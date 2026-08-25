"use client";

import React from 'react';
import { X } from 'lucide-react';
import styles from './chip.module.css';

export type ChipSize = 'sm' | 'md';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ChipSize;
  selected?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export function Chip({
  children,
  size = 'md',
  selected = false,
  clickable = false,
  disabled = false,
  icon,
  onRemove,
  onClick,
  className,
  ...props
}: ChipProps) {
  const sizeClass = styles[`size-${size}`] || styles['size-md'];

  const content = (
    <>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          aria-label="Remove chip"
          className={styles['remove-button']}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={12} />
        </button>
      )}
    </>
  );

  const classes = [
    styles.chip,
    sizeClass,
    (clickable || onClick) && styles.clickable,
    selected && styles.selected,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (clickable || onClick) {
    return (
      <button
        type="button"
        disabled={disabled}
        className={classes}
        onClick={onClick as any}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={classes} {...props}>
      {content}
    </div>
  );
}
