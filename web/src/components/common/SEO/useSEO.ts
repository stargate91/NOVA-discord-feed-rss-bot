import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
}

const DEFAULT_DESCRIPTION =
  'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.';
const DEFAULT_IMAGE = 'https://novafeeds.xyz/images/logo.webp';
const BASE_URL = 'https://novafeeds.xyz';

export const useSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  canonicalPath,
}: SEOProps): void => {
  const location = useLocation();

  useEffect(() => {
    // 1. Set document title
    const fullTitle = title
      ? `${title} | Nova Feeds`
      : 'Nova Feeds — Next-Generation Discord Notification Bot';
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
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);
  }, [title, description, image, canonicalPath, location.pathname]);
};
