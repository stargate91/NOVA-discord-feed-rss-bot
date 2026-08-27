import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Grid } from '@/ui';
import {
  AnalyticsPageHeader,
  AnalyticsCountersGrid,
  PlatformDistributionCard,
  ChannelHealthCard,
  AnalyticsAuditExportCard,
  useGuildAnalytics,
} from '@/features/analytics';

export const GuildAnalyticsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { data, timeRange, setTimeRange } = useGuildAnalytics(guildId);

  return (
    <Stack gap="xl">
      <AnalyticsPageHeader
        guildId={guildId}
        timeRange={timeRange}
        onChangeTimeRange={setTimeRange}
      />

      {/* Primary Counters */}
      <AnalyticsCountersGrid data={data} />

      {/* Detailed Breakdown */}
      <Grid minItemWidth="md" gap="lg">
        <PlatformDistributionCard data={data} />
        <ChannelHealthCard />
      </Grid>

      {/* Ultimate Tier Exclusive Audit Export */}
      <AnalyticsAuditExportCard />
    </Stack>
  );
};
