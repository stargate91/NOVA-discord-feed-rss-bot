import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  ReactNode,
} from 'react';

export type TableVariant = 'default' | 'striped' | 'bordered' | 'glass';
export type TableDensity = 'compact' | 'normal' | 'spacious';
export type TableAlign = 'left' | 'center' | 'right';
export type TableSortDirection = 'asc' | 'desc' | 'none';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  density?: TableDensity;
  hoverable?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
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
  selected?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: TableSortDirection;
  onSort?: () => void;
  align?: TableAlign;
  checkbox?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableAlign;
  checkbox?: boolean;
  children?: ReactNode;
  className?: string;
}
