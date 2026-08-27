import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, ProgressBar, Stack, Inline, Text } from '@/ui';
import type { GuildAnalyticsSummary } from '../types';

interface PlatformDistributionCardProps {
  data: GuildAnalyticsSummary;
}

export const PlatformDistributionCard: React.FC<PlatformDistributionCardProps> = () => {
  const { t } = useTranslation();

  return (
    <Card
      title={t('guild.platformDistributionTitle')}
      subtitle={t('guild.platformDistributionSubtitle')}
    >
      <Stack gap="md">
        <Stack gap="3xs">
          <Inline justify="between" align="center">
            <Text size="xs">{t('guild.analyticsPlatformYoutube')}</Text>
            <Text size="xs" color="secondary">
              {t('guild.analyticsPlatformYoutubeStats')}
            </Text>
          </Inline>
          <ProgressBar value={48} max={100} size="sm" variant="danger" />
        </Stack>

        <Stack gap="3xs">
          <Inline justify="between" align="center">
            <Text size="xs">{t('guild.analyticsPlatformTwitchKick')}</Text>
            <Text size="xs" color="secondary">
              {t('guild.analyticsPlatformTwitchKickStats')}
            </Text>
          </Inline>
          <ProgressBar value={30} max={100} size="sm" variant="purple" />
        </Stack>

        <Stack gap="3xs">
          <Inline justify="between" align="center">
            <Text size="xs">{t('guild.analyticsPlatformGames')}</Text>
            <Text size="xs" color="secondary">
              {t('guild.analyticsPlatformGamesStats')}
            </Text>
          </Inline>
          <ProgressBar value={14} max={100} size="sm" variant="brand" />
        </Stack>

        <Stack gap="3xs">
          <Inline justify="between" align="center">
            <Text size="xs">{t('guild.analyticsPlatformRss')}</Text>
            <Text size="xs" color="secondary">
              {t('guild.analyticsPlatformRssStats')}
            </Text>
          </Inline>
          <ProgressBar value={8} max={100} size="sm" variant="warning" />
        </Stack>
      </Stack>
    </Card>
  );
};
