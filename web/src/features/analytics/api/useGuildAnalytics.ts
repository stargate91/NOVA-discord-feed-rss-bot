import { useState } from 'react';
import { useApiQuery, apiClient } from '@/api';
import { featureFlags } from '@/constants';
import { MOCK_ANALYTICS_DATA } from '../constants';
import type { AnalyticsTimeRange, GuildAnalyticsSummary, UseGuildAnalyticsReturn } from '../types';

export const useGuildAnalytics = (guildId: string): UseGuildAnalyticsReturn => {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('7d');

  const query = useApiQuery<GuildAnalyticsSummary>(
    async (signal) => {
      if (featureFlags.useMockData) {
        return MOCK_ANALYTICS_DATA[timeRange] || MOCK_ANALYTICS_DATA['7d'];
      }
      return apiClient.get<GuildAnalyticsSummary>(
        `/api/v1/guilds/${guildId}/analytics?period=${timeRange}`,
        { signal }
      );
    },
    [guildId, timeRange],
    { key: `guild-analytics-${guildId}-${timeRange}`, enabled: Boolean(guildId) }
  );

  const fallbackData = MOCK_ANALYTICS_DATA[timeRange] || MOCK_ANALYTICS_DATA['7d'];

  return {
    data: query.data ?? fallbackData,
    timeRange,
    setTimeRange,
    isLoading: query.isLoading,
  };
};
