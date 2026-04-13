import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { File as ExpoFile } from 'expo-file-system';
import { useChatStore } from '../stores/chatStore';
import { transcribeAudio, isWhisperReady } from '../services/whisper';
import { speak, stopSpeech } from '../services/tts';
import { chatCompletion, isLLMReady, type ChatCompletionMessage } from '../services/llm';
import type { ChatMessage, VoiceState } from '../types';

/**
 * Hook that manages the full voice pipeline:
 * Record → Whisper (ASR) → LLM → TTS
 */
export function useVoiceRecorder() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { messages, addMessage, setIsTyping } = useChatStore();

  /**
   * Start recording audio from microphone.
   */
  const startRecording = useCallback(async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('Microphone permission denied');
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setVoiceState('recording');
      useChatStore.getState().setVoiceState('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setVoiceState('idle');
    }
  }, []);

  /**
   * Stop recording and run the full pipeline:
   * Audio → Whisper → LLM → TTS
   */
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      // Stop recording
      setVoiceState('transcribing');
      useChatStore.getState().setVoiceState('transcribing');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        console.error('No recording URI');
        setVoiceState('idle');
        return;
      }

      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Step 1: Transcribe with Whisper
      let userText: string;
      if (isWhisperReady()) {
        const result = await transcribeAudio(uri, 'ko');
        userText = result.text;
      } else {
        userText = '[Whisper not loaded - voice input unavailable]';
      }

      if (!userText.trim()) {
        setVoiceState('idle');
        useChatStore.getState().setVoiceState('idle');
        return;
      }

      // Add user message
      const userMsg: ChatMessage = {
        id: `${Date.now()}`,
        conversationId: '',
        role: 'user',
        content: userText,
        createdAt: new Date(),
      };
      addMessage(userMsg);

      // Step 2: Get LLM response
      setVoiceState('thinking');
      useChatStore.getState().setVoiceState('thinking');
      setIsTyping(true);

      let assistantText: string;
      if (isLLMReady()) {
        const recentMessages = [...messages, userMsg].slice(-20);
        const chatHistory: ChatCompletionMessage[] = recentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        assistantText = await chatCompletion(chatHistory);
      } else {
        assistantText = `[LLM not loaded] You said: "${userText}"`;
      }

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-resp`,
        conversationId: '',
        role: 'assistant',
        content: assistantText,
        createdAt: new Date(),
      };
      addMessage(assistantMsg);
      setIsTyping(false);

      // Step 3: Speak response with TTS
      setVoiceState('speaking');
      useChatStore.getState().setVoiceState('speaking');
      await speak(assistantText);

      // Done
      setVoiceState('idle');
      useChatStore.getState().setVoiceState('idle');

      // Clean up recording file
      try {
        const recordingFile = new ExpoFile(uri);
        if (recordingFile.exists) {
          recordingFile.delete();
        }
      } catch {
        // Ignore cleanup errors
      }
    } catch (error) {
      console.error('Voice pipeline error:', error);
      setVoiceState('idle');
      useChatStore.getState().setVoiceState('idle');
      setIsTyping(false);
    }
  }, [messages, addMessage, setIsTyping]);

  /**
   * Toggle recording: start if idle, stop if recording.
   * Cancel/stop if in any other state.
   */
  const toggleRecording = useCallback(async () => {
    switch (voiceState) {
      case 'idle':
        await startRecording();
        break;
      case 'recording':
        await stopRecording();
        break;
      case 'speaking':
        stopSpeech();
        setVoiceState('idle');
        useChatStore.getState().setVoiceState('idle');
        break;
      default:
        // For transcribing/thinking states, just wait
        break;
    }
  }, [voiceState, startRecording, stopRecording]);

  return {
    voiceState,
    toggleRecording,
    startRecording,
    stopRecording,
    isRecording: voiceState === 'recording',
  };
}
