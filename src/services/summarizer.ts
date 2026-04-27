import { chatCompletion, isLLMReady, type ChatCompletionMessage } from './llm';
import { useSettingsStore } from '../stores/settingsStore';
import type { ChatMessage } from '../types';

const SUMMARIZE_PROMPT = `대화를 간결하게 요약하는 어시스턴트야.
다음 대화를 보고:
1. 간단한 요약 (한국어 2-3문장)
2. 전체 분위기/감정 (한국어 한 단어: 즐거움, 우울함, 평온함, 걱정, 기대 등)

반드시 다음 형식으로 답해:
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

  const { companionName } = useSettingsStore.getState();
  const assistantLabel = companionName?.trim() || 'HERL';

  // Build conversation text
  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : assistantLabel}: ${m.content}`)
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
