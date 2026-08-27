import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import { DISCORD_BOT_INVITE_URL } from '@/constants';
import { openExternalUrl } from '@/utils';
import { Button, CardSkeleton, Grid, Stack, Inline, Text } from '@/ui';
import type { ServerItem } from './components';
import { ServerPickerCard } from './components';

const MOCK_SERVERS: ServerItem[] = [
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

export const ServerPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          : MOCK_SERVERS.map((server) => (
              <ServerPickerCard
                key={server.id}
                server={server}
                onManage={(serverId) => navigate(`/dashboard/${serverId}`)}
                onInvite={() => openExternalUrl(DISCORD_BOT_INVITE_URL)}
              />
            ))}
      </Grid>
    </Stack>
  );
};
