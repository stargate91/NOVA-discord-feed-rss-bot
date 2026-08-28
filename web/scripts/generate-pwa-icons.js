import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const ICONS_DIR = path.resolve(__dirname, '../public/images/icons');
const LOGO_PATH = path.resolve(__dirname, '../public/images/logo.webp');

if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const logoBase64 = fs.existsSync(LOGO_PATH)
  ? `data:image/webp;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : '';

const SIZES = [
  { name: 'icon-192x192', size: 192 },
  { name: 'icon-384x384', size: 384 },
  { name: 'icon-512x512', size: 512 },
  { name: 'apple-touch-icon', size: 180, isApple: true },
];

async function generatePwaIcons() {
  console.log('📱 Generating Multi-Resolution PWA & Apple Touch Icons with Playwright...');
  const browser = await chromium.launch({ headless: true });

  for (const { name, size, isApple } of SIZES) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #070a12;
      overflow: hidden;
    }
    img {
      width: ${Math.round(size * 0.88)}px;
      height: ${Math.round(size * 0.88)}px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="${logoBase64}" alt="Nova Icon" />
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle' });

    // Output paths
    const pngPath = isApple
      ? path.join(PUBLIC_DIR, 'apple-touch-icon.png')
      : path.join(ICONS_DIR, `${name}.png`);
    const webpPath = path.join(ICONS_DIR, `${name}.webp`);

    const pngBuffer = await page.screenshot({ type: 'png' });
    fs.writeFileSync(pngPath, pngBuffer);

    if (isApple) {
      // Also copy to icons dir
      fs.writeFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), pngBuffer);
    }

    // Convert to WebP via Canvas
    const webpDataUrl = await page.evaluate(async ({ base64Png, canvasSize }) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = canvasSize;
          canvas.height = canvasSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
          resolve(canvas.toDataURL('image/webp', 0.92));
        };
        img.src = `data:image/png;base64,${base64Png}`;
      });
    }, { base64Png: pngBuffer.toString('base64'), canvasSize: size });

    const webpBuffer = Buffer.from(webpDataUrl.replace(/^data:image\/webp;base64,/, ''), 'base64');
    fs.writeFileSync(webpPath, webpBuffer);

    console.log(`  ✓ Generated ${name}.png (${(pngBuffer.length / 1024).toFixed(1)} KB) & ${name}.webp (${(webpBuffer.length / 1024).toFixed(1)} KB)`);
    await page.close();
  }

  await browser.close();
  console.log('✨ All PWA and Apple Touch icons generated successfully!');
}

generatePwaIcons().catch((err) => {
  console.error('Error generating PWA icons:', err);
  process.exit(1);
});
