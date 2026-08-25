import { PlatformMetadata } from '@/types/monitor';

export interface CryptoPair {
  symbol: string;
  threshold: string;
}

export interface MonitorFormData {
  name: string;
  target_channels: string[];
  target_roles: string[];
  embed_color: string;
  platform_input: string;
  custom_alert: string;
  include_upcoming: boolean;
  target_genres: string[];
  target_languages: string[];
  send_initial_alert: boolean;
  use_native_player: boolean;
  custom_image: string;
}

export const INITIAL_MONITOR_FORM_DATA: MonitorFormData = {
  name: '',
  target_channels: [],
  target_roles: [],
  embed_color: '#3d3f45',
  platform_input: '',
  custom_alert: '',
  include_upcoming: false,
  target_genres: [],
  target_languages: [],
  send_initial_alert: true,
  use_native_player: false,
  custom_image: '',
};

/**
 * Serializes crypto pairs array to comma-separated format: "BTC:50000, ETH:3000"
 */
export function formatCryptoPairsToString(pairs: CryptoPair[]): string {
  return pairs
    .filter((p) => p.symbol.trim() && p.threshold.trim())
    .map((p) => `${p.symbol.trim().toUpperCase()}:${p.threshold.trim()}`)
    .join(', ');
}

/**
 * Parses a comma-separated crypto pairs string into CryptoPair objects
 */
export function parseCryptoPairsFromString(str?: string): CryptoPair[] {
  if (!str || typeof str !== 'string') {
    return [{ symbol: '', threshold: '' }];
  }

  const pairs = str
    .split(',')
    .map((item) => {
      const [symbol, threshold] = item.trim().split(':');
      return {
        symbol: (symbol || '').trim().toUpperCase(),
        threshold: (threshold || '').trim(),
      };
    })
    .filter((p) => p.symbol.length > 0);

  return pairs.length > 0 ? pairs : [{ symbol: '', threshold: '' }];
}

/**
 * Validates monitor creation/edit input
 */
export function validateMonitorForm(
  formData: MonitorFormData,
  platform: PlatformMetadata | null,
  cryptoPairs: CryptoPair[]
): string | null {
  if (!platform) {
    return 'Please select a platform first.';
  }

  if (!formData.name.trim()) {
    return 'Please enter a name for this monitor.';
  }

  if (!platform.isGlobal) {
    if (platform.isCrypto) {
      const validPairs = cryptoPairs.filter(
        (p) => p.symbol.trim() && p.threshold.trim()
      );
      if (validPairs.length === 0) {
        return 'Please enter at least one valid cryptocurrency symbol and threshold.';
      }
    } else if (!formData.platform_input.trim()) {
      return `Please specify the ${platform.inputLabel || 'source identifier'}.`;
    }
  }

  return null;
}

/**
 * Builds the API payload for creating a new monitor
 */
export function buildCreateMonitorPayload(
  formData: MonitorFormData,
  platform: PlatformMetadata,
  guildId: string,
  cryptoPairs: CryptoPair[]
): Record<string, any> {
  let platformInput = formData.platform_input.trim();
  if (platform.isCrypto) {
    platformInput = formatCryptoPairsToString(cryptoPairs);
  }

  const payload: Record<string, any> = {
    type: platform.id,
    name: formData.name.trim(),
    guildId: guildId,
    target_channels: formData.target_channels,
    target_roles: formData.target_roles,
    embed_color: formData.embed_color,
    custom_alert: formData.custom_alert.trim(),
    include_upcoming: formData.include_upcoming,
    target_genres: formData.target_genres,
    target_languages: formData.target_languages,
    send_initial_alert: ['twitch', 'kick'].includes(platform.id)
      ? formData.send_initial_alert
      : false,
    use_native_player:
      platform.id === 'youtube' ? formData.use_native_player : undefined,
    custom_image: formData.custom_image.trim(),
  };

  if (!platform.isGlobal) {
    const key =
      platform.id === 'crypto'
        ? 'symbols'
        : platform.inputKey || 'source_id';
    payload[key] = platformInput;
  }

  return payload;
}

/**
 * Builds the API payload for updating an existing monitor
 */
export function buildUpdateMonitorPayload(
  formData: MonitorFormData,
  platformId: string,
  cryptoPairs: CryptoPair[]
): Record<string, any> {
  const isCrypto = platformId === 'crypto';
  let platformInput = formData.platform_input.trim();
  if (isCrypto) {
    platformInput = formatCryptoPairsToString(cryptoPairs);
  }

  return {
    name: formData.name.trim(),
    target_channels: formData.target_channels,
    target_roles: formData.target_roles,
    embed_color: formData.embed_color,
    custom_alert: formData.custom_alert.trim(),
    include_upcoming: formData.include_upcoming,
    target_genres: formData.target_genres,
    target_languages: formData.target_languages,
    send_initial_alert: ['twitch', 'kick'].includes(platformId)
      ? formData.send_initial_alert
      : false,
    use_native_player:
      platformId === 'youtube' ? formData.use_native_player : undefined,
    custom_image: formData.custom_image.trim(),
    source_id: !isCrypto ? platformInput : undefined,
    symbols: isCrypto ? platformInput : undefined,
  };
}
