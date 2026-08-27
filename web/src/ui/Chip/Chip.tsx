import type { ReactNode, MouseEvent } from 'react';
import React from 'react';
import { X } from 'lucide-react';
import styles from './Chip.module.css';

export interface ChipProps {
  children?: ReactNode;
  label?: ReactNode;
  name?: string;
  icon?: string | ReactNode;
  variant?: 'default' | 'outline' | 'filled' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onDelete?: (event: MouseEvent<HTMLElement>) => void;
  deleteAriaLabel?: string;
  className?: string;
  id?: string;
  title?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  label,
  name,
  icon,
  variant = 'default',
  size = 'md',
  selected = false,
  active = false,
  disabled = false,
  onClick,
  onDelete,
  deleteAriaLabel = 'Remove item',
  className = '',
  id,
  title,
}) => {
  const content = children ?? label ?? name;
  const isSelected = selected || active;
  const isInteractive = Boolean(onClick);

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      default: styles.variantDefault,
      outline: styles.variantOutline,
      filled: styles.variantFilled,
      subtle: styles.variantSubtle,
    }[variant] || styles.variantDefault;

  const chipClasses = [
    styles.chip,
    sizeClass,
    variantClass,
    isSelected ? styles.selected : '',
    isInteractive ? styles.interactive : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return <img src={icon} alt="" aria-hidden="true" className={styles.icon} />;
    }

    return <span className={styles.iconWrapper}>{icon}</span>;
  };

  const handleDelete = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!disabled && onDelete) {
      onDelete(e);
    }
  };

  const deleteIconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  const innerContent = (
    <>
      {renderIcon()}
      {content && <span className={styles.label}>{content}</span>}
      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label={deleteAriaLabel}
          disabled={disabled}
          tabIndex={-1}
        >
          <X size={deleteIconSize} />
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
        className={chipClasses}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isSelected ? 'true' : undefined}
      >
        {innerContent}
      </button>
    );
  }

  return (
    <div id={id} title={title} className={chipClasses}>
      {innerContent}
    </div>
  );
};
