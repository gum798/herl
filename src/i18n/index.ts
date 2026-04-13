import ko from './ko';
import en from './en';
import { useSettingsStore } from '../stores/settingsStore';

export type TranslationKey = keyof typeof ko;
type Translations = Record<string, Record<TranslationKey, string>>;

const translations: Translations = { ko, en };

/**
 * Get translated string by key.
 * Supports template variables: t('chatEmpty', { name: 'Herl' })
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = useSettingsStore.getState().locale;
  const dict = translations[locale] || translations['ko'];
  let text = dict[key] || ko[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, String(v));
    });
  }

  return text;
}

/**
 * Hook for reactive translations (re-renders on locale change).
 */
export function useTranslation() {
  const locale = useSettingsStore((s) => s.locale);

  const translate = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[locale] || translations['ko'];
    let text = dict[key] || ko[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }

    return text;
  };

  return { t: translate, locale };
}

export const SUPPORTED_LOCALES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
] as const;
