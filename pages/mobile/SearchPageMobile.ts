// pages/mobile/SearchPageMobile.ts

import type { Locator, Page } from '@playwright/test';
import { SearchPageBase } from '../base/SearchPageBase';
import { logger } from '../../utils/logger';

/**
 * Mobile-specific implementation of search page functionality.
 */
export class SearchPageMobile extends SearchPageBase {
  readonly menCategory: Locator;
  readonly searchIcon: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartCount: Locator;

  /**
   * Initializes locators specific to mobile version of the search page.
   * @param page - Playwright's Page instance.
   */
  constructor(page: Page) {
    super(page);
    this.menCategory = page.locator('a.btn').nth(1);
    this.searchIcon = page.getByTestId('search_icon');
    this.searchInput = page.locator('#productsSearch');
    this.searchButton = page.locator(
      'div[data-test="search_component"] i.multiTheme-icon-search',
    );
    this.cartCount = page.getByTestId('cart_count');

    logger.info(`[SearchPageMobile] Initialized mobile locators.`);
  }

  /**
   * Clicks on the "Men" category.
   */
  async selectMenCategory(): Promise<void> {
    logger.info(`[SearchPageMobile] Selecting men category.`);
    await this.menCategory.click();
  }

  /**
   * Opens search input and fills it with the specified search term.
   * @param item - Search term to input.
   */
  async fillSearchInput(item: string): Promise<void> {
    logger.info(`[SearchPageMobile] Filling search input with "${item}".`);
    await this.cartCount.waitFor({ state: 'visible' });
    await this.searchIcon.click();
    await this.searchInput.fill('');
    await this.searchInput.fill(item);
  }

  /**
   * Clicks the search button to initiate the search.
   */
  async clickSearchButton(): Promise<void> {
    logger.info(`[SearchPageMobile] Clicking search button.`);
    await this.searchButton.click();
  }
}
