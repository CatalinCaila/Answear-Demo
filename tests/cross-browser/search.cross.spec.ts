// tests/cross-browser/crossdevice.search.spec.ts

import { test, expect } from '@playwright/test';
import { PageFactory } from '../../utils/helpers/pageFactory';
import type { ProductResponse } from '../../schemas/products.schema';
import { logger } from '../../utils/logger';

/**
 * UI test suite to verify search functionality across both desktop and mobile.
 */
test.describe('@ui @crossdevice @search', () => {
  test('Search works on both mobile and desktop', async ({ page, isMobile }) => {
    const platform: 'mobile' | 'desktop' = isMobile ? 'mobile' : 'desktop';
    logger.info(`[CrossDevice Search] Running search test on ${platform}.`);

    const searchPage = PageFactory.getSearchPage(page, platform);
    await page.goto('https://answear.ro/', { waitUntil: 'domcontentloaded' });

    await searchPage.selectMenCategory?.();
    logger.info(`[CrossDevice Search] Men category selected.`);

    const searchTerm = 'pantaloni';
    const data: ProductResponse = await searchPage.searchForItem(searchTerm);

    expect(data.items.length).toBeGreaterThan(0);
    logger.info(`[CrossDevice Search] ✅ Search returned ${data.items.length} items.`);

    const matchingProducts = data.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    expect(matchingProducts.length).toBeGreaterThan(0);
    logger.info(
      `[CrossDevice Search] ✅ ${matchingProducts.length} products contain "${searchTerm}".`,
    );
  });
});
