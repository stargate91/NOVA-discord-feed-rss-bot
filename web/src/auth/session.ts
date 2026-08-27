import { AUTH_TOKEN_KEY } from './context';

export const AUTH_EXPIRY_KEY = 'nova_auth_expires_at';
export const AUTH_REFRESH_TOKEN_KEY = 'nova_refresh_token';

export interface StoredSession {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isExpired: boolean;
}

/**
 * Saves authenticated session with optional expiration timestamp.
 */
export const saveAuthSession = (
  token: string,
  expiresInSeconds?: number,
  refreshToken?: string
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
  } catch {
    // Ignore storage errors
  }
};

/**
 * Retrieves the stored session and calculates expiration state.
 */
export const getStoredSession = (): StoredSession => {
  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null, expiresAt: null, isExpired: false };
  }

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    const expiryStr = localStorage.getItem(AUTH_EXPIRY_KEY);
    const expiresAt = expiryStr ? Number(expiryStr) : null;

    const isExpired = expiresAt !== null && Date.now() >= expiresAt;

    return {
      token,
      refreshToken,
      expiresAt,
      isExpired,
    };
  } catch {
    return { token: null, refreshToken: null, expiresAt: null, isExpired: false };
  }
};

/**
 * Clears stored authentication session tokens.
 */
export const clearStoredSession = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
};
