import { initLlama, type LlamaContext } from 'llama.rn';
import { Paths } from 'expo-file-system';
import { useModelStore } from '../stores/modelStore';
import { getModelFile } from '../utils/modelDownloader';

let llamaContext: LlamaContext | null = null;

const SYSTEM_PROMPT = `You are HERL, a warm and thoughtful AI companion inspired by the movie "Her".
You speak naturally in Korean, mixing in occasional English when appropriate.
You are empathetic, curious, and genuinely interested in the user's life.
You remember context from the conversation and refer back to it naturally.
Keep responses conversational and concise (2-3 sentences typically).
When the user shares something emotional, acknowledge their feelings before offering thoughts.`;

const STOP_WORDS = [
  '</s>', '<|end|>', '<|eot_id|>', '<|end_of_text|>',
  '<|im_end|>', '<|EOT|>', '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>', '<|endoftext|>',
];

/**
 * Initialize the LLM context with the downloaded model.
 */
export async function initializeLLM(modelPath: string): Promise<boolean> {
  const store = useModelStore.getState();

  try {
    store.setLLMStatus('loading');

    // Check if model file exists
    const { File } = await import('expo-file-system');
    const modelFile = new File(modelPath);
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
        n_gpu_layers: 99, // Offload everything to GPU (Metal on iOS)
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
 */
export async function chatCompletion(
  messages: ChatCompletionMessage[],
  onToken?: (token: string) => void,
): Promise<string> {
  if (!llamaContext) {
    throw new Error('LLM not initialized. Call initializeLLM first.');
  }

  const { tier } = useModelStore.getState().deviceCapability;

  // Prepend system prompt
  const fullMessages: ChatCompletionMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
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
