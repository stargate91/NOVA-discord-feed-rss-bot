/**
 * Enterprise Internationalization (Intl) Formatting Utilities
 * Provides high-performance, locale-aware date, time, number, currency, and relative time helpers.
 */

// LRU/Map formatter caches to avoid expensive repeated constructor calls
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>();

function getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

function getDateTimeFormatter(
  locale: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = dateTimeFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

function getRelativeTimeFormatter(
  locale: string,
  options?: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
  const key = `${locale}:${JSON.stringify(options || {})}`;
  let formatter = relativeTimeFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options });
    relativeTimeFormatCache.set(key, formatter);
  }
  return formatter;
}

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

/**
 * Format localized date (e.g. "Aug 27, 2026").
 */
export const formatDate = (
  date: Date | string | number,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string => {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return getDateTimeFormatter(locale, options).format(d);
};

/**
 * Format localized date and time (e.g. "Aug 27, 2026, 5:30 PM").
 */
export const formatDateTime = (
  date: Date | string | number,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return getDateTimeFormatter(locale, options).format(d);
};

/**
 * Format relative time (e.g. "2 hours ago", "in 3 days").
 */
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale = 'en-US'
): string => {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const elapsedSeconds = Math.round((d.getTime() - baseDate.getTime()) / 1000);
  const rtf = getRelativeTimeFormatter(locale);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(elapsedSeconds) >= seconds || unit === 'second') {
      const count = Math.round(elapsedSeconds / seconds);
      return rtf.format(count, unit);
    }
  }

  return rtf.format(0, 'second');
};

/**
 * Format latency in milliseconds with unit.
 */
export const formatLatency = (ms: number): string => {
  return `${Math.round(ms)} ms`;
};

/**
 * Format uptime seconds into human-readable duration (e.g. "4d 12h 30m").
 */
export const formatUptime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return '0s';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || seconds > 0) parts.push(`${seconds}s`);

  return parts.slice(0, 3).join(' ');
};

/**
 * Format byte count into human-readable file sizes (e.g. "1.5 MB").
 */
export const formatFileSize = (bytes: number, locale = 'en-US'): string => {
  if (bytes < 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = getNumberFormatter(locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(size);

  return `${formatted} ${units[unitIndex]}`;
};

/**
 * Truncate a string to maximum length with ellipsis.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
};
