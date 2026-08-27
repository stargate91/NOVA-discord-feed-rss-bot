import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode, MouseEvent } from 'react';
import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './Table.module.css';

export type TableVariant = 'default' | 'striped' | 'bordered' | 'glass';
export type TableDensity = 'compact' | 'normal' | 'spacious';
export type TableAlign = 'left' | 'center' | 'right';
export type TableSortDirection = 'asc' | 'desc' | 'none';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  density?: TableDensity;
  hoverable?: boolean;
  stickyHeader?: boolean;
  containerClassName?: string;
  children?: ReactNode;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode;
  className?: string;
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: TableSortDirection;
  onSort?: () => void;
  align?: TableAlign;
  children?: ReactNode;
  className?: string;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
  children?: ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '', ...rest }) => (
  <thead className={`${styles.thead} ${className}`} {...rest}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '', ...rest }) => (
  <tbody className={`${styles.tbody} ${className}`} {...rest}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', ...rest }) => (
  <tr className={`${styles.tr} ${className}`} {...rest}>
    {children}
  </tr>
);

export const TableHead: React.FC<TableHeadProps> = ({
  sortable = false,
  sortDirection = 'none',
  onSort,
  align = 'left',
  children,
  className = '',
  onClick,
  ...rest
}) => {
  const alignClass = {
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
    sortable ? styles.sortable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <th
      className={classes}
      onClick={handleClick}
      aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}
      {...rest}
    >
      <div className={styles.thContent}>
        <span>{children}</span>
        {renderSortIcon()}
      </div>
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({
  align = 'left',
  children,
  className = '',
  ...rest
}) => {
  const alignClass = {
    left: styles.alignLeft,
    center: styles.alignCenter,
    right: styles.alignRight,
  }[align] || styles.alignLeft;

  return (
    <td className={`${styles.td} ${alignClass} ${className}`} {...rest}>
      {children}
    </td>
  );
};

interface TableCompound extends React.FC<TableProps> {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Head: typeof TableHead;
  Cell: typeof TableCell;
}

export const Table = (({
  variant = 'default',
  density = 'normal',
  hoverable = true,
  stickyHeader = false,
  containerClassName = '',
  className = '',
  children,
  ...rest
}) => {
  const densityClass = {
    compact: styles.compact,
    normal: styles.normal,
    spacious: styles.spacious,
  }[density] || styles.normal;

  const variantClass = {
    default: '',
    striped: styles.striped,
    bordered: styles.bordered,
    glass: styles.glass,
  }[variant] || '';

  const tableClasses = [
    styles.table,
    densityClass,
    variantClass,
    hoverable ? styles.hoverable : '',
    stickyHeader ? styles.stickyHeader : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.container} ${variant === 'glass' ? styles.glass : ''} ${containerClassName}`}>
      <table className={tableClasses} {...rest}>
        {children}
      </table>
    </div>
  );
}) as TableCompound;

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
