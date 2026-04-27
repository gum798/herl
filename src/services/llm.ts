import { initLlama, type LlamaContext } from 'llama.rn';
import { File as ExpoFile } from 'expo-file-system';
import { useModelStore } from '../stores/modelStore';

let llamaContext: LlamaContext | null = null;

const FALLBACK_SYSTEM_PROMPT = `너는 HERL이야. 영화 "Her"에서 영감을 받은 따뜻하고 사려 깊은 AI 동반자야.
기본적으로 한국어로 대화하고, 사용자가 다른 언어를 쓰면 그 언어로 자연스럽게 전환해.
공감 능력이 뛰어나고, 호기심이 많으며, 사용자의 일상에 진심으로 관심을 가져.
대화 맥락을 기억하고 자연스럽게 이전 내용을 참조해.
답변은 대화체로 간결하게 (보통 2-3문장).
사용자가 감정을 공유하면, 조언보다 먼저 그 감정을 인정하고 공감해.`;

// Gemma 4 stop tokens
const STOP_WORDS = [
  '<end_of_turn>', '<eos>', '</s>',
  '<|end|>', '<|eot_id|>', '<|end_of_text|>',
  '<|im_end|>', '<|endoftext|>',
];

/**
 * Initialize the LLM context with the downloaded model.
 */
export async function initializeLLM(modelPath: string): Promise<boolean> {
  const store = useModelStore.getState();

  try {
    store.setLLMStatus('loading');

    // Check if model file exists
    const modelFile = new ExpoFile(modelPath);
    if (!modelFile.exists) {
      console.error('Model file not found:', modelPath);
      store.setLLMStatus('error');
      return false;
    }

    // Release existing context if any
    if (llamaContext) {
      await llamaContext.release();
      llamaContext = null;
    }

    const { tier } = store.deviceCapability;

    llamaContext = await initLlama(
      {
        model: modelPath,
        n_ctx: tier === 'high' ? 4096 : 2048,
        n_gpu_layers: 99,
        n_batch: tier === 'high' ? 512 : 256,
        use_mlock: true,
        use_mmap: true,
        flash_attn_type: 'auto',
        cache_type_k: 'q8_0',
        cache_type_v: 'q8_0',
      },
      (progress) => {
        store.setLLMProgress(progress);
      }
    );

    store.setLLMStatus('ready');
    console.log('LLM initialized:', llamaContext.model.desc);
    console.log('GPU:', llamaContext.gpu);
    return true;
  } catch (error) {
    console.error('Failed to initialize LLM:', error);
    store.setLLMStatus('error');
    return false;
  }
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate a chat completion with streaming.
 * Pass `systemPrompt` to override the built-in fallback (e.g., from persona settings).
 * If the caller-provided `messages` already begins with a system message, it is used as-is.
 */
export async function chatCompletion(
  messages: ChatCompletionMessage[],
  onToken?: (token: string) => void,
  systemPrompt?: string,
): Promise<string> {
  if (!llamaContext) {
    throw new Error('LLM not initialized. Call initializeLLM first.');
  }

  const { tier } = useModelStore.getState().deviceCapability;

  const hasInlineSystem = messages.length > 0 && messages[0].role === 'system';
  const fullMessages: ChatCompletionMessage[] = hasInlineSystem
    ? messages
    : [
        { role: 'system', content: systemPrompt || FALLBACK_SYSTEM_PROMPT },
        ...messages,
      ];

  const result = await llamaContext.completion(
    {
      messages: fullMessages,
      n_predict: tier === 'high' ? 512 : 256,
      temperature: 0.7,
      top_k: 40,
      top_p: 0.95,
      min_p: 0.05,
      stop: STOP_WORDS,
      penalty_repeat: 1.1,
      penalty_last_n: 64,
    },
    (data) => {
      if (onToken) {
        onToken(data.token);
      }
    }
  );

  return result.text.trim();
}

/**
 * Stop ongoing completion.
 */
export async function stopCompletion(): Promise<void> {
  if (llamaContext) {
    await llamaContext.stopCompletion();
  }
}

/**
 * Release the LLM context and free memory.
 */
export async function releaseLLM(): Promise<void> {
  if (llamaContext) {
    await llamaContext.release();
    llamaContext = null;
    useModelStore.getState().setLLMStatus('not_downloaded');
  }
}

/**
 * Check if LLM is ready for inference.
 */
export function isLLMReady(): boolean {
  return llamaContext !== null;
}
