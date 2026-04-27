import { useState, useCallback, useRef } from 'react';
import {
  chatCompletion,
  stopCompletion,
  isLLMReady,
  type ChatCompletionMessage,
} from '../services/llm';
import { useChatStore } from '../stores/chatStore';
import { useSettingsStore } from '../stores/settingsStore';
import { resolveSystemPrompt } from '../services/personas';
import { generateMockReply, streamMockTokens } from '../services/mockLLM';
import type { ChatMessage } from '../types';

/**
 * Hook for LLM chat interactions.
 * Manages message history, streaming, and conversation state.
 */
export function useLLM() {
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef(false);

  const { messages, addMessage, setIsTyping } = useChatStore();

  /**
   * Send a user message and get LLM response.
   */
  const sendMessage = useCallback(
    async (userText: string, imageUri?: string) => {
      if (!isLLMReady()) {
        // Mock fallback: persona-aware canned response with simulated streaming.
        // Used on simulator or before the real GGUF model finishes loading.
        const userMsg: ChatMessage = {
          id: `${Date.now()}`,
          conversationId: '',
          role: 'user',
          content: userText,
          hasImage: !!imageUri,
          imageUri,
          createdAt: new Date(),
        };
        addMessage(userMsg);

        abortRef.current = false;
        setIsGenerating(true);
        setIsTyping(true);
        setStreamingText('');

        const { companionName, personaPresetId, personaCustomPrompt } =
          useSettingsStore.getState();
        const mockReply = generateMockReply({
          userText,
          presetId: personaPresetId,
          customPrompt: personaCustomPrompt,
          companionName,
        });

        let accumulated = '';
        await streamMockTokens(
          mockReply,
          (chunk) => {
            if (abortRef.current) return;
            accumulated += chunk;
            setStreamingText(accumulated);
          },
          () => abortRef.current,
        );

        if (!abortRef.current) {
          const assistantMsg: ChatMessage = {
            id: `${Date.now()}-mock`,
            conversationId: '',
            role: 'assistant',
            content: mockReply,
            createdAt: new Date(),
          };
          addMessage(assistantMsg);
        }

        setIsGenerating(false);
        setIsTyping(false);
        setStreamingText('');
        return;
      }

      abortRef.current = false;
      setIsGenerating(true);
      setIsTyping(true);
      setStreamingText('');

      // Add user message
      const userMsg: ChatMessage = {
        id: `${Date.now()}`,
        conversationId: '',
        role: 'user',
        content: userText,
        hasImage: !!imageUri,
        imageUri,
        createdAt: new Date(),
      };
      addMessage(userMsg);

      try {
        // Build conversation history for context (last 20 messages max)
        const recentMessages = [...messages, userMsg].slice(-20);
        const chatHistory: ChatCompletionMessage[] = recentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let accumulated = '';

        const { companionName, personaPresetId, personaCustomPrompt } =
          useSettingsStore.getState();
        const systemPrompt = resolveSystemPrompt(
          personaPresetId,
          personaCustomPrompt,
          companionName,
        );

        const fullResponse = await chatCompletion(
          chatHistory,
          (token) => {
            if (abortRef.current) return;
            accumulated += token;
            setStreamingText(accumulated);
          },
          systemPrompt,
        );

        // Add assistant response
        if (!abortRef.current) {
          const assistantMsg: ChatMessage = {
            id: `${Date.now()}-resp`,
            conversationId: '',
            role: 'assistant',
            content: fullResponse,
            createdAt: new Date(),
          };
          addMessage(assistantMsg);
        }
      } catch (error) {
        console.error('LLM completion error:', error);
        const errorMsg: ChatMessage = {
          id: `${Date.now()}-err`,
          conversationId: '',
          role: 'assistant',
          content: '죄송해요, 응답을 생성하는 중에 문제가 생겼어요. 다시 시도해주시겠어요?',
          createdAt: new Date(),
        };
        addMessage(errorMsg);
      } finally {
        setIsGenerating(false);
        setIsTyping(false);
        setStreamingText('');
      }
    },
    [messages, addMessage, setIsTyping]
  );

  /**
   * Stop the current generation.
   */
  const stop = useCallback(async () => {
    abortRef.current = true;
    await stopCompletion();
    setIsGenerating(false);
    setIsTyping(false);
    setStreamingText('');
  }, [setIsTyping]);

  return {
    sendMessage,
    stop,
    streamingText,
    isGenerating,
    isReady: isLLMReady(),
  };
}
