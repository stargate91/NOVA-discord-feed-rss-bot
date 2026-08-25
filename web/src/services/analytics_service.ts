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

const analyticsService = {
  /**
   * Fetch analytics data for a specific guild and date range.
   */
  async getStats(guildId: string, range: string | number): Promise<AnalyticsData> {
    const res = await fetch(`/api/stats?guild=${guildId}&days=${range}`);
    
    if (res.status === 403) {
      throw new Error("Access Denied: You do not have permission to view this server's analytics.");
    }
    
    if (!res.ok) {
      throw new Error("Failed to fetch analytics data.");
    }

    const json = await res.json();
    return json;
  },

  /**
   * Helper to determine the tier limit for analytics range (fallback when maxAllowedDays not in response).
   */
  getTierLimit(tier: number): number {
    if (tier >= 3) return 999;
    if (tier >= 2) return 30;
    if (tier >= 1) return 7;
    return 3;
  }
};

export default analyticsService;

