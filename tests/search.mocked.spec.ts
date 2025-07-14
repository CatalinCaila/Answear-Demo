import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { SearchPageWeb } from '../pages/web/SearchPageWeb';

// Test to verify that the UI can correctly display mocked product results
test('UI shows mocked search results', async ({ page }) => {
  // Read the mock API response from a local JSON file
  const mockData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../fixtures/products.mock.json'), 'utf-8')
  );

  // Intercept the real /api/products call and respond with mock data instead
  await page.route('**/api/products', async route => {
    route.fulfill({
      status: 200, // Simulate success response
      contentType: 'application/json',
      body: JSON.stringify(mockData)
    });
  });

  // Navigate to the men's clothing category page
  await page.goto('https://answear.ro/c/barbati', { waitUntil: 'domcontentloaded' });

  // Use the SearchPage Page Object to trigger the search
  const searchPage = new SearchPageWeb(page);
  const results = await searchPage.searchForItem('mock');

  // Validate that the mocked product is shown correctly in the response
  expect(results.items[0].name).toBe('Mocked Pantaloni');
});
