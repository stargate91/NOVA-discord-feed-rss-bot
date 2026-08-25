"use client";

import React from 'react';
import { Menu } from 'lucide-react';
import styles from './dashboard.module.css';
import { IconButton } from '@/components/ui';
import LoginButton from '@/components/login_button';

export interface DashboardHeaderProps {
  session?: any;
  breadcrumbs?: React.ReactNode;
  onOpenMobileMenu?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  session,
  breadcrumbs,
  onOpenMobileMenu,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={[styles['dashboard-header'], className].filter(Boolean).join(' ')}>
      <div className={styles['header-left']}>
        {onOpenMobileMenu && (
          <div className="show-on-mobile">
            <IconButton
              icon={<Menu size={20} />}
              aria-label="Open navigation menu"
              size="sm"
              variant="ghost"
              onClick={onOpenMobileMenu}
            />
          </div>
        )}

        {breadcrumbs && <div>{breadcrumbs}</div>}
      </div>

      <div className={styles['header-right']}>
        {actions && <div>{actions}</div>}
        <LoginButton session={session} />
      </div>
    </header>
  );
}
