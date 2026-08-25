import { LayoutDashboard, Radio, BarChart3, Settings, Crown, HelpCircle, BookOpen, ShieldAlert } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  badge?: string;
  requiresMaster?: boolean;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { name: 'Monitors', href: '/monitors', icon: Radio },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Premium', href: '/premium', icon: Crown, badge: 'PRO' },
  { name: 'Guide', href: '/guide', icon: BookOpen },
  { name: 'FAQ', href: '/faq', icon: HelpCircle },
  { name: 'Dev Panel', href: '/dev', icon: ShieldAlert, requiresMaster: true }
];

export const MARKETING_NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Platforms', href: '#platforms' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' }
];

export const ANALYTICS_RANGE_LABELS: Record<string, string> = {
  "3": "Last 3 Days",
  "7": "Last 7 Days",
  "30": "Last 30 Days",
  "999": "∞ Lifetime"
};

export const ANALYTICS_PIE_COLORS: string[] = ['#7b2cbf', '#9d4edd', '#3c096c', '#5a189a', '#c19ee0'];
