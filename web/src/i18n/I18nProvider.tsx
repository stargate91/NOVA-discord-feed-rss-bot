import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLocale } from './types';
import type { TranslationKey } from './locales/en';
import { en } from './locales/en';
import {
  I18nContext,
  SUPPORTED_LOCALES,
  LOCALE_FALLBACK_CHAINS,
  STORAGE_KEY,
  detectInitialLocale,
} from './context';
import { loadLocaleDictionary } from './loader';
import { getPluralCategory } from './utils';

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<SupportedLocale>(detectInitialLocale);
  const [activeDictionary, setActiveDictionary] = useState<Record<string, string>>(en);
  const [fallbackDictionaries, setFallbackDictionaries] = useState<Record<string, string>[]>([]);
  const [isLoadingLocale, setIsLoadingLocale] = useState<boolean>(false);

  // Compute text direction (ltr vs rtl) from locale metadata
  const direction: 'ltr' | 'rtl' = useMemo(() => {
    const info = SUPPORTED_LOCALES.find((l) => l.code === locale);
    return info?.dir || 'ltr';
  }, [locale]);

  // Sync direction and lang attributes to documentElement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
      document.documentElement.setAttribute('dir', direction);
    }
  }, [locale, direction]);

  // Dynamically load primary and fallback locale dictionaries
  useEffect(() => {
    let isMounted = true;

    const loadLocale = async () => {
      if (locale === 'en') {
        setActiveDictionary(en);
        setFallbackDictionaries([]);
        return;
      }

      setIsLoadingLocale(true);

      // Load primary dictionary
      const primaryDict = await loadLocaleDictionary(locale);

      // Load intermediate fallback chain if configured (e.g. zh-tw -> [zh, en])
      const chain = LOCALE_FALLBACK_CHAINS[locale] || [];
      const intermediateDicts: Record<string, string>[] = [];
      for (const fallbackCode of chain) {
        if (fallbackCode !== 'en' && fallbackCode !== locale) {
          const dict = await loadLocaleDictionary(fallbackCode);
          intermediateDicts.push(dict);
        }
      }

      if (isMounted) {
        setActiveDictionary(primaryDict);
        setFallbackDictionaries(intermediateDicts);
        setIsLoadingLocale(false);
      }
    };

    loadLocale();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  // Sync state change to localStorage
  const handleSetLocale = useCallback((newLocale: SupportedLocale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  // Translation function with ICU plural rules, recursive fallback chain, and parameter interpolation
  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      let resolvedKey = key;

      // 1. ICU PluralRules category resolution if count parameter is present
      if (params && typeof params.count === 'number') {
        const count = params.count;
        const category = getPluralCategory(locale, count); // 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

        const candidateKeys = [
          `${key}_${category}`,
          category !== 'other' ? `${key}_${category}` : null,
          count === 0 ? `${key}_zero` : null,
          count === 1 ? `${key}_one` : null,
          count > 1 ? `${key}_other` : null,
          count !== 1 ? `${key}_plural` : null,
        ].filter((k): k is string => Boolean(k));

        for (const candidate of candidateKeys) {
          if (
            candidate in activeDictionary ||
            fallbackDictionaries.some((dict) => candidate in dict) ||
            candidate in en
          ) {
            resolvedKey = candidate;
            break;
          }
        }
      }

      // 2. Lookup in Active Dictionary -> Intermediate Fallback Chain -> Default English
      let text: string | undefined = activeDictionary[resolvedKey];

      if (text === undefined) {
        for (const fallbackDict of fallbackDictionaries) {
          if (fallbackDict[resolvedKey] !== undefined) {
            text = fallbackDict[resolvedKey];
            break;
          }
        }
      }

      if (text === undefined) {
        text = (en as Record<string, string>)[resolvedKey];
      }

      // 3. Fallback to raw key if not found with dev warning
      if (text === undefined) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation key: "${key}" for locale "${locale}"`);
        }
        text = key;
      }

      // 4. Interpolate variables: {variableName}
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = (text as string).replace(
            new RegExp(`\\{${paramKey}\\}`, 'g'),
            String(paramValue)
          );
        });
      }

      return text;
    },
    [locale, activeDictionary, fallbackDictionaries]
  );

  const value = useMemo(
    () => ({
      locale,
      direction,
      setLocale: handleSetLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
      isLoadingLocale,
    }),
    [locale, direction, handleSetLocale, t, isLoadingLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
