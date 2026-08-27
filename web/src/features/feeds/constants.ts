import type { FeedPlatform, FeedMonitor } from '@/types';
import type { TranslationKey } from '@/i18n/locales/en';

export interface FeedPlatformConfig {
  id: FeedPlatform;
  icon: string;
  labelKey: TranslationKey;
}

export const FEED_PLATFORMS: readonly FeedPlatformConfig[] = [
  { id: 'youtube', icon: '/images/brands/youtube.png', labelKey: 'guild.feedPlatformYoutube' },
  { id: 'twitch', icon: '/images/brands/twitch.png', labelKey: 'guild.feedPlatformTwitch' },
  { id: 'kick', icon: '/images/brands/kick.png', labelKey: 'guild.feedPlatformKick' },
  {
    id: 'epic_games',
    icon: '/images/brands/epic_games.png',
    labelKey: 'guild.feedPlatformEpicGames',
  },
  { id: 'steam', icon: '/images/brands/steam.png', labelKey: 'guild.feedPlatformSteam' },
  { id: 'tmdb', icon: '/images/brands/tmdb.png', labelKey: 'guild.feedPlatformTmdb' },
  { id: 'rss', icon: '/images/brands/rss.png', labelKey: 'guild.feedPlatformRss' },
] as const;

export const FEED_TYPE_OPTIONS = [
  {
    value: 'youtube',
    labelKey: 'guild.feedTypeYoutubeLabel',
    descKey: 'guild.feedTypeYoutubeDesc',
  },
  { value: 'twitch', labelKey: 'guild.feedTypeTwitchLabel', descKey: 'guild.feedTypeTwitchDesc' },
  { value: 'kick', labelKey: 'guild.feedTypeKickLabel', descKey: 'guild.feedTypeKickDesc' },
  {
    value: 'epic_games',
    labelKey: 'guild.feedTypeEpicGamesLabel',
    descKey: 'guild.feedTypeEpicGamesDesc',
  },
  { value: 'steam', labelKey: 'guild.feedTypeSteamLabel', descKey: 'guild.feedTypeSteamDesc' },
  { value: 'tmdb', labelKey: 'guild.feedTypeTmdbLabel', descKey: 'guild.feedTypeTmdbDesc' },
  { value: 'rss', labelKey: 'guild.feedTypeRssLabel', descKey: 'guild.feedTypeRssDesc' },
] as const;

export const MOCK_FEED_MONITORS: FeedMonitor[] = [
  {
    id: 'mon-101',
    guild_id: '123456789012345678',
    platform: 'youtube',
    target_id: 'MrBeast',
    target_name: 'MrBeast',
    destination_channel_id: '1122334455',
    destination_channel_name: 'youtube-feed',
    ping_role_id: null,
    status: 'active',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-20T14:30:00Z',
    last_checked_at: '2026-08-27T16:00:00Z',
    last_posted_at: '2026-08-26T18:45:00Z',
  },
  {
    id: 'mon-102',
    guild_id: '123456789012345678',
    platform: 'twitch',
    target_id: 'shroud',
    target_name: 'shroud',
    destination_channel_id: '1122334466',
    destination_channel_name: 'stream-alerts',
    ping_role_id: '9988776655',
    status: 'active',
    created_at: '2026-08-05T12:00:00Z',
    updated_at: '2026-08-22T09:15:00Z',
    last_checked_at: '2026-08-27T16:15:00Z',
    last_posted_at: '2026-08-27T14:00:00Z',
  },
  {
    id: 'mon-103',
    guild_id: '123456789012345678',
    platform: 'epic_games',
    target_id: 'free_weekly',
    target_name: 'Epic Games Weekly Freebies',
    destination_channel_id: '1122334477',
    destination_channel_name: 'free-games',
    ping_role_id: null,
    status: 'active',
    created_at: '2026-08-10T08:00:00Z',
    updated_at: '2026-08-24T17:00:00Z',
    last_checked_at: '2026-08-27T15:00:00Z',
    last_posted_at: '2026-08-21T16:00:00Z',
  },
];
