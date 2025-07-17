import { type Page, type Locator } from '@playwright/test';
import { SearchPageBase } from '../base/SearchPageBase';
import { productsResponseSchema } from '../../schemas/products.schema';

export class SearchPageMobile extends SearchPageBase {
  readonly menCategory: Locator;
  readonly searchIcon: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartCount: Locator;

  constructor(page: Page) {
    super(page);
    this.menCategory = page.locator('a.btn').nth(1);
    this.searchIcon = page.getByTestId('search_icon');
    this.searchInput = page.locator('#productsSearch');
    this.searchButton = page.locator('div[data-test="search_component"] i.multiTheme-icon-search');
    this.cartCount = page.getByTestId('cart_count');
  }

  async selectMenCategory() {
    await this.menCategory.click();
  }

  async searchForItem(item: string) {
     await this.cartCount.waitFor({ state: 'visible' });
    await this.searchIcon.click();
    await this.searchInput.fill('');
    await this.searchInput.fill(item);

    const [response] = await Promise.all([
      this.page.waitForResponse(res =>
        res.url().includes('/api/products') && res.status() === 200
      ),
      this.searchButton.click()
    ]);

    const json = await response.json();
    const parsed = productsResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error(parsed.error.format());
      throw new Error('❌ API response schema is invalid (mobile)');
    }

    return parsed.data;
  }
}
