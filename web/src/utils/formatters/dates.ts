import { getDateTimeFormatter, getRelativeTimeFormatter } from './cache';

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
