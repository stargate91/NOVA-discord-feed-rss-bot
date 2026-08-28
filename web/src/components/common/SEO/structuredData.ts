import {
  APP_BASE_URL,
  DISCORD_BOT_INVITE_URL,
  DISCORD_SUPPORT_SERVER_URL,
  OG_IMAGES,
} from '@/constants';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItemSchema {
  name: string;
  url: string;
}

export interface StructuredOffer {
  name: string;
  price: string;
  priceCurrency: string;
  billingDuration?: string;
  description: string;
  url: string;
}

/**
 * Builds Schema.org Organization structured data for Nova Feeds.
 */
export function buildOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${APP_BASE_URL}/#organization`,
    name: 'Nova Feeds',
    alternateName: ['NovaFeeds', 'Nova Discord Bot'],
    url: APP_BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${APP_BASE_URL}/images/logo.webp`,
      width: 512,
      height: 512,
    },
    image: OG_IMAGES.home,
    description:
      'Next-generation automated Discord notification bot delivering lightning-fast feeds from YouTube, Twitch, Kick, Free Games, Steam Deals, and RSS.',
    sameAs: [
      DISCORD_SUPPORT_SERVER_URL,
      DISCORD_BOT_INVITE_URL,
      'https://github.com/stargate91/discord-feed-bot',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: DISCORD_SUPPORT_SERVER_URL,
      availableLanguage: ['en', 'hu', 'de', 'es', 'fr', 'ja', 'zh'],
    },
  };
}

/**
 * Builds Schema.org WebSite structured data with SearchAction for Sitelinks Search Box.
 */
export function buildWebSiteSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${APP_BASE_URL}/#website`,
    url: APP_BASE_URL,
    name: 'Nova Feeds',
    description: 'Next-Generation Discord Notification Bot & Feed Management System',
    publisher: {
      '@id': `${APP_BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_BASE_URL}/docs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: [
      'en',
      'hu',
      'de',
      'es',
      'fr',
      'it',
      'pt',
      'ru',
      'ja',
      'ko',
      'zh',
      'pl',
      'nl',
      'tr',
      'cs',
      'sv',
      'ar',
      'he',
    ],
  };
}

/**
 * Builds enhanced Schema.org SoftwareApplication structured data for Nova Feeds.
 */
export function buildSoftwareApplicationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${APP_BASE_URL}/#software`,
    name: 'Nova Feeds',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Discord / Web Browser',
    url: APP_BASE_URL,
    softwareVersion: '2.0.0',
    description:
      'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.',
    screenshot: [OG_IMAGES.home, OG_IMAGES.premium],
    author: {
      '@id': `${APP_BASE_URL}/#organization`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0.00',
      highPrice: '14.99',
      offerCount: '4',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Tier',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Starter Plan',
          price: '3.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Professional Plan',
          price: '7.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Ultimate Plan',
          price: '14.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
  };
}

/**
 * Builds Schema.org FAQPage structured data from question/answer pairs.
 */
export function buildFaqPageSchema(faqs: FaqItem[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds Schema.org Product / OfferCatalog structured data for the Premium pricing page.
 */
export function buildPremiumProductSchema(offers?: StructuredOffer[]): Record<string, any> {
  const defaultOffers: StructuredOffer[] = [
    {
      name: 'Free Tier',
      price: '0.00',
      priceCurrency: 'USD',
      description: 'Standard 2-minute polling frequency, up to 5 feed monitors.',
      url: `${APP_BASE_URL}/premium`,
    },
    {
      name: 'Starter Plan',
      price: '3.99',
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Sub-60s polling speed, 15 feed monitors, full Discord markdown.',
      url: `${APP_BASE_URL}/premium`,
    },
    {
      name: 'Professional Plan',
      price: '7.99',
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Sub-15s rapid polling, 40 feed monitors, custom embed colors and branding.',
      url: `${APP_BASE_URL}/premium`,
    },
    {
      name: 'Ultimate Plan',
      price: '14.99',
      priceCurrency: 'USD',
      billingDuration: 'P1M',
      description: 'Sub-second real-time priority queue, unlimited monitors, dedicated SLA support.',
      url: `${APP_BASE_URL}/premium`,
    },
  ];

  const activeOffers = offers || defaultOffers;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${APP_BASE_URL}/premium#product`,
    name: 'Nova Feeds Premium Subscription',
    image: OG_IMAGES.premium,
    description:
      'Unlock sub-second feed frequency, custom branded Discord embeds, unlimited monitor quotas, and priority dispatch queues.',
    brand: {
      '@id': `${APP_BASE_URL}/#organization`,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0.00',
      highPrice: '14.99',
      offerCount: String(activeOffers.length),
      offers: activeOffers.map((o) => ({
        '@type': 'Offer',
        name: o.name,
        price: o.price,
        priceCurrency: o.priceCurrency,
        availability: 'https://schema.org/InStock',
        url: o.url,
        description: o.description,
      })),
    },
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data for rich breadcrumb snippets.
 */
export function buildBreadcrumbListSchema(crumbs: BreadcrumbItemSchema[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${APP_BASE_URL}${crumb.url}`,
    })),
  };
}
