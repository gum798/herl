import { Platform } from 'react-native';
import type { DeviceCapability, DeviceTier } from '../types';

/**
 * Detect device capability tier based on available memory.
 * High tier: 8GB+ RAM -> EXAONE 2.4B + Whisper Small (quantized)
 * Low tier: <8GB RAM -> Qwen2.5 1.5B + Whisper Base
 *
 * NOTE: React Native doesn't expose RAM directly.
 * For production, use react-native-device-info.
 */
export function getDeviceCapability(): DeviceCapability {
  const tier = estimateTier();

  return {
    tier,
    totalMemoryGB: tier === 'high' ? 8 : 6,
    modelId: tier === 'high' ? 'exaone-2.4b-q4' : 'qwen2.5-1.5b-q4',
    whisperModel: tier === 'high' ? 'small-q5_1' : 'base',
  };
}

function estimateTier(): DeviceTier {
  if (Platform.OS === 'ios') {
    // iPhone 15 Pro+ has 8GB RAM, A17 Pro -> high
    // iPhone 13/14 has 4-6GB RAM -> low
    // Default to 'low' until react-native-device-info is added
    return 'low';
  }

  if (Platform.OS === 'android') {
    return 'low';
  }

  return 'low';
}

/** Model info for UI display */
export const MODEL_INFO: Record<string, { name: string; sizeGB: number; desc: string }> = {
  'exaone-2.4b-q4': {
    name: 'EXAONE 3.5 2.4B',
    sizeGB: 1.64,
    desc: 'LG AI - 한국어 최적화',
  },
  'qwen2.5-1.5b-q4': {
    name: 'Qwen2.5 1.5B',
    sizeGB: 1.12,
    desc: 'Alibaba - 다국어 지원',
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
