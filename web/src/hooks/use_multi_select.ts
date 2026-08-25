import { useDropdown } from '@/hooks/use_dropdown';
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
  const {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
  } = useDropdown({ clearSearchOnClose: false });

  const selectedItems = getSelectedOptions(options, value);
  const filteredOptions = filterSelectOptions(options, search);

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

