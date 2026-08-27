export type GuildTier = 'free' | 'starter' | 'professional' | 'ultimate' | 'master';
export type SubscriptionTierNumber = 0 | 1 | 2 | 3 | 4;

export const TIER_RANKS: Record<GuildTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  ultimate: 3,
  master: 4,
} as const;

export const NUMBER_TO_TIER: Record<SubscriptionTierNumber, GuildTier> = {
  0: 'free',
  1: 'starter',
  2: 'professional',
  3: 'ultimate',
  4: 'master',
} as const;

export const TIER_TO_NUMBER: Record<GuildTier, SubscriptionTierNumber> = {
  free: 0,
  starter: 1,
  professional: 2,
  ultimate: 3,
  master: 4,
} as const;

export const TIER_LABELS: Record<GuildTier, string> = {
  free: 'Free Tier',
  starter: 'Starter Tier',
  professional: 'Professional Tier',
  ultimate: 'Ultimate Tier',
  master: 'Master Guild (Full Access)',
} as const;

/**
 * Normalizes any numeric or string tier representation into a type-safe GuildTier.
 */
export const toGuildTier = (tier: GuildTier | number | undefined | null): GuildTier => {
  if (tier === undefined || tier === null) return 'free';
  if (typeof tier === 'string') {
    const lower = tier.toLowerCase() as GuildTier;
    return lower in TIER_RANKS ? lower : 'free';
  }
  return NUMBER_TO_TIER[tier as SubscriptionTierNumber] ?? 'free';
};

/**
 * Converts a GuildTier or number to the numeric subscription tier index (0-4).
 */
export const toSubscriptionTierNumber = (
  tier: GuildTier | number | undefined | null
): SubscriptionTierNumber => {
  const resolved = toGuildTier(tier);
  return TIER_TO_NUMBER[resolved];
};

/**
 * Checks if currentTier meets or exceeds the requiredTier.
 * Master guilds automatically have access to all features.
 */
export const hasTierAccess = (
  currentTier: GuildTier | number = 'free',
  requiredTier: GuildTier | number = 'free'
): boolean => {
  const normCurrent = toGuildTier(currentTier);
  const normRequired = toGuildTier(requiredTier);
  if (normCurrent === 'master') {
    return true;
  }
  const currentRank = TIER_RANKS[normCurrent] ?? 0;
  const requiredRank = TIER_RANKS[normRequired] ?? 0;
  return currentRank >= requiredRank;
};
