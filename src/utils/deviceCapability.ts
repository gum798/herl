import { Platform } from 'react-native';
import type { DeviceCapability, DeviceTier } from '../types';

/**
 * Detect device capability tier based on available memory.
 * High tier: 8GB+ RAM -> E4B model + Whisper Small
 * Low tier: <8GB RAM -> E2B model + Whisper Tiny
 *
 * NOTE: React Native doesn't expose RAM directly.
 * We use platform-specific heuristics as approximation.
 * For production, use react-native-device-info.
 */
export function getDeviceCapability(): DeviceCapability {
  // TODO: Use react-native-device-info for actual RAM detection
  // For now, use platform-based heuristic
  const tier = estimateTier();

  return {
    tier,
    totalMemoryGB: tier === 'high' ? 8 : 6,
    modelId: tier === 'high' ? 'e4b-q4' : 'e2b-q4',
    whisperModel: tier === 'high' ? 'small' : 'tiny',
  };
}

function estimateTier(): DeviceTier {
  if (Platform.OS === 'ios') {
    // iPhone 15 Pro+ has 8GB RAM, A17 Pro
    // We'll default to 'low' until we can detect properly
    return 'low';
  }

  if (Platform.OS === 'android') {
    // Most modern Android flagships have 8GB+
    return 'low';
  }

  return 'low';
}

/** Model download URLs (placeholder - replace with actual model hosting) */
export const MODEL_URLS: Record<string, { url: string; sizeGB: number }> = {
  'e4b-q4': {
    url: 'https://huggingface.co/TODO/e4b-q4.gguf',
    sizeGB: 4.0,
  },
  'e2b-q4': {
    url: 'https://huggingface.co/TODO/e2b-q4.gguf',
    sizeGB: 1.5,
  },
  'whisper-small': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    sizeGB: 0.5,
  },
  'whisper-tiny': {
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    sizeGB: 0.08,
  },
};
