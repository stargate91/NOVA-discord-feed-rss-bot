import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { DiscordUser, AuthContextValue } from './types';
import { AuthContext, AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from './context';
import { buildDiscordOAuthUrl } from './oauth';
import { queryCache } from '@/api/queryCache';

interface AuthProviderProps {
  children: ReactNode;
}

const DEFAULT_DEMO_USER: DiscordUser = {
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

  // Initialize session from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedSecret = localStorage.getItem(ADMIN_SECRET_KEY);
        if (savedSecret) {
          setAdminSecret(savedSecret);
        }

        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (savedToken) {
          // Initialize session with saved user profile or demo user
          setUser(DEFAULT_DEMO_USER);
        }
      } catch {
        // Ignore localStorage read errors
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const mockLogin = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, 'demo_session_token_2026');
      setUser(DEFAULT_DEMO_USER);
    }
  }, []);

  const loginWithDiscord = useCallback(
    (redirectUri?: string) => {
      if (typeof window === 'undefined') return;

      // If mock auth is active or local preview, establish session
      const isMock = import.meta.env.VITE_MOCK_AUTH === 'true' || window.location.hostname === 'localhost';
      if (isMock) {
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setUser(null);
    queryCache.clear();
  }, []);

  const setAdminSecretKey = useCallback((secret: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_SECRET_KEY, secret);
    }
    setAdminSecret(secret);
  }, []);

  const clearAdminSecretKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SECRET_KEY);
    }
    setAdminSecret(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      adminSecret,
      loginWithDiscord,
      mockLogin,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
    }),
    [
      user,
      isLoading,
      adminSecret,
      loginWithDiscord,
      mockLogin,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
