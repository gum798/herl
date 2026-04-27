import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
export type { UserSettings };

interface SettingsState extends UserSettings {
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'herl-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { updateSetting: _u, resetSettings: _r, ...persisted } = state;
        return persisted;
      },
      version: 2,
    },
  ),
);
