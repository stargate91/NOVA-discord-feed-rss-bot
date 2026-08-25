import { PLATFORM_NAMES } from '@/constants/platforms';

export interface HistoryPoint {
  date: string;
  count: number | string;
}

export interface PlatformStat {
  platform: string;
  count: number | string;
}

export interface FormattedPlatformItem {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

/**
 * Calculates percentage growth between two equal halves of a history period
 */
export function calculatePeriodGrowthRate(history: HistoryPoint[]): number {
  if (!history || history.length < 2) return 0;

  const midpoint = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, midpoint);
  const secondHalf = history.slice(midpoint);

  const firstTotal = firstHalf.reduce((sum, h) => sum + (Number(h.count) || 0), 0);
  const secondTotal = secondHalf.reduce((sum, h) => sum + (Number(h.count) || 0), 0);

  if (firstTotal === 0) {
    return secondTotal > 0 ? 100 : 0;
  }

  const rate = ((secondTotal - firstTotal) / firstTotal) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Formats platform stats with friendly names, counts, and percentages
 */
export function formatPlatformBreakdown(
  platforms: PlatformStat[],
  totalPosts: number
): FormattedPlatformItem[] {
  if (!platforms || platforms.length === 0) return [];

  const total = totalPosts > 0
    ? totalPosts
    : platforms.reduce((acc, p) => acc + (Number(p.count) || 0), 0);

  return platforms.map((p) => {
    const count = Number(p.count) || 0;
    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    const name = PLATFORM_NAMES[p.platform] || p.platform;

    return {
      id: p.platform,
      name,
      count,
      percentage,
    };
  });
}

/**
 * Formats a 7-day, 24-hour heatmap matrix
 */
export function formatHeatmapMatrix(
  data: Array<{ day: number; hour: number; count: number | string }>
): number[][] {
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

  if (Array.isArray(data)) {
    data.forEach((d) => {
      const day = Number(d.day);
      const hour = Number(d.hour);
      const count = Number(d.count) || 0;

      if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
        matrix[day][hour] = count;
      }
    });
  }

  return matrix;
}

export interface GaugeMetrics {
  percentage: number;
  circumference: number;
  offset: number;
  strokeColor: string;
  variant: 'accent' | 'warning' | 'error';
  remaining: number;
}

/**
 * Calculates SVG circular gauge metrics and threshold states
 */
export function calculateGaugeMetrics(
  current: number,
  max: number,
  radius = 36
): GaugeMetrics {
  const safeMax = max > 0 ? max : 1;
  const percentage = Math.min(Math.round((current / safeMax) * 100), 100);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let strokeColor = 'var(--accent-light)';
  let variant: 'accent' | 'warning' | 'error' = 'accent';

  if (percentage >= 100) {
    strokeColor = 'var(--status-error)';
    variant = 'error';
  } else if (percentage >= 80) {
    strokeColor = 'var(--status-warning)';
    variant = 'warning';
  }

  return {
    percentage,
    circumference,
    offset,
    strokeColor,
    variant,
    remaining: Math.max(0, max - current),
  };
}

