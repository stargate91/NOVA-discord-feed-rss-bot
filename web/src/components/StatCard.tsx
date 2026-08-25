import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import styles from './stat-card.module.css';
import { Card, CardContent, Button } from '@/components/ui';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  valueColor?: string;
  actionButton?: string;
  actionHref?: string;
  compact?: boolean;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  valueColor,
  actionButton,
  actionHref,
  compact = false,
  icon: Icon,
  badge,
  className,
}: StatCardProps) {
  return (
    <Card variant="elevated" className={[styles['stat-card'], className].filter(Boolean).join(' ')}>
      <CardContent>
        <div className={styles['stat-header']}>
          <div className={styles['stat-title-wrapper']}>
            {Icon && (
              <div className={styles['stat-icon']}>
                <Icon size={16} />
              </div>
            )}
            <span className="text-caption">{title}</span>
          </div>
          {badge && <div>{badge}</div>}
        </div>

        <div
          className={[
            styles['stat-value'],
            compact && styles.compact,
          ]
            .filter(Boolean)
            .join(' ')}
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </div>

        {description && (
          <p className={styles['stat-desc']}>{description}</p>
        )}

        {actionButton && (
          <div className={styles['stat-action']}>
            {actionHref ? (
              <Link href={actionHref} style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" fullWidth>
                  {actionButton}
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" size="sm" fullWidth>
                {actionButton}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
