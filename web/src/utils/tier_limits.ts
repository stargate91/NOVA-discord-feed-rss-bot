export interface DashboardTierMeta {
  isMaster: boolean;
  isPremium: boolean;
  effectiveMaxMonitors: number;
  badgeVariant: 'master' | 'warning' | 'neutral';
  upgradeTitle: string;
  upgradeDesc: string;
}

export function getDashboardTierMeta(stats: any): DashboardTierMeta {
  const isMaster = Boolean(stats?.tierName === 'Master' || stats?.isLifetime);
  const isPremium = Boolean((stats?.tier ?? 0) >= 1 || isMaster);
  const effectiveMaxMonitors = isMaster ? 1000 : stats?.maxMonitors || 5;

  let badgeVariant: 'master' | 'warning' | 'neutral' = 'neutral';
  if (isMaster) {
    badgeVariant = 'master';
  } else if (isPremium) {
    badgeVariant = 'warning';
  }

  const upgradeTitle =
    stats?.tier === 0
      ? 'Unlock Instant Delivery & Unlimited Feeds'
      : 'Ready to scale up your server?';

  const upgradeDesc =
    stats?.tier === 0
      ? 'Get 2-minute refresh speeds, role mentions, and custom embed branding.'
      : 'Upgrade to higher tier for even faster intervals and massive monitor limits.';

  return {
    isMaster,
    isPremium,
    effectiveMaxMonitors,
    badgeVariant,
    upgradeTitle,
    upgradeDesc,
  };
}
