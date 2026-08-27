import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatLatency,
  formatUptime,
  formatFileSize,
  truncate,
} from '@/utils/formatters';

describe('Enterprise Intl & Utility Formatters Suite', () => {
  it('formats numbers with locale awareness and compact notation', () => {
    expect(formatNumber(1250000, 'en-US')).toBe('1,250,000');
    expect(formatCompactNumber(1500, 'en-US')).toBe('1.5K');
    expect(formatCompactNumber(2500000, 'en-US')).toBe('2.5M');
    expect(formatNumber(NaN)).toBe('0');
  });

  it('formats currency according to specified currency code and locale', () => {
    expect(formatCurrency(49.99, 'USD', 'en-US')).toBe('$49.99');
    expect(formatCurrency(0, 'EUR', 'de-DE')).toContain('0,00');
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('formats percentage values with decimal controls', () => {
    expect(formatPercent(99.94, 1)).toBe('99.9%');
    expect(formatPercent(100, 0)).toBe('100%');
    expect(formatPercent(NaN)).toBe('0%');
  });

  it('formats dates and datetimes with Intl options', () => {
    const fixedDate = new Date('2026-08-27T12:00:00Z');
    const formattedDate = formatDate(fixedDate, 'en-US');
    expect(formattedDate).toContain('2026');
    expect(formattedDate).toContain('Aug');

    const formattedDateTime = formatDateTime(fixedDate, 'en-US');
    expect(formattedDateTime).toContain('2026');

    expect(formatDate('invalid-date')).toBe('');
  });

  it('formats relative time using Intl.RelativeTimeFormat', () => {
    const now = new Date('2026-08-27T12:00:00Z');
    const twoHoursAgo = new Date('2026-08-27T10:00:00Z');
    const inThreeDays = new Date('2026-08-30T12:00:00Z');

    expect(formatRelativeTime(twoHoursAgo, now, 'en-US')).toBe('2 hours ago');
    expect(formatRelativeTime(inThreeDays, now, 'en-US')).toBe('in 3 days');
    expect(formatRelativeTime('invalid-date', now)).toBe('');
  });

  it('formats uptime, latency, file sizes, and truncation', () => {
    expect(formatLatency(45.6)).toBe('46 ms');
    expect(formatUptime(90065)).toBe('1d 1h 1m');
    expect(formatUptime(-5)).toBe('0s');

    expect(formatFileSize(500, 'en-US')).toBe('500 B');
    expect(formatFileSize(1536, 'en-US')).toBe('1.5 KB');
    expect(formatFileSize(1048576 * 5, 'en-US')).toBe('5 MB');
    expect(formatFileSize(-100)).toBe('0 B');

    expect(truncate('Hello World', 5)).toBe('Hell…');
    expect(truncate('Short', 10)).toBe('Short');
  });
});
