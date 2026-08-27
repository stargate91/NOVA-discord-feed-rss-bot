import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Inline.module.css';

export type InlineGap = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type InlineAlign = 'start' | 'center' | 'end' | 'baseline';
export type InlineJustify = 'start' | 'center' | 'end' | 'between';

export interface InlineProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  gap?: InlineGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  nowrap?: boolean;
  wrap?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Inline: React.FC<InlineProps> = ({
  as: Component = 'div',
  gap = 'sm',
  align = 'center',
  justify,
  nowrap = false,
  wrap,
  fullWidth = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const gapMap: Record<InlineGap, string> = {
    '3xs': styles.gap3xs,
    '2xs': styles.gap2xs,
    xs: styles.gapXs,
    sm: styles.gapSm,
    md: styles.gapMd,
    lg: styles.gapLg,
    xl: styles.gapXl,
    '2xl': styles.gap2xl,
  };

  const alignMap: Record<InlineAlign, string> = {
    start: styles.alignStart,
    center: styles.alignCenter,
    end: styles.alignEnd,
    baseline: styles.alignBaseline,
  };

  const justifyMap: Record<InlineJustify, string> = {
    start: styles.justifyStart,
    center: styles.justifyCenter,
    end: styles.justifyEnd,
    between: styles.justifyBetween,
  };

  const isNoWrap = wrap !== undefined ? !wrap : nowrap;

  const classes = [
    styles.inline,
    gapMap[gap],
    alignMap[align],
    justify ? justifyMap[justify] : '',
    isNoWrap ? styles.nowrap : '',
    fullWidth ? styles.fullWidth : '',
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

