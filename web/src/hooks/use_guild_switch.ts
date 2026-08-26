import { useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useDropdown } from '@/hooks/use_dropdown';
import { useGuilds } from '@/hooks/use_guilds';
import { switchGuildRoute } from '@/utils';

export function useGuildSwitch() {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown();
  const { guilds, activeGuilds, loading } = useGuilds();

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const currentGuildId = (params?.guildId as string) || '';

  const currentGuild = useMemo(
    () => guilds.find((g) => g.id === currentGuildId),
    [guilds, currentGuildId]
  );

  const handleSelect = (id: string) => {
    setIsOpen(false);
    router.push(switchGuildRoute(id, pathname));
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

export default useGuildSwitch;
