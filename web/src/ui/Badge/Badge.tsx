import type { ReactNode } from 'react';
import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant?: 'online' | 'offline' | 'tier' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  pill?: boolean;
  icon?: ReactNode;
  count?: number | string;
  overflowCount?: number;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  pill = false,
  icon,
  count,
  overflowCount = 99,
  children,
  className = '',
  id,
}) => {
  const sizeClass = {
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    md: styles.sizeMd,
  }[size] || styles.sizeMd;

  const classes = [
    styles.badge,
    styles[variant],
    sizeClass,
    pill ? styles.pill : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderContent = () => {
    if (count !== undefined) {
      if (typeof count === 'number' && count > overflowCount) {
        return `${overflowCount}+`;
      }
      return count;
    }
    return children;
  };

  return (
    <span id={id} className={classes}>
      {dot && <span className={`${styles.dot} ${pulse ? styles.pulse : ''}`} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {(children !== undefined || count !== undefined) && <span>{renderContent()}</span>}
    </span>
  );
};
