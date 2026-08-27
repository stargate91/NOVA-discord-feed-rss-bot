import type { MouseEvent, KeyboardEvent } from 'react';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { SelectOption, SelectProps, SelectStatus } from './types';
import { SelectTrigger } from './SelectTrigger';
import { SelectSearch } from './SelectSearch';
import { SelectListbox } from './SelectListbox';
import styles from './Select.module.css';

export type * from './types';

export const Select: React.FC<SelectProps> = ({
  name,
  value: controlledValue,
  defaultValue = '',
  options,
  onChange,
  onValueChange,
  placeholder = 'Select an option...',
  label,
  error,
  status = 'default',
  leftIcon,
  size = 'md',
  variant = 'default',
  disabled = false,
  clearable = false,
  searchable = false,
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options available',
  children,
  className = '',
  id,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  // Normalize options from prop or children
  const parsedOptions: SelectOption[] = useMemo(() => {
    if (options && options.length > 0) return options;
    const opts: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props) {
        opts.push({
          value: String((child.props as { value?: unknown }).value ?? ''),
          label: String(
            (child.props as { children?: unknown; value?: unknown }).children ??
              (child.props as { value?: unknown }).value ??
              ''
          ),
          disabled: Boolean((child.props as { disabled?: boolean }).disabled),
        });
      }
    });
    return opts;
  }, [options, children]);

  // Selected Option Object
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => opt.value === currentValue);
  }, [parsedOptions, currentValue]);

  // Filtered Options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return parsedOptions;
    const query = searchQuery.toLowerCase();
    return parsedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query))
    );
  }, [parsedOptions, searchQuery]);

  const selectId =
    id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlight index when filtered options change
  useEffect(() => {
    setHighlightedIndex(filteredOptions.findIndex((opt) => opt.value === currentValue));
  }, [filteredOptions, currentValue]);

  const handleSelect = useCallback(
    (optValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(optValue);
      }
      onValueChange?.(optValue);
      onChange?.({
        target: {
          value: optValue,
          name,
        },
      });
      setIsOpen(false);
      setSearchQuery('');
    },
    [isControlled, onChange, onValueChange, name]
  );

  const handleClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      handleSelect('');
    },
    [handleSelect]
  );

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev + 1;
          return next >= filteredOptions.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? filteredOptions.length - 1 : next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const opt = filteredOptions[highlightedIndex];
          if (!opt.disabled) {
            handleSelect(opt.value);
          }
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  const sizeClass =
    {
      sm: styles.sizeSm,
      md: styles.sizeMd,
      lg: styles.sizeLg,
    }[size] || styles.sizeMd;

  const variantClass =
    {
      default: styles.variantDefault,
      filled: styles.variantFilled,
      glass: styles.variantGlass,
    }[variant] || styles.variantDefault;

  const effectiveStatus: SelectStatus = error ? 'error' : status;

  const statusClass =
    {
      default: '',
      error: styles.hasError,
      warning: styles.hasWarning,
      success: styles.hasSuccess,
    }[effectiveStatus] || '';

  const chevronSize =
    {
      sm: 14,
      md: 16,
      lg: 18,
    }[size] || 16;

  const wrapperClasses = [
    styles.wrapper,
    sizeClass,
    variantClass,
    statusClass,
    isOpen ? styles.wrapperOpen : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  const listboxId = selectId ? `${selectId}-listbox` : 'select-listbox';

  return (
    <div ref={containerRef} id={selectId} className={`${styles.selectGroup} ${className}`}>
      {label && (
        <label htmlFor={selectId ? `${selectId}-trigger` : undefined} className={styles.label}>
          {label}
        </label>
      )}

      <div className={wrapperClasses}>
        <SelectTrigger
          selectId={selectId}
          listboxId={listboxId}
          isOpen={isOpen}
          disabled={disabled}
          clearable={clearable}
          currentValue={currentValue}
          selectedOption={selectedOption}
          placeholder={placeholder}
          leftIcon={leftIcon}
          chevronSize={chevronSize}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          onClear={handleClear}
        />

        {isOpen && (
          <SelectListbox
            listRef={listRef}
            listboxId={listboxId}
            filteredOptions={filteredOptions}
            currentValue={currentValue}
            highlightedIndex={highlightedIndex}
            emptyMessage={emptyMessage}
            onSelect={handleSelect}
          >
            {searchable && (
              <SelectSearch
                searchInputRef={searchInputRef}
                searchQuery={searchQuery}
                searchPlaceholder={searchPlaceholder}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            )}
          </SelectListbox>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};
