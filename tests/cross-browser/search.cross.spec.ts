// tests/cross-browser/crossdevice.search.spec.ts
import { mergeTests } from '@playwright/test';
import { test as roleTest, expect } from '../../fixtures/auth/roleFixture';
import { test as searchTest } from '../../fixtures/searchItem';

import { PageFactory } from '../../utils/helpers/pageFactory';
import type { ProductResponse } from '../../schemas/products.schema';
import { logger } from '../../utils/logger';
import { assertHomepageLoaded } from '../../utils/helpers/homepageHelper';


export const test = mergeTests(roleTest, searchTest);

/**
 * UI test suite to verify search functionality across both desktop and mobile.
 */
test.describe('@dev @qa @prod @ui @crossdevice @search', () => {
  test('Search works on both mobile and desktop', async ({ page, isMobile, searchItem, translations }) => {
    // Determine the current testing platform based on the viewport (mobile or desktop)
    const platform: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop';
    logger.info(`[CrossDevice Search] Running search test on ${platform}.`);

    // Instantiate the appropriate page object using a PageFactory based on platform
    const searchPage = PageFactory.getSearchPage(page, platform);

    // Navigate to the homepage of Answear.ro
    await page.goto('/');
    logger.info('[CrossDevice Search] Navigated to https://answear.ro/.');

     await assertHomepageLoaded(page);
     logger.info('[CrossDevice Search] Homepage loaded and verified.');

    // Select the 'Men' category if applicable (optional chaining used)
    await searchPage.selectMenCategory?.(translations);
    logger.info(`[CrossDevice Search] Men category selected.`);

    await searchPage.assertMenURL(translations);

    // Execute the search functionality and capture the response
    const data: ProductResponse = await searchPage.searchForItem(searchItem);
    logger.info(`[CrossDevice Search] Search executed with term "${searchItem}".`);

   

    // Validate that at least one product item is returned in the search response
    expect(data.items.length).toBeGreaterThan(0);
    logger.info(`[CrossDevice Search] ✅ Search returned ${data.items.length} items.`);

    // Further validate that the returned items contain the search term
    const matchingProducts = data.items.filter(item =>
      item.name.toLowerCase().includes(searchItem.toLowerCase()),
    );

    expect(matchingProducts.length).toBeGreaterThan(0);
    logger.info(
      `[CrossDevice Search] ✅ ${matchingProducts.length} products contain "${searchItem}".`,
    );
  });
});
