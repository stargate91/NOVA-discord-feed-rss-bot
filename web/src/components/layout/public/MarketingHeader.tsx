"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ExternalLink, Bot } from 'lucide-react';
import styles from './public.module.css';
import { Button, IconButton, Drawer, Stack } from '@/components/ui';
import LoginButton from '@/components/LoginButton';

export interface MarketingHeaderProps {
  session?: any;
}

export function MarketingHeader({ session }: MarketingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1489908793780338688'}&permissions=3387582172359760&response_type=code&redirect_uri=https%3A%2F%2Fnovafeeds.xyz%2Fapi%2Fauth%2Fcallback%2Fdiscord&integration_type=0&scope=identify+guilds+bot+applications.commands`;

  return (
    <header className={[styles['public-header'], scrolled && styles.scrolled].filter(Boolean).join(' ')}>
      <div className={['ui-container', styles['header-inner']].join(' ')}>
        <Link href="/" className={styles['brand-link']}>
          <Image
            src="/nova_v2.jpg"
            alt="NovaFeeds Logo"
            width={32}
            height={32}
            className={styles['brand-logo']}
            priority
          />
          <span className={styles['brand-name']}>NovaFeeds</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={[styles['nav-menu'], 'hide-on-mobile'].join(' ')}>
          <Link href="/dashboard" className={styles['nav-link']}>
            Dashboard
          </Link>
          <Link href="/premium" className={styles['nav-link']}>
            Premium
          </Link>
          <a
            href="https://discord.gg/PbvX3S7pXR"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['nav-link']}
          >
            Support
          </a>
        </nav>

        {/* Actions */}
        <div className={styles['header-actions']}>
          <a
            href={botInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hide-on-mobile"
          >
            <Button variant="secondary" size="sm" leftIcon={<Bot size={16} />}>
              Invite Bot
            </Button>
          </a>

          <LoginButton session={session} />

          {/* Mobile Menu Trigger */}
          <div className="show-on-mobile">
            <IconButton
              icon={<Menu size={20} />}
              aria-label="Open mobile menu"
              size="sm"
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="NovaFeeds"
        side="right"
      >
        <Stack gap="lg">
          <Link
            href="/dashboard"
            className={styles['nav-link']}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/premium"
            className={styles['nav-link']}
            onClick={() => setMobileMenuOpen(false)}
          >
            Premium Plans
          </Link>
          <a
            href="https://discord.gg/PbvX3S7pXR"
            target="_blank"
            rel="noopener noreferrer"
            className={styles['nav-link']}
          >
            Discord Support
          </a>
          <a
            href={botInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['nav-link']}
          >
            Invite to Server
          </a>
        </Stack>
      </Drawer>
    </header>
  );
}
