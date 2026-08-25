import { useState, useEffect } from 'react';
import { getBotInviteUrl } from '@/utils';

export interface UseMarketingHeaderOptions {
  scrollThreshold?: number;
}

export function useMarketingHeader(options?: UseMarketingHeaderOptions) {
  const scrollThreshold = options?.scrollThreshold ?? 20;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > scrollThreshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const botInviteUrl = getBotInviteUrl();

  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return {
    scrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    botInviteUrl,
  };
}
