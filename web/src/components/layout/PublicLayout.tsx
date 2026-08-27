import React from 'react';
import { Outlet } from 'react-router-dom';
import type { HealthStatus } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import styles from './PublicLayout.module.css';

interface PublicLayoutProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  health,
  loadingHealth,
}) => {
  return (
    <div className={styles.layout}>
      <Navbar
        health={health}
        loadingHealth={loadingHealth}
      />
      <main className={styles.body}>
        <ErrorBoundary name="Marketing Page">
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};
