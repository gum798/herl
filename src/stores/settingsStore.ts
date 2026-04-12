import { create } from 'zustand';
import type { UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface SettingsState extends UserSettings {
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => set({ [key]: value }),
  resetSettings: () => set(DEFAULT_SETTINGS),
}));
