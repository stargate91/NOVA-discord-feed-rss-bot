"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Bot } from 'lucide-react';
import styles from './public.module.css';
import { Button, IconButton, Drawer, Stack } from '@/components/ui';
import LoginButton from '@/components/login_button';
import { useMarketingHeader } from '@/hooks/use_marketing_header';

export interface MarketingHeaderProps {
  session?: any;
}

export function MarketingHeader({ session }: MarketingHeaderProps) {
  const {
    scrolled,
    mobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    botInviteUrl,
  } = useMarketingHeader();

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
              onClick={openMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        title="NovaFeeds"
        side="right"
      >
        <Stack gap="lg">
          <Link
            href="/dashboard"
            className={styles['nav-link']}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
          <Link
            href="/premium"
            className={styles['nav-link']}
            onClick={closeMobileMenu}
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

