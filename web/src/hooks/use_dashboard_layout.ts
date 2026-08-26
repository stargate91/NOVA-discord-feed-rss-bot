import { useState, useCallback } from 'react';
import { useIsClient } from './use_is_mounted';

export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'nova_sidebar_collapsed';

export function useDashboardLayout() {
  const isClient = useIsClient();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
    }
    return false;
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  const openMobileDrawer = useCallback(() => setMobileDrawerOpen(true), []);
  const closeMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);

  return {
    isClient,
    isCollapsed: isClient ? isCollapsed : false,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
    toggleCollapse,
  };
}
