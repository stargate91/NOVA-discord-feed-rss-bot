import api from './api_client';
import { resolveClientTierContext } from '@/utils/tier_limits';

export interface TrendData {
  growthRate: number;
  value: number;
  isPositive: boolean;
  currentPosts: number;
  previousPosts: number;
}

export interface HeatmapMatrixData {
  matrix: number[][];
  max: number;
}

export interface PlatformStat {
  id?: string;
  platform: string;
  count: number;
  name?: string;
  displayName: string;
  percentage?: number;
}

export interface TickerItem {
  platform: string;
  title: string;
  author_name?: string;
  published_at?: string;
}

export interface AnalyticsData {
  totalPosts: number;
  previousPeriodPosts?: number;
  activeMonitors: number;
  platformCount: number;
  platforms: PlatformStat[];
  history: Array<{ date: string; count: number | string }>;
  heatmap?: Array<{ day: number; hour: number; count: number }>;
  heatmapMatrix?: HeatmapMatrixData;
  trend?: TrendData;
  maxAllowedDays?: number;
  tier?: number;
  isMaster?: boolean;
  isPremium?: boolean;
  features?: any;
  [key: string]: any;
}

export const analyticsService = {
  /**
   * Fetch analytics data for a specific guild and date range.
   */
  async getStats(guildId: string, days: string | number = '14'): Promise<AnalyticsData> {
    if (!guildId) throw new Error('Guild ID is required');
    return api.get<AnalyticsData>('/api/stats', { guild: guildId, days });
  },

  /**
   * Fetch global live event ticker items.
   */
  async getGlobalTicker(): Promise<TickerItem[]> {
    return api.get<TickerItem[]>('/api/stats/global');
  },

  /**
   * Helper to determine the tier limit for analytics range (fallback when maxAllowedDays not in response).
   */
  getTierLimit(tier: number): number {
    return resolveClientTierContext({ tier }).maxAnalyticsDays;
  }
};

export default analyticsService;



