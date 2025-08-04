// pages/base/SearchPageBase.ts
import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { CookieBanner } from '../../utils/helpers/cookieBanner';
import type { ProductResponse } from '../../schemas/products.schema';
import { waitAndParseProductApi } from '../../utils/api/productApiHelper';
import { logger } from '../../utils/logger/logger';

/**
 * Abstract base class defining common search functionalities
 * across different platform implementations (web and mobile).
 */
export abstract class SearchPageBase {
  protected readonly page: Page;
  readonly cookieBanner: CookieBanner;
  protected abstract get searchButton(): Locator;
  protected abstract get menCategory(): Locator;

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
async selectMenCategory(translations: Record<string, string>): Promise<void> {
  logger.info(`[SearchPageBase] Selecting men category.`);
  
  await this.menCategory.waitFor({ state: 'visible', timeout: 5000 });
  await expect
    .soft(this.menCategory, 'Men category should display correct text before click')
    .toHaveText(new RegExp(translations['men.category'], 'i'));

  logger.info(`[SearchPageBase] ✅ Soft-asserted "${translations['men.category']}" text before click.`);
  
  await this.menCategory.click();
  logger.info('[SearchPageBase] ✅ Clicked on Men category.');
}

async assertMenURL(translations: Record<string, string>): Promise<void> {
  await expect
    .soft(this.page, 'URL should update correctly after clicking Men category')
    .toHaveURL(new RegExp(translations['men.URL']));

  logger.info('[SearchPageBase] ✅ Soft-asserted URL navigation after clicking Men category.');
}

  async clickSearchButton(): Promise<void> {
    logger.info(`[SearchPageWeb] Clicking search button.`);
    // Soft-assert that the search button is visible before clicking
    await expect
      .soft(this.searchButton, 'Search button should be visible before click')
      .toBeVisible();
    logger.info('[SearchPageBase] ✅ Soft-asserted search button visibility.');
    await this.searchButton.click();
    logger.info('[SearchPageBase] ✅ Clicked search button.');
  }

  abstract fillSearchInput(item: string): Promise<void>;

  async searchForItem(item: string): Promise<ProductResponse> {
    await this.fillSearchInput(item);
    logger.info(`[SearchPageBase] Filling search input with "${item}"`);

    const [data] = await Promise.all([waitAndParseProductApi(this.page), this.clickSearchButton()]);

    logger.info(
      `[SearchPageBase] Search completed successfully. Items returned: ${data.items.length}`,
    );

    return data;
  }

  async assertItemURL(item: string): Promise<void> {
    await expect(this.page, `URL should contain "${item}" after navigation`).toHaveURL(
      new RegExp(`/${item}`),
    );
    logger.info(`[SearchPageBase] ✅ Soft-asserted URL contains "${item}".`);
  }
}
