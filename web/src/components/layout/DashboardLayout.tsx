import React from 'react';
import { Outlet } from 'react-router-dom';
import type { HealthStatus } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  health,
  loadingHealth,
}) => {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <div className={styles.mainArea}>
        <DashboardHeader
          health={health}
          loadingHealth={loadingHealth}
        />
        <main className={styles.bodyContainer}>
          <ErrorBoundary name="Guild Dashboard">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
