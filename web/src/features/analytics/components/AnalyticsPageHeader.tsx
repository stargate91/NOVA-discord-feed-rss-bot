import React from 'react';
import { useTranslation } from '@/i18n';
import { Stack, Inline, Text, SegmentedControl, Badge } from '@/ui';
import { TIME_RANGE_OPTIONS } from '../constants';
import type { AnalyticsTimeRange } from '../types';

interface AnalyticsPageHeaderProps {
  guildId: string;
  timeRange: AnalyticsTimeRange;
  onChangeTimeRange: (range: AnalyticsTimeRange) => void;
}

export const AnalyticsPageHeader: React.FC<AnalyticsPageHeaderProps> = ({
  guildId,
  timeRange,
  onChangeTimeRange,
}) => {
  const { t } = useTranslation();

  return (
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
          onChange={(val) => onChangeTimeRange(val as AnalyticsTimeRange)}
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
  );
};
