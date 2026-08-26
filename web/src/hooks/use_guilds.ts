import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { GuildInfo } from '@/types/guild';
import guildService from '@/services/guild_service';
import { extractErrorMessage } from '@/utils/toast';
import { EnrichedGuildInfo, normalizeGuildInfo } from '@/utils/discord';

export interface UseGuildsOptions {
  autoFetch?: boolean;
}

export type GuildItem = EnrichedGuildInfo;

export interface UseGuildsReturn {
  guilds: EnrichedGuildInfo[];
  activeGuilds: EnrichedGuildInfo[];
  setGuilds: React.Dispatch<React.SetStateAction<EnrichedGuildInfo[]>>;
  loading: boolean;
  error: string | null;
  fetchGuilds: (forceRefresh?: boolean) => Promise<EnrichedGuildInfo[]>;
  session: ReturnType<typeof useSession>['data'];
  status: ReturnType<typeof useSession>['status'];
}

/**
 * Shared central hook to fetch and manage Discord servers for the authenticated user.
 * Backed by in-memory caching, normalization and request deduplication in guildService.
 */
export function useGuilds(options: UseGuildsOptions = {}): UseGuildsReturn {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState<EnrichedGuildInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuilds = useCallback(async (forceRefresh = false): Promise<EnrichedGuildInfo[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await guildService.getGuilds(forceRefresh);
      const list = (data || []).map(normalizeGuildInfo);
      setGuilds(list);
      return list;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to load Discord servers');
      setError(msg);
      console.error('[useGuilds] Fetch error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || options.autoFetch === false) {
      return;
    }

    let isMounted = true;
    guildService.getGuilds()
      .then((data) => {
        if (isMounted) {
          const list = (data || []).map(normalizeGuildInfo);
          setGuilds(list);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = extractErrorMessage(err, 'Failed to load Discord servers');
          setError(msg);
          setLoading(false);
          console.error('[useGuilds] Auto-fetch error:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [status, options.autoFetch]);

  const effectiveLoading = status === 'loading' || (status === 'authenticated' && loading);
  const effectiveGuilds = useMemo(
    () => (status === 'authenticated' ? guilds : []),
    [status, guilds]
  );

  const activeGuilds = useMemo(
    () => effectiveGuilds.filter((g) => g.hasBot),
    [effectiveGuilds]
  );

  return {
    guilds: effectiveGuilds,
    activeGuilds,
    setGuilds,
    loading: effectiveLoading,
    error,
    fetchGuilds,
    session,
    status,
  };
}

export default useGuilds;
