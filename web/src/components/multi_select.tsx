"use client";

import React from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { useMultiSelect } from '@/hooks/use_multi_select';
import { SelectOption, getOptionId, getOptionName } from '@/utils';
import styles from './multi_select.module.css';

interface MultiSelectProps {
  options?: Array<SelectOption | string>;
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options..." 
}: MultiSelectProps) {
  const {
    isOpen,
    search,
    setSearch,
    dropdownRef,
    selectedItems,
    filteredOptions,
    handleToggle,
    removeTag,
    clearAll,
    toggleDropdown,
    isSelected,
  } = useMultiSelect({ options, value, onChange });

  return (
    <div className={styles["select-wrapper"]} ref={dropdownRef}>
      <button 
        type="button"
        className={`${styles["select-box"]} ${isOpen ? styles.open : ''}`} 
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles["tag-list"]}>
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => {
              const id = getOptionId(item);
              const name = getOptionName(item);
              return (
                <span key={id} className={styles["tag-item"]}>
                  <span>{name}</span>
                  <button 
                    type="button" 
                    className={styles["tag-remove-btn"]} 
                    onClick={(e) => removeTag(id, e)}
                    aria-label={`Remove ${name}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })
          ) : (
            <span className={styles["placeholder-text"]}>{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={18} 
          className={`${styles["chevron-icon"]} ${isOpen ? styles.rotated : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={styles["dropdown-card"]}>
          <div className={styles["search-bar"]}>
            <Search size={16} className={styles["search-icon"]} />
            <input 
              type="text" 
              className={styles["search-input"]}
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className={styles["options-list"]}>
            {filteredOptions.map((option) => {
              const id = getOptionId(option);
              const name = getOptionName(option);
              const checked = isSelected(id);
              return (
                <button 
                  key={id} 
                  type="button"
                  className={`${styles["option-item"]} ${checked ? styles.selected : ''}`}
                  onClick={() => handleToggle(id)}
                >
                  <div className={`${styles["checkbox-custom"]} ${checked ? styles.checked : ''}`}>
                    {checked && <Check size={12} />}
                  </div>
                  <span className={styles["option-label"]}>{name}</span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className={styles["no-matches"]}>No matches found</div>
            )}
          </div>

          <div className={styles["dropdown-footer"]}>
            <span>{value.length} selected</span>
            <button 
              type="button" 
              className={styles["btn-clear"]} 
              onClick={clearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

