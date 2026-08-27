import { DISCORD_CLIENT_ID } from '@/constants';

export const DISCORD_OAUTH_SCOPES = 'identify guilds';

/**
 * Builds the official Discord OAuth2 authorization URL for user authentication.
 */
export const buildDiscordOAuthUrl = (
  redirectUri: string = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://novafeeds.xyz/auth/callback',
  state?: string,
  clientId: string = DISCORD_CLIENT_ID
): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: DISCORD_OAUTH_SCOPES,
    redirect_uri: redirectUri,
    prompt: 'consent',
  });
  if (state) {
    params.set('state', state);
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
};
