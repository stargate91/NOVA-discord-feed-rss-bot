import type { GuildAnalyticsSummary, FeedPlatform } from '@/types';

export type AnalyticsTimeRange = '24h' | '7d' | '30d';

export interface UseGuildAnalyticsReturn {
  data: GuildAnalyticsSummary;
  timeRange: AnalyticsTimeRange;
  setTimeRange: (range: AnalyticsTimeRange) => void;
  isLoading: boolean;
}

export type { GuildAnalyticsSummary, FeedPlatform };
