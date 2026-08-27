import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserGuild, GuildContextValue } from './types';
import { GuildContext } from './context';
import { useAuth } from '@/auth';
import { toGuildTier } from '@/auth/entitlements';
import { apiClient } from '@/api/client';
import { featureFlags } from '@/constants';
import { DEFAULT_DEMO_GUILDS, ACTIVE_GUILD_STORAGE_KEY } from './constants';

interface GuildProviderProps {
  children: ReactNode;
}

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
  const [activeGuildId, setActiveGuildId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(ACTIVE_GUILD_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isLoadingGuilds, setIsLoadingGuilds] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuilds = useCallback(async () => {
    if (!isAuthenticated) {
      setGuilds([]);
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

    // 2. Real async API fetch path with normalization
    try {
      const data = await apiClient.get<unknown[]>('/api/v1/users/@me/guilds', {
        timeout: 10000,
        dedup: true,
      });

      const rawList = Array.isArray(data) ? data : [];
      const normalizedGuilds: UserGuild[] = rawList.map((item: unknown) => {
        const g = item as Record<string, unknown>;
        return {
          id: String(g.id || g.guild_id || ''),
          name: String(g.name || 'Unnamed Server'),
          icon: (g.icon as string) || null,
          owner: Boolean(g.owner ?? g.is_owner),
          permissions: String(g.permissions ?? '0'),
          hasManagePermission: Boolean(g.hasManagePermission ?? g.is_owner ?? g.owner ?? true),
          tier: toGuildTier(g.tier as any),
          monitorsCount: Number(g.active_monitors ?? g.monitorsCount ?? 0),
        };
      });

      setGuilds(normalizedGuilds);
    } catch (err: unknown) {
      if (featureFlags.mockAuth) {
        setGuilds(DEFAULT_DEMO_GUILDS);
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch user Discord guilds';
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
    if (typeof window !== 'undefined') {
      try {
        if (guildId) {
          localStorage.setItem(ACTIVE_GUILD_STORAGE_KEY, guildId);
        } else {
          localStorage.removeItem(ACTIVE_GUILD_STORAGE_KEY);
        }
      } catch {
        // Ignore storage errors
      }
    }
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
    if (activeGuildId) {
      const matched = guilds.find((g) => g.id === activeGuildId);
      if (matched) return matched;
    }
    return guilds[0] || null;
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
