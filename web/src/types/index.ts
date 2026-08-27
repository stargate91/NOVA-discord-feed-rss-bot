// ==============================================================================
// Nova Feeds Web Application — Core Domain & API Types
// ==============================================================================

export type PageView = 'home' | 'dashboard' | 'admin';

// ------------------------------------------------------------------------------
// Feed Platforms & Monitors
// ------------------------------------------------------------------------------

export type FeedPlatform =
  | 'youtube'
  | 'twitch'
  | 'kick'
  | 'epic_games'
  | 'steam'
  | 'steam_deals'
  | 'tmdb'
  | 'rss'
  | 'github'
  | 'gog';

export type FeedMonitorStatus = 'active' | 'paused' | 'error' | 'rate_limited' | 'dead_channel';

export interface FeedMonitor {
  id: string;
  guild_id: string;
  platform: FeedPlatform;
  target_id: string;
  target_name?: string;
  destination_channel_id: string;
  destination_channel_name?: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
  status: FeedMonitorStatus;
  last_checked_at?: string | null;
  last_posted_at?: string | null;
  error_message?: string | null;
  consecutive_failures?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorPayload {
  platform: FeedPlatform;
  target_id: string;
  destination_channel_id: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
}

export interface UpdateMonitorPayload {
  destination_channel_id?: string;
  ping_role_id?: string | null;
  custom_message?: string | null;
  embed_color?: string | null;
  status?: FeedMonitorStatus;
}

import type { GuildTier, SubscriptionTierNumber } from '@/auth/entitlements';
export type { GuildTier, SubscriptionTierNumber } from '@/auth/entitlements';

// ------------------------------------------------------------------------------
// Guild & Subscription Entities
// ------------------------------------------------------------------------------

export type SubscriptionTier = GuildTier | SubscriptionTierNumber;

export interface GuildSummary {
  guild_id: string;
  name: string;
  icon?: string | null;
  tier: SubscriptionTier;
  active_monitors: number;
  max_monitors: number;
  refresh_interval: number;
  language: string;
  is_owner?: boolean;
  permissions?: string | number;
}

export interface GuildSettings {
  guild_id: string;
  language: string;
  timezone: string;
  log_channel_id?: string | null;
  auto_isolate_dead_channels: boolean;
  debug_logging_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GuildEntitlements {
  tier: SubscriptionTier;
  tier_name: string;
  max_monitors: number;
  min_poll_interval_seconds: number;
  custom_branding_allowed: boolean;
  priority_delivery: boolean;
  raw_csv_export_allowed: boolean;
  expires_at?: string | null;
}

// ------------------------------------------------------------------------------
// Analytics & Performance
// ------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------
// System Telemetry & Health
// ------------------------------------------------------------------------------

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline' | string;
  uptime_seconds?: number;
  db_latency_ms?: number;
  active_guilds?: number;
  active_monitors_count?: number;
  queue_length?: number;
  environment?: string;
  version?: string;
}

export interface SystemTelemetry {
  status: string;
  version: string;
  mode: string;
  database: string;
  queue_backend: string;
  shards_count?: number;
  connected_guilds?: number;
  uptime_seconds?: number;
}

export type AuditLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  action: string;
  message: string;
  guild_id?: string;
  metadata?: Record<string, unknown>;
}

// ------------------------------------------------------------------------------
// Type Guards & Runtime Validators (Enterprise Schema Verification)
// ------------------------------------------------------------------------------

export * from './validators';
