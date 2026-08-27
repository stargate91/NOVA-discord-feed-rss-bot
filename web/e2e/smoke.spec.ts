import { test, expect } from '@playwright/test';

test.describe('Nova Web Smoke Test Suite', () => {
  test('should load the homepage and display key brand elements', async ({ page }) => {
    await page.goto('/');

    // Verify title and brand header
    await expect(page).toHaveTitle(/Nova Feeds/i);
    const heroHeader = page.locator('h1');
    await expect(heroHeader).toBeVisible();

    // Verify Discord add button
    const ctaButton = page.getByRole('link', { name: /Add to Discord/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should switch between dark and light themes smoothly', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /theme/i }).first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', /(light|dark)/);
    }
  });
});
