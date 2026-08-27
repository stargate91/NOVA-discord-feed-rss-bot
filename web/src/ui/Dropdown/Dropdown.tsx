import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, MouseEvent } from 'react';
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import styles from './Dropdown.module.css';

interface DropdownContextValue {
  isOpen: boolean;
  align: 'start' | 'end';
  placement: 'bottom' | 'top';
  close: () => void;
  toggle: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown subcomponents must be used within a <Dropdown>');
  }
  return context;
};

/* --------------------------------------------------------------------------
   Root Dropdown Component
   -------------------------------------------------------------------------- */
export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
  placement?: 'bottom' | 'top';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

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

/* --------------------------------------------------------------------------
   Dropdown.Trigger
   -------------------------------------------------------------------------- */
export interface DropdownTriggerProps {
  children: React.ReactElement;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ children }) => {
  const { isOpen, toggle } = useDropdown();

  return React.cloneElement(children, {
    onClick: (e: MouseEvent) => {
      children.props.onClick?.(e);
      toggle();
    },
    'aria-expanded': isOpen ? 'true' : 'false',
    'aria-haspopup': 'true',
  });
};

/* --------------------------------------------------------------------------
   Dropdown.Menu
   -------------------------------------------------------------------------- */
export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

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

/* --------------------------------------------------------------------------
   Dropdown.Search
   -------------------------------------------------------------------------- */
export interface DropdownSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: string;
  defaultValue?: string;
  onClear?: () => void;
  clearable?: boolean;
  className?: string;
}

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  placeholder = 'Search...',
  value,
  defaultValue = '',
  onChange,
  onClear,
  clearable = true,
  autoFocus = true,
  className = '',
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onClear?.();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <Search size={14} className={styles.searchIcon} aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        className={styles.searchInput}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        {...rest}
      />
      {clearable && Boolean(currentValue) && (
        <button
          type="button"
          aria-label="Clear search"
          className={styles.searchClear}
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Dropdown.Item
   -------------------------------------------------------------------------- */
export interface DropdownItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  shortcut?: string;
  closeOnClick?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
}

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

/* --------------------------------------------------------------------------
   Dropdown.Header, Dropdown.Divider, Dropdown.Empty
   -------------------------------------------------------------------------- */
export interface DropdownHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.header} ${className}`} {...rest}>
    {children}
  </div>
);

export const DropdownDivider: React.FC<HTMLAttributes<HTMLHRElement>> = ({
  className = '',
  ...rest
}) => <hr className={`${styles.divider} ${className}`} {...rest} />;

export interface DropdownEmptyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const DropdownEmpty: React.FC<DropdownEmptyProps> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`${styles.empty} ${className}`} {...rest}>
    {children}
  </div>
);

/* --------------------------------------------------------------------------
   Compound Export
   -------------------------------------------------------------------------- */
interface DropdownCompound extends React.FC<DropdownProps> {
  Trigger: typeof DropdownTrigger;
  Menu: typeof DropdownMenu;
  Search: typeof DropdownSearch;
  Item: typeof DropdownItem;
  Header: typeof DropdownHeader;
  Divider: typeof DropdownDivider;
  Empty: typeof DropdownEmpty;
}

export const Dropdown = DropdownRoot as DropdownCompound;
Dropdown.Trigger = DropdownTrigger;
Dropdown.Menu = DropdownMenu;
Dropdown.Search = DropdownSearch;
Dropdown.Item = DropdownItem;
Dropdown.Header = DropdownHeader;
Dropdown.Divider = DropdownDivider;
Dropdown.Empty = DropdownEmpty;
