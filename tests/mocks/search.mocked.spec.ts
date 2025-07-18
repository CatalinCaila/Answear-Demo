import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { test, expect } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { logger } from '../../utils/logger';

// Define __dirname explicitly for ESM compatibility
const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('@dev @qa @prod @ui @mock @search', () => {
  test('UI shows mocked search results', async ({ page }) => {
    // Load mocked API response from fixtures
    const mockFilePath = path.resolve(__dirname, '../../fixtures/products.mock.json');
    const mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    logger.info(`[Mocked Search] Loaded mock data from "${mockFilePath}".`);

    // Intercept API request and provide mocked response
    await page.route('**/api/products', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      })
    );

    logger.info('[Mocked Search] Navigating to men’s clothing category page.');
    await page.goto('https://answear.ro/c/barbati', { waitUntil: 'domcontentloaded' });

    const searchPage = new SearchPageWeb(page);
    const results = await searchPage.searchForItem('mock');

    expect(results.items[0].name).toBe('Mocked Pantaloni');
    logger.info('[Mocked Search] ✅ Mocked product result verified successfully.');
  });
});
