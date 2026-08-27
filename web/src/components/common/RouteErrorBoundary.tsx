import type { ReactNode } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  name?: string;
}

/**
 * Route-level Error Boundary that automatically resets its error state
 * whenever the browser location (URL pathname) changes.
 */
export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children, name }) => {
  const location = useLocation();

  return (
    <ErrorBoundary
      key={location.pathname}
      isGlobal={false}
      name={name || `Route (${location.pathname})`}
    >
      {children}
    </ErrorBoundary>
  );
};
