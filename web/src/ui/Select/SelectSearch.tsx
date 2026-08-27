import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './Select.module.css';

interface SelectSearchProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  searchPlaceholder: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
  searchInputRef,
  searchQuery,
  searchPlaceholder,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <div className={styles.searchWrapper}>
      <Search size={14} className={styles.searchIcon} />
      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        placeholder={searchPlaceholder}
        className={styles.searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      />
      {searchQuery && (
        <button
          type="button"
          aria-label="Clear search"
          className={styles.clearBtn}
          onClick={onClearSearch}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
