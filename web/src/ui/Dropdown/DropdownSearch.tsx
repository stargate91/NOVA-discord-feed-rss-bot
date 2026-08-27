import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { DropdownSearchProps } from './types';
import styles from './Dropdown.module.css';

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
