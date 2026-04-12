import Tts from 'react-native-tts';
import { Platform } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';

let isInitialized = false;

/**
 * Initialize TTS engine with default settings.
 */
export async function initializeTTS(): Promise<void> {
  if (isInitialized) return;

  try {
    // Set default language to Korean
    await Tts.setDefaultLanguage('ko-KR');

    // Set default rate and pitch
    const settings = useSettingsStore.getState();
    await Tts.setDefaultRate(settings.ttsRate);
    await Tts.setDefaultPitch(settings.ttsPitch);

    // iOS specific: set voice
    if (Platform.OS === 'ios') {
      // Try to use a higher-quality Korean voice
      const voices = await Tts.voices();
      const koreanVoices = voices.filter(
        (v) => v.language === 'ko-KR' && !v.notInstalled
      );

      if (koreanVoices.length > 0) {
        // Prefer enhanced/premium voices
        const premium = koreanVoices.find(
          (v) => v.quality && v.quality >= 300
        );
        const selectedVoice = premium || koreanVoices[0];
        await Tts.setDefaultVoice(selectedVoice.id);
        console.log('TTS voice set to:', selectedVoice.name || selectedVoice.id);
      }
    }

    isInitialized = true;
    console.log('TTS initialized');
  } catch (error) {
    console.error('Failed to initialize TTS:', error);
  }
}

/**
 * Speak text using device TTS.
 * Returns a promise that resolves when speech is complete.
 */
export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!text.trim()) {
      resolve();
      return;
    }

    // Listen for completion using event handlers
    const onFinish = () => {
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
      resolve();
    };
    const onCancel = () => {
      Tts.removeEventListener('tts-finish', onFinish);
      Tts.removeEventListener('tts-cancel', onCancel);
      resolve();
    };

    Tts.addEventListener('tts-finish', onFinish);
    Tts.addEventListener('tts-cancel', onCancel);
    Tts.speak(text);
  });
}

/**
 * Stop current speech.
 */
export function stopSpeech(): void {
  Tts.stop();
}

/**
 * Update TTS settings.
 */
export async function updateTTSSettings(
  rate?: number,
  pitch?: number,
  voice?: string,
): Promise<void> {
  if (rate !== undefined) {
    await Tts.setDefaultRate(rate);
  }
  if (pitch !== undefined) {
    await Tts.setDefaultPitch(pitch);
  }
  if (voice) {
    await Tts.setDefaultVoice(voice);
  }
}

/**
 * Get available TTS voices for the current locale.
 */
export async function getAvailableVoices(): Promise<
  Array<{ id: string; name: string; language: string }>
> {
  const voices = await Tts.voices();
  return voices
    .filter((v) => !v.notInstalled)
    .map((v) => ({
      id: v.id,
      name: v.name || v.id,
      language: v.language,
    }));
}
