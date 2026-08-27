export type GuildTier = 'free' | 'starter' | 'professional' | 'ultimate' | 'master';

export const TIER_RANKS: Record<GuildTier, number> = {
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
 * Checks if currentTier meets or exceeds the requiredTier.
 * Master guilds automatically have access to all features.
 */
export const hasTierAccess = (
  currentTier: GuildTier = 'free',
  requiredTier: GuildTier = 'free'
): boolean => {
  if (currentTier === 'master') {
    return true;
  }
  const currentRank = TIER_RANKS[currentTier] ?? 0;
  const requiredRank = TIER_RANKS[requiredTier] ?? 0;
  return currentRank >= requiredRank;
};
