"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import styles from './multi_select.module.css';

interface MultiSelectOption {
  id?: string;
  name?: string;
  [key: string]: any;
}

interface MultiSelectProps {
  options?: Array<MultiSelectOption | string>;
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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getItemId = (opt: MultiSelectOption | string): string => {
    if (typeof opt === 'string') return opt;
    return String(opt.id || opt.value || opt.name || '');
  };

  const getItemName = (opt: MultiSelectOption | string): string => {
    if (typeof opt === 'string') return opt;
    return String(opt.name || opt.label || opt.id || '');
  };

  const selectedItems = options.filter(opt => value.includes(getItemId(opt)));
  const filteredOptions = options.filter(opt => 
    getItemName(opt).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter(v => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const removeTag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  return (
    <div className={styles["select-wrapper"]} ref={dropdownRef}>
      <button 
        type="button"
        className={`${styles["select-box"]} ${isOpen ? styles.open : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles["tag-list"]}>
          {selectedItems.length > 0 ? (
            selectedItems.map(item => {
              const id = getItemId(item);
              const name = getItemName(item);
              return (
                <span key={id} className={styles["tag-item"]}>
                  <span>{name}</span>
                  <button 
                    type="button" 
                    className={styles["tag-remove-btn"]} 
                    onClick={(e) => removeTag(e, id)}
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
            {filteredOptions.map(option => {
              const id = getItemId(option);
              const name = getItemName(option);
              const isSelected = value.includes(id);
              return (
                <button 
                  key={id} 
                  type="button"
                  className={`${styles["option-item"]} ${isSelected ? styles.selected : ''}`}
                  onClick={() => toggleOption(id)}
                >
                  <div className={`${styles["checkbox-custom"]} ${isSelected ? styles.checked : ''}`}>
                    {isSelected && <Check size={12} />}
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
              onClick={() => onChange([])}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
