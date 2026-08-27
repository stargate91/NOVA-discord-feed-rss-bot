import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_BASE_URL, DEFAULT_OG_IMAGE } from '@/constants';
import { SUPPORTED_LOCALES } from '@/i18n/context';

export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.';
const DEFAULT_IMAGE = DEFAULT_OG_IMAGE;
const BASE_URL = APP_BASE_URL;

export const useSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  canonicalPath,
  noIndex = false,
}: SEOProps): void => {
  const location = useLocation();

  useEffect(() => {
    // 1. Set document title
    const fullTitle = title
      ? `${title} | NovaFeeds`
      : 'NovaFeeds — Next-Generation Discord Notification Bot';
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Set Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'title', fullTitle);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Set OpenGraph Tags
    const fullUrl = `${BASE_URL}${canonicalPath || location.pathname}`;
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', fullUrl);

    // 4. Set Twitter Card Tags
    setMetaTag('property', 'twitter:title', fullTitle);
    setMetaTag('property', 'twitter:description', description);
    setMetaTag('property', 'twitter:image', image);
    setMetaTag('property', 'twitter:url', fullUrl);

    // 5. Set Canonical Link
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);

    // 6. Dynamic hreflang Alternate Tags (prevents duplicate content across :lang routes)
    // Remove previous hreflang tags created by Nova SEO
    document.querySelectorAll('link[data-nova-seo="hreflang"]').forEach((el) => el.remove());

    if (!noIndex) {
      // Determine raw path without language prefix
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      const isLangPrefixed = firstSegment && SUPPORTED_LOCALES.some((l) => l.code === firstSegment);
      const rawPath = isLangPrefixed ? '/' + pathSegments.slice(1).join('/') : location.pathname;
      const normalizedRawPath = rawPath === '/' ? '' : rawPath;

      SUPPORTED_LOCALES.forEach((locale) => {
        const langUrl =
          locale.code === 'en'
            ? `${BASE_URL}${normalizedRawPath || '/'}`
            : `${BASE_URL}/${locale.code}${normalizedRawPath}`;

        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', locale.code);
        link.setAttribute('href', langUrl);
        link.setAttribute('data-nova-seo', 'hreflang');
        document.head.appendChild(link);
      });

      // Add x-default fallback pointing to standard root / English
      const defaultLink = document.createElement('link');
      defaultLink.setAttribute('rel', 'alternate');
      defaultLink.setAttribute('hreflang', 'x-default');
      defaultLink.setAttribute('href', `${BASE_URL}${normalizedRawPath || '/'}`);
      defaultLink.setAttribute('data-nova-seo', 'hreflang');
      document.head.appendChild(defaultLink);
    }

    return () => {
      document.querySelectorAll('link[data-nova-seo="hreflang"]').forEach((el) => el.remove());
    };
  }, [title, description, image, canonicalPath, location.pathname, noIndex]);
};
