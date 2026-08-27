import type { ButtonHTMLAttributes, ReactNode } from 'react';
import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glass';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonShape = 'circle' | 'rounded' | 'square';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  loading?: boolean;
  active?: boolean;
  badge?: boolean | number;
  tooltip?: string;
  className?: string;
  id?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  shape = 'rounded',
  loading = false,
  active = false,
  badge,
  tooltip,
  disabled,
  className = '',
  id,
  title,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const sizeClass = {
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] || styles.sizeMd;

  const shapeClass = {
    circle: styles.shapeCircle,
    rounded: styles.shapeRounded,
    square: styles.shapeSquare,
  }[shape] || styles.shapeRounded;

  const variantClass = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    ghost: styles.variantGhost,
    outline: styles.variantOutline,
    danger: styles.variantDanger,
    glass: styles.variantGlass,
  }[variant] || styles.variantGhost;

  const classes = [
    styles.btn,
    sizeClass,
    shapeClass,
    variantClass,
    active ? styles.active : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 22,
  }[size] || 18;

  const renderBadge = () => {
    if (badge === true) {
      return <span className={styles.badgeDot} aria-hidden="true" />;
    }
    if (typeof badge === 'number') {
      return <span className={styles.badgeCount} aria-hidden="true">{badge > 99 ? '99+' : badge}</span>;
    }
    return null;
  };

  return (
    <button
      type="button"
      id={id}
      title={tooltip || title || ariaLabel}
      aria-label={ariaLabel}
      aria-pressed={active ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      className={classes}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner}>
          <Loader2 size={spinnerSize} />
        </span>
      ) : (
        icon
      )}
      {renderBadge()}
    </button>
  );
};
