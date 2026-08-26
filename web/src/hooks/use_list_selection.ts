import { useState, useCallback, useMemo } from 'react';

export interface UseListSelectionOptions<T = number> {
  initialSelected?: T[];
  initialMode?: boolean;
}

export function useListSelection<T = number>(
  items: Array<{ id: T } | any> = [],
  options: UseListSelectionOptions<T> = {}
) {
  const [selectedIds, setSelectedIds] = useState<T[]>(options.initialSelected || []);
  const [selectionMode, setSelectionMode] = useState<boolean>(Boolean(options.initialMode));

  const handleSelect = useCallback((id: T) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds: T[] = items.map((item) =>
      item && typeof item === 'object' && 'id' in item ? item.id : item
    );
    if (selectedIds.length === allIds.length && allIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  }, [items, selectedIds.length]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: T) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.length === items.length;
  }, [items.length, selectedIds.length]);

  const selectAllButtonLabel = isAllSelected ? 'Deselect All' : 'Select All';

  return {
    selectedIds,
    setSelectedIds,
    selectionMode,
    setSelectionMode,
    handleSelect,
    handleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectAllButtonLabel,
    selectedCount: selectedIds.length,
  };
}

export default useListSelection;
