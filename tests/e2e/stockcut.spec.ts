import { expect, test } from '@playwright/test';

test('375px mobile sheet workflow can optimize and print layout remains visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/sheet-cutting-optimizer');
  await page.getByRole('button', { name: 'Optimize' }).click();
  await expect(page.getByText('Basic cut sequence')).toBeVisible();
  await expect(page.locator('svg[role="img"]').first()).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('svg[role="img"]').first()).toBeVisible();
});

test('linear workflow optimizes and shows stock bars', async ({ page }) => {
  await page.goto('/linear-cutting-optimizer');
  await page.getByRole('button', { name: 'Optimize' }).click();
  await expect(page.getByText('Kerf loss')).toBeVisible();
  await expect(page.getByText(/Used .* offcut/)).toBeVisible();
});
