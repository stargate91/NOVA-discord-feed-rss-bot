import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { GuildInfo } from '@/types/guild';
import guildService from '@/services/guild_service';

export function useGuildSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const currentGuildId = (params?.guildId as string) || '';

  useEffect(() => {
    let ignore = false;
    async function fetchGuilds() {
      try {
        const data = await guildService.getGuilds();
        if (!ignore) {
          setGuilds(data);
        }
      } catch (err) {
        console.error('Failed to fetch guilds for switcher:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchGuilds();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentGuild = useMemo(
    () => guilds.find((g) => g.id === currentGuildId),
    [guilds, currentGuildId]
  );

  const activeGuilds = useMemo(
    () => guilds.filter((g) => g.hasBot || g.bot_in_guild),
    [guilds]
  );

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id === 'global') {
      router.push('/servers');
      return;
    }

    if (pathname && currentGuildId) {
      const subpath = pathname.replace(`/dashboard/${currentGuildId}`, '');
      if (subpath && !subpath.startsWith('?')) {
        router.push(`/dashboard/${id}${subpath}`);
        return;
      }
    }

    router.push(`/dashboard/${id}`);
  };

  return {
    isOpen,
    setIsOpen,
    dropdownRef,
    currentGuildId,
    currentGuild,
    activeGuilds,
    loading,
    handleSelect,
  };
}
