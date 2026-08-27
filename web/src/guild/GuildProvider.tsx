import type { ReactNode } from 'react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserGuild, GuildContextValue } from './types';
import { GuildContext } from './context';
import { useAuth } from '@/auth';

interface GuildProviderProps {
  children: ReactNode;
}

const DEFAULT_DEMO_GUILDS: UserGuild[] = [
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
  const { isAuthenticated } = useAuth();
  const [guilds, setGuilds] = useState<UserGuild[]>([]);
  const [activeGuildId, setActiveGuildId] = useState<string | null>(null);
  const [isLoadingGuilds, setIsLoadingGuilds] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingGuilds(true);
      setGuilds(DEFAULT_DEMO_GUILDS);
      setIsLoadingGuilds(false);
    } else {
      setGuilds([]);
      setActiveGuildId(null);
    }
  }, [isAuthenticated]);

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
      setGuilds,
      selectGuild,
      checkGuildPermission,
      getGuildById,
    }),
    [
      guilds,
      activeGuildId,
      activeGuild,
      isLoadingGuilds,
      selectGuild,
      checkGuildPermission,
      getGuildById,
    ]
  );

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
};
