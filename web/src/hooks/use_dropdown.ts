import { useState, useRef, useCallback } from 'react';
import { useClickOutside } from './use_click_outside';
import { useEscapeKey } from './use_escape_key';

export interface UseDropdownOptions {
  initialOpen?: boolean;
  initialSearch?: string;
  onOpen?: () => void;
  onClose?: () => void;
  clearSearchOnClose?: boolean;
}

export function useDropdown<T extends HTMLElement = HTMLDivElement>(options?: UseDropdownOptions) {
  const [isOpen, setIsOpen] = useState(options?.initialOpen ?? false);
  const [search, setSearch] = useState(options?.initialSearch ?? '');
  const dropdownRef = useRef<T | null>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    if (options?.clearSearchOnClose) {
      setSearch('');
    }
    options?.onClose?.();
  }, [options]);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    options?.onOpen?.();
  }, [options]);

  const toggleDropdown = useCallback((e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        options?.onOpen?.();
      } else {
        if (options?.clearSearchOnClose) {
          setSearch('');
        }
        options?.onClose?.();
      }
      return next;
    });
  }, [options]);

  const clearSearch = useCallback(() => {
    setSearch('');
  }, []);

  useClickOutside(dropdownRef, closeDropdown, isOpen);
  useEscapeKey(closeDropdown, isOpen);

  return {
    isOpen,
    setIsOpen,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    search,
    setSearch,
    clearSearch,
    dropdownRef,
  };
}
