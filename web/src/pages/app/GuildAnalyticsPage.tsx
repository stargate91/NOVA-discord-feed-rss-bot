import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Download } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { FeatureGate } from '../../components/common/FeatureGate';
import {
  Card,
  Badge,
  ProgressBar,
  SegmentedControl,
  Button,
  Stack,
  Inline,
  Grid,
  Text,
} from '../../ui';

const TIME_RANGE_OPTIONS = [
  { value: '24h', labelKey: 'guild.analytics24h' },
  { value: '7d', labelKey: 'guild.analytics7d' },
  { value: '30d', labelKey: 'guild.analytics30d' },
] as const;

export const GuildAnalyticsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<string>('7d');

  return (
    <Stack gap="xl">
      <Inline justify="between" align="center" wrap gap="md">
        <Stack gap="3xs">
          <Text as="h2" size="lg" weight="bold">
            {t('guild.analyticsTitle')}
          </Text>
          <Text size="xs" color="secondary">
            {t('guild.analyticsSubtitle', { guildId })}
          </Text>
        </Stack>

        <Inline align="center" gap="md">
          <SegmentedControl
            size="sm"
            value={timeRange}
            onChange={setTimeRange}
            options={TIME_RANGE_OPTIONS.map((opt) => ({
              value: opt.value,
              label: t(opt.labelKey),
            }))}
          />
          <Badge variant="online" dot pulse>
            {t('guild.liveMetricsBadge')}
          </Badge>
        </Inline>
      </Inline>

      {/* Primary Counters with Glow and Progress */}
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
              {t('guild.analyticsPostsDeliveredCount')}
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
              {t('guild.analyticsSuccessRateValue')}
            </Text>
            <Text size="2xs" color="muted">
              {t('guild.analyticsSuccessRateSubtitle')}
            </Text>
            <ProgressBar value={99.98} max={100} size="sm" variant="success" />
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
              {t('guild.analyticsAvgLatencyValue')}
            </Text>
            <Text size="2xs" color="muted">
              {t('guild.analyticsAvgLatencySubtitle')}
            </Text>
            <ProgressBar value={88} max={100} size="sm" variant="purple" />
          </Stack>
        </Card>
      </Grid>

      {/* Secondary Detailed Breakdown with Visual Progress Bars */}
      <Grid minItemWidth="md" gap="lg">
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
      </Grid>

      {/* Ultimate Tier Exclusive Real-time Stream Inspector */}
      <FeatureGate
        tier="ultimate"
        featureName={t('guild.analyticsFeatureName')}
        description={t('guild.analyticsFeatureDesc')}
      >
        <Card
          glow="blue"
          title={t('guild.analyticsAuditExportTitle')}
          subtitle={t('guild.analyticsAuditExportSubtitle')}
        >
          <Inline justify="between" align="center" wrap gap="md">
            <Text size="xs" color="secondary">
              {t('guild.analyticsAuditArchiveReady')}
            </Text>
            <Button variant="primary" size="sm">
              <Download size={14} /> {t('guild.exportCsvBtn')}
            </Button>
          </Inline>
        </Card>
      </FeatureGate>
    </Stack>
  );
};
