import { Activity, Radio, BarChart3, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { TranslationKey } from '@/i18n';

export interface DashboardNavItem {
  pathSuffix: string;
  labelKey: TranslationKey;
  icon: typeof Activity;
  end?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    pathSuffix: '',
    labelKey: 'guild.overviewTitle',
    icon: Activity,
    end: true,
  },
  {
    pathSuffix: '/feeds',
    labelKey: 'common.navFeeds',
    icon: Radio,
  },
  {
    pathSuffix: '/analytics',
    labelKey: 'common.navAnalytics',
    icon: BarChart3,
  },
  {
    pathSuffix: '/premium',
    labelKey: 'common.navPremium',
    icon: Sparkles,
  },
  {
    pathSuffix: '/settings',
    labelKey: 'common.navGuildSettings',
    icon: SlidersHorizontal,
  },
];

export const SIDEBAR_SERVERS = [
  {
    value: '123456789012345678',
    labelKey: 'guild.sidebarServer1Label' as TranslationKey,
    descKey: 'guild.sidebarServer1Desc' as TranslationKey,
  },
  {
    value: '987654321098765432',
    labelKey: 'guild.sidebarServer2Label' as TranslationKey,
    descKey: 'guild.sidebarServer2Desc' as TranslationKey,
  },
  {
    value: '555666777888999000',
    labelKey: 'guild.sidebarServer3Label' as TranslationKey,
    descKey: 'guild.sidebarServer3Desc' as TranslationKey,
  },
] as const;
