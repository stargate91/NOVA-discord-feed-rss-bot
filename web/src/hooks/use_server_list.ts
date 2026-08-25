import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GuildInfo } from '@/types/guild';
import guildService from '@/services/guild_service';
import { filterAndSortGuilds } from '@/utils/guild_sorter';

export function useServerList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGuilds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guildService.getGuilds();
      setGuilds(data);
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
      let ignore = false;
      async function load() {
        try {
          const data = await guildService.getGuilds();
          if (!ignore) {
            setGuilds(data);
          }
        } catch (err: any) {
          if (!ignore) {
            setError(err?.message || 'Failed to load Discord servers');
            console.error('Guild fetch error:', err);
          }
        } finally {
          if (!ignore) {
            setLoading(false);
          }
        }
      }
      load();
      return () => {
        ignore = true;
      };
    }
  }, [status, router]);

  const filteredGuilds = useMemo(() => {
    return filterAndSortGuilds(guilds, searchQuery);
  }, [guilds, searchQuery]);

  return {
    session,
    guilds,
    filteredGuilds,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchGuilds,
  };
}
