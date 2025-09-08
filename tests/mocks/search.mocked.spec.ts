import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { test, expect } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { logger } from '../../utils/logger/logger';

// __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('@dev @qa @stage @ui @mock @search', () => {
  test('UI shows mocked search results', async ({ page }) => {
    // …load mock…
    const mockFilePath = path.resolve(__dirname, '../../fixtures/mocks/products.mock.json');
    const mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    await page.route('**/api/products', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      })
    );

    logger.info('[Mocked Search] Navigating to men’s clothing category page.');
    await page.goto('/c/barbati');

    const searchPage = new SearchPageWeb(page);
    const results = await searchPage.searchForItem('mock');
    expect(results.items[0].name).toBe('Mocked Pantaloni');
    logger.info('[Mocked Search] ✅ Mocked product result verified successfully.');
  });
});
