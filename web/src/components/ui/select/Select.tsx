"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './select.module.css';

export interface SelectOption<T = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
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
