import React, { useEffect, lazy } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import type { SupportedLocale, LocaleInfo } from '@/i18n/types';
import { SUPPORTED_LOCALES } from '@/i18n/context';
import { useTranslation } from '@/i18n/useTranslation';

const NotFoundPage = lazy(() =>
  import('@/pages/marketing/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export const LocaleRouteWrapper: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { setLocale } = useTranslation();

  const isValidLocale =
    !lang || SUPPORTED_LOCALES.some((l: LocaleInfo) => l.code === (lang as SupportedLocale));

  useEffect(() => {
    if (lang && isValidLocale) {
      setLocale(lang as SupportedLocale);
    }
  }, [lang, isValidLocale, setLocale]);

  if (!isValidLocale) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};
