import { AUTH_TOKEN_KEY } from './context';
import type { DiscordUser } from './types';

export const AUTH_EXPIRY_KEY = 'nova_auth_expires_at';
export const AUTH_REFRESH_TOKEN_KEY = 'nova_refresh_token';
export const AUTH_USER_KEY = 'nova_auth_user';

export interface StoredSession {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isExpired: boolean;
  user: DiscordUser | null;
}

/**
 * Saves authenticated session with optional user profile, expiration, and refresh token.
 */
export const saveAuthSession = (
  token: string,
  expiresInSeconds?: number,
  refreshToken?: string,
  user?: DiscordUser
): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (expiresInSeconds && expiresInSeconds > 0) {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem(AUTH_EXPIRY_KEY, String(expiresAt));
    }
    if (refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Retrieves the stored user profile from localStorage.
 */
export const getStoredUser = (): DiscordUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as DiscordUser) : null;
  } catch {
    return null;
  }
};

/**
 * Saves user profile to localStorage.
 */
export const saveStoredUser = (user: DiscordUser | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Retrieves the stored session, user profile, and calculates expiration state.
 */
export const getStoredSession = (): StoredSession => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null, expiresAt: null, isExpired: false, user: null };
  }

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(AUTH_EXPIRY_KEY);
    const expiresAt = expiryStr ? Number(expiryStr) : null;
    const user = getStoredUser();

    const isExpired = expiresAt !== null && Date.now() >= expiresAt;

    return {
      token,
      refreshToken,
      expiresAt,
      isExpired,
      user,
    };
  } catch {
    return { token: null, refreshToken: null, expiresAt: null, isExpired: false, user: null };
  }
};

/**
 * Clears stored authentication session tokens and user state.
 */
export const clearStoredSession = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Ignore storage errors
  }
};
