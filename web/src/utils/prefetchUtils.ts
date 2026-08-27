import { useEffect } from 'react';

/**
 * Registry of dynamic route module loaders for predictive prefetching.
 */
const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/marketing/HomePage'),
  '/premium': () => import('@/pages/marketing/PremiumPage'),
  '/docs': () => import('@/pages/marketing/DocsPage'),
  '/support': () => import('@/pages/marketing/SupportPage'),
  '/changelog': () => import('@/pages/marketing/ChangelogPage'),
  '/terms': () => import('@/pages/marketing/TermsPage'),
  '/privacy': () => import('@/pages/marketing/PrivacyPage'),
  '/servers': () => import('@/pages/app/ServerPickerPage'),
  '/dev': () => import('@/pages/dev/DeveloperPage'),
  '/dev/ui': () => import('@/pages/dev/UiCatalogPage'),
  feeds: () => import('@/pages/app/GuildFeedsPage'),
  analytics: () => import('@/pages/app/GuildAnalyticsPage'),
  settings: () => import('@/pages/app/GuildSettingsPage'),
};

const prefetchedRoutes = new Set<string>();

/**
 * Dynamically prefetches a route module and caches it in memory.
 */
export async function prefetchRoute(routePath: string): Promise<void> {
  const normalized = routePath.replace(/^\/[a-z]{2}(\/|$)/, '/').replace(/\/$/, '') || '/';

  if (prefetchedRoutes.has(normalized)) return;

  const loader = ROUTE_LOADERS[normalized];
  if (loader) {
    prefetchedRoutes.add(normalized);
    try {
      await loader();
    } catch {
      // Non-blocking background prefetch failure
      prefetchedRoutes.delete(normalized);
    }
  }
}

/**
 * React hook to prefetch likely next routes during browser idle time.
 */
export function useIdlePrefetch(routes: string[]): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const runPrefetch = () => {
      routes.forEach((route) => {
        prefetchRoute(route);
      });
    };

    if ('requestIdleCallback' in window) {
      const handle = (
        window as Window & { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(runPrefetch);
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as Window & { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(
            handle
          );
        }
      };
    } else {
      const timer = setTimeout(runPrefetch, 2000);
      return () => clearTimeout(timer);
    }
  }, [routes]);
}
