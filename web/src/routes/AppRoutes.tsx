import React from 'react';
import { Routes, Route } from 'react-router-dom';
import type { HealthStatus } from '@/types';
import { PublicLayout, DashboardLayout } from '@/components/layout';
import { LocaleRouteWrapper } from '@/components/common/LocaleRouteWrapper';
import { RouteGuardWrapper } from './RouteGuard';
import {
  MARKETING_ROUTES,
  ServerPickerPage,
  DeveloperPage,
  UiCatalogPage,
  AuthCallbackPage,
  GuildOverviewPage,
  GuildFeedsPage,
  GuildAnalyticsPage,
  GuildSettingsPage,
  GuildPremiumPage,
  NotFoundPage,
  getRouteMetaByPath,
} from './config';

export interface AppRoutesProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

/**
 * Enterprise Declarative App Routes
 * Renders layout shells and automatically enforces route guard metadata.
 */
export const AppRoutes: React.FC<AppRoutesProps> = ({ health, loadingHealth }) => {
  return (
    <Routes>
      {/* 1. Public Marketing & Static Routes (Accessible with or without locale prefix) */}
      <Route element={<PublicLayout health={health} loadingHealth={loadingHealth} />}>
        {/* Root default routes */}
        {MARKETING_ROUTES.map((r) => (
          <Route
            key={r.id}
            index={r.isIndex}
            path={r.isIndex ? undefined : r.path}
            element={<r.component />}
          />
        ))}

        {/* Localized sub-routes (e.g. /hu/docs, /de/premium, /ja/changelog) */}
        <Route path=":locale">
          <Route element={<LocaleRouteWrapper />}>
            {MARKETING_ROUTES.map((r) => (
              <Route
                key={`localized-${r.id}`}
                index={r.isIndex}
                path={r.isIndex ? undefined : r.path}
                element={<r.component />}
              />
            ))}
          </Route>
        </Route>

        {/* Developer UI & Mock Catalog (Protected / Gated) */}
        <Route
          path="/dev"
          element={
            <RouteGuardWrapper meta={getRouteMetaByPath('/dev')}>
              <DeveloperPage />
            </RouteGuardWrapper>
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
            <RouteGuardWrapper meta={getRouteMetaByPath('/servers')}>
              <ServerPickerPage />
            </RouteGuardWrapper>
          }
        />
      </Route>

      {/* 2. Bot / Guild Dashboard Protected Routes */}
      <Route
        element={
          <RouteGuardWrapper
            meta={{
              requiresAuth: true,
              requiresGuildManage: true,
              fallbackRedirect: '/servers',
            }}
          >
            <DashboardLayout health={health} loadingHealth={loadingHealth} />
          </RouteGuardWrapper>
        }
      >
        <Route path="/dashboard/:guildId" element={<GuildOverviewPage />} />
        <Route path="/dashboard/:guildId/feeds" element={<GuildFeedsPage />} />
        <Route path="/dashboard/:guildId/analytics" element={<GuildAnalyticsPage />} />
        <Route path="/dashboard/:guildId/settings" element={<GuildSettingsPage />} />
        <Route path="/dashboard/:guildId/premium" element={<GuildPremiumPage />} />
      </Route>

      {/* 3. 404 Catch-all */}
      <Route element={<PublicLayout health={health} loadingHealth={loadingHealth} />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
