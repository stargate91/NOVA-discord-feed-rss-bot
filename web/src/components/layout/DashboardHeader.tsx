import React from 'react';
import { useParams } from 'react-router-dom';
import type { HealthStatus } from '../../types';
import { Badge } from '../../ui';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  health,
  loadingHealth,
}) => {
  const { guildId = '123456789012345678' } = useParams<{ guildId?: string }>();
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.titleGroup}>
          <h2>Server #{guildId}</h2>
          <Badge variant="tier">Plus Tier</Badge>
        </div>

        <div className={styles.actions}>
          {loadingHealth ? (
            <Badge variant="neutral">Checking...</Badge>
          ) : isOnline ? (
            <Badge variant="online" dot>Backend Online</Badge>
          ) : (
            <Badge variant="offline" dot>Backend Offline</Badge>
          )}
        </div>
      </div>
    </header>
  );
};
