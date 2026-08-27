/**
 * Format numbers with locale-aware thousands separators.
 */
export const formatNumber = (num: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format latency in milliseconds with unit.
 */
export const formatLatency = (ms: number): string => {
  return `${Math.round(ms)} ms`;
};

/**
 * Format percentage value.
 */
export const formatPercent = (val: number, decimals = 1): string => {
  return `${val.toFixed(decimals)}%`;
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
 * Truncate a string to maximum length with ellipsis.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
};
