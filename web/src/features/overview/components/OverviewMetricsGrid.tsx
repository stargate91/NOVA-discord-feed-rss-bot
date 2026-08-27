import React from 'react';
import { Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, ProgressBar, Stack, Grid, Text } from '@/ui';
import { MOCK_OVERVIEW_METRICS } from '../constants';

export const OverviewMetricsGrid: React.FC = () => {
  const { t } = useTranslation();
  const { activeFeedsQuota, latency, deliveredNotifications } = MOCK_OVERVIEW_METRICS;

  return (
    <Grid minItemWidth="sm" gap="lg">
      <Card glow="blue">
        <Card.Header>
          <Card.Title>{t('guild.metricActiveFeeds')}</Card.Title>
          <Card.Actions>
            <Activity size={16} color="var(--blue-400)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="brand">
            {t('guild.metricActiveFeedsQuota', {
              current: activeFeedsQuota.current,
              max: activeFeedsQuota.max,
            })}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.metricActiveFeedsDesc', { percent: activeFeedsQuota.percent })}
          </Text>
          <ProgressBar value={activeFeedsQuota.percent} max={100} size="sm" variant="brand" />
        </Stack>
      </Card>

      <Card glow="green">
        <Card.Header>
          <Card.Title>{t('guild.metricLatency')}</Card.Title>
          <Card.Actions>
            <Zap size={16} color="var(--status-success)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="success">
            {t('guild.metricLatencyValue', { ms: latency.ms })}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.metricLatencyDesc')}
          </Text>
          <ProgressBar value={latency.scorePercent} max={100} size="sm" variant="success" />
        </Stack>
      </Card>

      <Card glow="purple">
        <Card.Header>
          <Card.Title>{t('guild.metricDelivered')}</Card.Title>
          <Card.Actions>
            <CheckCircle2 size={16} color="var(--status-purple)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="purple">
            {t('guild.metricDeliveredValue', { count: deliveredNotifications.count })}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.metricDeliveredDesc')}
          </Text>
          <ProgressBar
            value={deliveredNotifications.scorePercent}
            max={100}
            size="sm"
            variant="purple"
          />
        </Stack>
      </Card>
    </Grid>
  );
};
