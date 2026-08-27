import React from 'react';
import { Check } from 'lucide-react';
import type { SelectOption } from './types';
import styles from './Select.module.css';

interface SelectListboxProps {
  listRef: React.RefObject<HTMLUListElement>;
  listboxId: string;
  filteredOptions: SelectOption[];
  currentValue: string;
  highlightedIndex: number;
  emptyMessage: string;
  onSelect: (value: string) => void;
  children?: React.ReactNode;
}

export const SelectListbox: React.FC<SelectListboxProps> = ({
  listRef,
  listboxId,
  filteredOptions,
  currentValue,
  highlightedIndex,
  emptyMessage,
  onSelect,
  children,
}) => {
  return (
    <div id={listboxId} className={styles.menu} role="listbox">
      {children}
      <ul ref={listRef} className={styles.optionsList}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, index) => {
            const isSelected = opt.value === currentValue;
            const isHighlighted = index === highlightedIndex;

            const optionClasses = [
              styles.option,
              isSelected ? styles.optionSelected : '',
              isHighlighted ? styles.optionHighlighted : '',
              opt.disabled ? styles.optionDisabled : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={optionClasses}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(opt.value);
                  }}
                >
                  <div className={styles.optionContent}>
                    {opt.icon && <span className={styles.optionIcon}>{opt.icon}</span>}
                    <div className={styles.optionDetails}>
                      <span className={styles.optionLabel}>{opt.label}</span>
                      {opt.description && (
                        <span className={styles.optionDescription}>{opt.description}</span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check size={14} className={styles.checkIcon} />}
                </button>
              </li>
            );
          })
        ) : (
          <li className={styles.empty}>{emptyMessage}</li>
        )}
      </ul>
    </div>
  );
};
