"use client";

import React from 'react';
import Link from 'next/link';
import { Plus, Shield, MessageSquare, Zap, LucideIcon } from 'lucide-react';
import styles from './quick-actions.module.css';
import { Card, CardContent } from '@/components/ui';

interface QuickActionItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
}

function QuickActionItem({ href, icon: Icon, label, description }: QuickActionItemProps) {
  return (
    <Link href={href} className={styles['action-item']}>
      <div className={styles['action-icon']}>
        <Icon size={16} />
      </div>

      <div className={styles['action-text']}>
        <span className={styles['action-title']}>{label}</span>
        {description && (
          <span className={styles['action-desc']}>{description}</span>
        )}
      </div>
    </Link>
  );
}

export interface QuickActionsProps {
  guildId: string;
}

export default function QuickActions({ guildId }: QuickActionsProps) {
  return (
    <Card variant="elevated" className={styles['quick-actions-card']}>
      <CardContent>
        <div className={styles['quick-actions-header']}>
          <span className="text-caption">Quick Actions</span>
          <Zap size={14} className={styles['header-icon']} />
        </div>

        <div className={styles['quick-actions-grid']}>
          <QuickActionItem
            href={`/dashboard/${guildId}/monitors?add=true`}
            icon={Plus}
            label="Add Feed"
            description="Create a new monitor"
          />
          <QuickActionItem
            href={`/dashboard/${guildId}/settings`}
            icon={Shield}
            label="Permissions"
            description="Configure admin roles"
          />
          <QuickActionItem
            href={`/dashboard/${guildId}/settings`}
            icon={MessageSquare}
            label="Templates"
            description="Custom alert messages"
          />
          <QuickActionItem
            href={`/dashboard/${guildId}/monitors?bulk=true`}
            icon={Zap}
            label="Bulk Wizard"
            description="Mass add feeds"
          />
        </div>
      </CardContent>
    </Card>
  );
}
