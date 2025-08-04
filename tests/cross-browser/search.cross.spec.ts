// tests/cross-browser/crossdevice.search.spec.ts
import { mergeTests } from '@playwright/test';
import { test as roleTest, expect } from '../../fixtures/auth/roleFixture';
import { test as searchTest } from '../../fixtures/data/searchItem';
import { PageFactory } from '../../utils/helpers/pageFactory';
import type { ProductResponse } from '../../schemas/products.schema';
import { logger } from '../../utils/logger/logger';
import { assertHomepageLoaded } from '../../utils/helpers/homepageHelper';

export const test = mergeTests(roleTest, searchTest);

/**
 * UI test suite to verify search functionality across desktop and mobile devices.
 */
test.describe('@dev @qa @prod @ui @crossdevice @search', () => {
  test('Search functionality works correctly on desktop and mobile', async ({
    page,
    isMobile,
    searchItem,
    translations,
  }) => {
    const platform = isMobile ? 'mobile' : 'desktop';
    logger.info(`[CrossDevice Search] Starting test on ${platform}.`);

    // Instantiate the appropriate page object based on the platform
    const searchPage = PageFactory.getSearchPage(page, platform);

    // Navigate to homepage
    await page.goto('/');
    logger.info('[CrossDevice Search] Navigated to homepage.');

    // Verify homepage has loaded successfully
    await assertHomepageLoaded(page);
    logger.info('[CrossDevice Search] Homepage verified successfully.');

    // Select the 'Men' category if available
    if (searchPage.selectMenCategory) {
      await searchPage.selectMenCategory(translations);
      logger.info('[CrossDevice Search] "Men" category selected.');

      await searchPage.assertMenURL(translations);
      logger.info('[CrossDevice Search] Men category URL assertion passed.');
    }

    // Perform search operation
    const data: ProductResponse = await searchPage.searchForItem(searchItem);
    logger.info(`[CrossDevice Search] Search executed for item: "${searchItem}".`);

    // Verify that search returned at least one result
    expect(data.items).not.toHaveLength(0);
    logger.info(`[CrossDevice Search] ✅ Search returned ${data.items.length} item(s).`);

    // Ensure returned items contain the search term
    const matchingProducts = data.items.filter(item =>
      item.name.toLowerCase().includes(searchItem.toLowerCase()),
    );

    expect(matchingProducts).not.toHaveLength(0);
    logger.info(
      `[CrossDevice Search] ✅ ${matchingProducts.length} product(s) matched the term "${searchItem}".`,
    );
  });
});
