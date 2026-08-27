import type { TranslationKey } from '@/i18n';

export interface NavItemConfig {
  path: string;
  labelKey: TranslationKey;
  end?: boolean;
  isDev?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { path: '/', labelKey: 'common.navOverview', end: true },
  { path: '/premium', labelKey: 'common.navPremium' },
  { path: '/docs', labelKey: 'common.navDocs' },
  { path: '/support', labelKey: 'common.navSupport' },
  { path: '/changelog', labelKey: 'common.navChangelog' },
];

export const getLocalizedPath = (path: string, lang?: string): string => {
  if (!lang || lang === 'en' || path.startsWith('/dev')) {
    return path;
  }
  return `/${lang}${path === '/' ? '' : path}`;
};
