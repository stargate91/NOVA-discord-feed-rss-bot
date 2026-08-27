import type { TranslationKey } from './locales/en';

export type SupportedLocale =
  | 'en'
  | 'hu'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'zh-tw'
  | 'pl'
  | 'nl'
  | 'tr'
  | 'cs'
  | 'sv';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
}

export type TranslationDictionary = Record<TranslationKey, string>;

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  supportedLocales: readonly LocaleInfo[];
}
