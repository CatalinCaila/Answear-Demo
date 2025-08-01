// tests/ui/compare.user.spec.ts

import { test } from '../../fixtures/auth/roleFixture';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { logger } from '../../utils/logger';

/**
 * UI test verifying product comparison functionality across pagination for authenticated users.
 */
test.describe('@dev @qa @prod @ui @search @pagination', () => {
  test('User can compare products across pagination', async ({ page, translations }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    const locale = (testInfo.project.use.locale || 'ro').toUpperCase();

    logger.info(`[Compare Products][${locale}] Test started: User compares products across pages at ${baseURL}.`);

    const searchPage = new SearchPageWeb(page);
    await page.goto(`${baseURL}/c/barbati`);

    logger.info(`[Compare Products][${locale}] Navigated to men’s clothing category page.`);

    await searchPage.compareValueOfPage1And2();

    logger.info(`[Compare Products][${locale}] ✅ Product comparison across pagination completed successfully.`);
  });
});