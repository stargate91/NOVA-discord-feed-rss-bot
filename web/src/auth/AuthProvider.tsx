import { isDiscordUser } from '@/types';
import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { DiscordUser, AuthContextValue } from './types';
import { AuthContext, ADMIN_SECRET_KEY } from './context';
import { buildDiscordOAuthUrl } from './oauth';
import {
  getStoredUser,
  getStoredSession,
  saveStoredUser,
  clearStoredSession,
  saveAuthSession,
} from './session';
import { queryCache } from '@/api/queryCache';
import { apiClient } from '@/api/client';
import { featureFlags } from '@/constants';

interface AuthProviderProps {
  children: ReactNode;
}

export const DEFAULT_DEMO_USER: DiscordUser = {
  id: '123456789012345678',
  username: 'NovaAdmin',
  discriminator: '0001',
  avatar: '/images/logo.webp',
  global_name: 'Nova Admin User',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuthToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const session = getStoredSession();
    if (!session.refreshToken) {
      return null;
    }

    try {
      // 1. Mock mode refresh simulation
      if (featureFlags.useMockData || featureFlags.mockAuth) {
        const refreshedToken = `mock_refreshed_${Date.now()}`;
        saveAuthSession(
          refreshedToken,
          86400,
          session.refreshToken,
          session.user || DEFAULT_DEMO_USER
        );
        apiClient.setAuthToken(refreshedToken);
        return refreshedToken;
      }

      // 2. Real backend OAuth2/JWT token refresh request
      const response = await fetch(`${apiClient.getBaseUrl()}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });

      if (!response.ok) {
        clearStoredSession();
        apiClient.clearSession();
        setUser(null);
        return null;
      }

      const data = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        refresh_token?: string;
      };

      if (data && typeof data.access_token === 'string') {
        const newToken = data.access_token;
        const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 86400;
        const newRefreshToken =
          typeof data.refresh_token === 'string' ? data.refresh_token : session.refreshToken;

        saveAuthSession(newToken, expiresIn, newRefreshToken, session.user || undefined);
        apiClient.setAuthToken(newToken);
        return newToken;
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  // Register token refresh handler on ApiClient
  useEffect(() => {
    apiClient.setTokenRefreshHandler(refreshAuthToken);
    return () => {
      apiClient.setTokenRefreshHandler(null);
    };
  }, [refreshAuthToken]);

  const rehydrateSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined') return;

      const savedSecret = localStorage.getItem(ADMIN_SECRET_KEY);
      if (savedSecret) {
        setAdminSecret(savedSecret);
        apiClient.setAdminSecret(savedSecret);
      }

      const session = getStoredSession();
      if (!session.token) {
        setUser(null);
        apiClient.setAuthToken(null);
        return;
      }

      // Proactively prevent sending expired tokens: refresh or invalidate
      let effectiveToken = session.token;
      if (session.isExpired) {
        if (session.refreshToken) {
          const refreshedToken = await refreshAuthToken();
          if (refreshedToken) {
            effectiveToken = refreshedToken;
          } else {
            clearStoredSession();
            apiClient.clearSession();
            setUser(null);
            return;
          }
        } else {
          clearStoredSession();
          apiClient.clearSession();
          setUser(null);
          return;
        }
      }

      apiClient.setAuthToken(effectiveToken);

      // 1. If mock mode is explicitly configured, use mock user profile
      if (featureFlags.useMockData) {
        setUser(DEFAULT_DEMO_USER);
        saveStoredUser(DEFAULT_DEMO_USER);
        return;
      }

      // 2. Try loading cached user profile from localStorage first for instant UI rehydration
      const cachedUser = getStoredUser();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // 3. Revalidate session profile against real backend with schema validation
      try {
        const liveUser = await apiClient.get<DiscordUser>('/api/v1/users/@me', {
          timeout: 5000,
          dedup: true,
          validate: isDiscordUser,
        });
        setUser(liveUser);
        saveStoredUser(liveUser);
      } catch (err: unknown) {
        // If 401 or token expired, invalidate stored session
        if (
          typeof err === 'object' &&
          err !== null &&
          'status' in err &&
          (err as { status: number }).status === 401
        ) {
          clearStoredSession();
          apiClient.clearSession();
          setUser(null);
        } else if (!cachedUser) {
          // If offline/network error and no cached user, fallback to demo if permitted
          if (featureFlags.mockAuth) {
            setUser(DEFAULT_DEMO_USER);
          } else {
            setError('Failed to revalidate authentication session');
          }
        }
      }
    } catch {
      setError('Unexpected error during session rehydration');
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuthToken]);

  // Initialize session on mount
  useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);

  const mockLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      saveAuthSession(
        'demo_session_token_2026',
        86400,
        'demo_refresh_token_2026',
        DEFAULT_DEMO_USER
      );
      apiClient.setAuthToken('demo_session_token_2026');
      setUser(DEFAULT_DEMO_USER);
      setError(null);
    }
  }, []);

  const loginWithDiscord = useCallback(
    (redirectUri?: string) => {
      if (typeof window === 'undefined') return;

      if (featureFlags.useMockData || featureFlags.mockAuth) {
        mockLogin();
        return;
      }

      // Production OAuth2 redirect flow
      const authUrl = buildDiscordOAuthUrl(redirectUri);
      window.location.href = authUrl;
    },
    [mockLogin]
  );

  const logout = useCallback(() => {
    clearStoredSession();
    apiClient.clearSession();
    setUser(null);
    setError(null);
    queryCache.clear();
  }, []);

  const setAdminSecretKey = useCallback((secret: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SECRET_KEY, secret);
    }
    apiClient.setAdminSecret(secret);
    setAdminSecret(secret);
  }, []);

  const clearAdminSecretKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SECRET_KEY);
    }
    apiClient.setAdminSecret(null);
    setAdminSecret(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      adminSecret,
      error,
      loginWithDiscord,
      mockLogin,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
      rehydrateSession,
    }),
    [
      user,
      isLoading,
      adminSecret,
      error,
      loginWithDiscord,
      mockLogin,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
      rehydrateSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
