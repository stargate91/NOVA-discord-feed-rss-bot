import { getNumberFormatter } from './cache';

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
