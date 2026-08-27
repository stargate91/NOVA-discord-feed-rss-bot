import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

import type { HealthStatus } from './types';
import { apiClient } from './api';
import { I18nProvider } from './i18n';
import { ToastProvider } from './components/common/Toast';
import { ModalProvider } from './components/common/Modal';
import { OfflineBanner } from './components/common/OfflineBanner';
import { AuthProvider, ProtectedRoute } from './auth';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicLayout, DashboardLayout } from './components/layout';

// Marketing Pages
import { HomePage } from './pages/marketing/HomePage';
import { PremiumPage } from './pages/marketing/PremiumPage';
import { DocsPage } from './pages/marketing/DocsPage';
import { SupportPage } from './pages/marketing/SupportPage';
import { ChangelogPage } from './pages/marketing/ChangelogPage';
import { TermsPage } from './pages/marketing/TermsPage';
import { PrivacyPage } from './pages/marketing/PrivacyPage';

// App & Dev Pages
import { ServerPickerPage } from './pages/app/ServerPickerPage';
import { GuildOverviewPage } from './pages/app/GuildOverviewPage';
import { GuildFeedsPage } from './pages/app/GuildFeedsPage';
import { GuildAnalyticsPage } from './pages/app/GuildAnalyticsPage';
import { GuildPremiumPage } from './pages/app/GuildPremiumPage';
import { GuildSettingsPage } from './pages/app/GuildSettingsPage';
import { DeveloperPage } from './pages/DeveloperPage';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await apiClient.get<HealthStatus>('/health');
      setHealth(data);
    } catch {
      setHealth({ status: 'offline' });
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <ErrorBoundary isGlobal name="Nova Platform">
      <I18nProvider>
        <ToastProvider>
          <ModalProvider>
            <OfflineBanner />
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  {/* 1. Public Marketing Routes with optional /:lang prefix */}
                  <Route element={<PublicLayout health={health} loadingHealth={loadingHealth} />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/:lang" element={<HomePage />} />
                    <Route path="/premium" element={<PremiumPage />} />
                    <Route path="/:lang/premium" element={<PremiumPage />} />
                    <Route path="/docs" element={<DocsPage />} />
                    <Route path="/:lang/docs" element={<DocsPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/:lang/support" element={<SupportPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />
                    <Route path="/:lang/changelog" element={<ChangelogPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/:lang/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/:lang/privacy" element={<PrivacyPage />} />

                    {/* Developer Portal */}
                    <Route path="/dev" element={<DeveloperPage />} />

                    {/* Server Picker (First entry point when entering Dashboard) */}
                    <Route path="/servers" element={<ServerPickerPage />} />
                  </Route>

                  {/* 2. Bot / Guild Dashboard Protected Routes (Clean, No lang in URL) */}
                  <Route element={<ProtectedRoute requireGuildManage />}>
                    <Route path="/dashboard/:guildId" element={<DashboardLayout health={health} loadingHealth={loadingHealth} />}>
                      <Route index element={<GuildOverviewPage />} />
                      <Route path="feeds" element={<GuildFeedsPage />} />
                      <Route path="analytics" element={<GuildAnalyticsPage />} />
                      <Route path="premium" element={<GuildPremiumPage />} />
                      <Route path="settings" element={<GuildSettingsPage />} />
                    </Route>
                  </Route>

                  {/* Fallback to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </ModalProvider>
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
};

export default App;
