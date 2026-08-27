import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { Navigate, Outlet, useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from './useAuth';
import { useGuild } from '@/guild';
import { featureFlags } from '@/constants';
import { useTranslation } from '@/i18n';
import { Card, Button, Stack, Text } from '@/ui';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAuth?: boolean;
  requireGuildManage?: boolean;
  requireAdminSecret?: boolean;
  fallbackRedirect?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireGuildManage = false,
  requireAdminSecret = false,
  fallbackRedirect = '/',
}) => {
  const { isLoading, isAuthenticated, adminSecret, mockLogin, loginWithDiscord } = useAuth();
  const { checkGuildPermission, isLoadingGuilds } = useGuild();
  const { guildId } = useParams<{ guildId?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // In development / mock mode, automatically sign in with demo credentials when accessing protected routes
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      if (featureFlags.mockAuth || featureFlags.useMockData) {
        mockLogin();
      }
    }
  }, [requireAuth, isAuthenticated, isLoading, mockLogin]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span>Verifying Security Entitlements...</span>
      </div>
    );
  }

  // Authentication check: render auth gate UI with clear Discord login action
  if (requireAuth && !isAuthenticated) {
    if (featureFlags.mockAuth || featureFlags.useMockData) {
      return children ? <>{children}</> : <Outlet />;
    }

    return (
      <div className={styles.authGateWrapper}>
        <Card padding="xl" glow="blue" className={styles.authGateCard}>
          <Stack align="center" gap="lg">
            <div className={styles.authIconBadge}>
              <ShieldAlert size={32} />
            </div>

            <Stack align="center" gap="2xs">
              <Text as="h2" size="lg" weight="bold">
                {t('common.authRequiredTitle')}
              </Text>
              <Text size="sm" color="secondary" align="center">
                {t('common.authRequiredDesc')}
              </Text>
            </Stack>

            <Stack gap="sm" style={{ width: '100%' }}>
              <Button
                variant="discord"
                size="lg"
                fullWidth
                onClick={() => loginWithDiscord()}
              >
                <LogIn size={18} /> {t('common.loginWithDiscord')}
              </Button>

              {!import.meta.env.PROD && (
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => mockLogin()}
                >
                  <Sparkles size={16} /> {t('common.demoLogin')}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => navigate(fallbackRedirect)}
              >
                <ArrowLeft size={14} /> {t('common.authCallbackReturnHome')}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </div>
    );
  }

  // Developer portal route check
  if (requireAdminSecret && !adminSecret) {
    return <Navigate to="/dev" replace />;
  }

  // Guild permission check
  if (requireGuildManage && guildId) {
    if (isLoadingGuilds) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span>Verifying Server Permissions...</span>
        </div>
      );
    }

    const hasAccess = checkGuildPermission(guildId);
    if (!hasAccess && !(featureFlags.mockAuth || featureFlags.useMockData)) {
      return <Navigate to="/servers" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
