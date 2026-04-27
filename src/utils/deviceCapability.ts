import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { DeviceCapability, DeviceTier } from '../types';

/**
 * Returns true when the app is running in an iOS Simulator or Android Emulator.
 * Used to switch to mock-LLM mode (real GGUF models don't fit in a simulator).
 */
export function isSimulator(): boolean {
  // Constants.isDevice: false on simulator/emulator, true on real devices.
  // Cast because the typings vary across expo-constants versions.
  const isDevice = (Constants as unknown as { isDevice?: boolean }).isDevice;
  if (typeof isDevice === 'boolean') return !isDevice;
  // Fallback: treat __DEV__ on ios/android as unknown — assume real device.
  return false;
}

/**
 * Detect device capability tier based on available memory.
 * High tier: 8GB+ RAM -> Gemma 4 E4B + Whisper Small (quantized)
 * Low tier: <8GB RAM -> Gemma 4 E2B + Whisper Base
 */
export function getDeviceCapability(): DeviceCapability {
  const tier = estimateTier();

  return {
    tier,
    totalMemoryGB: tier === 'high' ? 8 : 6,
    modelId: tier === 'high' ? 'gemma4-e4b-q4' : 'gemma4-e2b-q4',
    whisperModel: tier === 'high' ? 'small-q5_1' : 'base',
  };
}

function estimateTier(): DeviceTier {
  if (Platform.OS === 'ios') {
    // iPhone 15 Pro+ (8GB RAM, A17 Pro) -> high
    // iPhone 13/14 (4-6GB RAM) -> low
    return 'low';
  }
  if (Platform.OS === 'android') {
    return 'low';
  }
  return 'low';
}

/** Model info for UI display */
export const MODEL_INFO: Record<string, { name: string; sizeGB: number; desc: string }> = {
  'gemma4-e4b-q4': {
    name: 'Gemma 4 E4B',
    sizeGB: 5.41,
    desc: 'Google - 140+ 언어, 멀티모달',
  },
  'gemma4-e2b-q4': {
    name: 'Gemma 4 E2B',
    sizeGB: 3.46,
    desc: 'Google - 경량 모델, 다국어',
  },
  'small-q5_1': {
    name: 'Whisper Small Q5',
    sizeGB: 0.19,
    desc: '한국어 음성인식 (양자화)',
  },
  'base': {
    name: 'Whisper Base',
    sizeGB: 0.15,
    desc: '기본 음성인식',
  },
};
