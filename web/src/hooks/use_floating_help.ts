import React, { useState, useRef, useCallback } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { getGuildDashboardRoute } from '@/utils/navigation';
import { useClickOutside } from './use_click_outside';

export function useFloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const params = useParams();
  const guildId = (params?.guildId as string) || '';

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const isHidden = !guildId && pathname === '/premium';

  const toggleMenu = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const guideHref = guildId ? getGuildDashboardRoute(guildId, 'guide') : '/premium';
  const faqHref = guildId ? getGuildDashboardRoute(guildId, 'faq') : '/premium';
  const supportDiscordUrl = 'https://discord.gg/PbvX3S7pXR';

  return {
    isOpen,
    setIsOpen,
    menuRef,
    isHidden,
    toggleMenu,
    closeMenu,
    guideHref,
    faqHref,
    supportDiscordUrl,
  };
}
