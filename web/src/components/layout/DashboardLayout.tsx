import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { HealthStatus } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Container, Drawer } from '../../ui';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className={styles.layout}>
      {/* Desktop Persistent Sidebar */}
      <DashboardSidebar className={styles.desktopSidebar} />

      {/* Mobile Drawer Sidebar */}
      <Drawer
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        position="left"
        size="sm"
      >
        <DashboardSidebar
          onNavClick={() => setIsMobileSidebarOpen(false)}
          className={styles.drawerSidebar}
        />
      </Drawer>

      <div className={styles.mainArea}>
        <DashboardHeader
          health={health}
          loadingHealth={loadingHealth}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <main className={styles.bodyContainer}>
          <Container maxWidth="xl" padding="lg">
            <ErrorBoundary name="Guild Dashboard">
              <Outlet />
            </ErrorBoundary>
          </Container>
        </main>
      </div>
    </div>
  );
};

