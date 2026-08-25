import React from 'react';
import styles from './table.module.css';

export type TableSize = 'sm' | 'md' | 'lg';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: TableSize;
  striped?: boolean;
  wrapperClassName?: string;
}

export function Table({
  children,
  size = 'md',
  striped = false,
  wrapperClassName,
  className,
  ...props
}: TableProps) {
  const sizeClass = styles[`size-${size}`] || styles['size-md'];
  const stripedClass = striped ? styles.striped : '';

  return (
    <div className={[styles['table-wrapper'], wrapperClassName].filter(Boolean).join(' ')}>
      <table
        className={[
          styles.table,
          sizeClass,
          stripedClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={[styles['table-header'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot className={className} {...props}>
      {children}
    </tfoot>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export function TableRow({
  children,
  hoverable = true,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={[
        styles['table-row'],
        hoverable && styles.hoverable,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={[styles['table-head'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={[styles['table-cell'], className].filter(Boolean).join(' ')} {...props}>
      {children}
    </td>
  );
}
