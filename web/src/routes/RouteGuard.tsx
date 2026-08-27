import React from 'react';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import type { RouteMeta } from './types';

export interface RouteGuardWrapperProps {
  meta?: RouteMeta;
  children: React.ReactNode;
}

/**
 * RouteGuard automatically applies authentication and guild permission guards
 * declared in route metadata.
 */
export const RouteGuardWrapper: React.FC<RouteGuardWrapperProps> = ({ meta, children }) => {
  if (!meta || (!meta.requiresAuth && !meta.requiresGuildManage)) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute
      requireAuth={meta.requiresAuth}
      requireGuildManage={meta.requiresGuildManage}
      fallbackRedirect={meta.fallbackRedirect || '/'}
    >
      {children}
    </ProtectedRoute>
  );
};
