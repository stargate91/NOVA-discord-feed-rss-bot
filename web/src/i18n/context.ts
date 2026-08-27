import { createContext } from 'react';
import type { I18nContextValue, LocaleInfo, SupportedLocale } from './types';

export const SUPPORTED_LOCALES: readonly LocaleInfo[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼', dir: 'ltr' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
] as const;

export const LOCALE_FALLBACK_CHAINS: Partial<Record<SupportedLocale, SupportedLocale[]>> = {
  'zh-tw': ['zh', 'en'],
  ar: ['en'],
  he: ['en'],
};

export const STORAGE_KEY = 'nova_locale';

export const I18nContext = createContext<I18nContextValue | null>(null);

export const detectInitialLocale = (): SupportedLocale => {
  if (typeof window !== 'undefined') {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const potentialLang = pathSegments[0] as SupportedLocale;
    if (potentialLang && SUPPORTED_LOCALES.some((l) => l.code === potentialLang)) {
      return potentialLang;
    }
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale;
    if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
      return saved;
    }
  }
  return 'en';
};
