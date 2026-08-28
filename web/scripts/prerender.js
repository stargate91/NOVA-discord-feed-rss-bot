import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(__dirname, '../public');
const webRootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://novafeeds.xyz';

const publicMarketingRoutes = [
  {
    path: '/',
    title: 'NovaFeeds — Next-Generation Discord Notification Bot',
    description:
      'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.',
    keywords:
      'discord bot, social feeds, twitch live alerts, youtube discord notifications, kick stream monitor, free epic games bot, steam deals discord, discord feed alerts',
    ogImage: `${BASE_URL}/images/og/og-home.webp`,
    isLocalized: true,
    priority: '1.0',
    changefreq: 'daily',
    sourceFiles: [
      'src/pages/marketing/HomePage.tsx',
      'src/pages/marketing/home',
      'src/i18n/locales/en/home.ts',
    ],
  },
  {
    path: '/premium',
    title: 'Premium Subscription & Tier Plans — NovaFeeds',
    description:
      'Unlock sub-second polling, unlimited feed monitors, custom branding, and priority queue delivery for your Discord servers.',
    keywords:
      'discord bot premium, fast social feeds, real-time alerts, priority queue, custom discord embeds, unlimited monitors',
    ogImage: `${BASE_URL}/images/og/og-premium.webp`,
    isLocalized: true,
    priority: '0.9',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/PremiumPage.tsx',
      'src/pages/marketing/premium',
      'src/i18n/locales/en/premium.ts',
    ],
  },
  {
    path: '/docs',
    title: 'Documentation & API Guides — NovaFeeds',
    description:
      'Explore developer guides, feed configuration tutorials, webhook integration, and architectural documentation for Nova.',
    keywords:
      'discord bot documentation, nova setup guide, slash commands reference, feed configuration, webhook integration, bot permissions',
    ogImage: `${BASE_URL}/images/og/og-docs.webp`,
    isLocalized: true,
    priority: '0.8',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/DocsPage.tsx',
      'src/pages/marketing/docs',
      'src/i18n/locales/en/docs.ts',
    ],
  },
  {
    path: '/docs/commands',
    title: 'Slash Commands & Parameters Reference — NovaFeeds Docs',
    description:
      'Complete reference guide for Nova Feeds Discord bot slash commands, arguments, filter flags, and embed formatting options.',
    keywords:
      'discord bot slash commands, nova commands list, /feed add command, discord bot setup commands, bot permissions list',
    ogImage: `${BASE_URL}/images/og/og-docs.webp`,
    isLocalized: true,
    priority: '0.8',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/DocsPage.tsx',
      'src/pages/marketing/docs/DocsCommandsPanel.tsx',
    ],
  },
  {
    path: '/docs/feeds',
    title: 'Supported Feed Platforms & Sources — NovaFeeds Docs',
    description:
      'Learn how to configure real-time notifications for YouTube, Twitch, Kick, Free Games, Steam Deals, and custom RSS feeds.',
    keywords:
      'youtube discord bot, twitch stream alerts bot, kick stream notifications discord, epic games free games bot, steam deals alert bot',
    ogImage: `${BASE_URL}/images/og/og-docs.webp`,
    isLocalized: true,
    priority: '0.8',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/DocsPage.tsx',
      'src/pages/marketing/docs/DocsFeedsPanel.tsx',
    ],
  },
  {
    path: '/docs/setup',
    title: 'Bot Setup & Permissions Guide — NovaFeeds Docs',
    description:
      'Step-by-step setup guide, webhook configuration, and required Discord permissions for the Nova notification bot.',
    keywords:
      'invite discord bot, discord bot permissions setup, webhook permissions discord, feed notification channel setup',
    ogImage: `${BASE_URL}/images/og/og-docs.webp`,
    isLocalized: true,
    priority: '0.8',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/DocsPage.tsx',
      'src/pages/marketing/docs/DocsPermissionsPanel.tsx',
    ],
  },
  {
    path: '/support',
    title: 'Support & Community Help Center — NovaFeeds',
    description:
      'Get live assistance, report bugs, join our Discord community, and find answers to common setup questions.',
    keywords:
      'discord bot support, nova troubleshooting, discord help server, feed setup assistance, bot customer service',
    ogImage: `${BASE_URL}/images/og/og-support.webp`,
    isLocalized: true,
    priority: '0.7',
    changefreq: 'monthly',
    sourceFiles: [
      'src/pages/marketing/SupportPage.tsx',
      'src/i18n/locales/en/support.ts',
    ],
  },
  {
    path: '/changelog',
    title: 'Changelog & Release Notes — NovaFeeds',
    description:
      'See recent feature drops, architectural speed improvements, platform additions, and security enhancements.',
    keywords:
      'discord bot changelog, nova updates, release notes, new bot features, version history, bot patch notes',
    ogImage: `${BASE_URL}/images/og/og-changelog.webp`,
    isLocalized: true,
    priority: '0.7',
    changefreq: 'weekly',
    sourceFiles: [
      'src/pages/marketing/ChangelogPage.tsx',
      'src/i18n/locales/en/changelog.ts',
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — NovaFeeds',
    description:
      'Learn how Nova protects your Discord server data, encryption standards, and privacy commitments.',
    keywords:
      'discord bot privacy policy, data protection, discord server security, encryption standards, data handling',
    ogImage: `${BASE_URL}/images/og/og-legal.webp`,
    isLocalized: true,
    priority: '0.5',
    changefreq: 'monthly',
    sourceFiles: [
      'src/pages/marketing/PrivacyPage.tsx',
      'src/i18n/locales/en/legal.ts',
    ],
  },
  {
    path: '/terms',
    title: 'Terms of Service — NovaFeeds',
    description:
      'Read the terms of service governing usage of the Nova notification platform and bot services.',
    keywords:
      'discord bot terms of service, platform usage rules, bot terms and conditions, acceptable use policy',
    ogImage: `${BASE_URL}/images/og/og-legal.webp`,
    isLocalized: true,
    priority: '0.5',
    changefreq: 'monthly',
    sourceFiles: [
      'src/pages/marketing/TermsPage.tsx',
      'src/i18n/locales/en/legal.ts',
    ],
  },
];

const privateNoindexRoutes = [
  { path: '/servers', title: 'Select Server — NovaFeeds' },
  { path: '/auth/callback', title: 'Authenticating — NovaFeeds' },
  { path: '/dev', title: 'Developer Portal — NovaFeeds' },
  { path: '/dev/ui', title: 'UI Component Catalog — NovaFeeds' },
  { path: '/components', title: 'UI Components — NovaFeeds' },
];

const LOCALES = [
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
  'zh-tw',
  'pl',
  'nl',
  'tr',
  'cs',
  'sv',
  'ar',
  'he',
];

const LOCALE_TO_OG_LOCALE = {
  en: 'en_US',
  hu: 'hu_HU',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
  pt: 'pt_BR',
  ru: 'ru_RU',
  ja: 'ja_JP',
  ko: 'ko_KR',
  zh: 'zh_CN',
  'zh-tw': 'zh_TW',
  pl: 'pl_PL',
  nl: 'nl_NL',
  tr: 'tr_TR',
  cs: 'cs_CZ',
  sv: 'sv_SE',
  ar: 'ar_SA',
  he: 'he_IL',
};

function generateAlternateHreflangTags(routePath) {
  const cleanPath = routePath === '/' ? '' : routePath;
  const tags = LOCALES.map(
    (loc) => `    <link rel="alternate" hreflang="${loc}" href="${BASE_URL}/${loc}${cleanPath}" />`
  );
  tags.push(
    `    <link rel="alternate" hreflang="x-default" href="${BASE_URL}${cleanPath || '/'}" />`
  );
  return tags.join('\n');
}

function generateOgLocaleAlternateTags(currentLocale) {
  const tags = [];
  LOCALES.forEach((loc) => {
    if (loc !== currentLocale && LOCALE_TO_OG_LOCALE[loc]) {
      tags.push(`    <meta property="og:locale:alternate" content="${LOCALE_TO_OG_LOCALE[loc]}" />`);
    }
  });
  return tags.join('\n');
}

function generateJsonLdForRoute(route, currentLocale) {
  const isEn = currentLocale === 'en';
  const prefix = isEn ? '' : `/${currentLocale}`;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Nova Feeds',
    alternateName: ['NovaFeeds', 'Nova Discord Bot'],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/images/logo.webp`,
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/images/og/og-home.webp`,
    description:
      'Next-generation automated Discord notification bot delivering lightning-fast feeds from YouTube, Twitch, Kick, Free Games, Steam Deals, and RSS.',
    sameAs: [
      'https://discord.gg/tjRStPtm9k',
      'https://github.com/stargate91/discord-feed-bot',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://discord.gg/tjRStPtm9k',
      availableLanguage: ['en', 'hu', 'de', 'es', 'fr', 'ja', 'zh'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Nova Feeds',
    description: 'Next-Generation Discord Notification Bot & Feed Management System',
    publisher: { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/docs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#software`,
    name: 'Nova Feeds',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Discord / Web Browser',
    url: BASE_URL,
    softwareVersion: '2.0.0',
    description: route.description,
    screenshot: [`${BASE_URL}/images/og/og-home.webp`, `${BASE_URL}/images/og/og-premium.webp`],
    author: { '@id': `${BASE_URL}/#organization` },
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
        { '@type': 'Offer', name: 'Free Tier', price: '0.00', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: 'Starter Plan', price: '3.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: 'Professional Plan', price: '7.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        { '@type': 'Offer', name: 'Ultimate Plan', price: '14.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      ],
    },
  };

  const homeFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What platforms does Nova support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nova supports YouTube uploads, Twitch streams, Kick streams, Epic Games free store drops, Steam deals, TMDB movie releases, and any standard RSS/Atom feeds.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast are social notifications delivered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Free servers receive updates within standard 2-minute cycles. Premium servers enjoy sub-second or 15-second priority dispatch queues.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Nova free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Nova offers a fully functional Free Tier with up to 5 feed monitors, rich embeds, and automatic cleanup.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I add Nova to my Discord server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply click "Add to Discord" or "Invite Bot", select your server with Manage Server permission, and authorize the bot.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I customize message embed colors and buttons?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, full custom embed branding, custom colors, mentions, and buttons are available in our control panel and premium tiers.',
        },
      },
    ],
  };

  const premiumFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I activate my Premium subscription after purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Once subscribed via Stripe, link your Discord server in the Web Dashboard and your premium quotas will activate instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I transfer my subscription to another server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can transfer your active subscription slot between servers anytime from the server management portal.',
        },
      },
    ],
  };

  const premiumProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/premium#product`,
    name: 'Nova Feeds Premium Subscription',
    image: `${BASE_URL}/images/og/og-premium.webp`,
    description: 'Unlock sub-second feed frequency, custom branded Discord embeds, unlimited monitor quotas, and priority dispatch queues.',
    brand: { '@id': `${BASE_URL}/#organization` },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0.00',
      highPrice: '14.99',
      offerCount: '4',
      offers: [
        { '@type': 'Offer', name: 'Free Tier', price: '0.00', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${BASE_URL}${prefix}/premium` },
        { '@type': 'Offer', name: 'Starter Plan', price: '3.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${BASE_URL}${prefix}/premium` },
        { '@type': 'Offer', name: 'Professional Plan', price: '7.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${BASE_URL}${prefix}/premium` },
        { '@type': 'Offer', name: 'Ultimate Plan', price: '14.99', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${BASE_URL}${prefix}/premium` },
      ],
    },
  };

  const getBreadcrumbs = (pageName, pagePath) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}${prefix}/` },
      { '@type': 'ListItem', position: 2, name: pageName, item: `${BASE_URL}${prefix}${pagePath}` },
    ],
  });

  const getSubBreadcrumbs = (parentName, parentPath, childName, childPath) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}${prefix}/` },
      { '@type': 'ListItem', position: 2, name: parentName, item: `${BASE_URL}${prefix}${parentPath}` },
      { '@type': 'ListItem', position: 3, name: childName, item: `${BASE_URL}${prefix}${childPath}` },
    ],
  });

  if (route.path === '/') {
    return [orgSchema, websiteSchema, softwareSchema, homeFaq];
  }
  if (route.path === '/premium') {
    return [premiumProduct, premiumFaq, getBreadcrumbs('Premium Plans', '/premium')];
  }
  if (route.path === '/docs') {
    return [websiteSchema, getBreadcrumbs('Documentation', '/docs')];
  }
  if (route.path === '/docs/commands') {
    return [websiteSchema, getSubBreadcrumbs('Documentation', '/docs', 'Slash Commands', '/docs/commands')];
  }
  if (route.path === '/docs/feeds') {
    return [websiteSchema, getSubBreadcrumbs('Documentation', '/docs', 'Feed Sources', '/docs/feeds')];
  }
  if (route.path === '/docs/setup') {
    return [websiteSchema, getSubBreadcrumbs('Documentation', '/docs', 'Setup Guide', '/docs/setup')];
  }
  if (route.path === '/support') {
    return [getBreadcrumbs('Support Center', '/support')];
  }
  if (route.path === '/changelog') {
    return [getBreadcrumbs('Changelog', '/changelog')];
  }
  if (route.path === '/privacy') {
    return [getBreadcrumbs('Privacy Policy', '/privacy')];
  }
  if (route.path === '/terms') {
    return [getBreadcrumbs('Terms of Service', '/terms')];
  }

  return [orgSchema, websiteSchema];
}

function generateSemanticHtmlBody(route, currentLocale, targetUrlPath) {
  const isEn = currentLocale === 'en';
  const prefix = isEn ? '' : `/${currentLocale}`;
  const inviteUrl =
    'https://discord.com/oauth2/authorize?client_id=1541869073867083947&permissions=277025508352&scope=bot%20applications.commands';
  const supportUrl = 'https://discord.gg/tjRStPtm9k';

  const headerHtml = `
  <a href="#main-content" class="skipToContent">Skip to main content</a>
  <header style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); max-width: 1200px; margin: 0 auto;">
    <a href="${prefix || '/'}" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: #fff; font-weight: 800; font-size: 20px;">
      <picture>
        <source type="image/avif" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
        <source type="image/webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" />
        <source type="image/jpeg" srcSet="/images/logo.jpg 1x, /images/logo.jpg 2x" />
        <img src="/images/logo.webp" srcSet="/images/logo.webp 1x, /images/logo.webp 2x" sizes="36px" alt="Nova Feeds — Next-Generation Discord Notification Bot" width="36" height="36" decoding="async" style="border-radius: 8px;" />
      </picture>
      <span>Nova Feeds</span>
    </a>
    <nav aria-label="Main Navigation" style="display: flex; gap: 20px; align-items: center;">
      <a href="${prefix}/premium" style="color: #94a3b8; text-decoration: none; font-weight: 500;">Premium</a>
      <a href="${prefix}/docs" style="color: #94a3b8; text-decoration: none; font-weight: 500;">Documentation</a>
      <a href="${prefix}/support" style="color: #94a3b8; text-decoration: none; font-weight: 500;">Support</a>
      <a href="${prefix}/changelog" style="color: #94a3b8; text-decoration: none; font-weight: 500;">Changelog</a>
      <a href="${inviteUrl}" style="background: #5865f2; color: #fff; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Add to Discord</a>
    </nav>
  </header>`;

  const footerHtml = `
  <footer style="padding: 40px 24px; border-top: 1px solid rgba(255,255,255,0.08); max-width: 1200px; margin: 60px auto 0; color: #64748b; font-size: 14px;">
    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
      <div>
        <p style="font-weight: 700; color: #fff; margin-bottom: 8px;">Nova Feeds</p>
        <p>© 2026 NovaFeeds. All rights reserved.</p>
      </div>
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a>
        <a href="${prefix}/docs" style="color: #94a3b8; text-decoration: none;">Docs</a>
        <a href="${prefix}/premium" style="color: #94a3b8; text-decoration: none;">Premium</a>
        <a href="${prefix}/support" style="color: #94a3b8; text-decoration: none;">Support</a>
        <a href="${prefix}/changelog" style="color: #94a3b8; text-decoration: none;">Changelog</a>
        <a href="${prefix}/privacy" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
        <a href="${prefix}/terms" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
      </div>
    </div>
  </footer>`;

  let mainContent = '';

  if (route.path === '/') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <section style="text-align: center; padding: 40px 0 60px;">
        <div style="display: inline-block; padding: 6px 14px; background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 9999px; color: #38bdf8; font-size: 13px; font-weight: 700; margin-bottom: 20px;">
          ⚡ NEXT-GEN DISCORD NOTIFICATIONS
        </div>
        <h1 style="font-size: 48px; font-weight: 900; line-height: 1.15; margin-bottom: 20px; color: #fff;">
          Elevate Your Server Feeds <span style="background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Lightning Fast</span>
        </h1>
        <p style="font-size: 20px; color: #94a3b8; max-width: 750px; margin: 0 auto 32px; line-height: 1.5;">
          ${route.description}
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="${inviteUrl}" style="background: #5865f2; color: #fff; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px; box-shadow: 0 4px 20px rgba(88, 101, 242, 0.4);">
            Add to Discord — It's Free
          </a>
          <a href="${prefix}/premium" style="background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px;">
            Explore Premium Plans
          </a>
        </div>
      </section>

      <section style="padding: 40px 0;">
        <h2 style="font-size: 32px; font-weight: 800; text-align: center; color: #fff; margin-bottom: 32px;">
          Supported Platforms & Social Feeds
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
            <h3 style="color: #ef4444; font-size: 20px; margin-bottom: 10px;">🔴 YouTube & Twitch Live</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.4;">Instant stream go-live pings, upload drops, clips, and custom @everyone/@here or custom role mentions.</p>
          </article>
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
            <h3 style="color: #10b981; font-size: 20px; margin-bottom: 10px;">🎮 Free Games & Steam Deals</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.4;">Automated 100% discount alerts for Epic Games Store weekly freebies, Steam specials, and GOG giveaways.</p>
          </article>
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
            <h3 style="color: #38bdf8; font-size: 20px; margin-bottom: 10px;">⚡ Kick & Custom RSS Feeds</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.4;">Real-time Kick stream tracker plus universal RSS/Atom parser with sub-second asyncio background polling.</p>
          </article>
        </div>
      </section>

      <section style="padding: 40px 0;">
        <h2 style="font-size: 32px; font-weight: 800; text-align: center; color: #fff; margin-bottom: 32px;">
          Frequently Asked Questions
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px; max-width: 800px; margin: 0 auto;">
          <details style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
            <summary style="font-weight: 700; color: #fff; cursor: pointer; font-size: 17px;">What platforms does Nova support?</summary>
            <p style="color: #94a3b8; margin-top: 12px; line-height: 1.5;">Nova supports YouTube uploads, Twitch streams, Kick streams, Epic Games free store drops, Steam deals, TMDB movie releases, and any standard RSS/Atom feeds.</p>
          </details>
          <details style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
            <summary style="font-weight: 700; color: #fff; cursor: pointer; font-size: 17px;">How fast are social notifications delivered?</summary>
            <p style="color: #94a3b8; margin-top: 12px; line-height: 1.5;">Free servers receive updates within standard 2-minute cycles. Premium servers enjoy sub-second or 15-second priority dispatch queues.</p>
          </details>
          <details style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px;">
            <summary style="font-weight: 700; color: #fff; cursor: pointer; font-size: 17px;">Is Nova free to use?</summary>
            <p style="color: #94a3b8; margin-top: 12px; line-height: 1.5;">Yes! Nova offers a fully functional Free Tier with up to 5 feed monitors, rich embeds, and automatic cleanup.</p>
          </details>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/premium') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Premium Plans</li>
        </ol>
      </nav>
      <section style="text-align: center; padding: 20px 0 40px;">
        <h1 style="font-size: 44px; font-weight: 900; color: #fff; margin-bottom: 16px;">
          ${route.title}
        </h1>
        <p style="font-size: 19px; color: #94a3b8; max-width: 700px; margin: 0 auto 36px;">
          ${route.description}
        </p>
      </section>

      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 48px;">
        <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; text-align: center;">
          <h3 style="color: #fff; font-size: 20px;">Free Tier</h3>
          <p style="font-size: 32px; font-weight: 900; color: #fff; margin: 12px 0;">$0 <span style="font-size: 14px; color: #94a3b8;">/mo</span></p>
          <p style="color: #94a3b8; font-size: 14px;">5 monitors, standard 2-minute cycle</p>
        </article>
        <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; text-align: center;">
          <h3 style="color: #38bdf8; font-size: 20px;">Starter</h3>
          <p style="font-size: 32px; font-weight: 900; color: #fff; margin: 12px 0;">$3.99 <span style="font-size: 14px; color: #94a3b8;">/mo</span></p>
          <p style="color: #94a3b8; font-size: 14px;">15 monitors, sub-60s fast polling</p>
        </article>
        <article style="background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 16px; padding: 24px; text-align: center;">
          <h3 style="color: #38bdf8; font-size: 20px;">Professional</h3>
          <p style="font-size: 32px; font-weight: 900; color: #fff; margin: 12px 0;">$7.99 <span style="font-size: 14px; color: #94a3b8;">/mo</span></p>
          <p style="color: #94a3b8; font-size: 14px;">40 monitors, sub-15s rapid polling, custom branding</p>
        </article>
        <article style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 24px; text-align: center;">
          <h3 style="color: #fbbf24; font-size: 20px;">Ultimate</h3>
          <p style="font-size: 32px; font-weight: 900; color: #fff; margin: 12px 0;">$14.99 <span style="font-size: 14px; color: #94a3b8;">/mo</span></p>
          <p style="color: #94a3b8; font-size: 14px;">Unlimited monitors, sub-second real-time priority queue</p>
        </article>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/support" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #a855f7; font-size: 16px; margin-bottom: 4px;">Community Support</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">24/7 Discord help & troubleshooting</p>
          </a>
          <a href="${prefix}/changelog" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #34d399; font-size: 16px; margin-bottom: 4px;">Changelog</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Latest version releases & notes</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/docs') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Documentation</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 32px;">${route.description}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 32px;">
          <a href="${prefix}/docs/setup" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 18px; margin-bottom: 8px;">🛡️ Setup & Permissions</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Step-by-step bot authorization and webhook channel configuration.</p>
          </a>
          <a href="${prefix}/docs/feeds" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #10b981; font-size: 18px; margin-bottom: 8px;">📡 Feed Sources</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Configure YouTube, Twitch, Kick, Free Games, Steam, and RSS.</p>
          </a>
          <a href="${prefix}/docs/commands" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #a855f7; font-size: 18px; margin-bottom: 8px;">⌨️ Slash Commands</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Full reference for bot slash commands and parameter flags.</p>
          </a>
        </div>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
          <a href="${prefix}/support" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #a855f7; font-size: 16px; margin-bottom: 4px;">Community Support</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">24/7 Discord help & troubleshooting</p>
          </a>
          <a href="${prefix}/changelog" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #34d399; font-size: 16px; margin-bottom: 4px;">Changelog</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Latest version releases & notes</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/docs/commands') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li><a href="${prefix}/docs" style="color: #94a3b8; text-decoration: none;">Documentation</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Slash Commands</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 32px;">${route.description}</p>
        <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #38bdf8; font-size: 20px; margin-bottom: 12px;">Core Feed Management Commands</h2>
          <ul style="color: #94a3b8; line-height: 1.8; font-size: 15px; padding-left: 20px;">
            <li><code>/feed add [platform] [handle/url]</code> — Add a new stream or upload feed monitor.</li>
            <li><code>/feed list</code> — List all active feed monitors for the current server.</li>
            <li><code>/feed remove [id]</code> — Remove an existing feed monitor.</li>
            <li><code>/feed test [platform]</code> — Dispatch a sample notification embed to test channel permissions.</li>
            <li><code>/help</code> — Display interactive command palette and documentation links.</li>
          </ul>
        </article>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/docs/feeds') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li><a href="${prefix}/docs" style="color: #94a3b8; text-decoration: none;">Documentation</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Feed Sources</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 32px;">${route.description}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
            <h3 style="color: #ef4444; font-size: 18px; margin-bottom: 8px;">🔴 YouTube & Twitch</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Support for channel IDs, custom handles (@username), live stream detection, and video upload drops.</p>
          </article>
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
            <h3 style="color: #10b981; font-size: 18px; margin-bottom: 8px;">🎮 Free Games & Steam Deals</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Automatic tracking of Epic Games weekly freebies, Steam store price drops, and GOG promotions.</p>
          </article>
          <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
            <h3 style="color: #38bdf8; font-size: 18px; margin-bottom: 8px;">⚡ Kick & Custom RSS</h3>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Sub-second polling for Kick live streams and universal RSS 2.0 / Atom 1.0 XML feeds.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/docs/setup') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li><a href="${prefix}/docs" style="color: #94a3b8; text-decoration: none;">Documentation</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Setup Guide</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 32px;">${route.description}</p>
        <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
          <h2 style="color: #fff; font-size: 22px; margin-bottom: 16px;">Step-by-Step Setup Guide</h2>
          <ol style="color: #94a3b8; line-height: 1.8; font-size: 15px; padding-left: 20px;">
            <li><strong>Authorize Bot:</strong> Use the "Add to Discord" button with Manage Server permissions.</li>
            <li><strong>Required Permissions:</strong> Ensure Nova has <code>Send Messages</code>, <code>Embed Links</code>, and <code>Manage Webhooks</code> in destination channels.</li>
            <li><strong>Add Monitor:</strong> Execute <code>/feed add [platform] [handle/url]</code> in your selected Discord channel.</li>
          </ol>
        </article>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/support') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Support</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px; text-align: center;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; max-width: 650px; margin: 0 auto 32px;">${route.description}</p>
        <a href="${supportUrl}" style="background: #5865f2; color: #fff; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 16px; display: inline-block;">
          Join Discord Support Server
        </a>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
          <a href="${prefix}/changelog" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #34d399; font-size: 16px; margin-bottom: 4px;">Changelog</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Latest version releases & notes</p>
          </a>
        </div>
      </section>
    </main>`;
  } else if (route.path === '/changelog') {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">Changelog</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; margin-bottom: 32px;">${route.description}</p>
        <article style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
          <h2 style="color: #38bdf8; font-size: 22px; margin-bottom: 12px;">v2.0.0 — Next-Gen High-Performance Release</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Full architecture rewrite with sub-second polling queue, multi-language internationalization across 19 languages, Enterprise hardened CSP security, and real-time dashboard controls.</p>
        </article>
      </section>

      <section aria-labelledby="related-pages-heading" style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 id="related-pages-heading" style="color: #fff; font-size: 20px; font-weight: 700; margin-bottom: 20px;">Explore More Resources</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <a href="${prefix}/docs" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 4px;">Documentation</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Setup guides & command reference</p>
          </a>
          <a href="${prefix}/premium" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #fbbf24; font-size: 16px; margin-bottom: 4px;">Premium Plans</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sub-second polling & priority queue</p>
          </a>
          <a href="${prefix}/support" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; text-decoration: none; color: #fff; display: block;">
            <h3 style="color: #a855f7; font-size: 16px; margin-bottom: 4px;">Community Support</h3>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">24/7 Discord help & troubleshooting</p>
          </a>
        </div>
      </section>
    </main>`;
  } else {
    mainContent = `
    <main id="main-content" style="max-width: 1100px; margin: 0 auto; padding: 40px 20px;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 24px; color: #64748b; font-size: 14px;">
        <ol style="display: flex; gap: 8px; list-style: none; padding: 0;">
          <li><a href="${prefix || '/'}" style="color: #94a3b8; text-decoration: none;">Home</a></li>
          <li>/</li>
          <li style="color: #fff; font-weight: 600;">${route.title}</li>
        </ol>
      </nav>
      <section style="padding: 20px 0 40px;">
        <h1 style="font-size: 40px; font-weight: 900; color: #fff; margin-bottom: 16px;">${route.title}</h1>
        <p style="font-size: 18px; color: #94a3b8; line-height: 1.6;">${route.description}</p>
      </section>
    </main>`;
  }

  return `${headerHtml}\n${mainContent}\n${footerHtml}`;
}

function renderHtmlForRoute(template, route, currentLocale = 'en', targetUrlPath = route.path) {
  const masterCanonicalUrl = `${BASE_URL}${route.path}`;
  const pageUrl = `${BASE_URL}${targetUrlPath}`;
  const hreflangTags = generateAlternateHreflangTags(route.path);
  const ogImg = route.ogImage || `${BASE_URL}/images/og/og-home.webp`;
  const currentOgLocale = LOCALE_TO_OG_LOCALE[currentLocale] || 'en_US';
  const ogLocaleAlternates = generateOgLocaleAlternateTags(currentLocale);
  const jsonLdSchemas = generateJsonLdForRoute(route, currentLocale);
  const semanticBody = generateSemanticHtmlBody(route, currentLocale, targetUrlPath);

  let html = template;

  // Remove existing base template JSON-LD to avoid duplicates
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  // Inject Rich Semantic Pre-rendered Content into #root
  html = html.replace('<div id="root"></div>', `<div id="root">${semanticBody}</div>`);

  // Set html lang attribute
  html = html.replace(/<html lang=".*?"/gi, `<html lang="${currentLocale}"`);

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${route.title}</title>`);
  html = html.replace(
    /<meta name="title" content=".*?" \/>/gi,
    `<meta name="title" content="${route.title}" />`
  );

  // Replace Description & Keywords
  if (route.description) {
    html = html.replace(
      /<meta name="description" content=".*?" \/>/gi,
      `<meta name="description" content="${route.description}" />`
    );
  }
  if (route.keywords) {
    html = html.replace(
      /<meta name="keywords" content=".*?" \/>/gi,
      `<meta name="keywords" content="${route.keywords}" />`
    );
  }

  // Replace Open Graph Meta
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/gi,
    `<meta property="og:title" content="${route.title}" />`
  );
  if (route.description) {
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/gi,
      `<meta property="og:description" content="${route.description}" />`
    );
  }
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/gi,
    `<meta property="og:url" content="${pageUrl}" />`
  );
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/gi,
    `<meta property="og:image" content="${ogImg}" />`
  );
  html = html.replace(
    /<meta property="og:image:secure_url" content=".*?" \/>/gi,
    `<meta property="og:image:secure_url" content="${ogImg}" />`
  );
  html = html.replace(
    /<meta property="og:image:alt" content=".*?" \/>/gi,
    `<meta property="og:image:alt" content="${route.title}" />`
  );
  html = html.replace(
    /<meta property="og:locale" content=".*?" \/>/gi,
    `<meta property="og:locale" content="${currentOgLocale}" />`
  );

  // Replace Twitter Meta (using spec-compliant name attribute)
  html = html.replace(
    /<meta (?:name|property)="twitter:card" content=".*?" \/>/gi,
    `<meta name="twitter:card" content="summary_large_image" />`
  );
  html = html.replace(
    /<meta (?:name|property)="twitter:title" content=".*?" \/>/gi,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  if (route.description) {
    html = html.replace(
      /<meta (?:name|property)="twitter:description" content=".*?" \/>/gi,
      `<meta name="twitter:description" content="${route.description}" />`
    );
  }
  html = html.replace(
    /<meta (?:name|property)="twitter:url" content=".*?" \/>/gi,
    `<meta name="twitter:url" content="${pageUrl}" />`
  );
  html = html.replace(
    /<meta (?:name|property)="twitter:image" content=".*?" \/>/gi,
    `<meta name="twitter:image" content="${ogImg}" />`
  );
  html = html.replace(
    /<meta (?:name|property)="twitter:image:alt" content=".*?" \/>/gi,
    `<meta name="twitter:image:alt" content="${route.title}" />`
  );

  // Generate JSON-LD script blocks
  const jsonLdTags = jsonLdSchemas
    .map(
      (schema) =>
        `    <script type="application/ld+json" data-nova-seo="jsonld">\n      ${JSON.stringify(
          schema,
          null,
          2
        ).replace(/\n/g, '\n      ')}\n    </script>`
    )
    .join('\n');

  // Inject Master Canonical (pointing to default unprefixed route), Hreflang, OG Locale Alternates & JSON-LD Scripts before </head>
  const injection = `    <link rel="canonical" href="${masterCanonicalUrl}" />\n${hreflangTags}\n${ogLocaleAlternates}\n${jsonLdTags}\n  </head>`;
  html = html.replace(/<\/head>/i, injection);

  return html;
}




function renderNoindexShell(template, route) {
  let html = template;
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${route.title}</title>`);
  const metaInjection = `    <meta name="robots" content="noindex, nofollow" />\n  </head>`;
  html = html.replace(/<\/head>/i, metaInjection);
  return html;
}

function writeHtmlToDisk(relativeRoutePath, htmlContent) {
  const targetDir =
    relativeRoutePath === '/'
      ? distDir
      : path.join(distDir, relativeRoutePath.replace(/^\//, ''));

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf-8');
}

function getFilesLastModifiedDate(filePaths = []) {
  if (!filePaths || filePaths.length === 0) {
    return new Date().toISOString().split('T')[0];
  }

  // 1. Try Git log timestamp
  try {
    const existingPaths = filePaths.filter((fp) => fs.existsSync(path.resolve(webRootDir, fp)));
    if (existingPaths.length > 0) {
      const gitDate = execSync(`git log -1 --format=%cs -- ${existingPaths.join(' ')}`, {
        cwd: webRootDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
        return gitDate;
      }
    }
  } catch {
    // Git command not available or failed
  }

  // 2. Fallback to filesystem mtime
  try {
    let latestMtime = 0;
    for (const fp of filePaths) {
      const fullPath = path.resolve(webRootDir, fp);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const subFiles = fs.readdirSync(fullPath);
          for (const subFile of subFiles) {
            const subStats = fs.statSync(path.join(fullPath, subFile));
            if (subStats.mtimeMs > latestMtime) latestMtime = subStats.mtimeMs;
          }
        } else if (stats.mtimeMs > latestMtime) {
          latestMtime = stats.mtimeMs;
        }
      }
    }
    if (latestMtime > 0) {
      return new Date(latestMtime).toISOString().split('T')[0];
    }
  } catch {
    // FS fallback failed
  }

  return new Date().toISOString().split('T')[0];
}

function generateSitemapIndexAndChildSitemaps() {
  const publicSitemapsDir = path.join(publicDir, 'sitemaps');
  const distSitemapsDir = path.join(distDir, 'sitemaps');

  [publicSitemapsDir, distSitemapsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const sitemapFiles = [];

  // 1. Generate Main Root Sitemap (Default / Unprefixed)
  const mainUrls = [];
  let latestMainLastmod = '1970-01-01';

  publicMarketingRoutes.forEach((route) => {
    const cleanPath = route.path === '/' ? '' : route.path;
    const loc = `${BASE_URL}${route.path}`;
    const routeLastmod = getFilesLastModifiedDate(route.sourceFiles);

    if (routeLastmod > latestMainLastmod) {
      latestMainLastmod = routeLastmod;
    }

    const xhtmlLinksList = LOCALES.map(
      (lang) =>
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}/${lang}${cleanPath}" />`
    );
    xhtmlLinksList.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${cleanPath || '/'}" />`
    );
    const xhtmlLinks = xhtmlLinksList.join('\n');

    mainUrls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${routeLastmod}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.8'}</priority>
${xhtmlLinks}
  </url>`);
  });

  const mainSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${mainUrls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(publicSitemapsDir, 'sitemap-main.xml'), mainSitemapXml, 'utf-8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distSitemapsDir, 'sitemap-main.xml'), mainSitemapXml, 'utf-8');
  }
  sitemapFiles.push({ filename: 'sitemap-main.xml', lastmod: latestMainLastmod, count: mainUrls.length });

  // 2. Generate Dedicated Language-Specific Sitemaps
  let totalLocalizedUrls = 0;
  LOCALES.forEach((lang) => {
    const langUrls = [];
    let latestLangLastmod = '1970-01-01';

    publicMarketingRoutes.forEach((route) => {
      if (route.isLocalized) {
        const cleanPath = route.path === '/' ? '' : route.path;
        const localizedLoc = `${BASE_URL}/${lang}${cleanPath}`;

        const localeFiles = [...(route.sourceFiles || [])];
        if (lang !== 'en') {
          localeFiles.push(`src/i18n/locales/${lang}`);
        }
        const routeLastmod = getFilesLastModifiedDate(localeFiles);

        if (routeLastmod > latestLangLastmod) {
          latestLangLastmod = routeLastmod;
        }

        const xhtmlLinksList = LOCALES.map(
          (altLang) =>
            `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${cleanPath}" />`
        );
        xhtmlLinksList.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${cleanPath || '/'}" />`
        );
        const xhtmlLinks = xhtmlLinksList.join('\n');

        langUrls.push(`  <url>
    <loc>${localizedLoc}</loc>
    <lastmod>${routeLastmod}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${(Number(route.priority || 0.8) * 0.9).toFixed(1)}</priority>
${xhtmlLinks}
  </url>`);
      }
    });

    const langSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${langUrls.join('\n')}
</urlset>`;

    const fileName = `sitemap-${lang}.xml`;
    fs.writeFileSync(path.join(publicSitemapsDir, fileName), langSitemapXml, 'utf-8');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distSitemapsDir, fileName), langSitemapXml, 'utf-8');
    }
    sitemapFiles.push({ filename: fileName, lastmod: latestLangLastmod, count: langUrls.length });
    totalLocalizedUrls += langUrls.length;
  });

  // 3. Generate Master Sitemap Index (sitemap.xml)
  const sitemapIndexEntries = sitemapFiles.map(
    (item) => `  <sitemap>
    <loc>${BASE_URL}/sitemaps/${item.filename}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </sitemap>`
  );

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf-8');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapIndexXml, 'utf-8');
  }

  console.log(
    `  ✓ Generated master sitemap.xml Index with ${sitemapFiles.length} sub-sitemaps (${mainUrls.length + totalLocalizedUrls} total URLs partitioned by language with dynamic lastmod)`
  );
}


function generateRobotsTxt() {
  const content = `# ==============================================================================
# Nova Feeds — Enterprise Crawling Rules & Robots Exclusion Protocol
# ==============================================================================

User-agent: *
Allow: /
Allow: /images/

# Disallow private API endpoints, consoles, dashboards, auth callbacks, and dev catalog
Disallow: /api/
Disallow: /auth/
Disallow: /servers
Disallow: /dashboard/
Disallow: /dev/
Disallow: /components

# Crawl budget optimization for rate-sensitive crawlers (Bing, Yandex, Baidu, DuckDuckBot)
Crawl-delay: 1

# Host directive for Yandex and compatible search engines
Host: ${BASE_URL}

# Sitemap declaration
Sitemap: ${BASE_URL}/sitemap.xml
`;

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'robots.txt'), content, 'utf-8');
  }
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), content, 'utf-8');
  }

  console.log(`  ✓ Generated dynamic robots.txt pointing to ${BASE_URL}/sitemap.xml`);
}

function runPrerender() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('Prerender error: dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  console.log('⚡ Generating Static Pre-rendered HTML Shells (Root + All 19 Language Routes)...');

  let generatedCount = 0;

  // 1. Generate Root Marketing Routes
  publicMarketingRoutes.forEach((route) => {
    const html = renderHtmlForRoute(template, route, 'en', route.path);
    writeHtmlToDisk(route.path, html);
    generatedCount += 1;
  });
  console.log(`  ✓ Pre-rendered ${publicMarketingRoutes.length} root routes`);

  // 2. Generate Localized per-language route shells (/:lang/...)
  let localizedCount = 0;
  const localizableRoutes = publicMarketingRoutes.filter((r) => r.isLocalized);

  LOCALES.forEach((locale) => {
    localizableRoutes.forEach((route) => {
      const cleanSubPath = route.path === '/' ? '' : route.path;
      const localizedRoutePath = `/${locale}${cleanSubPath}`;

      const html = renderHtmlForRoute(template, route, locale, localizedRoutePath);
      writeHtmlToDisk(localizedRoutePath, html);
      localizedCount += 1;
      generatedCount += 1;
    });
  });

  // 3. Generate Noindex SPA Entry Shells for Private App Routes
  privateNoindexRoutes.forEach((route) => {
    const html = renderNoindexShell(template, route);
    writeHtmlToDisk(route.path, html);
    generatedCount += 1;
  });
  console.log(`  ✓ Pre-rendered ${privateNoindexRoutes.length} private app shells with noindex`);

  // 4. Generate XML Sitemap Index, Child Sitemaps & Robots.txt
  generateSitemapIndexAndChildSitemaps();
  generateRobotsTxt();

  console.log(`  ✓ Pre-rendered ${localizedCount} localized routes (${LOCALES.length} languages × ${localizableRoutes.length} pages)`);
  console.log(`✨ Total: ${generatedCount} static HTML shells + sitemap.xml & robots.txt generated!`);
}


runPrerender();
