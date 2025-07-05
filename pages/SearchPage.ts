import { type Page, type Locator, expect } from '@playwright/test';
import { productsResponseSchema } from '../schemas/products.schema';

export class SearchPage {
  readonly page: Page;
  readonly menCategory: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCardDescription: Locator;
  readonly page2Button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByTestId('search_input');
    this.menCategory = page.getByTestId('menuMaleCategory');
    this.searchButton = page.getByTestId('search_button');
    this.productCardDescription = page.locator('[data-test="productCardDescription"] >> span');
    this.page2Button = page.locator('[data-test="paginationPageNumbersItem"] >> text=2');
  }

  async selectMenCategory() {
    await this.menCategory.waitFor({ state: 'visible', timeout: 5000 });
    await this.menCategory.click();
  }

 async searchForItem(item: string) {

  await this.page.waitForTimeout(10000);



  // ✅ Clear input and fill
  await this.searchInput.fill('');
  await this.searchInput.fill(item);

  await this.searchButton.waitFor({ state: 'visible', timeout: 5000 });

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
 
    await this.page.waitForTimeout(10000);
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill('pantaloni');
    await this.searchInput.press('Enter');

    await expect(this.page).toHaveURL(/\/k\/barbati.*q=pantaloni/);
    await expect(this.productCardDescription.first()).toBeVisible();

    await this.page.waitForTimeout(10000);
    const page1Names = await this.productCardDescription.allTextContents();

    // Wait for page 2 button and click it
    await this.page2Button.waitFor({ state: 'visible', timeout: 10000 });
    await this.page2Button.click();

    await expect(this.page).toHaveURL(/\/k\/barbati.*page=2.*q=pantaloni/);
    await expect(this.productCardDescription.first()).toBeVisible();
    
    await this.page.waitForTimeout(10000);
    const page2Names = await this.productCardDescription.allTextContents();

    // Assertion
    expect(page1Names).not.toBe(page2Names);
    console.log('✅ Page 1 first:', page1Names[0]);
    console.log('✅ Page 2 first:', page2Names[0]);
  }
}
