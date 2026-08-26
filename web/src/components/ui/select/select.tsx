"use client";

import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useDropdown } from '@/hooks/use_dropdown';
import { SelectOption } from '@/types/ui';
import styles from './select.module.css';

export type { SelectOption };

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Select<T = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option...',
  disabled = false,
  className,
  id,
}: SelectProps<T>) {
  const { isOpen, setIsOpen, closeDropdown, toggleDropdown, dropdownRef } = useDropdown<HTMLDivElement>();

  const selectedOption = options.find(
    (opt) => (opt.value !== undefined ? opt.value : opt.id) === value
  );

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    const selectedVal = option.value !== undefined ? option.value : (option.id as unknown as T);
    onChange(selectedVal);
    closeDropdown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) toggleDropdown();
    }
  };


  return (
    <div
      ref={dropdownRef}
      className={[styles['select-wrapper'], className].filter(Boolean).join(' ')}
    >
      {label && <span className={styles.label}>{label}</span>}

      <button
        type="button"
        id={id}
        disabled={disabled}
        className={[
          styles.trigger,
          isOpen && styles.open,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles['trigger-content']}>
          {selectedOption?.icon && <span aria-hidden="true">{selectedOption.icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <ChevronDown
          size={16}
          className={[styles.chevron, isOpen && styles.open].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={styles['dropdown-menu']} role="listbox">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={index}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={[
                  styles['dropdown-item'],
                  isSelected && styles.selected,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(option)}
              >
                <span className={styles['trigger-content']}>
                  {option.icon && <span aria-hidden="true">{option.icon}</span>}
                  <span>{option.label}</span>
                </span>
                {isSelected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
