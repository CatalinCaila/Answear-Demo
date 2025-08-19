import type { Locator, Page } from '@playwright/test';
import { logger } from '../logger/logger';

type CookieBannerOptions = {
  /** Max time to wait for the banner/button to appear (ms). */
  timeoutMs?: number;
  /** Wait for DOM to be ready before searching the banner. */
  waitForDomContentLoaded?: boolean;
};

/**
 * Represents the Cookie Consent banner displayed on initial page load.
 */
export class CookieBanner {
  private readonly acceptButton: Locator;
  private readonly options: Required<CookieBannerOptions>;

  /**
   * Initializes the CookieBanner instance with the locator for the accept button.
   *
   * @param page - Playwright Page object.
   * @param options - Control waiting behavior.
   */
  constructor(
    private readonly page: Page,
    options?: CookieBannerOptions,
  ) {
    // Adjust the test id if your app uses a different attribute.
    this.acceptButton = page.getByTestId('cookiesAcceptButton').first();

    this.options = {
      timeoutMs: options?.timeoutMs ?? 25_000, // generous default
      waitForDomContentLoaded: options?.waitForDomContentLoaded ?? true,
    };

    logger.info('[CookieBanner] Initialized CookieBanner locator.');
  }

  /**
   * Clicks the accept button if visible to dismiss the cookie consent banner.
   * Waits up to `timeoutMs` for the banner to appear.
   */
  async clickIfPresent(): Promise<void> {
    logger.info('[CookieBanner.clickIfPresent] Start — checking cookie banner.');

    if (this.options.waitForDomContentLoaded) {
      await this.page.waitForLoadState('domcontentloaded');
    }

    try {
      // Wait for the button to become visible within the configured timeout.
      await this.acceptButton.waitFor({ state: 'visible', timeout: this.options.timeoutMs });

      // Optional: trial click to ensure it's actionable before the real click.
      await this.acceptButton.click({ trial: true }).catch(() => { /* noop */ });

      await this.acceptButton.click();
      logger.info('✅ Cookie banner accepted.');
    } catch (err) {
      // If wait timed out or element detached, check once more without waiting.
      const stillVisible = await this.acceptButton.isVisible().catch(() => false);

      if (stillVisible) {
        await this.acceptButton.click();
        logger.info('✅ Cookie banner accepted (after visibility re-check).');
      } else {
        logger.info('ℹ️ Cookie banner not present or already accepted.');
      }
    } finally {
      logger.info('[CookieBanner.clickIfPresent] End.');
    }
  }
}
