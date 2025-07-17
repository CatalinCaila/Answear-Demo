// pages/common/CookieBanner.ts

import type { Locator, Page } from '@playwright/test';
import { logger } from '../../utils/logger';

/**
 * Represents the Cookie Consent banner displayed on initial page load.
 */
export class CookieBanner {
  private readonly acceptButton: Locator;

  /**
   * Initializes the CookieBanner instance with the locator for the accept button.
   *
   * @param page - Playwright Page object.
   */
  constructor(private readonly page: Page) {
    this.acceptButton = page.getByTestId('cookiesAcceptButton');
    logger.info(`[CookieBanner] Initialized CookieBanner locator.`);
  }

  /**
   * Clicks the accept button if visible to dismiss the cookie consent banner.
   */
  async clickIfPresent(): Promise<void> {
    logger.info(`[CookieBanner] Checking if cookie banner is visible.`);
    if (await this.acceptButton.isVisible()) {
      await this.acceptButton.click();
      logger.info('✅ Cookie banner accepted.');
    } else {
      logger.info('ℹ️ Cookie banner not present or already accepted.');
    }
  }
}
