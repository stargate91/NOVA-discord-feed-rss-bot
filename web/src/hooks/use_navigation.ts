import { useMemo, useCallback } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
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

export interface NavLinkItem {
  id: string;
  subpath: string;
  label: string;
  title: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  isPremium?: boolean;
  isDev?: boolean;
  requiresSession?: boolean;
  requiresMaster?: boolean;
}

const RAW_NAV_ITEMS: Array<{
  id: string;
  subpath: string;
  label: string;
  title: string;
  icon: LucideIcon;
  isPremium?: boolean;
  isDev?: boolean;
  requiresSession?: boolean;
  requiresMaster?: boolean;
}> = [
  { id: 'overview', subpath: '', label: 'Dashboard', title: 'Overview', icon: LayoutDashboard },
  { id: 'monitors', subpath: 'monitors', label: 'Monitors', title: 'Monitors', icon: Monitor, requiresSession: true },
  { id: 'analytics', subpath: 'analytics', label: 'Analytics', title: 'Analytics', icon: BarChart2, requiresSession: true },
  { id: 'settings', subpath: 'settings', label: 'Settings', title: 'Settings', icon: Settings, requiresSession: true },
  { id: 'billing', subpath: 'billing', label: 'Billing', title: 'Billing & Plans', icon: Crown, isPremium: true, requiresSession: true },
  { id: 'guide', subpath: 'guide', label: 'Guide', title: 'Guide', icon: BookOpen, requiresSession: true },
  { id: 'faq', subpath: 'faq', label: 'FAQ', title: 'FAQ', icon: HelpCircle, requiresSession: true },
  { id: 'dev', subpath: 'dev', label: 'Dev Controls', title: 'Dev Controls', icon: Code, isDev: true, requiresSession: true, requiresMaster: true },
];

export function useNavigation(session?: any, isMaster = false) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const guildId = (params?.guildId as string) || searchParams?.get('guild') || '';

  const buildUrl = useCallback(
    (subpath: string) => {
      if (!guildId) return subpath === '' ? '/servers' : `/${subpath}`;
      if (subpath === '') return `/dashboard/${guildId}`;
      return `/dashboard/${guildId}/${subpath}`;
    },
    [guildId]
  );

  const checkIsActive = useCallback(
    (subpath: string) => {
      const target = buildUrl(subpath);
      if (subpath === '') {
        return pathname === target;
      }
      return pathname === target || (pathname ? pathname.startsWith(`${target}/`) : false);
    },
    [buildUrl, pathname]
  );

  const navItems = useMemo<NavLinkItem[]>(() => {
    return RAW_NAV_ITEMS.filter((item) => {
      if (item.requiresSession && !session) return false;
      if (item.requiresMaster && !isMaster) return false;
      return true;
    }).map((item) => {
      const href = buildUrl(item.subpath);
      let isActive = checkIsActive(item.subpath);
      if (item.subpath === 'billing' && checkIsActive('premium')) {
        isActive = true;
      }
      return {
        ...item,
        href,
        isActive,
      };
    });
  }, [session, isMaster, buildUrl, checkIsActive]);

  return {
    guildId,
    pathname,
    buildUrl,
    checkIsActive,
    navItems,
  };
}
