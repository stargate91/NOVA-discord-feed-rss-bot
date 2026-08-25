"use client";

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Drawer, Stack } from '@/components/ui';
import GuildSwitcher from '@/components/GuildSwitcher';
import NavLinks from '@/components/NavLinks';
import LogoutButton from '@/components/LogoutButton';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nova_sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nova_sidebar_collapsed', String(next));
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
          isCollapsed={isCollapsed}
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
          <nav onClick={() => setMobileDrawerOpen(false)}>
            <NavLinks session={session} isMaster={isMaster} />
          </nav>
          <LogoutButton />
        </Stack>
      </Drawer>

      {/* Main App Content Area */}
      <div
        className={[
          styles['dashboard-main'],
          isCollapsed && styles['sidebar-collapsed'],
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
