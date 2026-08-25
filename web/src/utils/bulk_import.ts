import { supportsLiveAlerts, supportsNativePlayer } from './platform';

export function parseSourcesList(input: string): string[] {
  return input
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

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

export function buildBulkAddPayload(params: BulkAddPayloadParams) {
  return {
    guildId: params.guildId,
    type: params.platformId,
    sources: params.sources,
    targetChannels: params.targetChannels,
    targetRoles: params.targetRoles,
    embedColor: params.embedColor,
    sendInitialAlert: supportsLiveAlerts(params.platformId)
      ? params.sendInitialAlert
      : false,
    use_native_player: supportsNativePlayer(params.platformId)
      ? params.useNativePlayer
      : undefined,
    custom_image: params.customImage,
  };
}
