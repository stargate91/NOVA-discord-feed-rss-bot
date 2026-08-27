import type { TranslationKey } from '@/i18n/locales/en';

export interface OverviewPlatformItem {
  id: string;
  labelKey: TranslationKey;
  icon: string;
  selected: boolean;
}

export interface OverviewMetricsData {
  activeFeedsQuota: { current: number; max: number; percent: number };
  latency: { ms: number; scorePercent: number };
  deliveredNotifications: { count: number; scorePercent: number };
  refreshIntervalSeconds: number;
}
