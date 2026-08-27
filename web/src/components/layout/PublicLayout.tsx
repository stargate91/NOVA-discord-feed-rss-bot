import React from 'react';
import { Outlet } from 'react-router-dom';
import type { HealthStatus } from '@/types';
import { useTranslation } from '@/i18n';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import styles from './PublicLayout.module.css';

interface PublicLayoutProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ health, loadingHealth }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      <a href="#main-content" className="skipToContent">
        {t('common.skipToContent')}
      </a>
      <Navbar health={health} loadingHealth={loadingHealth} />
      <main id="main-content" className={styles.body} tabIndex={-1}>
        <RouteErrorBoundary name="Marketing Page">
          <Outlet />
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};
