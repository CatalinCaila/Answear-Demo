// tests/mocks/search.mocked.spec.ts

import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { logger } from '../../utils/logger';

/**
 * UI test suite verifying product search results with mocked API responses.
 */
test.describe('@dev @qa @prod @ui @mock @search', () => {
  test('UI shows mocked search results', async ({ page }) => {
    // Load mocked API response from fixtures
    const mockFilePath = path.resolve(__dirname, '../../fixtures/products.mock.json');
    const mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf-8'));
    logger.info(`[Mocked Search] Loaded mock data from "${mockFilePath}".`);

    // Mock the products API call
    await page.route('**/api/products', async route => {
      logger.info('[Mocked Search] Intercepted API request. Responding with mocked data.');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });

    // Perform UI actions
    await page.goto('https://answear.ro/c/barbati', { waitUntil: 'domcontentloaded' });
    logger.info('[Mocked Search] Navigated to men’s clothing category page.');

    const searchPage = new SearchPageWeb(page);
    const results = await searchPage.searchForItem('mock');

    // Assert mocked results
    expect(results.items[0].name).toBe('Mocked Pantaloni');
    logger.info('[Mocked Search] ✅ Mocked product result verified successfully.');
  });
});
