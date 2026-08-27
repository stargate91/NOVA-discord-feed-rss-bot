import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { HealthStatus } from '@/types';
import { useTranslation } from '@/i18n';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { Container, Drawer } from '@/ui';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ health, loadingHealth }) => {
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  return (
    <div className={styles.layout}>
      <a href="#dashboard-main-content" className="skipToContent">
        {t('common.skipToContent')}
      </a>

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
        <main id="dashboard-main-content" className={styles.bodyContainer} tabIndex={-1}>
          <Container maxWidth="xl" padding="lg">
            <RouteErrorBoundary name="Guild Dashboard">
              <Outlet />
            </RouteErrorBoundary>
          </Container>
        </main>
      </div>
    </div>
  );
};
