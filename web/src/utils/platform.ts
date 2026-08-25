import {
  PLATFORM_REGISTRY,
  normalizePlatformId,
  getPlatformRegistryItem,
} from '@/constants/platforms';

export interface PlatformConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  description?: string;
}

/**
 * Returns the brand logo path for a given platform / monitor type.
 */
export function getPlatformLogo(type: string | undefined | null): string {
  if (!type) return '/brands/unknown.png';
  const item = getPlatformRegistryItem(type);
  if (item) return item.logo;
  const cleanType = type.toLowerCase().trim();
  return `/brands/${cleanType}.png`;
}

/**
 * Returns the brand accent color for a given platform / monitor type.
 */
export function getPlatformColor(type: string | undefined | null): string {
  if (!type) return '#0284c7';
  const item = getPlatformRegistryItem(type);
  return item ? item.color : '#0284c7';
}

/**
 * Checks if a platform supports native Discord video player embedding.
 */
export function supportsNativePlayer(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.supportsNativePlayer);
}

/**
 * Checks if a platform supports live/initial alert notifications.
 */
export function supportsLiveAlerts(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.supportsLiveAlerts);
}

/**
 * Checks if a platform supports TMDB media genre & language filters.
 */
export function supportsMediaFilters(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.supportsMediaFilters);
}

/**
 * Checks if a platform supports upcoming/free game notifications.
 */
export function supportsUpcomingGames(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.supportsUpcomingGames);
}

/**
 * Checks if a platform supports search autocomplete in form inputs.
 */
export function supportsAutocomplete(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.supportsAutocomplete);
}

/**
 * Checks if custom embed accent color is supported (e.g. YouTube with native player disabled).
 */
export function supportsCustomEmbedColor(
  platformId: string | undefined | null,
  useNativePlayer?: boolean
): boolean {
  if (!platformId) return true;
  const normId = normalizePlatformId(platformId);
  if (normId === 'youtube') {
    return !useNativePlayer;
  }
  return true;
}

/**
 * Checks if a platform is crypto coin / price alert based.
 */
export function isCryptoPlatform(platformId: string | undefined | null): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.isCrypto);
}

/**
 * Formats subtitle text for autocomplete dropdown items based on platform.
 */
export function formatAutocompleteSubtitle(
  platformId: string | undefined | null,
  item: { id?: string | number; stars?: number; [key: string]: any }
): string {
  if (!item) return '';
  const normId = normalizePlatformId(platformId);
  if (normId === 'github') {
    return `⭐ ${item.stars ?? 0} - ${item.id ?? ''}`;
  }
  return `ID: ${item.id ?? ''}`;
}
