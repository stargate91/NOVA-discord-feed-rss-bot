import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './Skeleton.module.css';

interface CardSkeletonProps {
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  hasAvatar = true,
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`${styles.cardSkeleton} ${className}`} aria-hidden="true">
      <div className={styles.cardHeader}>
        {hasAvatar && <Skeleton variant="circular" avatarSize="md" />}
        <div className={styles.cardHeaderContent}>
          <Skeleton variant="text" width="half" height="sm" />
          <Skeleton variant="text" width="third" height="xs" />
        </div>
      </div>

      <Skeleton lines={lines} height="xs" />
    </div>
  );
};
