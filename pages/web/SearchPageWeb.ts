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
  readonly userloggedIcon: Locator;
  readonly logoAnswear: Locator;

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
    this.userloggedIcon = page.locator('[id="Icon/User-logged-2"]');
    this.logoAnswear = page.locator('img[alt="logo answear"]');

    logger.info(`[SearchPageWeb] Initialized web locators.`);
  }



  /**
   * Fills the search input explicitly with the provided search term.
   * After Search input field will be present just on desktop, using assertSearchItem
   * @param item - Search term to input.
   */
  async fillSearchInput(item: string): Promise<void> {
    logger.info(`[SearchPageWeb] Filling search input with "${item}".`);
    await this.userloggedIcon.waitFor({ state: 'visible' });
    await this.searchInput.fill('');
    await this.searchInput.fill(item);
    await this.assertSearchItem(item);
  }

  async assertSearchItem(item: string): Promise<void> {
    await expect
      .soft(this.searchInput, `Search input should have value "${item}"`)
      .toHaveValue(item);
    logger.info(`[SearchPageWeb] ✅ Soft-asserted search input has value "${item}".`);
  }


  async compareValueOfPage1And2(): Promise<void> {
    logger.info(`[SearchPageWeb] Navigating to men's category page.`);
    await this.page.goto('https://answear.ro/c/barbati');
    await this.userloggedIcon.waitFor({ state: 'visible' });

    logger.info(`[SearchPageWeb] Initiating search for "pantaloni".`);
    await this.userloggedIcon.waitFor({ state: 'visible' });
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
