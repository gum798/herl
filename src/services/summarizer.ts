import { chatCompletion, isLLMReady, type ChatCompletionMessage } from './llm';
import type { ChatMessage } from '../types';

const SUMMARIZE_PROMPT = `You are a helpful assistant that creates concise conversation summaries.
Given the following conversation, create:
1. A brief summary (2-3 sentences in Korean)
2. The overall mood/emotion of the conversation (one word in Korean, e.g., 즐거움, 우울함, 평온함, 걱정, 기대)

Format your response exactly as:
SUMMARY: [요약 내용]
MOOD: [감정]`;

/**
 * Summarize a conversation using the LLM.
 */
export async function summarizeConversation(
  messages: ChatMessage[],
): Promise<{ summary: string; mood: string }> {
  if (!isLLMReady() || messages.length === 0) {
    return {
      summary: getSimpleSummary(messages),
      mood: 'unknown',
    };
  }

  // Build conversation text
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'HERL'}: ${m.content}`)
    .join('\n');

  const summarizeMessages: ChatCompletionMessage[] = [
    { role: 'system', content: SUMMARIZE_PROMPT },
    { role: 'user', content: conversationText },
  ];

  try {
    const result = await chatCompletion(summarizeMessages);

    // Parse the result
    const summaryMatch = result.match(/SUMMARY:\s*(.+)/);
    const moodMatch = result.match(/MOOD:\s*(.+)/);

    return {
      summary: summaryMatch?.[1]?.trim() || getSimpleSummary(messages),
      mood: moodMatch?.[1]?.trim() || 'unknown',
    };
  } catch (error) {
    console.error('Summarization failed:', error);
    return {
      summary: getSimpleSummary(messages),
      mood: 'unknown',
    };
  }
}

/**
 * Simple fallback summary when LLM is not available.
 */
function getSimpleSummary(messages: ChatMessage[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const count = userMessages.length;

  if (count === 0) return 'No messages';
  if (count === 1) return userMessages[0].content.slice(0, 100);

  const first = userMessages[0].content.slice(0, 50);
  return `${count}개 메시지: "${first}..." 외 ${count - 1}건`;
}
