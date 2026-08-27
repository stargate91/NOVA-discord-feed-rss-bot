import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, Stack, Inline, Text } from '@/ui';

export const ChannelHealthCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('guild.channelHealthTitle')} subtitle={t('guild.channelHealthSubtitle')}>
      <Stack gap="xs">
        <Inline justify="between" align="center">
          <Text size="xs" color="secondary">
            {t('guild.analyticsHealthChannels')}
          </Text>
          <Text size="xs" weight="semibold">
            {t('guild.analyticsHealthChannelsCount')}
          </Text>
        </Inline>
        <Inline justify="between" align="center">
          <Text size="xs" color="secondary">
            {t('guild.analyticsHealthPermErrors')}
          </Text>
          <Text size="xs" weight="semibold">
            {t('guild.analyticsHealthPermErrorsHealthy')}
          </Text>
        </Inline>
        <Inline justify="between" align="center">
          <Text size="xs" color="secondary">
            {t('guild.analyticsHealthRateLimit')}
          </Text>
          <Text size="xs" weight="semibold">
            {t('guild.analyticsHealthRateLimitEvents')}
          </Text>
        </Inline>
        <Inline justify="between" align="center">
          <Text size="xs" color="secondary">
            {t('guild.analyticsHealthQueueSpeed')}
          </Text>
          <Text size="xs" weight="semibold">
            {t('guild.analyticsHealthQueueSpeedValue')}
          </Text>
        </Inline>
      </Stack>
    </Card>
  );
};
