import { Paths, File as ExpoFile, Directory } from 'expo-file-system';
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
  return new ExpoFile(getModelDir(), `${modelId}.gguf`).uri;
}

/** Get the local file for an LLM model */
export function getModelFile(modelId: string): ExpoFile {
  return new ExpoFile(getModelDir(), `${modelId}.gguf`);
}

/** Get the local file path for whisper model */
export function getWhisperModelPath(modelSize: string): string {
  return new ExpoFile(getModelDir(), `ggml-${modelSize}.bin`).uri;
}

/** Get the local file for whisper model */
export function getWhisperModelFile(modelSize: string): ExpoFile {
  return new ExpoFile(getModelDir(), `ggml-${modelSize}.bin`);
}

/** Check if a model file is already downloaded */
export function isModelDownloaded(file: ExpoFile): boolean {
  return file.exists;
}

/**
 * Download a model file.
 */
export async function downloadModel(
  url: string,
  destFile: ExpoFile,
): Promise<ExpoFile> {
  ensureModelDir();

  if (destFile.exists) {
    return destFile;
  }

  const downloaded = await ExpoFile.downloadFileAsync(url, destFile, {
    idempotent: true,
  });

  return downloaded as unknown as ExpoFile;
}

/**
 * Download LLM model based on device capability.
 */
export async function downloadLLMModel(): Promise<string> {
  const store = useModelStore.getState();
  const { modelId } = store.deviceCapability;
  const destFile = getModelFile(modelId);

  // Gemma 4 E4B/E2B (Google, 140+ 언어, Apache 2.0)
  const modelUrls: Record<string, string> = {
    'gemma4-e4b-q4': 'https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf',
    'gemma4-e2b-q4': 'https://huggingface.co/bartowski/google_gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_K_M.gguf',
  };

  const url = modelUrls[modelId];
  if (!url) {
    throw new Error(`Unknown model ID: ${modelId}`);
  }

  store.setLLMStatus('downloading');
  store.setLLMProgress(0);

  try {
    const file = await downloadModel(url, destFile);
    store.setLLMProgress(100);
    store.setLLMStatus('not_downloaded');
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
    const file = await downloadModel(url, destFile);
    store.setWhisperProgress(100);
    store.setWhisperStatus('not_downloaded');
    return file.uri;
  } catch (error) {
    store.setWhisperStatus('error');
    throw error;
  }
}

/** Delete all downloaded models */
export function clearModels(): void {
  const dir = getModelDir();
  if (dir.exists) {
    dir.delete();
  }
}

/** Get total size of downloaded models in bytes */
export function getModelsSize(): number {
  const dir = getModelDir();
  if (!dir.exists) return 0;
  return dir.size ?? 0;
}
