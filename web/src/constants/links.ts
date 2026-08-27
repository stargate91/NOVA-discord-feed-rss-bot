export const DISCORD_CLIENT_ID = '1489908793780338688';
export const DISCORD_BOT_PERMISSIONS = '277025508352';
export const DISCORD_BOT_SCOPES = 'bot applications.commands';

/**
 * Generates the official Discord OAuth2 bot invitation URL.
 */
export const buildDiscordBotInviteUrl = (
  clientId: string = DISCORD_CLIENT_ID,
  permissions: string = DISCORD_BOT_PERMISSIONS,
  scopes: string = DISCORD_BOT_SCOPES
): string => {
  const encodedScopes = encodeURIComponent(scopes);
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${encodedScopes}`;
};

export const DISCORD_BOT_INVITE_URL = buildDiscordBotInviteUrl();
export const DISCORD_SUPPORT_SERVER_URL = 'https://discord.gg/PbvX3S7pXR';

export const APP_BASE_URL = 'https://novafeeds.xyz';
export const DEFAULT_OG_IMAGE = 'https://novafeeds.xyz/images/logo.webp';
