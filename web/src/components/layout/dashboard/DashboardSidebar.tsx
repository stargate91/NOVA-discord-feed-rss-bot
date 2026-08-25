"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import styles from './dashboard.module.css';
import { IconButton } from '@/components/ui';
import GuildSwitcher from '@/components/GuildSwitcher';
import NavLinks from '@/components/NavLinks';
import LogoutButton from '@/components/LogoutButton';

export interface DashboardSidebarProps {
  session?: any;
  isMaster?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function DashboardSidebar({
  session,
  isMaster = false,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: DashboardSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={[
        styles['dashboard-sidebar'],
        isCollapsed && styles.collapsed,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-brand-row']}>
          <Link href="/" className={styles['sidebar-brand']}>
            <Image
              src="/nova_v2.jpg"
              alt="NovaFeeds"
              width={32}
              height={32}
              className={styles['sidebar-brand-logo']}
              priority
            />
            {!isCollapsed && (
              <div className={styles['sidebar-brand-text']}>
                <span className={styles['sidebar-brand-title']}>NovaFeeds</span>
                <span className={styles['sidebar-brand-badge']}>DASHBOARD</span>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <IconButton
              icon={isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              size="sm"
              variant="ghost"
              onClick={onToggleCollapse}
            />
          )}
        </div>

        {/* Guild Selector (only rendered if expanded or mounted) */}
        {!isCollapsed && mounted && (
          <div>
            <GuildSwitcher isMaster={isMaster} />
          </div>
        )}
      </div>

      <nav className={styles['sidebar-nav']}>
        <NavLinks session={session} isMaster={isMaster} />
      </nav>

      <div className={styles['sidebar-footer']}>
        <LogoutButton />
      </div>
    </aside>
  );
}
