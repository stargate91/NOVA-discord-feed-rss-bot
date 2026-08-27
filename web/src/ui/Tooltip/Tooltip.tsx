import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import React, { useState, useRef, useEffect, useId } from 'react';
import styles from './Tooltip.module.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'dark' | 'glass' | 'brand';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  arrow?: boolean;
  delay?: number;
  disabled?: boolean;
  children: ReactElement;
  className?: string;
  id?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  variant = 'dark',
  arrow = true,
  delay = 150,
  disabled = false,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const autoId = useId();
  const tooltipId = id || autoId;

  const showTooltip = () => {
    if (disabled || !content) return;
    if (delay > 0) {
      timerRef.current = window.setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const posClass = {
    top: styles.posTop,
    bottom: styles.posBottom,
    left: styles.posLeft,
    right: styles.posRight,
  }[position] || styles.posTop;

  const variantClass = {
    dark: styles.variantDark,
    glass: styles.variantGlass,
    brand: styles.variantBrand,
  }[variant] || styles.variantDark;

  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      showTooltip();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hideTooltip();
    },
    'aria-describedby': visible && !disabled ? tooltipId : undefined,
  });

  return (
    <span className={styles.wrapper}>
      {trigger}

      {visible && !disabled && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`${styles.tooltip} ${posClass} ${variantClass} ${className}`}
          {...rest}
        >
          {content}
          {arrow && <span className={styles.arrow} aria-hidden="true" />}
        </span>
      )}
    </span>
  );
};
