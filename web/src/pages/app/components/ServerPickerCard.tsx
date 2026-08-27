import React from 'react';
import { Settings, UserPlus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, Avatar, Stack, Inline, Text, Badge, Button } from '@/ui';

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
    <Card
      glow={server.isBotInServer ? 'blue' : 'none'}
      interactive
      padding="lg"
    >
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
            <Badge variant={server.isBotInServer ? 'online' : 'neutral'} dot>
              {server.isBotInServer
                ? t('servers.statusActive')
                : t('servers.statusNotInvited')}
            </Badge>
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
          <Button
            variant="primary"
            fullWidth
            onClick={() => onManage(server.id)}
          >
            <Settings size={14} /> {t('servers.manageBtn')}
          </Button>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            onClick={onInvite}
          >
            <UserPlus size={14} /> {t('servers.inviteBtn')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};
