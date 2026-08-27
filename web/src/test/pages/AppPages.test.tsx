import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';
import { AuthProvider } from '@/auth';
import { GuildProvider } from '@/guild';
import { ToastProvider } from '@/components/common/Toast';
import { ConfirmProvider } from '@/components/common/ConfirmDialog';
import { ServerPickerPage } from '@/pages/app/ServerPickerPage';
import { GuildOverviewPage } from '@/pages/app/GuildOverviewPage';
import { GuildFeedsPage } from '@/pages/app/GuildFeedsPage';
import { GuildAnalyticsPage } from '@/pages/app/GuildAnalyticsPage';
import { GuildSettingsPage } from '@/pages/app/GuildSettingsPage';
import { GuildPremiumPage } from '@/pages/app/GuildPremiumPage';
import { DeveloperPage } from '@/pages/dev/DeveloperPage';
import { UiCatalogPage } from '@/pages/dev/UiCatalogPage';

const renderWithAllProviders = (
  component: React.ReactElement,
  initialPath: string = '/dashboard/123456789'
) => {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <GuildProvider>
                <MemoryRouter initialEntries={[initialPath]}>
                  <Routes>
                    <Route path="/servers" element={component} />
                    <Route path="/dashboard/:guildId" element={component} />
                    <Route path="/dashboard/:guildId/feeds" element={component} />
                    <Route path="/dashboard/:guildId/analytics" element={component} />
                    <Route path="/dashboard/:guildId/settings" element={component} />
                    <Route path="/dashboard/:guildId/premium" element={component} />
                    <Route path="/dev" element={component} />
                    <Route path="/dev/ui" element={component} />
                  </Routes>
                </MemoryRouter>
              </GuildProvider>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

describe('App & Dashboard Pages Smoke & Render Tests', () => {
  it('should render ServerPickerPage without crashing', () => {
    renderWithAllProviders(<ServerPickerPage />, '/servers');
    expect(document.body).toBeInTheDocument();
  });

  it('should render GuildOverviewPage without crashing', () => {
    renderWithAllProviders(<GuildOverviewPage />, '/dashboard/123456789');
    expect(document.body).toBeInTheDocument();
  });

  it('should render GuildFeedsPage without crashing', () => {
    renderWithAllProviders(<GuildFeedsPage />, '/dashboard/123456789/feeds');
    expect(document.body).toBeInTheDocument();
  });

  it('should render GuildAnalyticsPage without crashing', () => {
    renderWithAllProviders(<GuildAnalyticsPage />, '/dashboard/123456789/analytics');
    expect(document.body).toBeInTheDocument();
  });

  it('should render GuildSettingsPage without crashing', () => {
    renderWithAllProviders(<GuildSettingsPage />, '/dashboard/123456789/settings');
    expect(document.body).toBeInTheDocument();
  });

  it('should render GuildPremiumPage without crashing', () => {
    renderWithAllProviders(<GuildPremiumPage />, '/dashboard/123456789/premium');
    expect(document.body).toBeInTheDocument();
  });

  it('should render DeveloperPage authentication gateway without crashing', () => {
    renderWithAllProviders(<DeveloperPage />, '/dev');
    expect(screen.getByRole('heading', { level: 3, name: /Developer Authentication/i })).toBeInTheDocument();
  });

  it('should render UiCatalogPage without crashing', () => {
    renderWithAllProviders(<UiCatalogPage />, '/dev/ui');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
