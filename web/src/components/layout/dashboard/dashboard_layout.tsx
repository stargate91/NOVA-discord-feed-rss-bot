"use client";

import React, { useState, useSyncExternalStore } from 'react';
import styles from './dashboard.module.css';
import { DashboardSidebar } from './dashboard_sidebar';
import { DashboardHeader } from './dashboard_header';
import { Drawer, Stack } from '@/components/ui';
import GuildSwitcher from '@/components/guild_switcher';
import NavLinks from '@/components/nav_links';
import LogoutButton from '@/components/logout_button';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  session?: any;
  isMaster?: boolean;
  breadcrumbs?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

const emptySubscribe = () => () => {};

export function DashboardLayout({
  children,
  session,
  isMaster = false,
  breadcrumbs,
  headerActions,
  className,
}: DashboardLayoutProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nova_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nova_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  return (
    <div className={[styles['dashboard-root'], className].filter(Boolean).join(' ')}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hide-on-mobile">
        <DashboardSidebar
          session={session}
          isMaster={isMaster}
          isCollapsed={isClient ? isCollapsed : false}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="NovaFeeds Dashboard"
        side="left"
      >
        <Stack gap="lg">
          <GuildSwitcher isMaster={isMaster} />
          <nav 
            onClick={() => setMobileDrawerOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setMobileDrawerOpen(false);
            }}
          >
            <NavLinks session={session} isMaster={isMaster} />
          </nav>
          <LogoutButton />
        </Stack>
      </Drawer>

      {/* Main App Content Area */}
      <div
        className={[
          styles['dashboard-main'],
          (isClient && isCollapsed) && styles['sidebar-collapsed'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <DashboardHeader
          session={session}
          breadcrumbs={breadcrumbs}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          actions={headerActions}
        />

        <main className={styles['dashboard-content']}>{children}</main>
      </div>
    </div>
  );
}
