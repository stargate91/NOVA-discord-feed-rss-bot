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

export function getDashboardTierMeta(stats: any): DashboardTierMeta {
  const features = stats?.features;
  const isMaster = Boolean(features?.isMaster || stats?.tierName === 'Master' || stats?.isLifetime);
  const isPremium = Boolean(features?.isPremium || (stats?.tier ?? 0) >= 1 || isMaster);
  const tier = features?.tier ?? stats?.tier ?? 0;
  const effectiveMaxMonitors = features?.maxMonitors ?? (isMaster ? 1000 : stats?.maxMonitors || 5);
  const minInterval = features?.minRefreshInterval ?? stats?.refreshInterval ?? 20;
  const tierName = features?.tierName || stats?.tierName || (isMaster ? 'Master' : isPremium ? 'Premium' : 'Free');

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
    tier === 0
      ? 'Unlock Instant Delivery & Unlimited Feeds'
      : 'Ready to scale up your server?';

  const upgradeDesc =
    tier === 0
      ? 'Get 2-minute refresh speeds, role mentions, and custom embed branding.'
      : 'Upgrade to higher tier for even faster intervals and massive monitor limits.';

  const planStatusDescription = isMaster
    ? 'Unlimited capacity & 1-minute speed'
    : `${effectiveMaxMonitors} feeds • ${minInterval}m refresh`;

  const planActionLabel = tier === 0 && !isMaster ? 'Upgrade Plan' : undefined;
  const upgradeButtonLabel = tier === 0 ? 'Upgrade Now' : 'View Plans';
  const canUpgrade = !isMaster && tier < 3;

  return {
    isMaster,
    isPremium,
    effectiveMaxMonitors,
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

