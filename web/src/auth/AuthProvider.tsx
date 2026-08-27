import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { DiscordUser, AuthContextValue } from './types';
import { AuthContext, AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from './context';
import { buildDiscordOAuthUrl } from './oauth';
import { getStoredUser, saveStoredUser, clearStoredSession, saveAuthSession } from './session';
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

      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!savedToken) {
        setUser(null);
        apiClient.setAuthToken(null);
        return;
      }

      apiClient.setAuthToken(savedToken);

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

      // 3. Revalidate session profile against real backend
      try {
        const liveUser = await apiClient.get<DiscordUser>('/api/v1/users/@me', {
          timeout: 5000,
          dedup: true,
        });
        setUser(liveUser);
        saveStoredUser(liveUser);
      } catch (err: unknown) {
        // If 401 or token expired, invalidate stored session
        if (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 401) {
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
  }, []);

  // Initialize session on mount
  useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);

  const mockLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      saveAuthSession('demo_session_token_2026', 86400, undefined, DEFAULT_DEMO_USER);
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
