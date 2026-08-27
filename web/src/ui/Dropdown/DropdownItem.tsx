import type { MouseEvent } from 'react';
import React from 'react';
import type { DropdownItemProps } from './types';
import { useDropdown } from './context';
import styles from './Dropdown.module.css';

export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  danger = false,
  disabled = false,
  shortcut,
  closeOnClick = true,
  onClick,
  children,
  className = '',
  ...rest
}) => {
  const { close } = useDropdown();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    if (closeOnClick) {
      close();
    }
  };

  const classes = [
    styles.item,
    danger ? styles.itemDanger : '',
    disabled ? styles.itemDisabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={classes}
      onClick={handleClick}
      {...rest}
    >
      <span className={styles.itemContent}>
        {icon && <span className={styles.itemIcon}>{icon}</span>}
        <span>{children}</span>
      </span>

      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </button>
  );
};
