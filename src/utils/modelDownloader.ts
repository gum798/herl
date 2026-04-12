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

  // TODO: Replace with actual model URLs when models are hosted
  const modelUrls: Record<string, string> = {
    'e4b-q4': 'https://huggingface.co/TODO/e4b-q4-km.gguf',
    'e2b-q4': 'https://huggingface.co/TODO/e2b-q4-km.gguf',
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

  const whisperUrls: Record<string, string> = {
    'small': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    'tiny': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    'base': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
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
