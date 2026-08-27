import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '@/styles/global.css';

import type { HealthStatus } from '@/types';
import { apiClient } from '@/api';
import { ThemeProvider } from '@/theme';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/components/common/Toast';
import { ConfirmProvider } from '@/components/common/ConfirmDialog';
import { ComposeProviders } from '@/components/common/ComposeProviders';
import { AnnouncerProvider } from '@/components/common/ScreenReaderAnnouncer';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { PageLoader } from '@/components/common/PageLoader';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { AuthProvider } from '@/auth';
import { GuildProvider } from '@/guild';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';

const APP_PROVIDERS = [
  ErrorBoundary,
  ThemeProvider,
  I18nProvider,
  AnnouncerProvider,
  ToastProvider,
  ConfirmProvider,
  AuthProvider,
  GuildProvider,
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
          setHealth(null);
          setLoadingHealth(false);
        }
      }
    };

    fetchHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ComposeProviders providers={APP_PROVIDERS}>
      <BrowserRouter>
        <ScrollToTop />
        <OfflineBanner />
        <Suspense fallback={<PageLoader />}>
          <AppRoutes health={health} loadingHealth={loadingHealth} />
        </Suspense>
      </BrowserRouter>
    </ComposeProviders>
  );
};

export default App;
