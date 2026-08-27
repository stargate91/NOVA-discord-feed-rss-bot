import React from 'react';
import { useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import type { HealthStatus } from '../../types';
import { useTranslation } from '../../i18n';
import { ThemeToggle } from '../../theme';
import { Badge, Container, Inline, Text } from '../../ui';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  health: HealthStatus | null;
  loadingHealth: boolean;
  onMobileMenuClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  health,
  loadingHealth,
  onMobileMenuClick,
}) => {
  const { guildId = '123456789012345678' } = useParams<{ guildId?: string }>();
  const { t } = useTranslation();
  const isOnline = health?.status === 'ok' || health?.status === 'healthy';

  return (
    <header className={styles.header}>
      <Container maxWidth="xl" padding="md">
        <Inline justify="between" align="center" gap="md">
          <Inline align="center" gap="sm">
            {onMobileMenuClick && (
              <button
                type="button"
                className={styles.mobileMenuBtn}
                onClick={onMobileMenuClick}
                aria-label="Open sidebar menu"
              >
                <Menu size={18} />
              </button>
            )}
            <Text as="h2" size="base" weight="bold">
              {t('common.serverWithId', { id: guildId })}
            </Text>
            <Badge variant="tier">{t('common.plusTier')}</Badge>
          </Inline>

          <Inline align="center" gap="sm">
            <ThemeToggle />

            {loadingHealth ? (
              <Badge variant="neutral">{t('common.checking')}</Badge>
            ) : isOnline ? (
              <Badge variant="online" dot>
                {t('common.backendOnline')}
              </Badge>
            ) : (
              <Badge variant="offline" dot>
                {t('common.backendOffline')}
              </Badge>
            )}
          </Inline>
        </Inline>
      </Container>
    </header>
  );
};
