import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { SearchPage } from '../pages/SearchPage';

test('UI shows mocked search results', async ({ page }) => {
  // 1. Setup mock route
  await page.route('**/api/products', async route => {
    const mockData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../fixtures/products.mock.json'), 'utf-8')
    );

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });

  // 2. Perform search flow
  await page.goto('https://answear.ro/c/barbati');
  const searchPage = new SearchPage(page);
  await searchPage.searchForItem('pantaloni');

  // 3. Assert mock result appears
  await expect(page.locator('text=pantaloni')).toBeVisible();
});
