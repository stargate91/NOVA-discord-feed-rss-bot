import type { GridAlign, GridGap, GridJustify, GridMinItemWidth } from './types';
import styles from './Grid.module.css';

export const colSpanMap: Record<string, string> = {
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

export const colStartMap: Record<string, string> = {
  '1': styles.colStart1,
  '2': styles.colStart2,
  '3': styles.colStart3,
  '4': styles.colStart4,
  '5': styles.colStart5,
  '6': styles.colStart6,
};

export const rowSpanMap: Record<string, string> = {
  '1': styles.rowSpan1,
  '2': styles.rowSpan2,
  '3': styles.rowSpan3,
  '4': styles.rowSpan4,
};

export const colMap: Record<string, string> = {
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

export const minItemMap: Record<GridMinItemWidth, string> = {
  xs: styles.minItemXs,
  sm: styles.minItemSm,
  md: styles.minItemMd,
  lg: styles.minItemLg,
  xl: styles.minItemXl,
};

export const gapMap: Record<GridGap, string> = {
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

export const rowGapMap: Record<GridGap, string> = {
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

export const colGapMap: Record<GridGap, string> = {
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

export const alignMap: Record<GridAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
};

export const justifyMap: Record<GridJustify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
  around: styles.justifyAround,
  evenly: styles.justifyEvenly,
};
