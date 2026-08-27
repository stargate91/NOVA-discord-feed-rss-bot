import React from 'react';
import { Settings, UserPlus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Avatar, Stack, Inline, Text, Badge, Button } from '@/ui';
import styles from './ServerPickerCard.module.css';

export interface ServerItem {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  isBotInServer: boolean;
  monitors: number;
}

export interface ServerPickerCardProps {
  server: ServerItem;
  onManage: (serverId: string) => void;
  onInvite: () => void;
}

export const ServerPickerCard: React.FC<ServerPickerCardProps> = ({
  server,
  onManage,
  onInvite,
}) => {
  const { t } = useTranslation();

  return (
    <Card glow={server.isBotInServer ? 'blue' : 'none'} interactive padding="lg">
      <Stack gap="lg">
        <Inline align="center" gap="md">
          <Avatar
            src={server.avatar}
            name={server.name}
            size="md"
            status={server.isBotInServer ? 'online' : 'offline'}
          />
          <Stack gap="none">
            <Text weight="bold">{server.name}</Text>
            <Text size="2xs" color="muted" mono>
              {server.id}
            </Text>
          </Stack>
        </Inline>

        <Stack gap="xs">
          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('servers.statusLabel')}
            </Text>
            {server.isBotInServer ? (
              <span className={`${styles.ekgBadge} ${styles.ekgBadgeActive}`}>
                <svg
                  className={styles.ekgSvg}
                  viewBox="0 0 26 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    className={styles.ekgTrack}
                    d="M0,6 L6,6 L8,6 L10,1 L12,11 L14,3 L16,7 L18,6 L26,6"
                  />
                  <path
                    className={styles.ekgPulse}
                    d="M0,6 L6,6 L8,6 L10,1 L12,11 L14,3 L16,7 L18,6 L26,6"
                  />
                </svg>
                <span>{t('servers.statusActive')}</span>
              </span>
            ) : (
              <span className={`${styles.ekgBadge} ${styles.ekgBadgeInactive}`}>
                <svg
                  className={styles.flatlineSvg}
                  viewBox="0 0 26 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line
                    className={styles.flatline}
                    x1="0"
                    y1="6"
                    x2="26"
                    y2="6"
                  />
                </svg>
                <span>{t('servers.statusNotInvited')}</span>
              </span>
            )}
          </Inline>

          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('servers.planLabel')}
            </Text>
            <Badge variant="tier">{server.tier}</Badge>
          </Inline>

          <Inline justify="between" align="center">
            <Text size="xs" color="secondary">
              {t('servers.activeFeedsLabel')}
            </Text>
            <Text size="xs" weight="semibold">
              {t('servers.monitorsCount', { count: server.monitors })}
            </Text>
          </Inline>
        </Stack>

        {server.isBotInServer ? (
          <Button variant="primary" fullWidth onClick={() => onManage(server.id)}>
            <Settings size={14} /> {t('servers.manageBtn')}
          </Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={onInvite}>
            <UserPlus size={14} /> {t('servers.inviteBtn')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};
