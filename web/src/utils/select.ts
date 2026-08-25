import { SelectOption } from '@/types/ui';

export type { SelectOption };

export function getOptionId(opt: SelectOption | string): string {
  if (typeof opt === 'string') return opt;
  return String(opt.id || opt.value || opt.name || '');
}

export function getOptionName(opt: SelectOption | string): string {
  if (typeof opt === 'string') return opt;
  return String(opt.name || opt.label || opt.id || '');
}

export function filterSelectOptions<T extends SelectOption | string>(
  options: T[],
  searchQuery: string
): T[] {
  if (!searchQuery.trim()) return options;
  const q = searchQuery.toLowerCase().trim();
  return options.filter((opt) => getOptionName(opt).toLowerCase().includes(q));
}

export function getSelectedOptions<T extends SelectOption | string>(
  options: T[],
  selectedValues: string[]
): T[] {
  return options.filter((opt) => selectedValues.includes(getOptionId(opt)));
}

export function toggleSelectOption(
  currentValues: string[],
  optionId: string
): string[] {
  return currentValues.includes(optionId)
    ? currentValues.filter((v) => v !== optionId)
    : [...currentValues, optionId];
}
