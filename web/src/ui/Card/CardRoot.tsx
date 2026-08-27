import React from 'react';
import { Spinner } from '@/ui/Spinner/Spinner';
import type { CardProps } from './types';
import styles from './Card.module.css';

export const CardRoot: React.FC<CardProps> = ({
  as: Component = 'div',
  title,
  subtitle,
  description,
  action,
  interactive = false,
  variant = 'default',
  borderAccent = 'none',
  headerDivided = false,
  footerDivided: _footerDivided = false,
  glow = 'none',
  padding = 'lg',
  loading = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const padClass =
    {
      none: styles.padNone,
      sm: styles.padSm,
      md: styles.padMd,
      lg: styles.padLg,
      xl: styles.padXl,
    }[padding] || styles.padLg;

  const glowClass =
    {
      none: '',
      blue: styles.glowBlue,
      purple: styles.glowPurple,
      green: styles.glowGreen,
      danger: styles.glowDanger,
    }[glow] || '';

  const variantClass =
    {
      default: '',
      surface: styles.variantSurface,
      glass: styles.variantGlass,
      elevated: styles.variantElevated,
      ghost: styles.variantGhost,
      'gradient-border': styles.variantGradientBorder,
    }[variant] || '';

  const accentClass =
    {
      none: '',
      left: styles.accentLeft,
      top: styles.accentTop,
    }[borderAccent] || '';

  const classes = [
    styles.card,
    padClass,
    glowClass,
    variantClass,
    accentClass,
    interactive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const descText = description ?? subtitle;
  const hasMonolithicHeader = Boolean(title || descText || action);

  return (
    <Component id={id} className={classes} {...rest}>
      {loading && <Spinner overlay />}

      {hasMonolithicHeader && (
        <div className={`${styles.header} ${headerDivided ? styles.headerDivided : ''}`}>
          <div className={styles.titleGroup}>
            {title &&
              (typeof title === 'string' ? <h3 className={styles.title}>{title}</h3> : title)}
            {descText &&
              (typeof descText === 'string' ? (
                <p className={styles.description}>{descText}</p>
              ) : (
                descText
              ))}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}

      {hasMonolithicHeader ? <div className={styles.body}>{children}</div> : children}
    </Component>
  );
};
