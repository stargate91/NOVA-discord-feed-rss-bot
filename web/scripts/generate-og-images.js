import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_OG_DIR = path.resolve(__dirname, '../public/images/og');
const IMAGES_OG_DIR = path.resolve(__dirname, '../images/og');
const LOGO_PATH = path.resolve(__dirname, '../public/images/logo.webp');

// Ensure output directories exist
[PUBLIC_OG_DIR, IMAGES_OG_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Convert logo to base64 data URI for standalone rendering
const logoBase64 = fs.existsSync(LOGO_PATH)
  ? `data:image/webp;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : '';

const OG_CARDS = [
  {
    id: 'og-home',
    badge: '⚡ NEXT-GEN DISCORD NOTIFICATIONS',
    badgeColor: '#0ea5e9',
    badgeBg: 'rgba(14, 165, 233, 0.15)',
    badgeBorder: 'rgba(14, 165, 233, 0.4)',
    title: 'Elevate Your Server Feeds',
    highlight: 'Lightning Fast',
    highlightGradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    description:
      'Sub-second stream notifications, free game drops & custom media alerts for YouTube, Twitch, Kick, Epic Games, Steam Deals & RSS.',
    tags: [
      { text: '🎮 Free Games Alert', color: '#10b981' },
      { text: '🔴 Twitch & YouTube', color: '#ef4444' },
      { text: '⚡ Sub-Second Polling', color: '#38bdf8' },
      { text: '🛡️ 99.9% Reliable', color: '#a855f7' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(14, 165, 233, 0.35) 0%, transparent 60%)',
    accentBorder: '#0ea5e9',
  },
  {
    id: 'og-premium',
    badge: '👑 ULTRA-FAST DELIVERY & UNLIMITED MONITORS',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    title: 'Supercharge Your Community with',
    highlight: 'Nova Premium',
    highlightGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
    description:
      'Unlock sub-second feed frequency, custom branded Discord embeds, unlimited monitor quotas, and priority dispatch queues.',
    tags: [
      { text: '⚡ Instant Sub-Second Delivery', color: '#fbbf24' },
      { text: '🎨 Custom Embed Branding', color: '#ec4899' },
      { text: '👑 Unlimited Feeds', color: '#8b5cf6' },
      { text: '💎 20% Yearly Discount', color: '#10b981' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.35) 0%, transparent 60%)',
    accentBorder: '#f59e0b',
  },
  {
    id: 'og-docs',
    badge: '📖 DEVELOPER GUIDES & SETUP MANUALS',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    badgeBorder: 'rgba(139, 92, 246, 0.4)',
    title: 'Complete Setup Guides &',
    highlight: 'Slash Commands Reference',
    highlightGradient: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #38bdf8 100%)',
    description:
      'Step-by-step guides for channel permissions, feed configuration, webhook integrations, and rich Discord message formatting.',
    tags: [
      { text: '🚀 Quickstart in 60s', color: '#38bdf8' },
      { text: '🛡️ Permission Helper', color: '#10b981' },
      { text: '⚡ Slash Commands API', color: '#a78bfa' },
      { text: '⚙️ Webhooks & RSS', color: '#f59e0b' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.35) 0%, transparent 60%)',
    accentBorder: '#8b5cf6',
  },
  {
    id: 'og-support',
    badge: '💬 24/7 COMMUNITY HELP & SUPPORT CENTER',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    title: 'Need Assistance? We Are Here to',
    highlight: 'Help You 24/7',
    highlightGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    description:
      'Join our vibrant Discord community server, access troubleshooting guides, report feed issues, and get direct assistance.',
    tags: [
      { text: '💬 Live Discord Support', color: '#5865f2' },
      { text: '❓ Interactive FAQs', color: '#34d399' },
      { text: '⚡ Quick Bug Resolution', color: '#38bdf8' },
      { text: '🤝 Active Community', color: '#a855f7' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 60%)',
    accentBorder: '#10b981',
  },
  {
    id: 'og-changelog',
    badge: '🚀 CONTINUOUS UPDATES & RELEASE NOTES',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(236, 72, 153, 0.4)',
    title: 'Platform Releases & Feature',
    highlight: 'Changelog Notes',
    highlightGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #a855f7 100%)',
    description:
      'Explore recent speed enhancements, new platform feed adapters, security upgrades, and user dashboard improvements.',
    tags: [
      { text: '✨ Version Releases', color: '#f472b6' },
      { text: '⚡ Speed Improvements', color: '#38bdf8' },
      { text: '🔒 Security Hardening', color: '#10b981' },
      { text: '🌐 Multi-Language Support', color: '#fbbf24' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(236, 72, 153, 0.35) 0%, transparent 60%)',
    accentBorder: '#ec4899',
  },
  {
    id: 'og-legal',
    badge: '🛡️ SECURITY, PRIVACY & LEGAL POLICIES',
    badgeColor: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    badgeBorder: 'rgba(99, 102, 241, 0.4)',
    title: 'Terms of Service &',
    highlight: 'Privacy Commitment',
    highlightGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    description:
      'Transparent privacy standards, zero token sharing, secure encrypted data storage, and strict Discord API compliance.',
    tags: [
      { text: '🔒 Encrypted Storage', color: '#818cf8' },
      { text: '📜 Clear Terms of Service', color: '#38bdf8' },
      { text: '🛡️ Server Data Safety', color: '#10b981' },
      { text: '✅ GDPR & CCPA Ready', color: '#fbbf24' },
    ],
    accentGlow: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.35) 0%, transparent 60%)',
    accentBorder: '#6366f1',
  },
];

function generateHtmlCard(card) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #070a12;
      font-family: 'Inter', sans-serif;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Ambient cyber glows */
    .bg-glow-1 {
      position: absolute;
      top: -100px;
      right: -50px;
      width: 650px;
      height: 650px;
      background: ${card.accentGlow};
      filter: blur(80px);
      border-radius: 50%;
      pointer-events: none;
    }

    .bg-glow-2 {
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
      filter: blur(90px);
      border-radius: 50%;
      pointer-events: none;
    }

    /* Grid pattern */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(circle at 60% 40%, black 40%, transparent 80%);
      pointer-events: none;
    }

    /* Outer Container Frame */
    .card-container {
      width: 1120px;
      height: 550px;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .card-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: ${card.highlightGradient};
    }

    /* Header Row */
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-img {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 25px rgba(14, 165, 233, 0.4);
    }

    .brand-text {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-domain {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.06);
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      letter-spacing: 0.5px;
    }

    .badge-pill {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      color: ${card.badgeColor};
      background: ${card.badgeBg};
      border: 1px solid ${card.badgeBorder};
      padding: 8px 18px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 20px ${card.badgeBg};
    }

    /* Main Content */
    .content-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 900px;
    }

    .headline {
      font-family: 'Outfit', sans-serif;
      font-size: 46px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1px;
      color: #ffffff;
    }

    .headline-highlight {
      background: ${card.highlightGradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .description {
      font-size: 20px;
      line-height: 1.45;
      color: #94a3b8;
      font-weight: 400;
    }

    /* Footer Tags */
    .tags-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .tag-item {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="bg-grid"></div>

  <div class="card-container">
    <div class="header-row">
      <div class="brand-group">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Nova Feeds — Next-Generation Discord Notification Bot" class="logo-img" />` : ''}
        <div class="brand-text">Nova Feeds <span class="brand-domain">novafeeds.xyz</span></div>
      </div>
      <div class="badge-pill">${card.badge}</div>
    </div>

    <div class="content-block">
      <h1 class="headline">
        ${card.title} <span class="headline-highlight">${card.highlight}</span>
      </h1>
      <p class="description">${card.description}</p>
    </div>

    <div class="tags-row">
      ${card.tags
        .map(
          (t) => `
        <div class="tag-item">
          <span class="tag-dot" style="background: ${t.color}; box-shadow: 0 0 8px ${t.color}"></span>
          <span>${t.text}</span>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
</body>
</html>`;
}

async function renderOgImages() {
  console.log('🎨 Generating High-Resolution 1200x630 & 1200x1200 Social Preview (OG) Images with Playwright...');

  const browser = await chromium.launch({ headless: true });
  
  // 1. Landscape 1200x630 context (Twitter / Facebook / Discord)
  const landscapeContext = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  const landscapePage = await landscapeContext.newPage();

  // 2. Square 1200x1200 context (WhatsApp / Telegram / WeChat)
  const squareContext = await browser.newContext({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1.5,
  });
  const squarePage = await squareContext.newPage();

  for (const card of OG_CARDS) {
    const html = generateHtmlCard(card);

    // Render Landscape 1200x630
    await landscapePage.setContent(html, { waitUntil: 'networkidle' });
    const publicPngPath = path.join(PUBLIC_OG_DIR, `${card.id}.png`);
    const publicWebpPath = path.join(PUBLIC_OG_DIR, `${card.id}.webp`);
    const repoPngPath = path.join(IMAGES_OG_DIR, `${card.id}.png`);
    const repoWebpPath = path.join(IMAGES_OG_DIR, `${card.id}.webp`);

    const pngBuffer = await landscapePage.screenshot({ type: 'png' });
    fs.writeFileSync(publicPngPath, pngBuffer);
    fs.writeFileSync(repoPngPath, pngBuffer);

    const webpDataUrl = await landscapePage.evaluate(async (base64Png) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 630;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 1200, 630);
          resolve(canvas.toDataURL('image/webp', 0.88));
        };
        img.src = `data:image/png;base64,${base64Png}`;
      });
    }, pngBuffer.toString('base64'));

    const webpBuffer = Buffer.from(webpDataUrl.replace(/^data:image\/webp;base64,/, ''), 'base64');
    fs.writeFileSync(publicWebpPath, webpBuffer);
    fs.writeFileSync(repoWebpPath, webpBuffer);

    // Render Square 1200x1200 for WhatsApp / messaging
    await squarePage.setContent(html, { waitUntil: 'networkidle' });
    const squarePngPath = path.join(PUBLIC_OG_DIR, `${card.id}-square.png`);
    const squareWebpPath = path.join(PUBLIC_OG_DIR, `${card.id}-square.webp`);

    const squarePngBuffer = await squarePage.screenshot({ type: 'png' });
    fs.writeFileSync(squarePngPath, squarePngBuffer);

    const squareWebpDataUrl = await squarePage.evaluate(async (base64Png) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 1200, 1200);
          resolve(canvas.toDataURL('image/webp', 0.88));
        };
        img.src = `data:image/png;base64,${base64Png}`;
      });
    }, squarePngBuffer.toString('base64'));

    const squareWebpBuffer = Buffer.from(squareWebpDataUrl.replace(/^data:image\/webp;base64,/, ''), 'base64');
    fs.writeFileSync(squareWebpPath, squareWebpBuffer);

    console.log(
      `  ✓ Created OG images: ${card.id}.webp (1200x630) & ${card.id}-square.webp (1200x1200 square)`
    );
  }

  await browser.close();
  console.log(`✨ Successfully generated all ${OG_CARDS.length} landscape & square OpenGraph images!`);
}

renderOgImages().catch((err) => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});
