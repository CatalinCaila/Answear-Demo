import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { fetchSearchResults } from '../utils/api/products';

test('should return products when search query is valid via direct API', async () => {
  const results = await fetchSearchResults('pantaloni');

  expect(results.items.length).toBeGreaterThan(0);
  console.log('✅ First product:', results.items[0]?.name ?? 'No products found');
});

test('should return products when search query is valid using SearchPage class [UI]', async ({ page }) => {
  const searchPage = new SearchPage(page);

  await page.goto('https://answear.ro/', { waitUntil: 'domcontentloaded' });

  // Optional: Ensure we start in the men’s category
  await searchPage.selectMenCategory?.(); // Use optional chaining if this method is conditional

  const results = await searchPage.searchForItem('pantaloni');

  expect(results.items.length).toBeGreaterThan(0);
  console.log('✅ First product:', results.items[0].name);
});
