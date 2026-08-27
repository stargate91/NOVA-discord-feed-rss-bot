import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLocale } from './types';
import type { TranslationKey } from './locales/en';
import { en } from './locales/en';
import { I18nContext, SUPPORTED_LOCALES, STORAGE_KEY, detectInitialLocale } from './context';

// 17 Dictionaries mapping matching Python backend locales (fallback to en initially)
const dictionaries: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en,
  hu: en,
  de: en,
  es: en,
  fr: en,
  it: en,
  pt: en,
  ru: en,
  ja: en,
  ko: en,
  zh: en,
  'zh-tw': en,
  pl: en,
  nl: en,
  tr: en,
  cs: en,
  sv: en,
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<SupportedLocale>(detectInitialLocale);

  // Sync state change to localStorage
  const handleSetLocale = useCallback((newLocale: SupportedLocale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Translation function with parameter interpolation & pluralization
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const activeDict = dictionaries[locale] || en;

      // Pluralization resolver if count is provided
      let resolvedKey = key as string;
      if (params && typeof params.count === 'number') {
        const count = params.count;
        if (count === 0 && `${key}_zero` in activeDict) {
          resolvedKey = `${key}_zero`;
        } else if (count === 1 && `${key}_one` in activeDict) {
          resolvedKey = `${key}_one`;
        } else if (count > 1 && `${key}_other` in activeDict) {
          resolvedKey = `${key}_other`;
        } else if (`${key}_plural` in activeDict && count !== 1) {
          resolvedKey = `${key}_plural`;
        }
      }

      const dictKey = resolvedKey as TranslationKey;
      let text: string =
        activeDict[dictKey] || en[dictKey] || activeDict[key] || en[key] || (key as string);

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return text;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale, handleSetLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
