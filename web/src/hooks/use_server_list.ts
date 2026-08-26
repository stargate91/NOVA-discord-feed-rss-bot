import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { filterAndSortGuilds, getGuildDashboardRoute, EnrichedGuildInfo } from '@/utils';
import { useGuilds } from './use_guilds';

export type { EnrichedGuildInfo };

export function useServerList() {
  const router = useRouter();
  const { guilds, loading, error, fetchGuilds, session, status } = useGuilds();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const filteredGuilds = useMemo(
    () => filterAndSortGuilds(guilds, searchQuery),
    [guilds, searchQuery]
  );

  const handleSelectGuild = useCallback(
    (guildId: string) => {
      router.push(getGuildDashboardRoute(guildId));
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
    fetchGuilds: () => fetchGuilds(true),
    handleSelectGuild,
  };
}

export default useServerList;
