export const DISCORD_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DISCORD_CLIENT_ID) ||
  '1541869073867083947';
export const DISCORD_BOT_PERMISSIONS = '277025508352';
export const DISCORD_BOT_SCOPES = 'bot applications.commands';

/**
 * Generates the official Discord OAuth2 bot invitation URL.
 */
export const buildDiscordBotInviteUrl = (
  clientId: string = DISCORD_CLIENT_ID,
  permissions: string = DISCORD_BOT_PERMISSIONS,
  scopes: string = DISCORD_BOT_SCOPES,
  guildId?: string
): string => {
  const encodedScopes = encodeURIComponent(scopes);
  let url = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${encodedScopes}`;
  if (guildId) {
    url += `&guild_id=${guildId}&disable_guild_select=true`;
  }
  return url;
};

export const DISCORD_BOT_INVITE_URL = buildDiscordBotInviteUrl();
export const DISCORD_SUPPORT_SERVER_URL = 'https://discord.gg/tjRStPtm9k';

export const APP_BASE_URL = 'https://novafeeds.xyz';
export const DEFAULT_OG_IMAGE = 'https://novafeeds.xyz/images/og/og-home.webp';

export const OG_IMAGES = {
  home: 'https://novafeeds.xyz/images/og/og-home.webp',
  premium: 'https://novafeeds.xyz/images/og/og-premium.webp',
  docs: 'https://novafeeds.xyz/images/og/og-docs.webp',
  support: 'https://novafeeds.xyz/images/og/og-support.webp',
  changelog: 'https://novafeeds.xyz/images/og/og-changelog.webp',
  legal: 'https://novafeeds.xyz/images/og/og-legal.webp',
} as const;

