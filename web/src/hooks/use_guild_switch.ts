import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { GuildInfo } from '@/types/guild';
import guildService from '@/services/guild_service';
import { useDropdown } from '@/hooks/use_dropdown';

export function useGuildSwitch() {
  const { isOpen, setIsOpen, dropdownRef, closeDropdown } = useDropdown();
  const [guilds, setGuilds] = useState<Array<GuildInfo & { hasBot?: boolean }>>([]);
  const [loading, setLoading] = useState(true);

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
