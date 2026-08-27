import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './Skeleton.module.css';

interface TableSkeletonProps {
  rows?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 4, className = '' }) => {
  const rowElements = [];
  for (let i = 0; i < rows; i++) {
    rowElements.push(
      <div key={`table-skeleton-row-${i}`} className={styles.tableRow}>
        <Skeleton variant="circular" avatarSize="sm" />
        <Skeleton variant="text" width="third" height="sm" />
        <Skeleton variant="text" width="half" height="xs" />
        <Skeleton variant="rounded" width="quarter" height="sm" />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      {rowElements}
    </div>
  );
};
