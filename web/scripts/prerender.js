import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const BASE_URL = 'https://novafeeds.xyz';

const publicMarketingRoutes = [
  {
    path: '/',
    title: 'Nova Feeds — Next-Generation Discord Notification Bot',
    description:
      'Lightning-fast social notifications, media drops, release alerts, and live stream updates for your Discord community. Powered by resilient asyncio worker architecture.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/premium',
    title: 'Premium Subscription & Tier Plans — Nova Feeds',
    description:
      'Unlock sub-second polling, unlimited feed monitors, custom branding, and priority queue delivery for your Discord servers.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/docs',
    title: 'Documentation & API Guides — Nova Feeds',
    description:
      'Explore developer guides, feed configuration tutorials, webhook integration, and architectural documentation for Nova.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/support',
    title: 'Support & Community Help Center — Nova Feeds',
    description:
      'Get live assistance, report bugs, join our Discord community, and find answers to common setup questions.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/changelog',
    title: 'Changelog & Release Notes — Nova Feeds',
    description:
      'See recent feature drops, architectural speed improvements, platform additions, and security enhancements.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — Nova Feeds',
    description:
      'Learn how Nova protects your Discord server data, encryption standards, and privacy commitments.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/terms',
    title: 'Terms of Service — Nova Feeds',
    description:
      'Read the terms of service governing usage of the Nova notification platform and bot services.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: true,
  },
  {
    path: '/servers',
    title: 'Select Server — Nova Feeds Dashboard',
    description:
      'Manage notification feeds, live streams, and automated delivery schedules for your Discord servers.',
    ogImage: `${BASE_URL}/images/logo.webp`,
    isLocalized: false,
  },
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
];

function generateAlternateHreflangTags(routePath) {
  const cleanPath = routePath === '/' ? '' : routePath;
  const tags = LOCALES.map(
    (loc) => `    <link rel="alternate" hreflang="${loc}" href="${BASE_URL}/${loc}${cleanPath}" />`
  );
  tags.push(`    <link rel="alternate" hreflang="x-default" href="${BASE_URL}${cleanPath || '/'}" />`);
  return tags.join('\n');
}

function renderHtmlForRoute(template, route, currentLocale = 'en', targetUrlPath = route.path) {
  const canonicalUrl = `${BASE_URL}${targetUrlPath}`;
  const hreflangTags = generateAlternateHreflangTags(route.path);
  const ogImg = route.ogImage || `${BASE_URL}/images/logo.webp`;

  let html = template;

  // Set html lang attribute
  html = html.replace(/<html lang=".*?"/gi, `<html lang="${currentLocale}"`);

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${route.title}</title>`);
  html = html.replace(/<meta name="title" content=".*?" \/>/gi, `<meta name="title" content="${route.title}" />`);

  // Replace Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/gi,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace Open Graph Meta
  html = html.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${route.title}" />`);
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/gi,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(/<meta property="og:url" content=".*?" \/>/gi, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/gi, `<meta property="og:image" content="${ogImg}" />`);

  // Replace Twitter Meta
  html = html.replace(/<meta property="twitter:title" content=".*?" \/>/gi, `<meta property="twitter:title" content="${route.title}" />`);
  html = html.replace(
    /<meta property="twitter:description" content=".*?" \/>/gi,
    `<meta property="twitter:description" content="${route.description}" />`
  );
  html = html.replace(/<meta property="twitter:url" content=".*?" \/>/gi, `<meta property="twitter:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="twitter:image" content=".*?" \/>/gi, `<meta property="twitter:image" content="${ogImg}" />`);

  // Inject Canonical & Hreflang Tags before </head>
  const injection = `    <link rel="canonical" href="${canonicalUrl}" />\n${hreflangTags}\n  </head>`;
  html = html.replace(/<\/head>/i, injection);

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

function runPrerender() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('Prerender error: dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  console.log('⚡ Generating Static Pre-rendered HTML Shells (Root + All 17 Language Routes)...');

  let generatedCount = 0;

  // 1. Generate Root Routes
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

  console.log(`  ✓ Pre-rendered ${localizedCount} localized routes (${LOCALES.length} languages × ${localizableRoutes.length} pages)`);
  console.log(`✨ Total: ${generatedCount} static pre-rendered HTML shells generated with full SEO, Open Graph & Hreflang alternate metadata!`);
}

runPrerender();
