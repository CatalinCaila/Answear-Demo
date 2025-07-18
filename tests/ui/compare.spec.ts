// tests/ui/compare.user.spec.ts

import { test } from '../../fixtures/auth/roleFixture';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { logger } from '../../utils/logger';

/**
 * UI test verifying product comparison functionality across pagination for authenticated users.
 */
test.describe('@ui @search @pagination', () => {
  test('User can compare products', async ({ page }) => {
    logger.info('[Compare Products] Test started: User can compare products across pages.');
    
    const searchPage = new SearchPageWeb(page);
    await page.goto('https://answear.ro/c/barbati', { waitUntil: 'networkidle' });
    logger.info('[Compare Products] Navigated to men’s clothing category page.');

    await searchPage.compareValueOfPage1And2();
    
    logger.info('[Compare Products] ✅ Product comparison test completed successfully.');
  });
});
