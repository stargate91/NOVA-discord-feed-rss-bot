import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserGuild, GuildContextValue } from './types';
import { GuildContext } from './context';
import { useAuth } from '@/auth';
import { apiClient } from '@/api/client';
import { featureFlags } from '@/constants';

interface GuildProviderProps {
  children: ReactNode;
}

export const DEFAULT_DEMO_GUILDS: UserGuild[] = [
  {
    id: '123456789012345678',
    name: 'Stargate Gaming Lounge',
    icon: null,
    owner: true,
    permissions: '8',
    hasManagePermission: true,
    tier: 'professional',
    monitorsCount: 4,
  },
  {
    id: '987654321098765432',
    name: 'Creator Hub VIP',
    icon: null,
    owner: true,
    permissions: '8',
    hasManagePermission: true,
    tier: 'ultimate',
    monitorsCount: 8,
  },
];

export const GuildProvider: React.FC<GuildProviderProps> = ({ children }) => {
  // Safe consumption of AuthContext with graceful fallback if rendered outside AuthProvider
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch {
    isAuthenticated = false;
  }

  const [guilds, setGuilds] = useState<UserGuild[]>([]);
  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuilds = useCallback(async () => {
    if (!isAuthenticated) {
      setGuilds([]);
      setActiveGuildId(null);
      setError(null);
      return;
    }

    setIsLoadingGuilds(true);
    setError(null);

    // 1. If mock data mode is enabled, load demo guilds
    if (featureFlags.useMockData) {
      setGuilds(DEFAULT_DEMO_GUILDS);
      setIsLoadingGuilds(false);
      return;
    }

    // 2. Real async API fetch path
    try {
      const data = await apiClient.get<UserGuild[]>('/api/v1/users/@me/guilds', {
        timeout: 6000,
        dedup: true,
      });

      const normalizedGuilds = Array.isArray(data) ? data : DEFAULT_DEMO_GUILDS;
      setGuilds(normalizedGuilds);
    } catch (err: unknown) {
      // Graceful fallback in development or offline preview
      if (featureFlags.mockAuth) {
        setGuilds(DEFAULT_DEMO_GUILDS);
      } else {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to fetch user Discord guilds';
        setError(errorMsg);
      }
    } finally {
      setIsLoadingGuilds(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  const selectGuild = useCallback((guildId: string | null) => {
    setActiveGuildId(guildId);
  }, []);

  const getGuildById = useCallback(
    (guildId: string): UserGuild | undefined => {
      return guilds.find((g) => g.id === guildId);
    },
    [guilds]
  );

  const checkGuildPermission = useCallback(
    (guildId: string): boolean => {
      if (!guildId) return false;
      const found = guilds.find((g) => g.id === guildId);
      if (!found) return false;
      return Boolean(found.hasManagePermission || found.owner);
    },
    [guilds]
  );

  const activeGuild = useMemo(() => {
    if (!activeGuildId) return guilds[0] || null;
    return guilds.find((g) => g.id === activeGuildId) || null;
  }, [activeGuildId, guilds]);

  const value: GuildContextValue = useMemo(
    () => ({
      guilds,
      activeGuildId,
      activeGuild,
      isLoadingGuilds,
      error,
      setGuilds,
      selectGuild,
      checkGuildPermission,
      getGuildById,
      refetchGuilds: fetchGuilds,
    }),
    [
      guilds,
      activeGuildId,
      activeGuild,
      isLoadingGuilds,
      error,
      selectGuild,
      checkGuildPermission,
      getGuildById,
      fetchGuilds,
    ]
  );

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
};
