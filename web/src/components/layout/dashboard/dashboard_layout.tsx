"use client";

import React from 'react';
import styles from './dashboard.module.css';
import { DashboardSidebar } from './dashboard_sidebar';
import { DashboardHeader } from './dashboard_header';
import { Drawer, Stack } from '@/components/ui';
import GuildSwitcher from '@/components/guild_switcher';
import NavLinks from '@/components/nav_links';
import LogoutButton from '@/components/logout_button';
import { useDashboardLayout } from '@/hooks/use_dashboard_layout';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  session?: any;
  isMaster?: boolean;
  breadcrumbs?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  session,
  isMaster = false,
  breadcrumbs,
  headerActions,
  className,
}: DashboardLayoutProps) {
  const {
    isClient,
    isCollapsed,
    mobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
    toggleCollapse,
  } = useDashboardLayout();

  return (
    <div className={[styles['dashboard-root'], className].filter(Boolean).join(' ')}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hide-on-mobile">
        <DashboardSidebar
          session={session}
          isMaster={isMaster}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={closeMobileDrawer}
        title="NovaFeeds Dashboard"
        side="left"
      >
        <Stack gap="lg">
          <GuildSwitcher isMaster={isMaster} />
          <nav 
            onClick={closeMobileDrawer}
            onKeyDown={(e) => {
              if (e.key === 'Enter') closeMobileDrawer();
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
          onOpenMobileMenu={openMobileDrawer}
          actions={headerActions}
        />

        <main className={styles['dashboard-content']}>{children}</main>
      </div>
    </div>
  );
}
