import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLocale } from './types';
import type { TranslationKey } from './locales/en';
import { en } from './locales/en';
import { I18nContext, SUPPORTED_LOCALES, STORAGE_KEY, detectInitialLocale } from './context';
import { loadLocaleDictionary } from './loader';

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<SupportedLocale>(detectInitialLocale);
  const [activeDictionary, setActiveDictionary] = useState<Record<string, string>>(en);
  const [isLoadingLocale, setIsLoadingLocale] = useState<boolean>(false);

  // Dynamically load locale when changed or on mount
  useEffect(() => {
    let isMounted = true;

    const loadLocale = async () => {
      if (locale === 'en') {
        setActiveDictionary(en);
        return;
      }

      setIsLoadingLocale(true);
      const dict = await loadLocaleDictionary(locale);
      if (isMounted) {
        setActiveDictionary(dict);
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
      document.documentElement.lang = newLocale;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Translation function with parameter interpolation, pluralization, and missing-key dev warning
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      // Pluralization resolver if count is provided
      let resolvedKey = key as string;
      if (params && typeof params.count === 'number') {
        const count = params.count;
        if (count === 0 && `${key}_zero` in activeDictionary) {
          resolvedKey = `${key}_zero`;
        } else if (count === 1 && `${key}_one` in activeDictionary) {
          resolvedKey = `${key}_one`;
        } else if (count > 1 && `${key}_other` in activeDictionary) {
          resolvedKey = `${key}_other`;
        } else if (`${key}_plural` in activeDictionary && count !== 1) {
          resolvedKey = `${key}_plural`;
        }
      }

      let text: string | undefined =
        activeDictionary[resolvedKey] || en[resolvedKey as TranslationKey];

      if (text === undefined) {
        text = activeDictionary[key as string] || en[key];
      }

      if (text === undefined) {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation key: "${key}" for locale "${locale}"`);
        }
        text = key as string;
      }

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = (text as string).replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return text;
    },
    [locale, activeDictionary]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
      isLoadingLocale,
    }),
    [locale, handleSetLocale, t, isLoadingLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
