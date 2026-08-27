import type { ReactNode } from 'react';
import React from 'react';
import styles from './Badge.module.css';

export type BadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
export type BadgeStyleVariant = 'solid' | 'subtle' | 'outline';

export interface BadgeProps {
  variant?: 'online' | 'offline' | 'tier' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  styleVariant?: BadgeStyleVariant;
  placement?: BadgePlacement;
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
  styleVariant = 'subtle',
  placement = 'inline',
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

  const placementClass = placement !== 'inline' ? {
    'top-right': `${styles.placed} ${styles.topRight}`,
    'top-left': `${styles.placed} ${styles.topLeft}`,
    'bottom-right': `${styles.placed} ${styles.bottomRight}`,
    'bottom-left': `${styles.placed} ${styles.bottomLeft}`,
  }[placement] : '';

  const styleClass = styleVariant === 'solid' ? styles.styleSolid : '';

  const classes = [
    styles.badge,
    styles[variant],
    styleClass,
    sizeClass,
    placementClass,
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

