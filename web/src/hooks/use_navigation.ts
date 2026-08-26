import { useMemo, useCallback } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { Session } from 'next-auth';
import { LucideIcon } from 'lucide-react';
import { RAW_NAV_ITEMS, RawNavItem } from '@/constants/navigation';
import { getGuildDashboardRoute } from '@/utils/navigation';

export interface NavLinkItem extends RawNavItem {
  href: string;
  isActive: boolean;
}

export function useNavigation(session?: Session | null, isMaster = false) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const guildId = (params?.guildId as string) || searchParams?.get('guild') || '';

  const buildUrl = useCallback(
    (subpath: string) => getGuildDashboardRoute(guildId, subpath),
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
