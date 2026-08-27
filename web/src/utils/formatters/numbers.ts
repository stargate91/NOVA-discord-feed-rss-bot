import { getNumberFormatter } from './cache';

/**
 * Format numbers with locale-aware thousands separators.
 */
export const formatNumber = (
  num: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string => {
  if (isNaN(num)) return '0';
  return getNumberFormatter(locale, options).format(num);
};

/**
 * Format compact numbers (e.g. 1.5K, 2.3M, 10B).
 */
export const formatCompactNumber = (num: number, locale = 'en-US'): string => {
  if (isNaN(num)) return '0';
  return getNumberFormatter(locale, { notation: 'compact', compactDisplay: 'short' }).format(num);
};

/**
 * Format localized currency amounts.
 */
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  if (isNaN(amount)) return '$0.00';
  return getNumberFormatter(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Format localized percentage value.
 */
export const formatPercent = (val: number, decimals = 1, locale = 'en-US'): string => {
  if (isNaN(val)) return '0%';
  return (
    getNumberFormatter(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(val) + '%'
  );
};
