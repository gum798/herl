import { Paths, File, Directory } from 'expo-file-system';
import { useModelStore } from '../stores/modelStore';

/** Models directory inside document storage */
const getModelDir = (): Directory => {
  return new Directory(Paths.document, 'models');
};

/** Ensure the models directory exists */
function ensureModelDir(): void {
  const dir = getModelDir();
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
}

/** Get the local file path for an LLM model */
export function getModelPath(modelId: string): string {
  return new File(getModelDir(), `${modelId}.gguf`).uri;
}

/** Get the local file for an LLM model */
export function getModelFile(modelId: string): File {
  return new File(getModelDir(), `${modelId}.gguf`);
}

/** Get the local file path for whisper model */
export function getWhisperModelPath(modelSize: string): string {
  return new File(getModelDir(), `ggml-${modelSize}.bin`).uri;
}

/** Get the local file for whisper model */
export function getWhisperModelFile(modelSize: string): File {
  return new File(getModelDir(), `ggml-${modelSize}.bin`);
}

/** Check if a model file is already downloaded */
export function isModelDownloaded(file: File): boolean {
  return file.exists;
}

/**
 * Download a model file.
 * Returns the File object on success.
 *
 * NOTE: expo-file-system new API doesn't support progress callbacks natively.
 * For large model downloads, consider using a background download library.
 */
export async function downloadModelFile(
  url: string,
  destFile: File,
): Promise<File> {
  ensureModelDir();

  // Check if already downloaded
  if (destFile.exists) {
    return destFile;
  }

  // Download to model directory
  const downloaded = await File.downloadFileAsync(url, destFile, {
    idempotent: true,
  });

  return downloaded;
}

/**
 * Download LLM model based on device capability.
 */
export async function downloadLLMModel(): Promise<string> {
  const store = useModelStore.getState();
  const { modelId } = store.deviceCapability;
  const destFile = getModelFile(modelId);

  // Actual model URLs (Korean-optimized)
  // High: EXAONE 3.5 2.4B (LG, 한국어 최적화) - 1.64GB
  // Low: Qwen2.5 1.5B (다국어, 한국어 양호) - 1.12GB
  const modelUrls: Record<string, string> = {
    'exaone-2.4b-q4': 'https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct-GGUF/resolve/main/EXAONE-3.5-2.4B-Instruct-Q4_K_M.gguf',
    'qwen2.5-1.5b-q4': 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
  };

  const url = modelUrls[modelId];
  if (!url) {
    throw new Error(`Unknown model ID: ${modelId}`);
  }

  store.setLLMStatus('downloading');
  store.setLLMProgress(0);

  try {
    const file = await downloadModelFile(url, destFile);
    store.setLLMProgress(100);
    store.setLLMStatus('not_downloaded'); // Will be set to 'ready' after initLlama
    return file.uri;
  } catch (error) {
    store.setLLMStatus('error');
    throw error;
  }
}

/**
 * Download Whisper model based on device capability.
 */
export async function downloadWhisperModel(): Promise<string> {
  const store = useModelStore.getState();
  const { whisperModel } = store.deviceCapability;
  const destFile = getWhisperModelFile(whisperModel);

  // Whisper models (multilingual, NOT .en variants - Korean needs multilingual)
  const whisperUrls: Record<string, string> = {
    'small-q5_1': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin',
    'small': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    'base': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    'tiny': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
  };

  const url = whisperUrls[whisperModel];
  if (!url) {
    throw new Error(`Unknown Whisper model: ${whisperModel}`);
  }

  store.setWhisperStatus('downloading');
  store.setWhisperProgress(0);

  try {
    const file = await downloadModelFile(url, destFile);
    store.setWhisperProgress(100);
    store.setWhisperStatus('not_downloaded');
    return file.uri;
  } catch (error) {
    store.setWhisperStatus('error');
    throw error;
  }
}

/**
 * Delete all downloaded models.
 */
export function clearModels(): void {
  const dir = getModelDir();
  if (dir.exists) {
    dir.delete();
  }
}

/**
 * Get total size of downloaded models in bytes.
 */
export function getModelsSize(): number {
  const dir = getModelDir();
  if (!dir.exists) return 0;
  return dir.size ?? 0;
}
