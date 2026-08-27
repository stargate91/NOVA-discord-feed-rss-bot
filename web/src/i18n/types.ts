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
  | 'sv'
  | 'ar'
  | 'he';

export type Namespace =
  | 'common'
  | 'home'
  | 'premium'
  | 'docs'
  | 'support'
  | 'changelog'
  | 'legal'
  | 'servers'
  | 'guild'
  | 'dev';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export type NestedTranslationDictionary = {
  [key: string]: string | NestedTranslationDictionary;
};

export type TranslationDictionary = Record<string, string>;

export interface I18nContextValue {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  supportedLocales: readonly LocaleInfo[];
  isLoadingLocale?: boolean;
}
