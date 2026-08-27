import React from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Card, ProgressBar, Stack, Grid, Text } from '@/ui';
import type { GuildAnalyticsSummary } from '../types';

interface AnalyticsCountersGridProps {
  data: GuildAnalyticsSummary;
}

export const AnalyticsCountersGrid: React.FC<AnalyticsCountersGridProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Grid minItemWidth="sm" gap="lg">
      <Card glow="blue">
        <Card.Header>
          <Card.Title>{t('guild.totalPostsDelivered')}</Card.Title>
          <Card.Actions>
            <Activity size={18} color="var(--blue-400)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="brand">
            {data.total_posts_delivered.toLocaleString()}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.analyticsPostsDeliveredSubtitle')}
          </Text>
          <ProgressBar value={71} max={100} size="sm" variant="brand" />
        </Stack>
      </Card>

      <Card glow="green">
        <Card.Header>
          <Card.Title>{t('guild.successRate')}</Card.Title>
          <Card.Actions>
            <ShieldCheck size={18} color="var(--status-success)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="success">
            {`${data.success_rate}%`}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.analyticsSuccessRateSubtitle')}
          </Text>
          <ProgressBar value={data.success_rate} max={100} size="sm" variant="success" />
        </Stack>
      </Card>

      <Card glow="purple">
        <Card.Header>
          <Card.Title>{t('guild.avgLatency')}</Card.Title>
          <Card.Actions>
            <Zap size={18} color="var(--status-purple)" />
          </Card.Actions>
        </Card.Header>
        <Stack gap="xs">
          <Text size="2xl" weight="black" color="purple">
            {`${data.avg_latency_ms}ms`}
          </Text>
          <Text size="2xs" color="muted">
            {t('guild.analyticsAvgLatencySubtitle')}
          </Text>
          <ProgressBar value={88} max={100} size="sm" variant="purple" />
        </Stack>
      </Card>
    </Grid>
  );
};
