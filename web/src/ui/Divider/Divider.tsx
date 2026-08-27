import type { HTMLAttributes, ReactNode } from 'react';
import React from 'react';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'subtle' | 'card' | 'gradient' | 'dashed';
export type DividerSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: DividerSpacing;
  label?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'subtle',
  spacing = 'md',
  label,
  text,
  children,
  className = '',
  id,
  ...rest
}) => {
  const content = children ?? label ?? text;

  const spacingMap: Record<DividerSpacing, string> = {
    none: styles.spacingNone,
    xs: styles.spacingXs,
    sm: styles.spacingSm,
    md: styles.spacingMd,
    lg: styles.spacingLg,
    xl: styles.spacingXl,
  };

  const isVertical = orientation === 'vertical';

  if (content && !isVertical) {
    const withLabelClasses = [
      styles.withLabel,
      spacingMap[spacing],
      styles[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div id={id} className={withLabelClasses} role="separator" aria-orientation="horizontal" {...rest}>
        <span className={styles.label}>{content}</span>
      </div>
    );
  }

  const classes = [
    isVertical ? styles.vertical : styles.horizontal,
    styles[variant],
    spacingMap[spacing],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={id}
      className={classes}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    />
  );
};
