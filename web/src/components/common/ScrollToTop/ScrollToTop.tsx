import type React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls window to top on route navigation, or smoothly scrolls
 * to hash anchor elements if present in the URL.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.focus({ preventScroll: true });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Accessibility: Manage focus on route change for screen readers & keyboard users
    const mainContent = document.getElementById('main-content') || document.querySelector('h1');
    if (mainContent instanceof HTMLElement) {
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname, hash]);

  return null;
};
