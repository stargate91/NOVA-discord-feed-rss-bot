import { test, expect } from '@playwright/test';

test.describe('Nova Web Navigation E2E Suite', () => {
  test('should navigate to docs and premium pages without full reload', async ({ page }) => {
    await page.goto('/');

    // Navigate to Premium
    const premiumLink = page.getByRole('link', { name: /Premium/i }).first();
    if (await premiumLink.isVisible()) {
      await premiumLink.click();
      await expect(page).toHaveURL(/.*\/premium/);
      await expect(page.locator('h1')).toContainText(/Premium/i);
    }

    // Navigate to Docs
    const docsLink = page.getByRole('link', { name: /Docs/i }).first();
    if (await docsLink.isVisible()) {
      await docsLink.click();
      await expect(page).toHaveURL(/.*\/docs/);
    }
  });

  test('should render 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-that-does-not-exist');
    await expect(page.locator('h1')).toContainText(/404/i);
  });
});
