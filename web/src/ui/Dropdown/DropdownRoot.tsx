import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DropdownProps } from './types';
import { DropdownContext } from './context';
import styles from './Dropdown.module.css';

export const DropdownRoot: React.FC<DropdownProps> = ({
  align = 'start',
  placement = 'bottom',
  open: controlledOpen,
  onOpenChange,
  children,
  className = '',
  id,
  ...rest
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [isOpen, setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider value={{ isOpen, align, placement, close, toggle }}>
      <div id={id} ref={dropdownRef} className={`${styles.dropdown} ${className}`} {...rest}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
