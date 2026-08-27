import type { ReactNode, KeyboardEvent } from 'react';
import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { SelectOption } from './types';
import styles from './Select.module.css';

interface SelectTriggerProps {
  id?: string;
  selectId?: string;
  listboxId: string;
  isOpen: boolean;
  disabled?: boolean;
  clearable?: boolean;
  currentValue: string;
  selectedOption?: SelectOption;
  placeholder: string;
  leftIcon?: ReactNode;
  chevronSize: number;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onClear: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  selectId,
  listboxId,
  isOpen,
  disabled,
  clearable,
  currentValue,
  selectedOption,
  placeholder,
  leftIcon,
  chevronSize,
  onClick,
  onKeyDown,
  onClear,
}) => {
  return (
    <button
      type="button"
      id={selectId ? `${selectId}-trigger` : undefined}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-disabled={disabled ? true : undefined}
      disabled={disabled}
      className={styles.trigger}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className={styles.triggerContent}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        {!leftIcon && selectedOption?.icon && (
          <span className={styles.icon}>{selectedOption.icon}</span>
        )}

        {selectedOption ? (
          <span className={styles.valueText}>{selectedOption.label}</span>
        ) : (
          <span className={styles.placeholderText}>{placeholder}</span>
        )}
      </div>

      <div className={styles.actionsArea}>
        {clearable && Boolean(currentValue) && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            className={styles.clearBtn}
            onClick={onClear}
          >
            <X size={chevronSize - 2} />
          </button>
        )}

        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <ChevronDown size={chevronSize} />
        </span>
      </div>
    </button>
  );
};
