import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fill' | 'auto-fit';
export type GridMinItemWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridGap =
  'none' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  columns?: GridColumns;
  minItemWidth?: GridMinItemWidth;
  gap?: GridGap;
  rowGap?: GridGap;
  columnGap?: GridGap;
  align?: GridAlign;
  justify?: GridJustify;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
  colStart?: 1 | 2 | 3 | 4 | 5 | 6;
  rowSpan?: 1 | 2 | 3 | 4;
  children?: ReactNode;
  className?: string;
  id?: string;
}
