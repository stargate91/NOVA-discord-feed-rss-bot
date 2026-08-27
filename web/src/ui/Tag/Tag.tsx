import type { ReactNode, MouseEvent } from 'react';
import React, { memo } from 'react';
import { X } from 'lucide-react';
import styles from './Tag.module.css';

export type TagVariant = 'default' | 'subtle' | 'outline' | 'filled';
export type TagColor = 'blue' | 'green' | 'amber' | 'red' | 'purple';
export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps {
  children?: ReactNode;
  label?: ReactNode;
  icon?: ReactNode;
  variant?: TagVariant;
  color?: TagColor;
  size?: TagSize;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onRemove?: (event: MouseEvent<HTMLElement>) => void;
  onDelete?: (event: MouseEvent<HTMLElement>) => void;
  removeAriaLabel?: string;
  className?: string;
  id?: string;
  title?: string;
}

const TagComponent: React.FC<TagProps> = ({
  children,
  label,
  icon,
  variant = 'default',
  color,
  size = 'md',
  selected = false,
  disabled = false,
  onClick,
  onRemove,
  onDelete,
  removeAriaLabel = 'Remove tag',
  className = '',
  id,
  title,
}) => {
  const content = children ?? label;
  const isInteractive = Boolean(onClick);
  const handleRemove = onRemove ?? onDelete;

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      default: styles.variantDefault,
      subtle: styles.variantSubtle,
      outline: styles.variantOutline,
      filled: styles.variantFilled,
    }[variant] || styles.variantDefault;

  const colorClass = color ? styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`] : '';

  const tagClasses = [
    styles.tag,
    sizeClass,
    variantClass,
    colorClass,
    selected ? styles.selected : '',
    disabled ? styles.disabled : '',
    isInteractive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemoveClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!disabled && handleRemove) {
      handleRemove(e);
    }
  };

  const removeIconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  const inner = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{content}</span>
      {handleRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemoveClick}
          aria-label={removeAriaLabel}
          disabled={disabled}
          tabIndex={-1}
        >
          <X size={removeIconSize} />
        </button>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        id={id}
        title={title}
        className={tagClasses}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected ? 'true' : undefined}
      >
        {inner}
      </button>
    );
  }

  return (
    <span id={id} title={title} className={tagClasses}>
      {inner}
    </span>
  );
};

export const Tag = memo(TagComponent);
