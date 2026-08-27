import type { DiscordUser } from '@/auth/types';
import type { UserGuild } from '@/guild/types';
import type {
  FeedMonitor,
  HealthStatus,
  GuildSummary,
  GuildSettings,
  GuildAnalyticsSummary,
  SystemTelemetry,
} from './index';

// ==============================================================================
// 1. Primitive Schema Validators
// ==============================================================================

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const isString = (val: unknown): val is string => typeof val === 'string';

const isNumber = (val: unknown): val is number => typeof val === 'number' && !isNaN(val);

const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';

// ==============================================================================
// 2. Domain Entity Type Guards
// ==============================================================================

/**
 * Validates DiscordUser schema ensuring all mandatory fields are valid strings.
 */
export function isDiscordUser(data: unknown): data is DiscordUser {
  if (!isObject(data)) return false;
  return (
    isString(data.id) &&
    data.id.trim().length > 0 &&
    isString(data.username) &&
    isString(data.discriminator) &&
    isString(data.avatar) &&
    (data.global_name === undefined || isString(data.global_name))
  );
}

/**
 * Validates UserGuild schema.
 */
export function isUserGuild(data: unknown): data is UserGuild {
  if (!isObject(data)) return false;
  const hasId =
    (isString(data.id) && data.id.trim().length > 0) ||
    (isString(data.guild_id) && data.guild_id.trim().length > 0);
  const hasName = isString(data.name);
  const hasOwner = isBoolean(data.owner) || isBoolean(data.is_owner);
  const hasPerms = isString(data.permissions) || isNumber(data.permissions);
  return Boolean(hasId && hasName && hasOwner && hasPerms);
}

/**
 * Validates HealthStatus schema.
 */
export function isHealthStatus(data: unknown): data is HealthStatus {
  if (!isObject(data)) return false;
  return isString(data.status);
}

/**
 * Validates GuildSummary schema.
 */
export function isGuildSummary(data: unknown): data is GuildSummary {
  if (!isObject(data)) return false;
  return (
    isString(data.guild_id) &&
    isString(data.name) &&
    (isString(data.tier) || isNumber(data.tier)) &&
    isNumber(data.active_monitors) &&
    isNumber(data.max_monitors)
  );
}

/**
 * Validates FeedMonitor schema.
 */
export function isFeedMonitor(data: unknown): data is FeedMonitor {
  if (!isObject(data)) return false;
  return (
    isString(data.id) &&
    isString(data.guild_id) &&
    isString(data.platform) &&
    isString(data.target_id) &&
    isString(data.destination_channel_id) &&
    isString(data.status) &&
    isString(data.created_at) &&
    isString(data.updated_at)
  );
}

/**
 * Validates GuildSettings schema.
 */
export function isGuildSettings(data: unknown): data is GuildSettings {
  if (!isObject(data)) return false;
  return (
    isString(data.guild_id) &&
    isString(data.language) &&
    isString(data.timezone) &&
    (data.log_channel_id === null ||
      data.log_channel_id === undefined ||
      isString(data.log_channel_id)) &&
    isBoolean(data.auto_isolate_dead_channels) &&
    isBoolean(data.debug_logging_enabled)
  );
}

/**
 * Validates GuildAnalyticsSummary schema.
 */
export function isGuildAnalyticsSummary(data: unknown): data is GuildAnalyticsSummary {
  if (!isObject(data)) return false;
  return (
    (data.period === '24h' || data.period === '7d' || data.period === '30d') &&
    isNumber(data.total_posts_delivered) &&
    isNumber(data.success_rate) &&
    isNumber(data.avg_latency_ms) &&
    isNumber(data.dead_channels_count) &&
    isNumber(data.rate_limit_events_count) &&
    isObject(data.platform_breakdown)
  );
}

/**
 * Validates SystemTelemetry schema.
 */
export function isSystemTelemetry(data: unknown): data is SystemTelemetry {
  if (!isObject(data)) return false;
  return (
    isString(data.status) &&
    isString(data.version) &&
    isString(data.mode) &&
    isString(data.database) &&
    isString(data.queue_backend)
  );
}

// ==============================================================================
// 3. Safe Parsing / Coercion Helpers with Fallbacks
// ==============================================================================

export function safeParseDiscordUser(
  data: unknown,
  fallback: DiscordUser | null = null
): DiscordUser | null {
  return isDiscordUser(data) ? data : fallback;
}

export function safeParseUserGuildArray(data: unknown, fallback: UserGuild[] = []): UserGuild[] {
  if (!Array.isArray(data)) return fallback;
  const validGuilds = data.filter(isUserGuild);
  return validGuilds.length > 0 ? validGuilds : fallback;
}

export function safeParseFeedMonitorArray(
  data: unknown,
  fallback: FeedMonitor[] = []
): FeedMonitor[] {
  if (!Array.isArray(data)) return fallback;
  return data.filter(isFeedMonitor);
}
