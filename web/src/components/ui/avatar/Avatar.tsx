"use client";

import React, { useState } from 'react';
import styles from './avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'bot';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  badge?: React.ReactNode;
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  badge,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClass = styles[`size-${size}`] || styles['size-md'];
  const shapeClass = styles[`shape-${shape}`] || styles['shape-circle'];
  const statusClass = status ? styles[`status-${status}`] : '';

  const showImage = src && !hasError;

  return (
    <div className={[styles['avatar-wrapper'], className].filter(Boolean).join(' ')} {...props}>
      <div className={[styles.avatar, sizeClass, shapeClass].filter(Boolean).join(' ')}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={styles['avatar-img']}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className={styles['avatar-fallback']}>
            {fallback || (alt ? alt.substring(0, 2).toUpperCase() : '?')}
          </div>
        )}
      </div>

      {status && (
        <span
          className={[styles['status-dot'], statusClass].filter(Boolean).join(' ')}
          aria-label={`Status: ${status}`}
        />
      )}

      {badge && <span className={styles['avatar-badge']}>{badge}</span>}
    </div>
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  children: React.ReactNode;
}

export function AvatarGroup({
  max,
  size = 'md',
  children,
  className,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const sizeClass = styles[`size-${size}`] || styles['size-md'];

  const visibleAvatars = max ? childrenArray.slice(0, max) : childrenArray;
  const excessCount = max && childrenArray.length > max ? childrenArray.length - max : 0;

  return (
    <div className={[styles['avatar-group'], className].filter(Boolean).join(' ')} {...props}>
      {visibleAvatars}
      {excessCount > 0 && (
        <div className={[styles['avatar-excess'], sizeClass].filter(Boolean).join(' ')}>
          +{excessCount}
        </div>
      )}
    </div>
  );
}
