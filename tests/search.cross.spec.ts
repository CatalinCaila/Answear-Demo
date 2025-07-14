import { test, expect } from '@playwright/test';
import { PageFactory } from '../utils/helpers/pageFactory';
import type { ProductResponse } from '../schemas/products.schema';
import { fetchSearchResults } from '../utils/api/products';

test('should return products when search query is valid via direct API', async () => {
  const results = await fetchSearchResults('pantaloni');

  expect(results.items.length).toBeGreaterThan(0);
  console.log('✅ First product:', results.items[0]?.name ?? 'No products found');
});

test('Search works on both mobile and desktop', async ({ page }, testInfo) => {
  const platform = testInfo.project.name as 'desktop' | 'mobile';
  const searchPage = PageFactory.getSearchPage(page);

  await page.goto('https://answear.ro/', { waitUntil: 'domcontentloaded' });

  await searchPage.selectMenCategory?.();

  const searchTerm = 'pantaloni';
  const data: ProductResponse = await searchPage.searchForItem(searchTerm);

  expect(data.items.length).toBeGreaterThan(0);
  console.log(`[${platform}] ✅ Search returned ${data.items.length} items`);

  const matching = data.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  expect(matching.length).toBeGreaterThan(0);
  console.log(`[${platform}] ✅ ${matching.length} products contain '${searchTerm}'`);
});
