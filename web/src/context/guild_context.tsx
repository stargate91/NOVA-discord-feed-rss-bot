"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { GuildInfo, GuildSettings, GuildFeatures, DiscordChannel, DiscordRole } from '@/types/guild';
import { DiscordSelectOption, formatChannelOptions, formatRoleOptions } from '@/utils/discord';
import { ClientTierContext, resolveClientTierContext, TierFeatureName } from '@/utils/tier_limits';
import guildService from '@/services/guild_service';

export interface GuildContextType extends ClientTierContext {
  guildId: string;
  guild: (GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }) | null;
  settings: GuildSettings | null;
  channels: DiscordChannel[];
  roles: DiscordRole[];
  channelOptions: DiscordSelectOption[];
  roleOptions: DiscordSelectOption[];
  tierContext: ClientTierContext;
  loading: boolean;
  channelsLoading: boolean;
  refreshGuild: () => Promise<void>;
  refreshChannelsAndRoles: (force?: boolean) => Promise<void>;
  updateSettingsState: (updated: Partial<GuildSettings>) => void;
  updateGuildSettings: (settings: Partial<GuildSettings>) => Promise<GuildSettings>;
}

const GuildContext = createContext<GuildContextType | null>(null);

export interface GuildProviderProps {
  guildId: string;
  initialIsMaster?: boolean;
  children: React.ReactNode;
}

export function GuildProvider({ guildId, initialIsMaster = false, children }: GuildProviderProps) {
  const { data: session } = useSession();
  const [guild, setGuild] = useState<(GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }) | null>(null);
  const [settings, setSettings] = useState<GuildSettings | null>(null);
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(true);

  const isMasterUser = initialIsMaster || session?.user?.role === 'master';

  const loadChannelsAndRoles = useCallback(async (force = false) => {
    if (!guildId) return;
    try {
      setChannelsLoading(true);
      const [cData, rData] = await Promise.all([
        guildService.getChannels(guildId, force).catch(() => []),
        guildService.getRoles(guildId, force).catch(() => []),
      ]);
      setChannels(cData || []);
      setRoles(rData || []);
    } catch (err) {
      console.error('[GuildProvider] Failed to load channels/roles:', err);
    } finally {
      setChannelsLoading(false);
    }
  }, [guildId]);

  const loadData = useCallback(async (force = false) => {
    if (!guildId) return;
    try {
      setLoading(true);
      const [guildsList, sData] = await Promise.all([
        guildService.getGuilds(force).catch(() => []),
        guildService.getSettings(guildId, force).catch(() => null),
        loadChannelsAndRoles(force),
      ]);
      const current = guildsList.find((g) => String(g.id) === String(guildId)) || null;
      setGuild(current);
      setSettings(sData);
    } catch (err) {
      console.error('[GuildProvider] Failed to load guild data:', err);
    } finally {
      setLoading(false);
    }
  }, [guildId, loadChannelsAndRoles]);

  useEffect(() => {
    if (!guildId) return;
    loadData(false);
  }, [guildId, loadData]);

  const updateSettingsState = useCallback((updated: Partial<GuildSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...updated } : (updated as GuildSettings)));
  }, []);

  const updateGuildSettings = useCallback(async (newSettings: Partial<GuildSettings>): Promise<GuildSettings> => {
    if (!guildId) throw new Error('Guild ID is required');
    const updated = await guildService.updateSettings(guildId, newSettings);
    setSettings((prev) => (prev ? { ...prev, ...updated } : updated));
    return updated;
  }, [guildId]);

  const channelOptions = useMemo(() => formatChannelOptions(channels), [channels]);
  const roleOptions = useMemo(() => formatRoleOptions(roles), [roles]);

  const tierContext = useMemo(() => {
    return resolveClientTierContext({
      features: settings?.features,
      tier: settings?.tier ?? guild?.tier,
      isPremium: guild?.isPremium,
      isMaster: isMasterUser || guild?.isMaster || settings?.isMaster,
      session,
    });
  }, [settings, guild, isMasterUser, session]);

  const value = useMemo<GuildContextType>(() => ({
    guildId,
    guild,
    settings,
    channels,
    roles,
    channelOptions,
    roleOptions,
    tierContext,
    ...tierContext,
    loading,
    channelsLoading,
    refreshGuild: () => loadData(true),
    refreshChannelsAndRoles: (force = true) => loadChannelsAndRoles(force),
    updateSettingsState,
    updateGuildSettings,
  }), [guildId, guild, settings, channels, roles, channelOptions, roleOptions, tierContext, loading, channelsLoading, loadData, loadChannelsAndRoles, updateSettingsState, updateGuildSettings]);

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  );
}

export function useGuildContext(): GuildContextType {
  const ctx = useContext(GuildContext);
  if (!ctx) {
    throw new Error('useGuildContext must be used within a GuildProvider');
  }
  return ctx;
}

export function useOptionalGuildContext(): GuildContextType | null {
  return useContext(GuildContext);
}

/**
 * Returns true if the active GuildProvider matches the given target guild ID.
 */
export function useIsCurrentGuild(targetGuildId?: string | number | null): boolean {
  const ctx = useContext(GuildContext);
  if (!ctx || !targetGuildId) return false;
  return String(ctx.guildId) === String(targetGuildId);
}

/**
 * Returns matching GuildContext if active provider matches the given guild ID, or null otherwise.
 */
export function useMatchingGuildContext(targetGuildId?: string | number | null): GuildContextType | null {
  const ctx = useContext(GuildContext);
  if (!ctx || !targetGuildId || String(ctx.guildId) !== String(targetGuildId)) return null;
  return ctx;
}

