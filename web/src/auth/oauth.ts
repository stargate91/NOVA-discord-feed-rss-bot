import { DISCORD_CLIENT_ID } from '@/constants';

export const DISCORD_OAUTH_SCOPES = 'identify guilds';
export const OAUTH_STATE_KEY = 'nova_oauth_state';

/**
 * Generates a cryptographically random OAuth state string and saves it to sessionStorage.
 */
export const generateOAuthState = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    const state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    try {
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
    } catch {
      // Ignore storage write errors
    }
    return state;
  }

  const fallback = Math.random().toString(36).substring(2) + Date.now().toString(36);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(OAUTH_STATE_KEY, fallback);
    } catch {
      // Ignore storage write errors
    }
  }
  return fallback;
};

/**
 * Validates the returning OAuth state against the stored token to prevent CSRF attacks.
 */
export const validateOAuthState = (receivedState: string | null): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);

    if (!savedState || !receivedState) {
      return false;
    }

    return savedState === receivedState;
  } catch {
    return false;
  }
};

/**
 * Builds the official Discord OAuth2 authorization URL for user authentication.
 */
export const buildDiscordOAuthUrl = (
  redirectUri: string = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://novafeeds.xyz/auth/callback',
  state: string = typeof window !== 'undefined' ? generateOAuthState() : '',
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
