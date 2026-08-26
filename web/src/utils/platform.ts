import {
  PLATFORM_REGISTRY,
  normalizePlatformId,
  getPlatformRegistryItem,
} from '@/constants/platforms';
import { formatNumber } from './number';

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

export type PlatformCapability =
  | 'supportsNativePlayer'
  | 'supportsLiveAlerts'
  | 'supportsMediaFilters'
  | 'supportsUpcomingGames'
  | 'supportsAutocomplete'
  | 'supportsPatchFilter'
  | 'isCrypto'
  | 'isGlobal';

/**
 * Checks if a platform has a specific capability declared in its registry definition.
 */
export function hasPlatformCapability(
  platformId: string | undefined | null,
  capability: PlatformCapability
): boolean {
  if (!platformId) return false;
  const item = getPlatformRegistryItem(platformId);
  return Boolean(item?.[capability]);
}

/**
 * Checks if a platform supports native Discord video player embedding.
 */
export function supportsNativePlayer(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsNativePlayer');
}

/**
 * Checks if a platform supports live/initial alert notifications.
 */
export function supportsLiveAlerts(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsLiveAlerts');
}

/**
 * Checks if a platform supports TMDB media genre & language filters.
 */
export function supportsMediaFilters(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsMediaFilters');
}

/**
 * Checks if a platform supports upcoming/free game notifications.
 */
export function supportsUpcomingGames(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsUpcomingGames');
}

/**
 * Checks if a platform supports search autocomplete in form inputs.
 */
export function supportsAutocomplete(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsAutocomplete');
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
  return hasPlatformCapability(platformId, 'isCrypto');
}

/**
 * Checks if a platform supports patch/update only filtering (e.g. Steam news).
 */
export function supportsPatchFilter(platformId: string | undefined | null): boolean {
  return hasPlatformCapability(platformId, 'supportsPatchFilter');
}

/**
 * Formats subtitle text for autocomplete dropdown items based on platform metadata or available item properties.
 */
export function formatAutocompleteSubtitle(
  platformId: string | undefined | null,
  item: { id?: string | number; stars?: number; [key: string]: any }
): string {
  if (!item) return '';
  if (item.stars !== undefined && item.stars !== null) {
    return `⭐ ${formatNumber(item.stars)} - ${item.id ?? ''}`;
  }
  return `ID: ${item.id ?? ''}`;
}

/**
 * Resolves the backend search endpoint domain for a given platform.
 * e.g. 'steam_news' -> 'steam'
 */
export function getPlatformSearchDomain(platformId: string | undefined | null): string {
  if (!platformId) return '';
  const norm = normalizePlatformId(platformId);
  if (norm === 'steam_news' || norm === 'steam_free') return 'steam';
  return norm;
}

