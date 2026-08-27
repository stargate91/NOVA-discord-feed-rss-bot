import type { GuildEntitlements } from '@/types';

export const VALID_PROMO_CODES = ['nova2026', 'launch', 'masteraccess', 'vip'];

export const DEFAULT_GUILD_ENTITLEMENTS: GuildEntitlements = {
  tier: 'professional',
  tier_name: 'Nova Professional',
  max_monitors: 35,
  min_poll_interval_seconds: 120,
  custom_branding_allowed: true,
  priority_delivery: true,
  raw_csv_export_allowed: false,
  expires_at: null,
};

export const MASTER_GUILD_ENTITLEMENTS: GuildEntitlements = {
  tier: 'master',
  tier_name: 'Nova Master (Unlimited Access)',
  max_monitors: 999999,
  min_poll_interval_seconds: 0,
  custom_branding_allowed: true,
  priority_delivery: true,
  raw_csv_export_allowed: true,
  expires_at: null,
};
