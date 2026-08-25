import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBotInviteUrl } from '@/utils';
import styles from './public.module.css';

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();
  const botInviteUrl = getBotInviteUrl();

  return (
    <footer className={styles['public-footer']}>
      <div className="ui-container">
        <div className={styles['footer-grid']}>
          {/* Brand Col */}
          <div className={styles['footer-brand-col']}>
            <Link href="/" className={styles['brand-link']}>
              <Image
                src="/nova_v2.jpg"
                alt="NovaFeeds"
                width={32}
                height={32}
                className={styles['brand-logo']}
              />
              <span className={styles['brand-name']}>NovaFeeds</span>
            </Link>
            <p className={styles['footer-desc']}>
              Real-time Discord automated feed bot for YouTube, Twitch, Kick, Steam, RSS, and more.
            </p>
          </div>

          {/* Product Col */}
          <div className={styles['footer-col']}>
            <span className={styles['footer-heading']}>Product</span>
            <Link href="/dashboard" className={styles['footer-link']}>
              Dashboard
            </Link>
            <Link href="/premium" className={styles['footer-link']}>
              Premium Plans
            </Link>
          </div>

          {/* Resources Col */}
          <div className={styles['footer-col']}>
            <span className={styles['footer-heading']}>Resources</span>
            <a
              href="https://discord.gg/PbvX3S7pXR"
              target="_blank"
              rel="noopener noreferrer"
              className={styles['footer-link']}
            >
              Support Server
            </a>
            <a
              href={botInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles['footer-link']}
            >
              Invite Bot
            </a>
          </div>

          {/* Legal Col */}
          <div className={styles['footer-col']}>
            <span className={styles['footer-heading']}>Legal</span>
            <Link href="/terms" className={styles['footer-link']}>
              Terms of Service
            </Link>
            <Link href="/privacy" className={styles['footer-link']}>
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles['footer-bottom']}>
          <span className={styles['footer-copyright']}>
            © {currentYear} NovaFeeds. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
