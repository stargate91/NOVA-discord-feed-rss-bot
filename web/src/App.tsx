import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import type { HealthStatus } from './types';
import { isHealthStatus } from './types';
import { apiClient } from './api';
import { errorReporter } from './services/errorReporter';
import { ThemeProvider } from './theme';
import { I18nProvider } from './i18n';
import { ToastProvider } from './components/common/Toast';
import { ModalProvider } from './components/common/Modal';
import { OfflineBanner } from './components/common/OfflineBanner';
import { PageLoader } from './components/common/PageLoader';
import { LocaleRouteWrapper } from './components/common/LocaleRouteWrapper';
import { AuthProvider, ProtectedRoute } from './auth';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicLayout, DashboardLayout } from './components/layout';

// Lazy-loaded Marketing Pages (Code Splitting)
const HomePage = lazy(() =>
  import('./pages/marketing/HomePage').then((m) => ({ default: m.HomePage }))
);
const PremiumPage = lazy(() =>
  import('./pages/marketing/PremiumPage').then((m) => ({ default: m.PremiumPage }))
);
const DocsPage = lazy(() =>
  import('./pages/marketing/DocsPage').then((m) => ({ default: m.DocsPage }))
);
const SupportPage = lazy(() =>
  import('./pages/marketing/SupportPage').then((m) => ({ default: m.SupportPage }))
);
const ChangelogPage = lazy(() =>
  import('./pages/marketing/ChangelogPage').then((m) => ({ default: m.ChangelogPage }))
);
const TermsPage = lazy(() =>
  import('./pages/marketing/TermsPage').then((m) => ({ default: m.TermsPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/marketing/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/marketing/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Lazy-loaded App & Dev Pages
const ServerPickerPage = lazy(() =>
  import('./pages/app/ServerPickerPage').then((m) => ({ default: m.ServerPickerPage }))
);
const GuildOverviewPage = lazy(() =>
  import('./pages/app/GuildOverviewPage').then((m) => ({ default: m.GuildOverviewPage }))
);
const GuildFeedsPage = lazy(() =>
  import('./pages/app/GuildFeedsPage').then((m) => ({ default: m.GuildFeedsPage }))
);
const GuildAnalyticsPage = lazy(() =>
  import('./pages/app/GuildAnalyticsPage').then((m) => ({ default: m.GuildAnalyticsPage }))
);
const GuildPremiumPage = lazy(() =>
  import('./pages/app/GuildPremiumPage').then((m) => ({ default: m.GuildPremiumPage }))
);
const GuildSettingsPage = lazy(() =>
  import('./pages/app/GuildSettingsPage').then((m) => ({ default: m.GuildSettingsPage }))
);
const DeveloperPage = lazy(() =>
  import('./pages/DeveloperPage').then((m) => ({ default: m.DeveloperPage }))
);

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await apiClient.get<HealthStatus>('/health', {
        maxRetries: 1,
        retryDelayMs: 500,
        validate: isHealthStatus,
      });
      setHealth(data);
    } catch (err: unknown) {
      errorReporter.captureMessage(
        `Backend health probe failed: ${err instanceof Error ? err.message : 'Server offline'}`,
        'warning',
        { endpoint: '/health' }
      );
      setHealth({ status: 'offline' });
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <ErrorBoundary isGlobal name="Nova Platform">
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>
            <ModalProvider>
              <OfflineBanner />
              <AuthProvider>
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* 1. Public Marketing Routes with optional /:lang prefix */}
                      <Route
                        element={<PublicLayout health={health} loadingHealth={loadingHealth} />}
                      >
                        {/* Root default routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/premium" element={<PremiumPage />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/changelog" element={<ChangelogPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />

                        {/* Validated multi-language routes */}
                        <Route path="/:lang" element={<LocaleRouteWrapper />}>
                          <Route index element={<HomePage />} />
                          <Route path="premium" element={<PremiumPage />} />
                          <Route path="docs" element={<DocsPage />} />
                          <Route path="support" element={<SupportPage />} />
                          <Route path="changelog" element={<ChangelogPage />} />
                          <Route path="terms" element={<TermsPage />} />
                          <Route path="privacy" element={<PrivacyPage />} />
                        </Route>

                        {/* Developer Management Portal */}
                        <Route path="/dev" element={<DeveloperPage />} />

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
              </AuthProvider>
            </ModalProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
