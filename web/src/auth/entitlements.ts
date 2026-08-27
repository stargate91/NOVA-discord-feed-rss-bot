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
  free: 'Nova Free',
  starter: 'Nova Starter',
  professional: 'Nova Professional',
  ultimate: 'Nova Ultimate',
  master: 'Nova Master',
} as const;

/**
 * Designated Master Guild IDs (Granted absolute full access with zero limits).
 * Cannot be purchased; exclusively assigned by the owner.
 */
export const MASTER_GUILD_IDS = new Set<string>([
  '1083433370815582240',
  '1419208997852020769',
  '1532501759971430460',
  '1542531403751755857',
]);

/**
 * Checks if a given Discord Guild ID is an owner-designated Master Guild.
 */
export const isMasterGuild = (guildId?: string | number | null): boolean => {
  if (!guildId) return false;
  return MASTER_GUILD_IDS.has(String(guildId));
};

/**
 * Designated Master User IDs (Bot owners / Developer access).
 */
export const MASTER_USER_IDS = new Set<string>([
  '1438156842609148006',
  '321300698245365761',
  '495596107473223700',
]);

/**
 * Checks if a given Discord User ID is an owner/master admin.
 */
export const isMasterAdmin = (userId?: string | number | null): boolean => {
  if (!userId) return false;
  return MASTER_USER_IDS.has(String(userId));
};

/**
 * Normalizes any numeric or string tier representation into a type-safe GuildTier.
 */
export const toGuildTier = (
  tier: string | number | undefined | null,
  guildId?: string | number | null
): GuildTier => {
  if (guildId && isMasterGuild(guildId)) return 'master';
  if (tier === undefined || tier === null) return 'free';
  if (typeof tier === 'string') {
    const lower = tier.trim().toLowerCase();
    if (lower === 'master' || lower === 'nova master') return 'master';
    if (lower === 'ultimate' || lower === 'nova ultimate') return 'ultimate';
    if (lower === 'professional' || lower === 'nova professional' || lower === 'pro') return 'professional';
    if (lower === 'starter' || lower === 'nova starter') return 'starter';
    if (lower === 'free' || lower === 'nova free') return 'free';
    return (lower in TIER_RANKS ? lower : 'free') as GuildTier;
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
