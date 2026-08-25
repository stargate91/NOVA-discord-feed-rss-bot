import { useState, useRef } from 'react';
import { useClickOutside, useEscapeKey } from '@/hooks';
import {
  SelectOption,
  filterSelectOptions,
  getSelectedOptions,
  toggleSelectOption,
} from '@/utils';

export interface UseMultiSelectOptions {
  options?: Array<SelectOption | string>;
  value?: string[];
  onChange: (value: string[]) => void;
}

export function useMultiSelect({
  options = [],
  value = [],
  onChange,
}: UseMultiSelectOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedItems = getSelectedOptions(options, value);
  const filteredOptions = filterSelectOptions(options, search);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen);

  const handleToggle = (id: string) => {
    onChange(toggleSelectOption(value, id));
  };

  const removeTag = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const isSelected = (id: string) => value.includes(id);

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    dropdownRef,
    selectedItems,
    filteredOptions,
    handleToggle,
    removeTag,
    clearAll,
    toggleDropdown,
    closeDropdown,
    isSelected,
  };
}
