import { useState, useEffect, useMemo } from 'react';
import guildService from '@/services/guild_service';
import { DiscordChannel, DiscordRole } from '@/types/guild';
import { useMatchingGuildContext } from '@/context/guild_context';
import {
  DiscordSelectOption,
  formatChannelOptions,
  formatRoleOptions,
} from '@/utils/discord';

export interface UseGuildChannelsAndRolesResult {
  channels: DiscordChannel[];
  roles: DiscordRole[];
  channelOptions: DiscordSelectOption[];
  roleOptions: DiscordSelectOption[];
  loading: boolean;
  error: Error | null;
}

/**
 * Shared hook to load Discord text channels and roles for a guild.
 * Reads from centralized GuildContext when mounted within a dashboard tree.
 */
export function useGuildChannelsAndRoles(
  guildId: string,
  enabled: boolean = true
): UseGuildChannelsAndRolesResult {
  const guildCtx = useMatchingGuildContext(guildId);
  const isContextMatch = Boolean(guildCtx);

  const [fallbackChannels, setFallbackChannels] = useState<DiscordChannel[]>([]);
  const [fallbackRoles, setFallbackRoles] = useState<DiscordRole[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !guildId || isContextMatch) return;

    let ignore = false;
    const loadData = async () => {
      try {
        setFallbackLoading(true);
        setError(null);
        const [chanData, roleData] = await Promise.all([
          guildService.getChannels(guildId),
          guildService.getRoles(guildId),
        ]);
        if (!ignore) {
          setFallbackChannels(chanData || []);
          setFallbackRoles(roleData || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error('[useGuildChannelsAndRoles] Failed to load channels/roles:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!ignore) {
          setFallbackLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [guildId, enabled, isContextMatch]);

  const fallbackChannelOptions = useMemo(
    () => (isContextMatch ? [] : formatChannelOptions(fallbackChannels)),
    [fallbackChannels, isContextMatch]
  );
  const fallbackRoleOptions = useMemo(
    () => (isContextMatch ? [] : formatRoleOptions(fallbackRoles)),
    [fallbackRoles, isContextMatch]
  );

  if (isContextMatch && guildCtx) {
    return {
      channels: guildCtx.channels,
      roles: guildCtx.roles,
      channelOptions: guildCtx.channelOptions,
      roleOptions: guildCtx.roleOptions,
      loading: guildCtx.channelsLoading,
      error: null,
    };
  }

  return {
    channels: fallbackChannels,
    roles: fallbackRoles,
    channelOptions: fallbackChannelOptions,
    roleOptions: fallbackRoleOptions,
    loading: fallbackLoading,
    error,
  };
}

export default useGuildChannelsAndRoles;

