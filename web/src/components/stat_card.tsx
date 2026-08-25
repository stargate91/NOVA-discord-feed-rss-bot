import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import styles from './stat_card.module.css';
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
  trend?: { value: number; isPositive: boolean; label?: string };
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  valueColor: _valueColor,
  actionButton,
  actionHref,
  compact = false,
  icon: Icon,
  badge,
  trend,
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
          {trend && (
            <span
              className={[
                styles['trend-badge'],
                trend.isPositive ? styles['trend-positive'] : styles['trend-negative']
              ].join(' ')}
            >
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          )}
        </div>

        <div
          className={[
            styles['stat-value'],
            compact && styles.compact,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </div>

        {description && (
          <p className={styles['stat-desc']}>{description}</p>
        )}

        {actionButton && (
          <div className={styles['stat-action']}>
            {actionHref ? (
              <Link href={actionHref} className={styles['action-link']}>
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
