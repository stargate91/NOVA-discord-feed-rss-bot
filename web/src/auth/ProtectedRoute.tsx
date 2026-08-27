import type { ReactNode } from 'react';
import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from './useAuth';
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
  const { isLoading, isAuthenticated, adminSecret, checkGuildPermission } = useAuth();
  const { guildId } = useParams<{ guildId?: string }>();

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
    return <Navigate to={fallbackRedirect} replace />;
  }

  // Developer portal route check
  if (requireAdminSecret && !adminSecret) {
    return <Navigate to="/dev" replace />;
  }

  // Guild permission check
  if (requireGuildManage && guildId) {
    const hasAccess = checkGuildPermission(guildId);
    if (!hasAccess) {
      return <Navigate to="/servers" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
