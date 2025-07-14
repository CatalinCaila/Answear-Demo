// webSearch
import { test, expect } from '@playwright/test';
import { SearchPageWeb } from '../pages/web/SearchPageWeb';
import { fetchSearchResults } from '../utils/api/products';
import { PageFactory } from '../utils/helpers/pageFactory';
import type { ProductResponse } from '../schemas/products.schema';

test('should return products when search query is valid via direct API', async () => {
  const results = await fetchSearchResults('pantaloni');

  expect(results.items.length).toBeGreaterThan(0);
  console.log('✅ First product:', results.items[0]?.name ?? 'No products found');
});


test('should return products when search query is valid using SearchPage class [UI]', async ({ page }) => {
  // Get the web version of the SearchPage class (since this is a "web" test project)
  const searchPage = PageFactory.getSearchPage("web", page);

  // Navigate to the homepage and wait for DOM to load
  // Step 1: Go to homepage
  await page.goto('https://answear.ro/', { waitUntil: 'domcontentloaded' });

  // Step 2: Select men category (if applicable)
  await searchPage.selectMenCategory?.();

  // Step 3: Define search term and perform search
  const searchTerm = 'pantaloni';
  const data: ProductResponse = await searchPage.searchForItem(searchTerm); // 👈 Add type here

  // Step 4: Assert result list is not empty
  expect(data.items.length).toBeGreaterThan(0);
  console.log('✅ Search returned', data.items.length, 'items');

  // Step 5: Assert that at least one product name contains the search term
  const matchingProducts = data.items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  expect(matchingProducts.length).toBeGreaterThan(0);
  console.log(`✅ Found ${matchingProducts.length} product(s) containing '${searchTerm}'`);
});
