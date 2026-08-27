import type React from 'react';
import { Spinner } from '@/ui/Spinner/Spinner';
import type { TableProps } from './types';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { TableRow } from './TableRow';
import { TableHead } from './TableHead';
import { TableCell } from './TableCell';
import styles from './Table.module.css';

export type * from './types';
export { TableHeader } from './TableHeader';
export { TableBody } from './TableBody';
export { TableRow } from './TableRow';
export { TableHead } from './TableHead';
export { TableCell } from './TableCell';

export interface TableCompound extends React.FC<TableProps> {
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
  loading = false,
  emptyState,
  containerClassName = '',
  className = '',
  children,
  ...rest
}) => {
  const densityClass =
    {
      compact: styles.compact,
      normal: styles.normal,
      spacious: styles.spacious,
    }[density] || styles.normal;

  const variantClass =
    {
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
    <div
      className={`${styles.container} ${styles.loadingContainer} ${variant === 'glass' ? styles.glass : ''} ${containerClassName}`}
    >
      {loading && (
        <div className={styles.loadingOverlay}>
          <Spinner size="md" />
        </div>
      )}
      <table className={tableClasses} {...rest}>
        {children}
      </table>
      {emptyState && !loading && <div className={styles.emptyState}>{emptyState}</div>}
    </div>
  );
}) as TableCompound;

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
