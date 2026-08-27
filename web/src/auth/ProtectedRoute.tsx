import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useGuild } from '@/guild';
import { featureFlags } from '@/constants';
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
  const { isLoading, isAuthenticated, adminSecret, mockLogin } = useAuth();
  const { checkGuildPermission } = useGuild();
  const { guildId } = useParams<{ guildId?: string }>();

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

  // Authentication check
  if (requireAuth && !isAuthenticated) {
    if (featureFlags.mockAuth || featureFlags.useMockData) {
      return children ? <>{children}</> : <Outlet />;
    }
    return <Navigate to={fallbackRedirect} replace />;
  }

  // Developer portal route check
  if (requireAdminSecret && !adminSecret) {
    return <Navigate to="/dev" replace />;
  }

  // Guild permission check
  if (requireGuildManage && guildId) {
    const hasAccess = checkGuildPermission(guildId);
    if (!hasAccess && !(featureFlags.mockAuth || featureFlags.useMockData)) {
      return <Navigate to="/servers" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

