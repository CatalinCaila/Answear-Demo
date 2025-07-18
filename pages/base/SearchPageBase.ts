// pages/base/SearchPageBase.ts

import type { Page } from '@playwright/test';
import { CookieBanner } from '../common/CookieBanner';
import type { ProductResponse } from '../../schemas/products.schema';
import { waitAndParseProductApi } from '../../utils/api/waitAndParseProductApi';
import { logger } from '../../utils/logger';

/**
 * Abstract base class defining common search functionalities
 * across different platform implementations (web and mobile).
 */
export abstract class SearchPageBase {
  protected readonly page: Page;
  readonly cookieBanner: CookieBanner;

  /**
   * Constructor initializes the page instance and cookie banner.
   * @param page - Playwright's Page instance for browser interaction.
   */
  constructor(page: Page) {
    this.page = page;
    this.cookieBanner = new CookieBanner(page);
    logger.info(`[SearchPageBase] Initialized base class`);
  }

  /**
   * Abstract method to select "Men" category from the navigation menu.
   * Implementation is platform-specific.
   */
  abstract selectMenCategory(): Promise<void>;

  /**
   * Abstract method to fill in the search input field.
   * @param item - The search term to enter into the input field.
   */
  abstract fillSearchInput(item: string): Promise<void>;

  /**
   * Abstract method to click the search button.
   */
  abstract clickSearchButton(): Promise<void>;

  /**
   * Performs a search for the given item, triggering the search button click
   * and waiting for API response parsing.
   *
   * @param item - The search term to query.
   * @returns Parsed response data conforming to ProductResponse schema.
   */
  async searchForItem(item: string): Promise<ProductResponse> {
    logger.info(`[SearchPageBase] searchForItem started with query: "${item}"`);
    await this.fillSearchInput(item);
    logger.info(`[SearchPageBase] Filled search input with "${item}"`);

    const [data] = await Promise.all([
      waitAndParseProductApi(this.page),
      this.clickSearchButton(),
    ]);

    logger.info(
      `[SearchPageBase] Search completed successfully. Items returned: ${data.items.length}`,
    );

    return data;
  }
}
