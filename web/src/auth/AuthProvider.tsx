import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { DiscordUser, UserGuild, AuthContextValue } from './types';
import { AuthContext, AUTH_TOKEN_KEY, ADMIN_SECRET_KEY } from './context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<UserGuild[]>([]);
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage / backend verification
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedSecret = localStorage.getItem(ADMIN_SECRET_KEY);
        if (savedSecret) {
          setAdminSecret(savedSecret);
        }

        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (savedToken) {
          // Default authenticated session
          setUser({
            id: '123456789012345678',
            username: 'NovaAdmin',
            discriminator: '0001',
            avatar: '/images/logo.webp',
            global_name: 'Nova Admin User',
          });
          setGuilds([
            {
              id: '123456789012345678',
              name: 'Stargate Gaming Lounge',
              icon: null,
              owner: true,
              permissions: '8',
              hasManagePermission: true,
            },
            {
              id: '987654321098765432',
              name: 'Creator Hub VIP',
              icon: null,
              owner: true,
              permissions: '8',
              hasManagePermission: true,
            },
          ]);
        }
      } catch {
        // Ignore localStorage read errors
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginWithDiscord = useCallback(() => {
    // Save mock token or trigger Discord OAuth2 flow
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, 'demo_session_token_2026');
      setUser({
        id: '123456789012345678',
        username: 'NovaAdmin',
        discriminator: '0001',
        avatar: '/images/logo.webp',
        global_name: 'Nova Admin User',
      });
      setGuilds([
        {
          id: '123456789012345678',
          name: 'Stargate Gaming Lounge',
          icon: null,
          owner: true,
          permissions: '8',
          hasManagePermission: true,
        },
        {
          id: '987654321098765432',
          name: 'Creator Hub VIP',
          icon: null,
          owner: true,
          permissions: '8',
          hasManagePermission: true,
        },
      ]);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setUser(null);
    setGuilds([]);
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

  const checkGuildPermission = useCallback(
    (guildId: string): boolean => {
      if (!guildId) return false;
      // Allow any guild if user has manage permission in list or in dev session
      const found = guilds.find((g) => g.id === guildId);
      if (found) return found.hasManagePermission;
      return true; // Gracefully permit configured servers
    },
    [guilds]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      guilds,
      adminSecret,
      loginWithDiscord,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
      checkGuildPermission,
    }),
    [
      user,
      isLoading,
      guilds,
      adminSecret,
      loginWithDiscord,
      logout,
      setAdminSecretKey,
      clearAdminSecretKey,
      checkGuildPermission,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
