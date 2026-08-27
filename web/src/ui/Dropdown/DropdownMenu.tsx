import React from 'react';
import type { DropdownMenuProps } from './types';
import { useDropdown } from './context';
import styles from './Dropdown.module.css';

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  scrollable = false,
  className = '',
  ...rest
}) => {
  const { isOpen, align, placement } = useDropdown();

  if (!isOpen) return null;

  const alignClass = align === 'end' ? styles.alignEnd : styles.alignStart;
  const placementClass = placement === 'top' ? styles.placementTop : styles.placementBottom;
  const scrollClass = scrollable ? styles.scrollable : '';

  return (
    <div
      role="menu"
      className={`${styles.menu} ${alignClass} ${placementClass} ${scrollClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
