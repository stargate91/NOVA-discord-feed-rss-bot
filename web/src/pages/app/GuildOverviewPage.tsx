import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Grid } from '@/ui';
import {
  OverviewPageHeader,
  OverviewMetricsGrid,
  MonitoredPlatformsCard,
  PlanDetailsSummaryCard,
} from '@/features/overview';

export const GuildOverviewPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();

  return (
    <Stack gap="xl">
      <OverviewPageHeader guildId={guildId} />

      {/* Metrics Row */}
      <OverviewMetricsGrid />

      {/* Quick Access Grid */}
      <Grid minItemWidth="md" gap="lg">
        <MonitoredPlatformsCard guildId={guildId} />
        <PlanDetailsSummaryCard guildId={guildId} />
      </Grid>
    </Stack>
  );
};
