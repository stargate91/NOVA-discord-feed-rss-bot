import { lazyWithRetry } from '@/utils/lazyWithRetry';
import type { AppRouteDefinition, RouteMeta } from './types';

// Lazy-loaded Marketing Pages (Code Splitting with auto-retry)
export const HomePage = lazyWithRetry(() =>
  import('@/pages/marketing/HomePage').then((m) => ({ default: m.HomePage }))
);
export const PremiumPage = lazyWithRetry(() =>
  import('@/pages/marketing/PremiumPage').then((m) => ({ default: m.PremiumPage }))
);
export const DocsPage = lazyWithRetry(() =>
  import('@/pages/marketing/DocsPage').then((m) => ({ default: m.DocsPage }))
);
export const SupportPage = lazyWithRetry(() =>
  import('@/pages/marketing/SupportPage').then((m) => ({ default: m.SupportPage }))
);
export const ChangelogPage = lazyWithRetry(() =>
  import('@/pages/marketing/ChangelogPage').then((m) => ({ default: m.ChangelogPage }))
);
export const TermsPage = lazyWithRetry(() =>
  import('@/pages/marketing/TermsPage').then((m) => ({ default: m.TermsPage }))
);
export const PrivacyPage = lazyWithRetry(() =>
  import('@/pages/marketing/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
export const NotFoundPage = lazyWithRetry(() =>
  import('@/pages/marketing/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded App & Dev Pages (Code Splitting with auto-retry)
export const ServerPickerPage = lazyWithRetry(() =>
  import('@/pages/app/ServerPickerPage').then((m) => ({ default: m.ServerPickerPage }))
);
export const GuildOverviewPage = lazyWithRetry(() =>
  import('@/pages/app/GuildOverviewPage').then((m) => ({ default: m.GuildOverviewPage }))
);
export const GuildFeedsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildFeedsPage').then((m) => ({ default: m.GuildFeedsPage }))
);
export const GuildAnalyticsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildAnalyticsPage').then((m) => ({ default: m.GuildAnalyticsPage }))
);
export const GuildPremiumPage = lazyWithRetry(() =>
  import('@/pages/app/GuildPremiumPage').then((m) => ({ default: m.GuildPremiumPage }))
);
export const GuildSettingsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildSettingsPage').then((m) => ({ default: m.GuildSettingsPage }))
);
export const DeveloperPage = lazyWithRetry(() =>
  import('@/pages/dev/DeveloperPage').then((m) => ({ default: m.DeveloperPage }))
);
export const AuthCallbackPage = lazyWithRetry(() =>
  import('@/pages/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);
export const UiCatalogPage = lazyWithRetry(() =>
  import('@/pages/dev/UiCatalogPage').then((m) => ({ default: m.UiCatalogPage }))
);

/**
 * Public Marketing and Documentation Routes (Multi-language enabled)
 */
export const MARKETING_ROUTES: AppRouteDefinition[] = [
  {
    id: 'home',
    path: '',
    isIndex: true,
    component: HomePage,
    layout: 'public',
    meta: {
      title: 'Nova Feeds — Next-Generation Discord Notification Bot',
      titleKey: 'home.heroTitle',
      isLocalized: true,
    },
  },
  {
    id: 'premium',
    path: 'premium',
    component: PremiumPage,
    layout: 'public',
    meta: {
      title: 'Premium Plans & Tiers — Nova Feeds',
      titleKey: 'nav.premium',
      isLocalized: true,
    },
  },
  {
    id: 'docs',
    path: 'docs',
    component: DocsPage,
    layout: 'public',
    meta: {
      title: 'Documentation — Nova Feeds',
      titleKey: 'nav.docs',
      isLocalized: true,
    },
  },
  {
    id: 'support',
    path: 'support',
    component: SupportPage,
    layout: 'public',
    meta: {
      title: 'Support Center — Nova Feeds',
      titleKey: 'nav.support',
      isLocalized: true,
    },
  },
  {
    id: 'changelog',
    path: 'changelog',
    component: ChangelogPage,
    layout: 'public',
    meta: {
      title: 'Changelog & Updates — Nova Feeds',
      titleKey: 'nav.changelog',
      isLocalized: true,
    },
  },
  {
    id: 'terms',
    path: 'terms',
    component: TermsPage,
    layout: 'public',
    meta: {
      title: 'Terms of Service — Nova Feeds',
      titleKey: 'legal.termsOfService',
      isLocalized: true,
    },
  },
  {
    id: 'privacy',
    path: 'privacy',
    component: PrivacyPage,
    layout: 'public',
    meta: {
      title: 'Privacy Policy — Nova Feeds',
      titleKey: 'legal.privacyPolicy',
      isLocalized: true,
    },
  },
];

/**
 * Enterprise Application Route Registry with Metadata, Guards, and Layout Declarations
 */
export const APP_ROUTES: AppRouteDefinition[] = [
  ...MARKETING_ROUTES,
  {
    id: 'dev-portal',
    path: '/dev',
    component: DeveloperPage,
    layout: 'public',
    meta: {
      title: 'Developer Portal — Nova Feeds',
      requiresAuth: true,
      fallbackRedirect: '/servers',
    },
  },
  {
    id: 'ui-catalog',
    path: '/dev/ui',
    component: UiCatalogPage,
    layout: 'public',
    meta: {
      title: 'UI Component Catalog — Nova Feeds',
    },
  },
  {
    id: 'components-shortcut',
    path: '/components',
    component: UiCatalogPage,
    layout: 'public',
    meta: {
      title: 'UI Component Catalog — Nova Feeds',
    },
  },
  {
    id: 'oauth-callback',
    path: '/auth/callback',
    component: AuthCallbackPage,
    layout: 'public',
    meta: {
      title: 'Authenticating — Nova Feeds',
    },
  },
  {
    id: 'server-picker',
    path: '/servers',
    component: ServerPickerPage,
    layout: 'public',
    meta: {
      title: 'Select Server — Nova Feeds',
      requiresAuth: true,
      fallbackRedirect: '/',
    },
  },
  // Guild Management Dashboard Routes
  {
    id: 'guild-overview',
    path: '/dashboard/:guildId',
    component: GuildOverviewPage,
    layout: 'dashboard',
    meta: {
      title: 'Server Overview — Nova Feeds',
      requiresAuth: true,
      requiresGuildManage: true,
      fallbackRedirect: '/servers',
    },
  },
  {
    id: 'guild-feeds',
    path: '/dashboard/:guildId/feeds',
    component: GuildFeedsPage,
    layout: 'dashboard',
    meta: {
      title: 'Feed Management — Nova Feeds',
      requiresAuth: true,
      requiresGuildManage: true,
      fallbackRedirect: '/servers',
    },
  },
  {
    id: 'guild-analytics',
    path: '/dashboard/:guildId/analytics',
    component: GuildAnalyticsPage,
    layout: 'dashboard',
    meta: {
      title: 'Analytics & Delivery Stats — Nova Feeds',
      requiresAuth: true,
      requiresGuildManage: true,
      fallbackRedirect: '/servers',
    },
  },
  {
    id: 'guild-settings',
    path: '/dashboard/:guildId/settings',
    component: GuildSettingsPage,
    layout: 'dashboard',
    meta: {
      title: 'Server Settings — Nova Feeds',
      requiresAuth: true,
      requiresGuildManage: true,
      fallbackRedirect: '/servers',
    },
  },
  {
    id: 'guild-premium',
    path: '/dashboard/:guildId/premium',
    component: GuildPremiumPage,
    layout: 'dashboard',
    meta: {
      title: 'Server Premium & Quotas — Nova Feeds',
      requiresAuth: true,
      requiresGuildManage: true,
      fallbackRedirect: '/servers',
    },
  },
];

/**
 * Finds declarative metadata for a given path.
 */
export function getRouteMetaByPath(pathname: string): RouteMeta | undefined {
  const match = APP_ROUTES.find((r) => {
    if (r.path === pathname) return true;
    if (r.path.includes(':')) {
      const regex = new RegExp(`^${r.path.replace(/:[a-zA-Z0-9_]+/g, '[^/]+')}$`);
      return regex.test(pathname);
    }
    return false;
  });
  return match?.meta;
}
