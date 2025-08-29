import type { Locator, Page } from '@playwright/test';
import { SearchPageBase } from '../base/SearchPageBase';
import { logger } from '../../utils/logger/logger';
import { expect } from '@playwright/test';

export class SearchPageWeb extends SearchPageBase {
  readonly menCategory: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCardDescription: Locator;
  readonly paginationButton: (pageNumber: number) => Locator;
  readonly userloggedIcon: Locator;
  readonly logoAnswear: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search_input');
    this.menCategory = page.getByTestId('menuMaleCategory');
    this.searchButton = page.getByTestId('search_button');
    this.productCardDescription = page.locator('[data-test="productCardDescription"] >> span');
    this.paginationButton = (pageNumber) =>
      page.locator(`[data-test="paginationPageNumbersItem"] >> text=${pageNumber}`);
    this.userloggedIcon = page.locator('#Icon\\/User-logged-2');
    this.logoAnswear = page.locator('img[alt="logo answear"]');

    logger.info(`[SearchPageWeb] Initialized web locators.`);
  }

  async navigateToMenCategory(baseURL: string): Promise<void> {
    logger.info(`[SearchPageWeb] Navigating to men's category page.`);
    await this.page.goto(`${baseURL}/c/barbati`);
    await this.userloggedIcon.waitFor({ state: 'visible' });
  }

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

  async performSearch(query: string): Promise<void> {
    await this.fillSearchInput(query);
    await this.searchInput.press('Enter');
    await this.productCardDescription.first().waitFor({ state: 'visible', timeout: 30000 });
    logger.info(`[SearchPageWeb] Search performed successfully for "${query}".`);
  }

  async getProductDescriptions(): Promise<string[]> {
    await this.productCardDescription.first().waitFor({ state: 'visible', timeout: 30000 });
    return this.productCardDescription.allTextContents();
  }

  async navigateToPage(pageNumber: number): Promise<void> {
    const pageButton = this.paginationButton(pageNumber);
    await pageButton.waitFor({ state: 'visible', timeout: 50000 });
    await pageButton.click();
    await this.productCardDescription.first().waitFor({ state: 'visible', timeout: 30000 });
    logger.info(`[SearchPageWeb] Navigated successfully to page ${pageNumber}.`);
  }

  async compareProductsBetweenPages(pageA: number, pageB: number): Promise<void> {
    const pageADescriptions = await this.getProductDescriptions();
    logger.info(`[SearchPageWeb] Page ${pageA} first product: ${pageADescriptions[0]}`);

    await this.navigateToPage(pageB);
    const pageBDescriptions = await this.getProductDescriptions();
    logger.info(`[SearchPageWeb] Page ${pageB} first product: ${pageBDescriptions[0]}`);

    expect(pageADescriptions).not.toEqual(pageBDescriptions);
    logger.info(
      `[SearchPageWeb] ✅ Verified products on pages ${pageA} and ${pageB} differ as expected.`,
    );
  }
}
