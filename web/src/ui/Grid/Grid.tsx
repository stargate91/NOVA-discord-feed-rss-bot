import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Grid.module.css';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fill' | 'auto-fit';
export type GridGap =
  | 'none'
  | '3xs'
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  columns?: GridColumns;
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

export const GridItem: React.FC<GridItemProps> = ({
  as: Component = 'div',
  colSpan,
  colStart,
  rowSpan,
  children,
  className = '',
  id,
  ...rest
}) => {
  const colSpanMap: Record<string, string> = {
    '1': styles.colSpan1,
    '2': styles.colSpan2,
    '3': styles.colSpan3,
    '4': styles.colSpan4,
    '5': styles.colSpan5,
    '6': styles.colSpan6,
    '7': styles.colSpan7,
    '8': styles.colSpan8,
    '9': styles.colSpan9,
    '10': styles.colSpan10,
    '11': styles.colSpan11,
    '12': styles.colSpan12,
    full: styles.colSpanFull,
  };

  const colStartMap: Record<string, string> = {
    '1': styles.colStart1,
    '2': styles.colStart2,
    '3': styles.colStart3,
    '4': styles.colStart4,
    '5': styles.colStart5,
    '6': styles.colStart6,
  };

  const rowSpanMap: Record<string, string> = {
    '1': styles.rowSpan1,
    '2': styles.rowSpan2,
    '3': styles.rowSpan3,
    '4': styles.rowSpan4,
  };

  const classes = [
    styles.item,
    colSpan ? colSpanMap[String(colSpan)] : '',
    colStart ? colStartMap[String(colStart)] : '',
    rowSpan ? rowSpanMap[String(rowSpan)] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component id={id} className={classes} {...rest}>
      {children}
    </Component>
  );
};

export const Grid: React.FC<GridProps> & { Item: typeof GridItem } = ({
  as: Component = 'div',
  columns = 1,
  gap = 'md',
  rowGap,
  columnGap,
  align,
  justify,
  children,
  className = '',
  id,
  ...rest
}) => {
  const colMap: Record<string, string> = {
    '1': styles.cols1,
    '2': styles.cols2,
    '3': styles.cols3,
    '4': styles.cols4,
    '5': styles.cols5,
    '6': styles.cols6,
    '12': styles.cols12,
    'auto-fill': styles.colsAutoFill,
    'auto-fit': styles.colsAutoFit,
  };

  const gapMap: Record<GridGap, string> = {
    none: styles.gapNone,
    '3xs': styles.gap3xs,
    '2xs': styles.gap2xs,
    xs: styles.gapXs,
    sm: styles.gapSm,
    md: styles.gapMd,
    lg: styles.gapLg,
    xl: styles.gapXl,
    '2xl': styles.gap2xl,
    '3xl': styles.gap3xl,
    '4xl': styles.gap4xl,
    '5xl': styles.gap5xl,
  };

  const rowGapMap: Record<GridGap, string> = {
    none: styles.rowGapNone,
    '3xs': styles.rowGap3xs,
    '2xs': styles.rowGap2xs,
    xs: styles.rowGapXs,
    sm: styles.rowGapSm,
    md: styles.rowGapMd,
    lg: styles.rowGapLg,
    xl: styles.rowGapXl,
    '2xl': styles.rowGap2xl,
    '3xl': styles.rowGap3xl,
    '4xl': styles.rowGap3xl,
    '5xl': styles.rowGap3xl,
  };

  const colGapMap: Record<GridGap, string> = {
    none: styles.colGapNone,
    '3xs': styles.colGap3xs,
    '2xs': styles.colGap2xs,
    xs: styles.colGapXs,
    sm: styles.colGapSm,
    md: styles.colGapMd,
    lg: styles.colGapLg,
    xl: styles.colGapXl,
    '2xl': styles.colGap2xl,
    '3xl': styles.colGap3xl,
    '4xl': styles.colGap3xl,
    '5xl': styles.colGap3xl,
  };

  const alignMap: Record<GridAlign, string> = {
    start: styles.alignStart,
    center: styles.alignCenter,
    end: styles.alignEnd,
    stretch: styles.alignStretch,
  };

  const justifyMap: Record<GridJustify, string> = {
    start: styles.justifyStart,
    center: styles.justifyCenter,
    end: styles.justifyEnd,
    between: styles.justifyBetween,
    around: styles.justifyAround,
    evenly: styles.justifyEvenly,
  };

  const classes = [
    styles.grid,
    colMap[String(columns)],
    gapMap[gap],
    rowGap ? rowGapMap[rowGap] : '',
    columnGap ? colGapMap[columnGap] : '',
    align ? alignMap[align] : '',
    justify ? justifyMap[justify] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component id={id} className={classes} {...rest}>
      {children}
    </Component>
  );
};

Grid.Item = GridItem;
