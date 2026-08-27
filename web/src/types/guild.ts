import type { GuildTier, SubscriptionTierNumber } from '@/auth/entitlements';
export type { GuildTier, SubscriptionTierNumber } from '@/auth/entitlements';

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
