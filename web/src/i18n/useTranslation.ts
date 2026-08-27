import { useContext, useMemo, useCallback } from 'react';
import { I18nContext } from './context';
import type { SupportedLocale, LocaleInfo, Namespace } from './types';
import type { TranslationKey } from './locales/en';

export interface UseTranslationResult<N extends Namespace | undefined = undefined> {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: SupportedLocale) => void;
  supportedLocales: readonly LocaleInfo[];
  isLoadingLocale?: boolean;
  t: (
    key: N extends undefined ? TranslationKey : string,
    params?: Record<string, string | number>
  ) => string;
}

export const useTranslation = <N extends Namespace | undefined = undefined>(
  namespace?: N
): UseTranslationResult<N> => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  const { t: baseT, locale, direction, setLocale, supportedLocales, isLoadingLocale } = context;

  const t = useCallback(
    (
      key: N extends undefined ? TranslationKey : string,
      params?: Record<string, string | number>
    ): string => {
      const fullKey = namespace
        ? (`${namespace}.${key}` as TranslationKey)
        : (key as TranslationKey);
      return baseT(fullKey, params);
    },
    [baseT, namespace]
  );

  return useMemo(
    () => ({
      locale,
      direction,
      setLocale,
      supportedLocales,
      isLoadingLocale,
      t,
    }),
    [locale, direction, setLocale, supportedLocales, isLoadingLocale, t]
  );
};
