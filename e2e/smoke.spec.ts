import { expect, test } from '@playwright/test';

test('room ac calculator renders and updates result', async ({ page }) => {
  await page.goto('/room-ac-btu-calculator/');
  await expect(page.getByRole('heading', { name: 'Room AC BTU Calculator' })).toBeVisible();
  await expect(page.getByText(/BTU\/h/)).toBeVisible();
  await page.getByLabel('Area override sq ft').fill('300');
  await expect(page.getByText(/5,500-6,500 BTU\/h/)).toBeVisible();
});
