import type { HTMLAttributes, ReactNode } from 'react';
import React, { useState, Children, isValidElement } from 'react';
import { User } from 'lucide-react';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'bot';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  fallbackIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  children: ReactNode;
  className?: string;
  id?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  shape = 'circle',
  status,
  fallbackIcon,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClass =
    {
      xs: styles.sizeXs,
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      xl: styles.sizeXl,
      '2xl': styles.size2xl,
    }[size] || styles.sizeMd;

  const shapeClass =
    {
      circle: styles.shapeCircle,
      rounded: styles.shapeRounded,
      square: styles.shapeSquare,
    }[shape] || styles.shapeCircle;

  const statusClass = status
    ? {
        online: styles.statusOnline,
        idle: styles.statusIdle,
        dnd: styles.statusDnd,
        offline: styles.statusOffline,
        bot: styles.statusBot,
      }[status] || ''
    : '';

  const classes = [styles.avatar, sizeClass, shapeClass, className].filter(Boolean).join(' ');

  const iconSize =
    {
      xs: 10,
      sm: 14,
      md: 18,
      lg: 24,
      xl: 32,
      '2xl': 42,
    }[size] || 18;

  const renderContent = () => {
    if (children) {
      return children;
    }

    if (src && !imageError) {
      const dim =
        {
          xs: 20,
          sm: 28,
          md: 36,
          lg: 48,
          xl: 64,
          '2xl': 84,
        }[size] || 36;

      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          width={dim}
          height={dim}
          loading="lazy"
          decoding="async"
          className={styles.image}
          onError={() => setImageError(true)}
        />
      );
    }

    if (name) {
      return <span className={styles.monogram}>{getInitials(name)}</span>;
    }

    return <span className={styles.fallbackIcon}>{fallbackIcon || <User size={iconSize} />}</span>;
  };

  return (
    <div id={id} className={classes} {...rest}>
      {renderContent()}
      {status && (
        <span className={`${styles.status} ${statusClass}`} aria-label={`Status: ${status}`} />
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  size = 'md',
  shape = 'circle',
  children,
  className = '',
  id,
  ...rest
}) => {
  const childArray = Children.toArray(children).filter(isValidElement);
  const total = childArray.length;

  const visibleChildren = max && max > 0 ? childArray.slice(0, max) : childArray;
  const overflowCount = max && total > max ? total - max : 0;

  const sizeClass =
    {
      xs: styles.sizeXs,
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
      xl: styles.sizeXl,
      '2xl': styles.size2xl,
    }[size] || styles.sizeMd;

  const shapeClass =
    {
      circle: styles.shapeCircle,
      rounded: styles.shapeRounded,
      square: styles.shapeSquare,
    }[shape] || styles.shapeCircle;

  return (
    <div id={id} className={`${styles.group} ${className}`} {...rest}>
      {visibleChildren.map((child, index) =>
        React.cloneElement(child as React.ReactElement<AvatarProps>, {
          key: (child as React.ReactElement).key || `avatar-${index}`,
          size,
          shape,
        })
      )}
      {overflowCount > 0 && (
        <div className={`${styles.avatar} ${styles.overflow} ${sizeClass} ${shapeClass}`}>
          +{overflowCount}
        </div>
      )}
    </div>
  );
};
