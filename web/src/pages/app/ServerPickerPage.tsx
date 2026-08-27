import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, UserPlus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { DISCORD_BOT_INVITE_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Button, Badge, Card, Avatar, CardSkeleton, Grid, Stack, Inline, Text } from '@/ui';

interface ServerItem {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  isBotInServer: boolean;
  monitors: number;
}

export const ServerPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mockServers: ServerItem[] = [
    {
      id: '123456789012345678',
      name: 'Stargate Gaming Lounge',
      avatar: '/images/logo.webp',
      tier: 'Plus Tier',
      isBotInServer: true,
      monitors: 8,
    },
    {
      id: '987654321098765432',
      name: 'Creator Hub VIP',
      avatar: '/images/logo.webp',
      tier: 'Master Tier',
      isBotInServer: true,
      monitors: 24,
    },
    {
      id: '555666777888999000',
      name: 'Community Anime & Hangout',
      avatar: '/images/logo.webp',
      tier: 'Free',
      isBotInServer: false,
      monitors: 0,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack gap="lg">
      <SEO title={t('servers.title')} description={t('servers.subtitle')} />

      <Inline justify="between" align="center" wrap gap="md">
        <Stack gap="3xs">
          <Text as="h2" size="lg" weight="bold">
            {t('servers.title')}
          </Text>
          <Text size="xs" color="secondary">
            {t('servers.subtitle')}
          </Text>
        </Stack>

        <Button variant="discord" onClick={() => openExternalUrl(DISCORD_BOT_INVITE_URL)}>
          <Plus size={14} /> {t('servers.addBot')}
        </Button>
      </Inline>

      <Grid minItemWidth="sm" gap="lg">
        {isLoading
          ? [1, 2, 3].map((key) => <CardSkeleton key={`skeleton-server-${key}`} lines={3} />)
          : mockServers.map((server) => (
              <Card
                key={server.id}
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
                      onClick={() => navigate(`/dashboard/${server.id}`)}
                    >
                      <Settings size={14} /> {t('servers.manageBtn')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => openExternalUrl(DISCORD_BOT_INVITE_URL)}
                    >
                      <UserPlus size={14} /> {t('servers.inviteBtn')}
                    </Button>
                  )}
                </Stack>
              </Card>
            ))}
      </Grid>
    </Stack>
  );
};
