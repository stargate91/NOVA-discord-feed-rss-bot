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
  const isMaster = Boolean(stats?.tierName === 'Master' || stats?.isLifetime);
  const isPremium = Boolean((stats?.tier ?? 0) >= 1 || isMaster);
  const effectiveMaxMonitors = isMaster ? 1000 : stats?.maxMonitors || 5;

  let badgeVariant: 'master' | 'warning' | 'neutral' = 'neutral';
  let badgeLabel = 'Free Plan';
  let badgeHasDot = false;

  if (isMaster) {
    badgeVariant = 'master';
    badgeLabel = 'Master Tier';
  } else if (isPremium) {
    badgeVariant = 'warning';
    badgeLabel = stats?.tierName || 'Premium';
    badgeHasDot = true;
  }

  const upgradeTitle =
    stats?.tier === 0
      ? 'Unlock Instant Delivery & Unlimited Feeds'
      : 'Ready to scale up your server?';

  const upgradeDesc =
    stats?.tier === 0
      ? 'Get 2-minute refresh speeds, role mentions, and custom embed branding.'
      : 'Upgrade to higher tier for even faster intervals and massive monitor limits.';

  const planStatusDescription = isMaster
    ? 'Unlimited capacity & 1-minute speed'
    : `${stats?.maxMonitors || 2} feeds • ${stats?.refreshInterval || 20}m refresh`;

  const planActionLabel = stats?.tier === 0 && !isMaster ? 'Upgrade Plan' : undefined;
  const upgradeButtonLabel = stats?.tier === 0 ? 'Upgrade Now' : 'View Plans';
  const canUpgrade = !isMaster && (stats?.tier ?? 0) < 3;

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

