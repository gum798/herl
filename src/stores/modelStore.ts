import { create } from 'zustand';
import type { DeviceCapability, ModelState, ModelStatus } from '../types';
import { getDeviceCapability } from '../utils/deviceCapability';

interface ModelStoreState extends ModelState {
  deviceCapability: DeviceCapability;

  // Actions
  setLLMStatus: (status: ModelStatus) => void;
  setWhisperStatus: (status: ModelStatus) => void;
  setLLMProgress: (progress: number) => void;
  setWhisperProgress: (progress: number) => void;
  detectDevice: () => void;
}

export const useModelStore = create<ModelStoreState>((set) => ({
  llmStatus: 'not_downloaded',
  whisperStatus: 'not_downloaded',
  llmProgress: 0,
  whisperProgress: 0,
  deviceCapability: getDeviceCapability(),

  setLLMStatus: (llmStatus) => set({ llmStatus }),
  setWhisperStatus: (whisperStatus) => set({ whisperStatus }),
  setLLMProgress: (llmProgress) => set({ llmProgress }),
  setWhisperProgress: (whisperProgress) => set({ whisperProgress }),
  detectDevice: () => set({ deviceCapability: getDeviceCapability() }),
}));
