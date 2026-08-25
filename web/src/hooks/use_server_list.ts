import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GuildInfo } from '@/types/guild';
import guildService from '@/services/guild_service';
import {
  filterAndSortGuilds,
  getGuildIconUrl,
  getBotInviteUrl,
  getGuildInitials,
} from '@/utils';

export interface EnrichedGuildInfo extends GuildInfo {
  hasBot: boolean;
  iconUrl: string | null;
  botInviteUrl: string;
  initials: string;
}

export function useServerList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean; bot_in_guild?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGuilds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guildService.getGuilds();
      setGuilds(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Discord servers');
      console.error('Guild fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      let isMounted = true;
      guildService.getGuilds()
        .then((data) => {
          if (isMounted) {
            setGuilds(data || []);
            setLoading(false);
          }
        })
        .catch((err: any) => {
          if (isMounted) {
            setError(err?.message || 'Failed to load Discord servers');
            setLoading(false);
            console.error('Guild fetch error:', err);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [status, router]);


  const filteredGuilds: EnrichedGuildInfo[] = useMemo(() => {
    const sorted = filterAndSortGuilds(guilds, searchQuery);
    return sorted.map((guild) => ({
      ...guild,
      hasBot: Boolean(guild.hasBot || (guild as any).bot_in_guild),
      iconUrl: getGuildIconUrl(guild.id, guild.icon, 128),
      botInviteUrl: getBotInviteUrl(guild.id),
      initials: getGuildInitials(guild.name),
    }));
  }, [guilds, searchQuery]);

  const handleSelectGuild = useCallback(
    (guildId: string) => {
      router.push(`/dashboard/${guildId}`);
    },
    [router]
  );

  return {
    session,
    guilds,
    filteredGuilds,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchGuilds,
    handleSelectGuild,
  };
}
