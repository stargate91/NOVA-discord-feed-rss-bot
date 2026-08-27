import type { GuildAnalyticsSummary } from '@/types';

export const TIME_RANGE_OPTIONS = [
  { value: '24h', labelKey: 'guild.analytics24h' },
  { value: '7d', labelKey: 'guild.analytics7d' },
  { value: '30d', labelKey: 'guild.analytics30d' },
] as const;

export const MOCK_ANALYTICS_DATA: Record<string, GuildAnalyticsSummary> = {
  '24h': {
    period: '24h',
    total_posts_delivered: 24,
    success_rate: 100,
    avg_latency_ms: 110,
    dead_channels_count: 0,
    rate_limit_events_count: 0,
    platform_breakdown: {
      youtube: 12,
      twitch: 8,
      epic_games: 2,
      rss: 2,
    },
  },
  '7d': {
    period: '7d',
    total_posts_delivered: 148,
    success_rate: 99.98,
    avg_latency_ms: 142,
    dead_channels_count: 0,
    rate_limit_events_count: 0,
    platform_breakdown: {
      youtube: 71,
      twitch: 44,
      epic_games: 21,
      rss: 12,
    },
  },
  '30d': {
    period: '30d',
    total_posts_delivered: 612,
    success_rate: 99.95,
    avg_latency_ms: 156,
    dead_channels_count: 1,
    rate_limit_events_count: 2,
    platform_breakdown: {
      youtube: 290,
      twitch: 184,
      epic_games: 88,
      rss: 50,
    },
  },
};
