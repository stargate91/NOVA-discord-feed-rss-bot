/**
 * Formats a number with comma separators for display (e.g. 1000000 -> "1,000,000").
 */
export function formatNumber(input?: number | string | null): string {
  if (input === null || input === undefined || input === '') return '0';
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Formats a number in compact notation (e.g. 1500 -> "1.5K", 2300000 -> "2.3M").
 */
export function formatCompactNumber(input?: number | string | null): string {
  if (input === null || input === undefined || input === '') return '0';
  const num = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(num)) return '0';
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
}
