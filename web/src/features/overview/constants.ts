import type { OverviewPlatformItem } from './types';

export const OVERVIEW_PLATFORMS: readonly OverviewPlatformItem[] = [
  {
    id: 'youtube',
    labelKey: 'guild.feedPlatformYoutube',
    icon: '/images/brands/youtube.png',
    selected: true,
  },
  {
    id: 'twitch',
    labelKey: 'guild.feedPlatformTwitch',
    icon: '/images/brands/twitch.png',
    selected: true,
  },
  {
    id: 'steam',
    labelKey: 'guild.feedPlatformSteamDeals',
    icon: '/images/brands/steam.png',
    selected: true,
  },
  {
    id: 'kick',
    labelKey: 'guild.feedPlatformKickLive',
    icon: '/images/brands/kick.png',
    selected: false,
  },
] as const;

export const MOCK_OVERVIEW_METRICS = {
  activeFeedsQuota: { current: 8, max: 25, percent: 32 },
  latency: { ms: 142, scorePercent: 94 },
  deliveredNotifications: { count: 64, scorePercent: 64 },
  refreshIntervalSeconds: 120,
};
