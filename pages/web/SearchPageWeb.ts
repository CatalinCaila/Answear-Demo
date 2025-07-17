// pages/web/SearchPageWeb.ts

import type { Locator, Page } from '@playwright/test';
import { SearchPageBase } from '../base/SearchPageBase';
import { logger } from '../../utils/logger';
import { expect } from '@playwright/test';

/**
 * Web-specific implementation of search page functionality.
 */
export class SearchPageWeb extends SearchPageBase {
  readonly menCategory: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCardDescription: Locator;
  readonly page2Button: Locator;
  readonly cartCount: Locator;

  /**
   * Initializes locators specific to web version of the search page.
   * @param page - Playwright's Page instance.
   */
  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search_input');
    this.menCategory = page.getByTestId('menuMaleCategory');
    this.searchButton = page.getByTestId('search_button');
    this.productCardDescription = page.locator('[data-test="productCardDescription"] >> span');
    this.page2Button = page.locator('[data-test="paginationPageNumbersItem"] >> text=2');
    this.cartCount = page.getByTestId('cart_count');

    logger.info(`[SearchPageWeb] Initialized web locators.`);
  }

  /**
   * Clicks on the "Men" category after ensuring visibility.
   */
  async selectMenCategory(): Promise<void> {
    logger.info(`[SearchPageWeb] Selecting men category.`);
    await this.menCategory.waitFor({ state: 'visible', timeout: 5000 });
    await this.menCategory.click();
  }

  /**
   * Fills the search input explicitly with the provided search term.
   * @param item - Search term to input.
   */
  async fillSearchInput(item: string): Promise<void> {
    logger.info(`[SearchPageWeb] Filling search input with "${item}".`);
    await this.cartCount.waitFor({ state: 'visible' });
    await this.searchInput.fill('');
    await this.searchInput.fill(item);
  }

  /**
   * Clicks the search button explicitly to perform a search.
   */
  async clickSearchButton(): Promise<void> {
    logger.info(`[SearchPageWeb] Clicking search button.`);
    await this.searchButton.click();
  }

  /**
   * Compares the product results on page 1 and page 2 of the search results.
   * Ensures that the results differ to validate pagination functionality.
   */
  async compareValueOfPage1And2(): Promise<void> {
    logger.info(`[SearchPageWeb] Navigating to men's category page.`);
    await this.page.goto('https://answear.ro/c/barbati', { waitUntil: 'domcontentloaded' });

    logger.info(`[SearchPageWeb] Initiating search for "pantaloni".`);
    await this.cartCount.waitFor({ state: 'visible' });
    await this.fillSearchInput('pantaloni');
    await this.searchInput.press('Enter');

    const productDescriptions = this.page.locator('[data-test="productCardDescription"] span');
    await productDescriptions.first().waitFor({ state: 'visible', timeout: 15000 });

    const page1Names = await productDescriptions.allTextContents();
    logger.info(`[SearchPageWeb] Page 1 first product: ${page1Names[0]}`);

    logger.info(`[SearchPageWeb] Navigating to page 2.`);
    await this.page2Button.waitFor({ state: 'visible', timeout: 50000 });
    await this.page2Button.click();

    await productDescriptions.first().waitFor({ state: 'visible', timeout: 15000 });
    const page2Names = await productDescriptions.allTextContents();
    logger.info(`[SearchPageWeb] Page 2 first product: ${page2Names[0]}`);

    expect(page1Names).not.toEqual(page2Names);
    logger.info(`[SearchPageWeb] Product names on pages 1 and 2 differ as expected.`);
  }
}
