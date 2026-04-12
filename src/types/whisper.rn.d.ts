declare module 'whisper.rn' {
  export interface WhisperContextOptions {
    filePath: string;
    isBundledAsset?: boolean;
    useGpu?: boolean;
    useCoreMLIos?: number;
  }

  export interface TranscribeOptions {
    language?: string;
    maxThreads?: number;
    translate?: boolean;
    tokenTimestamps?: boolean;
    prompt?: string;
    onProgress?: (progress: number) => void;
    onNewSegments?: (result: TranscribeNewSegmentsResult) => void;
  }

  export interface TranscribeResult {
    result: string;
    segments: Array<{ text: string; t0: number; t1: number }>;
    language?: string;
    isAborted: boolean;
  }

  export interface TranscribeNewSegmentsResult {
    nNew: number;
    totalNNew: number;
    result: string;
    segments: Array<{ text: string; t0: number; t1: number }>;
  }

  export interface RealtimeTranscribeOptions {
    language?: string;
    maxThreads?: number;
    audioSessionOnStartIos?: {
      category: string;
      options: string[];
      mode: string;
    };
    audioSessionOnStopIos?: string;
  }

  export interface RealtimeTranscribeEvent {
    isCapturing: boolean;
    data?: {
      result: string;
    };
    processTime?: number;
    recordingTime?: number;
  }

  export interface WhisperContext {
    id: number;
    gpu: boolean;
    transcribe(
      audioSource: string | number,
      options?: TranscribeOptions,
    ): { stop: () => void; promise: Promise<TranscribeResult> };
    transcribeRealtime(
      options?: RealtimeTranscribeOptions,
    ): Promise<{
      stop: () => void;
      subscribe: (callback: (evt: RealtimeTranscribeEvent) => void) => void;
    }>;
    release(): Promise<void>;
  }

  export function initWhisper(
    options: WhisperContextOptions,
    progressCallback?: (progress: number) => void,
  ): Promise<WhisperContext>;

  export function releaseAllWhisper(): Promise<void>;
}
