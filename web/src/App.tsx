import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/styles/global.css';

import type { HealthStatus } from '@/types';
import { apiClient } from '@/api';
import { ThemeProvider } from '@/theme';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/common/Toast';
import { ConfirmProvider } from '@/components/common/ConfirmDialog';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { PageLoader } from '@/components/common/PageLoader';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { LocaleRouteWrapper } from '@/components/common/LocaleRouteWrapper';
import { AuthProvider, ProtectedRoute } from '@/auth';
import { GuildProvider } from '@/guild';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PublicLayout, DashboardLayout } from '@/components/layout';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy-loaded Marketing Pages (Code Splitting with auto-retry)
const HomePage = lazyWithRetry(() =>
  import('@/pages/marketing/HomePage').then((m) => ({ default: m.HomePage }))
);
const PremiumPage = lazyWithRetry(() =>
  import('@/pages/marketing/PremiumPage').then((m) => ({ default: m.PremiumPage }))
);
const DocsPage = lazyWithRetry(() =>
  import('@/pages/marketing/DocsPage').then((m) => ({ default: m.DocsPage }))
);
const SupportPage = lazyWithRetry(() =>
  import('@/pages/marketing/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const ChangelogPage = lazyWithRetry(() =>
  import('@/pages/marketing/ChangelogPage').then((m) => ({ default: m.ChangelogPage }))
);
const TermsPage = lazyWithRetry(() =>
  import('@/pages/marketing/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazyWithRetry(() =>
  import('@/pages/marketing/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const NotFoundPage = lazyWithRetry(() =>
  import('@/pages/marketing/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded App & Dev Pages (Code Splitting with auto-retry)
const ServerPickerPage = lazyWithRetry(() =>
  import('@/pages/app/ServerPickerPage').then((m) => ({ default: m.ServerPickerPage }))
);
const GuildOverviewPage = lazyWithRetry(() =>
  import('@/pages/app/GuildOverviewPage').then((m) => ({ default: m.GuildOverviewPage }))
);
const GuildFeedsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildFeedsPage').then((m) => ({ default: m.GuildFeedsPage }))
);
const GuildAnalyticsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildAnalyticsPage').then((m) => ({ default: m.GuildAnalyticsPage }))
);
const GuildPremiumPage = lazyWithRetry(() =>
  import('@/pages/app/GuildPremiumPage').then((m) => ({ default: m.GuildPremiumPage }))
);
const GuildSettingsPage = lazyWithRetry(() =>
  import('@/pages/app/GuildSettingsPage').then((m) => ({ default: m.GuildSettingsPage }))
);
const DeveloperPage = lazyWithRetry(() =>
  import('@/pages/dev/DeveloperPage').then((m) => ({ default: m.DeveloperPage }))
);
const AuthCallbackPage = lazyWithRetry(() =>
  import('@/pages/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);
const UiCatalogPage = lazyWithRetry(() =>
  import('@/pages/dev/UiCatalogPage').then((m) => ({ default: m.UiCatalogPage }))
);

interface MarketingRouteDef {
  path: string;
  component: React.ComponentType;
  isIndex?: boolean;
}

const MARKETING_ROUTES: MarketingRouteDef[] = [
  { path: '', component: HomePage, isIndex: true },
  { path: 'premium', component: PremiumPage },
  { path: 'docs', component: DocsPage },
  { path: 'support', component: SupportPage },
  { path: 'changelog', component: ChangelogPage },
  { path: 'terms', component: TermsPage },
  { path: 'privacy', component: PrivacyPage },
];

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const data = await apiClient.get<HealthStatus>('/health', {
          timeout: 4000,
          dedup: true,
        });
        if (isMounted) {
          setHealth(data);
          setLoadingHealth(false);
        }
      } catch {
        if (isMounted) {
          setHealth({ status: 'degraded', version: '1.0.0' });
          setLoadingHealth(false);
        }
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <ErrorBoundary isGlobal name="Nova Platform">
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <ConfirmProvider>
              <OfflineBanner />
              <AuthProvider>
                <GuildProvider>
                  <BrowserRouter>
                    <ScrollToTop />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* 1. Public Marketing Routes with optional /:lang prefix */}
                        <Route
                          element={<PublicLayout health={health} loadingHealth={loadingHealth} />}
                        >
                          {/* Root default routes */}
                          {MARKETING_ROUTES.map(({ path, component: Component, isIndex }) =>
                            isIndex ? (
                              <Route key="root-index" path="/" element={<Component />} />
                            ) : (
                              <Route key={`root-${path}`} path={`/${path}`} element={<Component />} />
                            )
                          )}

                          {/* Validated multi-language routes */}
                          <Route path="/:lang" element={<LocaleRouteWrapper />}>
                            {MARKETING_ROUTES.map(({ path, component: Component, isIndex }) =>
                              isIndex ? (
                                <Route key="lang-index" index element={<Component />} />
                              ) : (
                                <Route key={`lang-${path}`} path={path} element={<Component />} />
                              )
                            )}
                            <Route path="*" element={<NotFoundPage />} />
                          </Route>

                          {/* Developer Management Portal (Protected by Auth) & UI Catalog */}
                          <Route
                            path="/dev"
                            element={
                              <ProtectedRoute requireAuth fallbackRedirect="/servers">
                                <DeveloperPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/dev/ui" element={<UiCatalogPage />} />
                          <Route path="/components" element={<UiCatalogPage />} />

                          {/* OAuth2 Callback Handler */}
                          <Route path="/auth/callback" element={<AuthCallbackPage />} />

                          {/* Server Selection Entry Point (Protected) */}
                          <Route
                            path="/servers"
                            element={
                              <ProtectedRoute requireAuth fallbackRedirect="/">
                                <ServerPickerPage />
                              </ProtectedRoute>
                            }
                          />
                        </Route>

                        {/* 2. Bot / Guild Dashboard Protected Routes */}
                        <Route
                          element={
                            <ProtectedRoute
                              requireAuth
                              requireGuildManage
                              fallbackRedirect="/servers"
                            />
                          }
                        >
                          <Route
                            path="/dashboard/:guildId"
                            element={
                              <DashboardLayout health={health} loadingHealth={loadingHealth} />
                            }
                          >
                            <Route index element={<GuildOverviewPage />} />
                            <Route path="feeds" element={<GuildFeedsPage />} />
                            <Route path="analytics" element={<GuildAnalyticsPage />} />
                            <Route path="premium" element={<GuildPremiumPage />} />
                            <Route path="settings" element={<GuildSettingsPage />} />
                          </Route>
                        </Route>

                        {/* 3. 404 Not Found Page */}
                        <Route
                          element={<PublicLayout health={health} loadingHealth={loadingHealth} />}
                        >
                          <Route path="*" element={<NotFoundPage />} />
                        </Route>
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </GuildProvider>
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
