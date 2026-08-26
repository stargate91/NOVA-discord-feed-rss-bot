import {
  PlatformMetadata,
  CreateMonitorPayload,
  UpdateMonitorPayload,
  BulkAddPayload,
  MonitorConfig,
} from '@/types/monitor';
import {
  supportsLiveAlerts,
  supportsNativePlayer,
  supportsPatchFilter,
  isCryptoPlatform,
} from './platform';

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
  steam_patch_only?: boolean;
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
  steam_patch_only: false,
};

export interface BulkAddFormData {
  sources_input: string;
  target_channels: string[];
  target_roles: string[];
  embed_color: string;
  send_initial_alert: boolean;
  use_native_player: boolean;
  custom_image: string;
}

export const INITIAL_BULK_ADD_DATA: BulkAddFormData = {
  sources_input: '',
  target_channels: [],
  target_roles: [],
  embed_color: '#3d3f45',
  send_initial_alert: false,
  use_native_player: false,
  custom_image: '',
};

export interface BulkEditFormData {
  target_channels: string[];
  target_roles: string[];
  embed_color: string;
  use_channels: boolean;
  use_roles: boolean;
  use_color: boolean;
  use_native: boolean;
  use_native_player: boolean;
  use_custom_image: boolean;
  custom_image: string;
}

export const INITIAL_BULK_EDIT_DATA: BulkEditFormData = {
  target_channels: [],
  target_roles: [],
  embed_color: '#3d3f45',
  use_channels: false,
  use_roles: false,
  use_color: false,
  use_native: false,
  use_native_player: false,
  use_custom_image: false,
  custom_image: '',
};

/**
 * Sanitizes and normalizes a cryptocurrency ticker symbol (e.g., '  btc  ' -> 'BTC').
 */
export function normalizeCryptoSymbol(symbol?: string | null): string {
  if (!symbol) return '';
  return symbol.trim().toUpperCase();
}

/**
 * Serializes crypto pairs array to comma-separated format: "BTC:50000, ETH:3000"
 */
export function formatCryptoPairsToString(pairs: CryptoPair[]): string {
  return pairs
    .filter((p) => p.symbol.trim() && p.threshold.trim())
    .map((p) => `${normalizeCryptoSymbol(p.symbol)}:${p.threshold.trim()}`)
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
        symbol: normalizeCryptoSymbol(symbol),
        threshold: (threshold || '').trim(),
      };
    })
    .filter((p) => p.symbol.length > 0);

  return pairs.length > 0 ? pairs : [{ symbol: '', threshold: '' }];
}

/**
 * Extracts normalized CryptoPair array from any monitor source (MonitorConfig, symbols, source_id, array or string).
 */
export function extractCryptoPairsFromMonitor(
  monitor?: { symbols?: string[] | string | null; source_id?: string | null } | null
): CryptoPair[] {
  if (!monitor) return [{ symbol: '', threshold: '' }];
  const rawSymbols = monitor.symbols ?? monitor.source_id ?? '';
  const symbolsStr = Array.isArray(rawSymbols) ? rawSymbols.join(',') : String(rawSymbols);
  return parseCryptoPairsFromString(symbolsStr);
}

/**
 * Extracts normalized MonitorFormData from a MonitorConfig object (reverse of buildCreateMonitorPayload / buildUpdateMonitorPayload).
 */
export function extractMonitorFormData(monitor?: Partial<MonitorConfig> | null): MonitorFormData {
  if (!monitor) {
    return { ...INITIAL_MONITOR_FORM_DATA };
  }

  const extra: Record<string, any> =
    typeof monitor.extra_settings === 'object' && monitor.extra_settings !== null
      ? monitor.extra_settings
      : {};

  return {
    name: monitor.name || '',
    target_channels: Array.isArray(monitor.target_channels) ? monitor.target_channels : [],
    target_roles: Array.isArray(monitor.target_roles) ? monitor.target_roles : [],
    embed_color: monitor.embed_color || '#3d3f45',
    platform_input: monitor.source_id || '',
    custom_alert: monitor.custom_alert || extra.custom_alert || '',
    include_upcoming: Boolean(monitor.include_upcoming || extra.include_upcoming),
    target_genres: Array.isArray(monitor.target_genres) ? monitor.target_genres : [],
    target_languages: Array.isArray(monitor.target_languages) ? monitor.target_languages : [],
    send_initial_alert: monitor.send_initial_alert !== undefined ? Boolean(monitor.send_initial_alert) : true,
    use_native_player: Boolean(monitor.use_native_player || extra.use_native_player),
    custom_image: monitor.custom_image || extra.custom_image || '',
    steam_patch_only: Boolean(monitor.steam_patch_only || extra.steam_patch_only),
  };
}

/**
 * Parses a multiline sources input into cleaned unique non-empty string tokens.
 */
export function parseSourcesList(input: string): string[] {
  return input
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Validates bulk add form inputs
 */
export function validateBulkAddInputs(
  sources: string[],
  targetChannels: string[]
): { isValid: boolean; errorTitle?: string; errorMessage?: string } {
  if (sources.length === 0) {
    return {
      isValid: false,
      errorTitle: 'Empty List',
      errorMessage: 'Please enter at least one source.',
    };
  }
  if (targetChannels.length === 0) {
    return {
      isValid: false,
      errorTitle: 'Missing Channel',
      errorMessage: 'Please select at least one target channel.',
    };
  }
  return { isValid: true };
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
    if (isCryptoPlatform(platform.id)) {
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
 * Normalizes common monitor attributes (delivery, branding, platform-specific flags)
 */
export interface NormalizedMonitorAttributes {
  target_channels: string[];
  target_roles: string[];
  embed_color: string;
  custom_alert: string;
  include_upcoming: boolean;
  target_genres: string[];
  target_languages: string[];
  send_initial_alert: boolean;
  use_native_player?: boolean;
  custom_image: string;
  steam_patch_only?: boolean;
}

export function normalizeMonitorAttributes(
  formData: Partial<MonitorFormData | BulkAddFormData>,
  platformId?: string | null
): NormalizedMonitorAttributes {
  const normPlatformId = platformId || '';
  const result: NormalizedMonitorAttributes = {
    target_channels: formData.target_channels || [],
    target_roles: formData.target_roles || [],
    embed_color: formData.embed_color || '#3d3f45',
    custom_alert: ('custom_alert' in formData ? (formData.custom_alert || '') : '').trim(),
    include_upcoming: 'include_upcoming' in formData ? Boolean(formData.include_upcoming) : false,
    target_genres: 'target_genres' in formData && Array.isArray(formData.target_genres) ? formData.target_genres : [],
    target_languages: 'target_languages' in formData && Array.isArray(formData.target_languages) ? formData.target_languages : [],
    send_initial_alert: supportsLiveAlerts(normPlatformId)
      ? Boolean(formData.send_initial_alert)
      : false,
    use_native_player: supportsNativePlayer(normPlatformId)
      ? Boolean(formData.use_native_player)
      : undefined,
    custom_image: (formData.custom_image || '').trim(),
  };

  if (
    'steam_patch_only' in formData &&
    supportsPatchFilter(normPlatformId) &&
    formData.steam_patch_only !== undefined
  ) {
    result.steam_patch_only = Boolean(formData.steam_patch_only);
  }

  return result;
}

/**
 * Builds the API payload for creating a new monitor
 */
export function buildCreateMonitorPayload(
  formData: MonitorFormData,
  platform: PlatformMetadata,
  guildId: string,
  cryptoPairs: CryptoPair[] = []
): CreateMonitorPayload {
  const isCrypto = isCryptoPlatform(platform.id);
  const platformInput = isCrypto
    ? formatCryptoPairsToString(cryptoPairs)
    : formData.platform_input.trim();

  const attributes = normalizeMonitorAttributes(formData, platform.id);

  const payload: CreateMonitorPayload = {
    type: platform.id,
    name: formData.name.trim(),
    guildId,
    ...attributes,
  };

  if (!platform.isGlobal) {
    const key = isCrypto
      ? 'symbols'
      : platform.inputKey || 'source_id';
    (payload as any)[key] = platformInput;
  }

  return payload;
}

/**
 * Builds the API payload for updating an existing monitor
 */
export function buildUpdateMonitorPayload(
  formData: MonitorFormData,
  platformId: string,
  cryptoPairs: CryptoPair[] = []
): UpdateMonitorPayload {
  const isCrypto = isCryptoPlatform(platformId);
  const platformInput = isCrypto
    ? formatCryptoPairsToString(cryptoPairs)
    : formData.platform_input.trim();

  const attributes = normalizeMonitorAttributes(formData, platformId);

  const payload: UpdateMonitorPayload = {
    name: formData.name.trim(),
    ...attributes,
    source_id: !isCrypto ? platformInput : undefined,
    symbols: isCrypto ? platformInput : undefined,
  };

  return payload;
}

export interface BulkAddPayloadParams {
  guildId: string;
  platformId: string;
  sources: string[];
  targetChannels: string[];
  targetRoles: string[];
  embedColor: string;
  sendInitialAlert: boolean;
  useNativePlayer: boolean;
  customImage: string;
}

/**
 * Builds the API payload for bulk adding monitors
 */
export function buildBulkAddPayload(params: BulkAddPayloadParams): BulkAddPayload {
  const attributes = normalizeMonitorAttributes(
    {
      target_channels: params.targetChannels,
      target_roles: params.targetRoles,
      embed_color: params.embedColor,
      send_initial_alert: params.sendInitialAlert,
      use_native_player: params.useNativePlayer,
      custom_image: params.customImage,
    },
    params.platformId
  );

  return {
    guildId: params.guildId,
    type: params.platformId,
    sources: params.sources,
    targetChannels: attributes.target_channels,
    targetRoles: attributes.target_roles,
    embedColor: attributes.embed_color,
    sendInitialAlert: attributes.send_initial_alert,
    useNativePlayer: attributes.use_native_player,
    customImage: attributes.custom_image,
  };
}

/**
 * Builds the partial update payload for bulk monitor editing based on enabled toggle flags.
 */
export function buildBulkEditPayload(formData: Partial<BulkEditFormData>): Record<string, any> {
  const updateData: Record<string, any> = {};
  if (formData.use_channels) updateData.target_channels = formData.target_channels || [];
  if (formData.use_roles) updateData.target_roles = formData.target_roles || [];
  if (formData.use_color) updateData.embed_color = formData.embed_color || '#3d3f45';
  if (formData.use_native) updateData.use_native_player = Boolean(formData.use_native_player);
  if (formData.use_custom_image) updateData.custom_image = (formData.custom_image || '').trim();
  return updateData;
}

/**
 * Checks whether any field has been selected for bulk update.
 */
export function hasBulkEditChanges(updateData: Record<string, any>): boolean {
  return Object.keys(updateData).length > 0;
}

/**
 * Appends a variable tag to an existing template string.
 */
export function appendTemplateTag(currentTemplate = '', tag: string): string {
  return `${currentTemplate}${tag}`;
}



