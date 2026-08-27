import type { FeedPlatform } from './feed';

export interface DeliveryMetric {
  timestamp: string;
  platform: FeedPlatform;
  posts_delivered: number;
  avg_latency_ms: number;
  success_rate: number;
}

export interface GuildAnalyticsSummary {
  period: '24h' | '7d' | '30d';
  total_posts_delivered: number;
  success_rate: number;
  avg_latency_ms: number;
  dead_channels_count: number;
  rate_limit_events_count: number;
  platform_breakdown: Partial<Record<FeedPlatform, number>>;
}
