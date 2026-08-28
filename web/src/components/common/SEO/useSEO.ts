import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_BASE_URL, DEFAULT_OG_IMAGE } from '@/constants';
import { useTranslation } from '@/i18n';
import { SUPPORTED_LOCALES, LOCALE_TO_OG_LOCALE } from '@/i18n/context';

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_DESCRIPTION =
  'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.';
const DEFAULT_KEYWORDS =
  'discord bot, social feeds, twitch live alerts, youtube discord notifications, kick stream monitor, free epic games bot, steam deals discord, discord feed alerts';
const DEFAULT_IMAGE = DEFAULT_OG_IMAGE;
const BASE_URL = APP_BASE_URL;

export const useSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
  imageType,
  canonicalPath,
  noIndex = false,
  structuredData,
}: SEOProps): void => {
  const location = useLocation();
  const { locale: activeLocale } = useTranslation();

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
    const formattedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    setMetaTag('name', 'keywords', formattedKeywords);
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'title', fullTitle);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Determine raw path without language prefix
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    const isLangPrefixed = firstSegment && SUPPORTED_LOCALES.some((l) => l.code === firstSegment);
    const rawPath = isLangPrefixed ? '/' + pathSegments.slice(1).join('/') : location.pathname;
    const normalizedRawPath = rawPath === '/' ? '' : rawPath;

    // 3. Set OpenGraph Tags
    const pageUrl = `${BASE_URL}${location.pathname}`;
    const masterCanonicalUrl = `${BASE_URL}${canonicalPath || normalizedRawPath || '/'}`;
    const computedImageType =
      imageType || (image.endsWith('.webp') ? 'image/webp' : image.endsWith('.png') ? 'image/png' : 'image/jpeg');
    const computedImageAlt = imageAlt || fullTitle;

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:image:secure_url', image);
    setMetaTag('property', 'og:image:type', computedImageType);
    setMetaTag('property', 'og:image:width', String(imageWidth));
    setMetaTag('property', 'og:image:height', String(imageHeight));
    setMetaTag('property', 'og:image:alt', computedImageAlt);
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('property', 'og:site_name', 'Nova Feeds');

    // 4. OpenGraph Locale & Locale Alternates
    const currentOgLocale = LOCALE_TO_OG_LOCALE[activeLocale] || 'en_US';
    setMetaTag('property', 'og:locale', currentOgLocale);

    // Remove previous dynamic og:locale:alternate tags
    document.querySelectorAll('meta[data-nova-seo="og:locale:alternate"]').forEach((el) => el.remove());

    if (!noIndex) {
      SUPPORTED_LOCALES.forEach((loc) => {
        if (loc.code !== activeLocale) {
          const altOgLocale = LOCALE_TO_OG_LOCALE[loc.code];
          if (altOgLocale) {
            const meta = document.createElement('meta');
            meta.setAttribute('property', 'og:locale:alternate');
            meta.setAttribute('content', altOgLocale);
            meta.setAttribute('data-nova-seo', 'og:locale:alternate');
            document.head.appendChild(meta);
          }
        }
      });
    }

    // 5. Set Twitter Card Tags (using spec-compliant name attribute)
    // Clean up any legacy property="twitter:..." tags if present
    document.querySelectorAll('meta[property^="twitter:"]').forEach((el) => el.remove());

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
    setMetaTag('name', 'twitter:image:alt', computedImageAlt);
    setMetaTag('name', 'twitter:url', pageUrl);

    // 6. Set Master Canonical Link (points to default/unprefixed root route)
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', masterCanonicalUrl);

    // 7. Dynamic hreflang Alternate Tags (prevents duplicate content across :lang routes)
    document.querySelectorAll('link[data-nova-seo="hreflang"]').forEach((el) => el.remove());

    if (!noIndex) {
      // Determine raw path without language prefix
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      const isLangPrefixed = firstSegment && SUPPORTED_LOCALES.some((l) => l.code === firstSegment);
      const rawPath = isLangPrefixed ? '/' + pathSegments.slice(1).join('/') : location.pathname;
      const normalizedRawPath = rawPath === '/' ? '' : rawPath;

      SUPPORTED_LOCALES.forEach((locale) => {
        const langUrl = `${BASE_URL}/${locale.code}${normalizedRawPath}`;

        const link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', locale.code);
        link.setAttribute('href', langUrl);
        link.setAttribute('data-nova-seo', 'hreflang');
        document.head.appendChild(link);
      });

      // Add x-default fallback pointing to standard root / English default route
      const defaultLink = document.createElement('link');
      defaultLink.setAttribute('rel', 'alternate');
      defaultLink.setAttribute('hreflang', 'x-default');
      defaultLink.setAttribute('href', `${BASE_URL}${normalizedRawPath || '/'}`);
      defaultLink.setAttribute('data-nova-seo', 'hreflang');
      document.head.appendChild(defaultLink);
    }

    // 8. JSON-LD Structured Data Dynamic Injection
    document.querySelectorAll('script[data-nova-seo="jsonld"]').forEach((el) => el.remove());

    if (structuredData && !noIndex) {
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((item) => {
        if (item) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-nova-seo', 'jsonld');
          script.textContent = JSON.stringify(item);
          document.head.appendChild(script);
        }
      });
    }

    return () => {
      document.querySelectorAll('link[data-nova-seo="hreflang"]').forEach((el) => el.remove());
      document.querySelectorAll('meta[data-nova-seo="og:locale:alternate"]').forEach((el) => el.remove());
      document.querySelectorAll('script[data-nova-seo="jsonld"]').forEach((el) => el.remove());
    };
  }, [
    title,
    description,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    imageType,
    canonicalPath,
    location.pathname,
    noIndex,
    activeLocale,
    structuredData,
  ]);
};


