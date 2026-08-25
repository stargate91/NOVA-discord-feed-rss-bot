export interface PlatformConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  description?: string;
}

export const PLATFORM_LOGOS: Record<string, string> = {
  youtube: '/brands/youtube.png',
  twitch: '/brands/twitch.png',
  stream: '/brands/twitch.png',
  kick: '/brands/kick.png',
  epic_games: '/brands/epic-games.png',
  epic: '/brands/epic-games.png',
  steam: '/brands/steam.png',
  steam_free: '/brands/steam.png',
  steam_news: '/brands/steam.png',
  gog: '/brands/gog.png',
  gog_free: '/brands/gog.png',
  movie: '/brands/tmdb.png',
  tv_series: '/brands/tmdb.png',
  tv: '/brands/tmdb.png',
  tmdb: '/brands/tmdb.png',
  github: '/brands/github.png',
  crypto: '/brands/crypto.png',
  rss: '/brands/rss.png',
  unknown: '/brands/unknown.png',
};

export const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#ff0000',
  twitch: '#9146ff',
  stream: '#9146ff',
  kick: '#53fc18',
  epic_games: '#ffffff',
  steam: '#66c0f4',
  steam_free: '#66c0f4',
  steam_news: '#66c0f4',
  gog: '#b237c1',
  gog_free: '#b237c1',
  movie: '#00d1b2',
  tv_series: '#3273dc',
  tmdb: '#01b4e4',
  github: '#fafafa',
  crypto: '#f3ba2f',
  rss: '#ee802f',
};

/**
 * Returns the brand logo path for a given platform / monitor type.
 */
export function getPlatformLogo(type: string | undefined | null): string {
  if (!type) return '/brands/unknown.png';
  const cleanType = type.toLowerCase().trim();
  return PLATFORM_LOGOS[cleanType] || `/brands/${cleanType}.png`;
}

/**
 * Returns the brand accent color for a given platform / monitor type.
 */
export function getPlatformColor(type: string | undefined | null): string {
  if (!type) return '#0284c7';
  const cleanType = type.toLowerCase().trim();
  return PLATFORM_COLORS[cleanType] || '#0284c7';
}

/**
 * Checks if a platform supports native Discord video player embedding.
 */
export function supportsNativePlayer(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  return platformId.toLowerCase().trim() === 'youtube';
}

/**
 * Checks if a platform supports live/initial alert notifications.
 */
export function supportsLiveAlerts(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const clean = platformId.toLowerCase().trim();
  return clean === 'twitch' || clean === 'kick' || clean === 'stream';
}

/**
 * Checks if a platform supports TMDB media genre & language filters.
 */
export function supportsMediaFilters(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const clean = platformId.toLowerCase().trim();
  return clean === 'movie' || clean === 'tv_series' || clean === 'tv' || clean === 'tmdb';
}

/**
 * Checks if a platform supports upcoming/free game notifications.
 */
export function supportsUpcomingGames(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const clean = platformId.toLowerCase().trim();
  return clean === 'epic_games' || clean === 'epic';
}

/**
 * Checks if a platform supports search autocomplete in form inputs.
 */
export function supportsAutocomplete(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const clean = platformId.toLowerCase().trim();
  return clean === 'steam_news' || clean === 'twitch' || clean === 'stream' || clean === 'github';
}

/**
 * Checks if custom embed accent color is supported (e.g. YouTube with native player disabled).
 */
export function supportsCustomEmbedColor(
  platformId: string | undefined | null,
  useNativePlayer?: boolean
): boolean {
  if (!platformId) return true;
  const clean = platformId.toLowerCase().trim();
  if (clean === 'youtube') {
    return !useNativePlayer;
  }
  return true;
}

/**
 * Checks if a platform is crypto coin / price alert based.
 */
export function isCryptoPlatform(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  return platformId.toLowerCase().trim() === 'crypto';
}

/**
 * Formats subtitle text for autocomplete dropdown items based on platform.
 */
export function formatAutocompleteSubtitle(
  platformId: string | undefined | null,
  item: { id?: string | number; stars?: number; [key: string]: any }
): string {
  if (!item) return '';
  const clean = platformId ? platformId.toLowerCase().trim() : '';
  if (clean === 'github') {
    return `⭐ ${item.stars ?? 0} - ${item.id ?? ''}`;
  }
  return `ID: ${item.id ?? ''}`;
}

