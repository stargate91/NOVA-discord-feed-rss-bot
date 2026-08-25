import React from 'react';
import styles from './public.module.css';
import { MarketingHeader } from './marketing_header';
import { MarketingFooter } from './marketing_footer';

export interface PublicLayoutProps {
  children: React.ReactNode;
  session?: any;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function PublicLayout({
  children,
  session,
  showHeader = true,
  showFooter = true,
  className,
}: PublicLayoutProps) {
  return (
    <div className={[styles['public-root'], className].filter(Boolean).join(' ')}>
      {showHeader && <MarketingHeader session={session} />}
      <main className={styles['public-main']}>{children}</main>
      {showFooter && <MarketingFooter />}
    </div>
  );
}
