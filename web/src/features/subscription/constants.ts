import type { GuildEntitlements } from '@/types';

export const VALID_PROMO_CODES = ['nova2026', 'launch', 'masteraccess', 'vip'];

export const DEFAULT_GUILD_ENTITLEMENTS: GuildEntitlements = {
  tier: 'professional',
  tier_name: 'Professional Tier',
  max_monitors: 25,
  min_poll_interval_seconds: 120,
  custom_branding_allowed: true,
  priority_delivery: true,
  raw_csv_export_allowed: false,
  expires_at: null,
};
