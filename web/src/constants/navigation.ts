import {
  LayoutDashboard,
  Crown,
  Monitor,
  BarChart2,
  Settings,
  HelpCircle,
  Code,
  BookOpen,
  LucideIcon,
} from 'lucide-react';

export interface RawNavItem {
  id: string;
  subpath: string;
  label: string;
  title: string;
  icon: LucideIcon;
  isPremium?: boolean;
  isDev?: boolean;
  requiresSession?: boolean;
  requiresMaster?: boolean;
}

export const RAW_NAV_ITEMS: RawNavItem[] = [
  { id: 'overview', subpath: '', label: 'Dashboard', title: 'Overview', icon: LayoutDashboard },
  { id: 'monitors', subpath: 'monitors', label: 'Monitors', title: 'Monitors', icon: Monitor, requiresSession: true },
  { id: 'analytics', subpath: 'analytics', label: 'Analytics', title: 'Analytics', icon: BarChart2, requiresSession: true },
  { id: 'settings', subpath: 'settings', label: 'Settings', title: 'Settings', icon: Settings, requiresSession: true },
  { id: 'billing', subpath: 'billing', label: 'Billing', title: 'Billing & Plans', icon: Crown, isPremium: true, requiresSession: true },
  { id: 'guide', subpath: 'guide', label: 'Guide', title: 'Guide', icon: BookOpen, requiresSession: true },
  { id: 'faq', subpath: 'faq', label: 'FAQ', title: 'FAQ', icon: HelpCircle, requiresSession: true },
  { id: 'dev', subpath: 'dev', label: 'Dev Controls', title: 'Dev Controls', icon: Code, isDev: true, requiresSession: true, requiresMaster: true },
];

export const MARKETING_NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Platforms', href: '#platforms' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' }
];
