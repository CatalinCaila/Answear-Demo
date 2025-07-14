import { test, expect } from '@playwright/test';
import { PageFactory } from '../utils/helpers/pageFactory';;
import type { ProductResponse } from '../schemas/products.schema';

//test('Mobile test', async ({ page }) => {
// await page.goto('https://answear.ro/');
// await page.locator('a.btn').nth(1).click();
// await page.getByTestId('cart_count').waitFor({ state: 'visible' });
// await page.getByTestId('search_icon').click();
// await page.locator('#productsSearch').fill(''); 
// await page.locator('#productsSearch').fill('pantaloni');
// await page.locator('div[class*="searchIconButtonWrapper"]').click();
// await page.pause();


//});

test('should return products when search query is valid using SearchPage class [UI]', async ({ page }) => {
  const searchPage = PageFactory.getSearchPage("mobile", page);

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
