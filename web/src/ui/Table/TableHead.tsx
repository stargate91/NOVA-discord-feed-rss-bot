import type { MouseEvent } from 'react';
import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { TableHeadProps } from './types';
import styles from './Table.module.css';

export const TableHead: React.FC<TableHeadProps> = ({
  sortable = false,
  sortDirection = 'none',
  onSort,
  align = 'left',
  checkbox = false,
  children,
  className = '',
  onClick,
  ...rest
}) => {
  const alignClass =
    {
      left: styles.alignLeft,
      center: styles.alignCenter,
      right: styles.alignRight,
    }[align] || styles.alignLeft;

  const handleClick = (e: MouseEvent<HTMLTableCellElement>) => {
    onClick?.(e);
    if (sortable) {
      onSort?.();
    }
  };

  const renderSortIcon = () => {
    if (!sortable) return null;
    if (sortDirection === 'asc') {
      return <ArrowUp size={13} className={`${styles.sortIcon} ${styles.sortActive}`} />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown size={13} className={`${styles.sortIcon} ${styles.sortActive}`} />;
    }
    return <ArrowUpDown size={13} className={styles.sortIcon} />;
  };

  const classes = [
    styles.th,
    alignClass,
    checkbox ? styles.checkboxCell : '',
    sortable ? styles.sortable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <th
      className={classes}
      onClick={handleClick}
      aria-sort={
        sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined
      }
      {...rest}
    >
      <div className={styles.thContent}>
        <span>{children}</span>
        {renderSortIcon()}
      </div>
    </th>
  );
};
