import { Session } from 'next-auth';
import { GuildFeatures } from '@/types/guild';
import { UserRole } from '@/types/auth';
import { TIER_DEFINITIONS, MASTER_TIER_LIMITS } from '@/constants/tiers';

export interface DashboardTierMeta {
  isMaster: boolean;
  isPremium: boolean;
  effectiveMaxMonitors: number;
  badgeVariant: 'master' | 'warning' | 'neutral';
  badgeLabel: string;
  badgeHasDot: boolean;
  upgradeTitle: string;
  upgradeDesc: string;
  planStatusDescription: string;
  planActionLabel?: string;
  upgradeButtonLabel: string;
  canUpgrade: boolean;
}

export interface ClientTierContextInput {
  features?: GuildFeatures | null;
  tier?: number | string | null;
  isPremium?: boolean | null;
  isMaster?: boolean | null;
  tierName?: string | null;
  userRole?: UserRole | null;
  session?: Session | null;
  isLifetime?: boolean | null;
  refreshInterval?: number | null;
  maxMonitors?: number | null;
  maxAnalyticsDays?: number | null;
  maxAllowedDays?: number | null;
  [key: string]: any;
}

export type TierFeatureName =
  | 'basic'
  | 'custom_color'
  | 'alert_template'
  | 'custom_template'
  | 'genre_filter'
  | 'tmdb_language_filter'
  | 'remove_branding'
  | 'bulk_import'
  | 'bulk_delete'
  | 'repost'
  | 'native_player'
  | (string & {});

export interface ClientTierContext {
  isMaster: boolean;
  isPremium: boolean;
  effectiveTier: number;
  tierName: string;
  maxMonitors: number;
  minRefreshInterval: number;
  maxPurge: number;
  maxChannels: number;
  maxPings: number;
  maxAnalyticsDays: number;
  features?: GuildFeatures;
  isLocked: (featureName: TierFeatureName) => boolean;
  isIntervalAllowed: (intervalMinutes: number) => boolean;
  isIntervalLocked: (intervalMinutes: number) => boolean;
  isAnalyticsRangeAllowed: (days: number | string) => boolean;
  isAnalyticsRangeLocked: (days: number | string) => boolean;
}

/**
 * Single source of truth for resolving client-side tier level, master/premium status, and feature limits.
 */
export function resolveClientTierContext(input?: ClientTierContextInput | null): ClientTierContext {
  const features = input?.features;
  const userRole = input?.userRole || input?.session?.user?.role;
  const isMasterUser = userRole === 'master';

  const rawTier = parseInt(String(features?.tier ?? input?.tier ?? 0), 10) || 0;
  const isMaster = Boolean(
    isMasterUser ||
    features?.isMaster ||
    input?.isMaster ||
    input?.isLifetime ||
    input?.tierName === 'Master' ||
    features?.tierName === 'Master' ||
    (input?.isPremium && rawTier === 0) ||
    rawTier >= 3
  );

  const effectiveTier = isMaster ? 3 : Math.min(Math.max(rawTier, 0), 3);
  const isPremium = Boolean(features?.isPremium || input?.isPremium || effectiveTier >= 1 || isMaster);

  const fallbackTierDef = TIER_DEFINITIONS[effectiveTier] || TIER_DEFINITIONS[0];
  const fallbackLimits = isMaster ? MASTER_TIER_LIMITS : fallbackTierDef.limits;

  const tierName = isMaster
    ? 'Master'
    : features?.tierName || input?.tierName || fallbackTierDef.title;

  const maxMonitors = isMaster
    ? MASTER_TIER_LIMITS.maxMonitors
    : features?.maxMonitors ?? input?.maxMonitors ?? fallbackLimits.maxMonitors;

  const minRefreshInterval = isMaster
    ? MASTER_TIER_LIMITS.minRefreshInterval
    : features?.minRefreshInterval ?? input?.refreshInterval ?? fallbackLimits.minRefreshInterval;

  const maxPurge = isMaster
    ? MASTER_TIER_LIMITS.maxPurge
    : features?.maxPurge ?? fallbackLimits.maxPurge;

  const maxChannels = isMaster
    ? MASTER_TIER_LIMITS.maxChannels
    : features?.maxChannels ?? fallbackLimits.maxChannels;

  const maxPings = isMaster
    ? MASTER_TIER_LIMITS.maxPings
    : features?.maxPings ?? fallbackLimits.maxPings;

  const maxAnalyticsDays = isMaster || effectiveTier >= 3
    ? MASTER_TIER_LIMITS.maxAnalyticsDays
    : features?.maxAnalyticsDays ?? features?.maxAllowedDays ?? input?.maxAnalyticsDays ?? input?.maxAllowedDays ?? fallbackLimits.maxAnalyticsDays;

  const isLocked = (featureName: string) => isFeatureLocked(featureName, features, effectiveTier, isMaster);

  const isIntervalAllowed = (intervalMinutes: number) => {
    if (isMaster) return true;
    return intervalMinutes >= minRefreshInterval;
  };

  const isIntervalLocked = (intervalMinutes: number) => !isIntervalAllowed(intervalMinutes);

  const isAnalyticsRangeAllowed = (days: number | string) => {
    if (isMaster || effectiveTier >= 3) return true;
    const numDays = typeof days === 'string' ? parseInt(days, 10) : days;
    if (isNaN(numDays)) return false;
    return numDays <= maxAnalyticsDays;
  };

  const isAnalyticsRangeLocked = (days: number | string) => !isAnalyticsRangeAllowed(days);

  return {
    isMaster,
    isPremium,
    effectiveTier,
    tierName,
    maxMonitors,
    minRefreshInterval,
    maxPurge,
    maxChannels,
    maxPings,
    maxAnalyticsDays,
    features: features || undefined,
    isLocked,
    isIntervalAllowed,
    isIntervalLocked,
    isAnalyticsRangeAllowed,
    isAnalyticsRangeLocked,
  };
}

/**
 * Builds metadata for the dashboard overview plan card and banner.
 */
export function getDashboardTierMeta(stats: any): DashboardTierMeta {
  const ctx = resolveClientTierContext(stats);
  const { isMaster, isPremium, effectiveTier, tierName, maxMonitors, minRefreshInterval } = ctx;

  let badgeVariant: 'master' | 'warning' | 'neutral' = 'neutral';
  let badgeLabel = 'Free Plan';
  let badgeHasDot = false;

  if (isMaster) {
    badgeVariant = 'master';
    badgeLabel = 'Master Tier';
  } else if (isPremium) {
    badgeVariant = 'warning';
    badgeLabel = tierName;
    badgeHasDot = true;
  }

  const upgradeTitle =
    effectiveTier === 0
      ? 'Unlock Instant Delivery & Unlimited Feeds'
      : 'Ready to scale up your server?';

  const upgradeDesc =
    effectiveTier === 0
      ? 'Get 2-minute refresh speeds, role mentions, and custom embed branding.'
      : 'Upgrade to higher tier for even faster intervals and massive monitor limits.';

  const planStatusDescription = isMaster
    ? 'Unlimited capacity & 1-minute speed'
    : `${maxMonitors} feeds • ${minRefreshInterval}m refresh`;

  const planActionLabel = effectiveTier === 0 && !isMaster ? 'Upgrade Plan' : undefined;
  const upgradeButtonLabel = effectiveTier === 0 ? 'Upgrade Now' : 'View Plans';
  const canUpgrade = !isMaster && effectiveTier < 3;

  return {
    isMaster,
    isPremium,
    effectiveMaxMonitors: maxMonitors,
    badgeVariant,
    badgeLabel,
    badgeHasDot,
    upgradeTitle,
    upgradeDesc,
    planStatusDescription,
    planActionLabel,
    upgradeButtonLabel,
    canUpgrade,
  };
}

export interface TierBadgeProps {
  variant: 'master' | 'warning' | 'neutral';
  label: string;
  dot: boolean;
  isMaster: boolean;
}

/**
 * Single source of truth for generating PageHeader / Card badge properties across all pages.
 */
export function getTierBadgeProps(input?: ClientTierContextInput | null): TierBadgeProps {
  const ctx = resolveClientTierContext(input);
  if (ctx.isMaster) {
    return {
      variant: 'master',
      label: 'Master Tier',
      dot: false,
      isMaster: true,
    };
  }
  if (ctx.isPremium || ctx.effectiveTier > 0) {
    return {
      variant: 'warning',
      label: ctx.tierName || `Tier ${ctx.effectiveTier} Active`,
      dot: true,
      isMaster: false,
    };
  }
  return {
    variant: 'neutral',
    label: 'Free Plan',
    dot: false,
    isMaster: false,
  };
}

export interface TierPlanStatusInfo {
  title: string;
  subtitle: string;
}

/**
 * Single source of truth for generating plan title and status descriptions.
 */
export function getTierPlanStatusInfo(input?: ClientTierContextInput | null): TierPlanStatusInfo {
  const ctx = resolveClientTierContext(input);
  const title = ctx.isMaster ? 'Master Access' : ctx.tierName || 'Free Plan';
  const subtitle = ctx.isMaster
    ? 'Lifetime Unlimited'
    : ctx.effectiveTier > 0
    ? 'Active Subscription'
    : 'Standard Tier';

  return { title, subtitle };
}

/**
 * Single Source of Truth helper for checking whether a specific feature is locked for a server.
 */
export function isFeatureLocked(
  featureName: TierFeatureName,
  features?: GuildFeatures | null,
  tier: number | string = 0,
  isMaster: boolean = false
): boolean {
  if (isMaster || features?.isMaster) return false;
  if (featureName === 'basic') return false;

  if (features) {
    if (featureName === 'custom_color') return !features.canCustomColor;
    if (featureName === 'alert_template') return !features.canAlertTemplate;
    if (featureName === 'custom_template') return !features.canCustomTemplate;
    if (featureName === 'genre_filter') return !features.canGenreFilter;
    if (featureName === 'tmdb_language_filter') return !features.canTmdbLanguageFilter;
    if (featureName === 'remove_branding') return !features.canRemoveBranding;
    if (featureName === 'bulk_import') return !features.canBulkImport;
    if (featureName === 'bulk_delete') return !features.canBulkDelete;
    if (featureName === 'repost') return !features.canRepost;
    if (featureName === 'native_player') return features.canNativePlayer !== undefined ? !features.canNativePlayer : !features.canCustomColor;
    if (features.features?.includes('*') || features.features?.includes(featureName)) return false;
    return !features.features?.includes(featureName);
  }

  const numTier = parseInt(String(tier), 10) || 0;
  if (numTier >= 3) return false;

  const tierDef = TIER_DEFINITIONS[numTier];
  if (!tierDef) return true;

  if (featureName === 'custom_color') return !tierDef.canCustomColor;
  if (featureName === 'alert_template') return !tierDef.canAlertTemplate;
  if (featureName === 'custom_template') return !tierDef.canCustomTemplate;
  if (featureName === 'genre_filter') return !tierDef.canGenreFilter;
  if (featureName === 'tmdb_language_filter') return !tierDef.canTmdbLanguageFilter;
  if (featureName === 'remove_branding') return !tierDef.canRemoveBranding;
  if (featureName === 'bulk_import') return !tierDef.canBulkImport;
  if (featureName === 'bulk_delete') return !tierDef.canBulkDelete;
  if (featureName === 'repost') return !tierDef.canRepost;
  if (featureName === 'native_player') return !tierDef.hasNativePlayer;

  return true;
}

