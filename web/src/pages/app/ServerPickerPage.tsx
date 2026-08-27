import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogIn, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { SEO } from '@/components/common/SEO';
import {
  DISCORD_CLIENT_ID,
  DISCORD_BOT_PERMISSIONS,
  DISCORD_BOT_SCOPES,
  buildDiscordBotInviteUrl,
  featureFlags,
} from '@/constants';
import { openExternalUrl } from '@/utils';
import { useApiQuery, apiClient } from '@/api';
import { useAuth, isMasterGuild, toGuildTier, TIER_LABELS } from '@/auth';
import { useGuild } from '@/guild';
import { Button, CardSkeleton, Grid, Stack, Inline, Text, EmptyState, Alert } from '@/ui';
import type { ServerItem } from './components';
import { ServerPickerCard } from './components';
import styles from './ServerPickerPage.module.css';

interface ApiGuildItem {
  id?: string;
  guild_id?: string;
  name: string;
  icon?: string | null;
  tier: number | string;
  active_monitors?: number;
  monitorsCount?: number;
  max_monitors?: number;
  bot_in_guild: boolean;
}

const MOCK_SERVERS: ServerItem[] = [
  {
    id: '1083433370815582240',
    name: 'Stargate Lounge',
    avatar: '/images/logo.webp',
    tier: 'Nova Master',
    isBotInServer: true,
    monitors: 12,
  },
  {
    id: '123456789012345678',
    name: 'Gaming Community',
    avatar: '/images/logo.webp',
    tier: 'Nova Professional',
    isBotInServer: true,
    monitors: 8,
  },
  {
    id: '987654321098765432',
    name: 'Creator Hub',
    avatar: '/images/logo.webp',
    tier: 'Nova Ultimate',
    isBotInServer: true,
    monitors: 24,
  },
  {
    id: '555666777888999000',
    name: 'Public Hangout',
    avatar: '/images/logo.webp',
    tier: 'Nova Free',
    isBotInServer: false,
    monitors: 0,
  },
];

export const ServerPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, loginWithDiscord, mockLogin } = useAuth();
  const { selectGuild } = useGuild();
  const [showDemoServers, setShowDemoServers] = useState<boolean>(false);

  const {
    data: rawGuilds,
    isLoading,
    error,
    refetch,
  } = useApiQuery<ApiGuildItem[]>(
    async (signal) => {
      if (featureFlags.useMockData || showDemoServers) {
        return [];
      }
      return apiClient.get<ApiGuildItem[]>('/api/v1/users/@me/guilds', { signal });
    },
    [showDemoServers, isAuthenticated],
    { key: 'user-manageable-guilds', enabled: isAuthenticated && !showDemoServers }
  );

  const isMockActive = featureFlags.useMockData || showDemoServers;

  const servers: ServerItem[] =
    rawGuilds && rawGuilds.length > 0
      ? rawGuilds.map((g) => {
          const guildId = String(g.id || g.guild_id);
          return {
            id: guildId,
            name: g.name,
            avatar: g.icon
              ? `https://cdn.discordapp.com/icons/${guildId}/${g.icon}.png`
              : '/images/logo.webp',
            tier: isMasterGuild(guildId)
              ? 'Nova Master'
              : TIER_LABELS[toGuildTier(g.tier, guildId)],
            isBotInServer: g.bot_in_guild,
            monitors: g.active_monitors ?? g.monitorsCount ?? 0,
          };
        })
      : isMockActive
        ? MOCK_SERVERS
        : [];

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

        {error && (
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} /> {t('servers.retryBtn')}
          </Button>
        )}
      </Inline>

      {/* Authentication Prompt */}
      {!isAuthenticated && (
        <Alert
          variant="warning"
          title={t('common.authRequiredTitle')}
          description={t('common.authRequiredDesc')}
          action={
            <Inline gap="sm" align="center" className={styles.alertActionRow}>
              <Button variant="discord" size="sm" onClick={() => loginWithDiscord()}>
                <LogIn size={14} /> {t('common.loginWithDiscord')}
              </Button>
              {!import.meta.env.PROD && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    mockLogin();
                    setShowDemoServers(true);
                  }}
                >
                  <Sparkles size={14} /> {t('common.demoLogin')}
                </Button>
              )}
            </Inline>
          }
        />
      )}

      {/* Backend Offline or Communication Error Alert */}
      {error && !isMockActive && (
        <Alert
          variant={error.status === 401 ? 'warning' : 'danger'}
          title={
            error.status === 401 ? t('common.sessionExpired') : t('servers.errorLoadingServers')
          }
          description={
            error.status === 401
              ? t('common.authRequiredDesc')
              : `${t('common.backendOfflineDesc')} (${error.message || t('common.connectionRefused')})`
          }
          action={
            <Inline gap="sm" align="center" wrap className={styles.alertActionRow}>
              {error.status === 401 ? (
                <Button variant="discord" size="sm" onClick={() => loginWithDiscord()}>
                  <LogIn size={14} /> {t('common.loginWithDiscord')}
                </Button>
              ) : (
                <>
                  <Button variant="secondary" size="sm" onClick={() => refetch()}>
                    <RefreshCw size={14} /> {t('common.retryConnection')}
                  </Button>
                  <Button variant="discord" size="sm" onClick={() => loginWithDiscord()}>
                    <LogIn size={14} /> {t('common.loginWithDiscord')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDemoServers(true);
                    }}
                  >
                    <Sparkles size={14} /> {t('common.tryDemoMode')}
                  </Button>
                </>
              )}
            </Inline>
          }
        />
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <Grid minItemWidth="sm" gap="lg">
          {[1, 2, 3].map((key) => (
            <CardSkeleton key={`skeleton-server-${key}`} lines={3} />
          ))}
        </Grid>
      ) : servers.length > 0 ? (
        <Grid minItemWidth="sm" gap="lg">
          {servers.map((server) => (
            <ServerPickerCard
              key={server.id}
              server={server}
              onManage={(serverId) => {
                selectGuild(serverId);
                navigate(`/dashboard/${serverId}`);
              }}
              onInvite={() =>
                openExternalUrl(
                  buildDiscordBotInviteUrl(
                    DISCORD_CLIENT_ID,
                    DISCORD_BOT_PERMISSIONS,
                    DISCORD_BOT_SCOPES,
                    server.id
                  )
                )
              }
            />
          ))}
        </Grid>
      ) : (
        <EmptyState
          title={t('servers.noServersFound')}
          description={t('servers.noServersDesc')}
          action={
            <Inline gap="sm" align="center">
              {!isAuthenticated ? (
                <Button variant="discord" onClick={() => loginWithDiscord()}>
                  <LogIn size={14} /> {t('common.loginWithDiscord')}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => refetch()}>
                  <RefreshCw size={14} /> {t('servers.retryBtn')}
                </Button>
              )}
            </Inline>
          }
        />
      )}
    </Stack>
  );
};
