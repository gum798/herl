import { initWhisper, type WhisperContext } from 'whisper.rn';
import { useModelStore } from '../stores/modelStore';
import { getWhisperModelFile } from '../utils/modelDownloader';

let whisperContext: WhisperContext | null = null;

/**
 * Initialize the Whisper context with the downloaded model.
 */
export async function initializeWhisper(modelPath: string): Promise<boolean> {
  const store = useModelStore.getState();

  try {
    store.setWhisperStatus('loading');

    // Release existing context
    if (whisperContext) {
      await whisperContext.release();
      whisperContext = null;
    }

    whisperContext = await initWhisper({
      filePath: modelPath,
    });

    store.setWhisperStatus('ready');
    console.log('Whisper initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Whisper:', error);
    store.setWhisperStatus('error');
    return false;
  }
}

/**
 * Transcribe an audio file to text.
 * @param audioPath - Path to WAV audio file
 * @param language - Language code (default: 'ko' for Korean)
 */
export async function transcribeAudio(
  audioPath: string,
  language: string = 'ko',
): Promise<{ text: string; language: string }> {
  if (!whisperContext) {
    throw new Error('Whisper not initialized. Call initializeWhisper first.');
  }

  const { stop, promise } = whisperContext.transcribe(audioPath, {
    language,
    maxThreads: 4,
    onNewSegments: (result) => {
      console.log('New segments:', result.result);
    },
  });

  const result = await promise;

  return {
    text: result.result.trim(),
    language: result.language || language,
  };
}

/**
 * Start real-time transcription using the microphone.
 * Returns controls for stopping and subscribing to results.
 */
export async function startRealtimeTranscription(
  language: string = 'ko',
  onResult?: (text: string, isFinal: boolean) => void,
): Promise<{ stop: () => void }> {
  if (!whisperContext) {
    throw new Error('Whisper not initialized. Call initializeWhisper first.');
  }

  const { stop, subscribe } = await whisperContext.transcribeRealtime({
    language,
    maxThreads: 4,
    // iOS audio session config
    audioSessionOnStartIos: {
      category: 'PlayAndRecord',
      options: ['DefaultToSpeaker', 'AllowBluetooth'],
      mode: 'SpokenAudio',
    },
    audioSessionOnStopIos: 'RestorePrevious',
  });

  subscribe((evt) => {
    const { isCapturing, data } = evt;

    if (onResult && data?.result) {
      onResult(data.result.trim(), !isCapturing);
    }

    if (!isCapturing) {
      console.log('Realtime transcription finished');
    }
  });

  return { stop };
}

/**
 * Release the Whisper context and free memory.
 */
export async function releaseWhisper(): Promise<void> {
  if (whisperContext) {
    await whisperContext.release();
    whisperContext = null;
    useModelStore.getState().setWhisperStatus('not_downloaded');
  }
}

/**
 * Check if Whisper is ready.
 */
export function isWhisperReady(): boolean {
  return whisperContext !== null;
}
