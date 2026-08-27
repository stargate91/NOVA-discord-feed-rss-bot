/**
 * Opens an external URL safely in a new browser tab.
 */
export const openExternalUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Normalizes a URL path to ensure leading slash and no trailing slash (except root).
 */
export const normalizePath = (path: string): string => {
  if (!path || path === '/') return '/';
  const trimmed = path.trim();
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') && withLeading.length > 1
    ? withLeading.slice(0, -1)
    : withLeading;
};
