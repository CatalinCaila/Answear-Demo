import { type Page, type Locator, expect } from '@playwright/test';
import { productsResponseSchema } from '../../schemas/products.schema';
import { SearchPageBase } from '../base/SearchPageBase';

export class SearchPageWeb extends SearchPageBase{
  readonly menCategory: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCardDescription: Locator;
  readonly page2Button: Locator;
  readonly cartCount: Locator;
 
  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search_input');
    this.menCategory = page.getByTestId('menuMaleCategory');
    this.searchButton = page.getByTestId('search_button');
    this.productCardDescription = page.locator('[data-test="productCardDescription"] >> span');
    this.page2Button = page.locator('[data-test="paginationPageNumbersItem"] >> text=2');
    this.cartCount = page.getByTestId('cart_count');
  }

  async selectMenCategory() {
    await this.menCategory.waitFor({ state: 'visible', timeout: 5000 });
    await this.menCategory.click();
  }

 async searchForItem(item: string) {
 await this.cartCount.waitFor({ state: 'visible' });


  // ✅ Clear input and fill
  await this.searchInput.fill('');
  await this.searchInput.fill(item);


  const [response] = await Promise.all([
    this.page.waitForResponse(res =>
      res.url().includes('/api/products') &&
      res.status() === 200
    ),
    this.searchButton.click()
  ]);

  const json = await response.json();
  const parsed = productsResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error(parsed.error.format());
    throw new Error('❌ API response schema is invalid');
  }

  return parsed.data;
}

async compareValueOfPage1And2() {
  await this.page.goto('https://answear.ro/c/barbati', { waitUntil: 'domcontentloaded' });

  await this.cartCount.waitFor({ state: 'visible' });
  await this.searchInput.fill('pantaloni');
  await this.searchInput.press('Enter');

  // Explicitly target product names clearly
  const productDescriptions = this.page.locator('[data-test="productCardDescription"] span');
  await productDescriptions.first().waitFor({ state: 'visible', timeout: 15000 });

  const page1Names = await productDescriptions.allTextContents();

  await this.page2Button.waitFor({ state: 'visible', timeout: 50000 });
  await this.page2Button.click();

  await productDescriptions.first().waitFor({ state: 'visible', timeout: 15000 });
  const page2Names = await productDescriptions.allTextContents();

  expect(page1Names).not.toEqual(page2Names);

  console.log('✅ Page 1 first:', page1Names[0]);
  console.log('✅ Page 2 first:', page2Names[0]);
}
}
