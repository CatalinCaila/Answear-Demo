
import { test as base, type Page, type Locator, expect } from '@playwright/test';
//import { Page, expect } from '@playwright/test';

export class UserPage {
  readonly page: Page;
  readonly accountButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountButton = page.locator('#myaccount-login-btn');
    this.emailInput = page.locator('#formInputEmail');
    this.passwordInput = page.locator('input[aria-labelledby="formLabelPassword"]');
    this.loginButton = page.locator('#myaccount-login-modal > section > div.modal__footer > div > a.action-button.button > span');
  }

  async loginUser() {
    await this.page.goto('https://www.aboutyou.ro/');
    await expect(this.accountButton).toBeVisible();
    await this.accountButton.click();

    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(process.env.PLAYWRIGHT_USER_EMAIL || 'catalin.caila@gmail.com');

    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(process.env.PLAYWRIGHT_USER_PASSWORD || '$d4hZ6EY8iKs!if');

    await expect(this.loginButton).toBeVisible();
    await this.loginButton.click();
  }
}



export class AdminPage {
  readonly page: Page;
  readonly accountButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountButton = page.locator('#myaccount-login-btn');
    this.emailInput = page.locator('#formInputEmail');
    this.passwordInput = page.locator('input[aria-labelledby="formLabelPassword"]');
    this.loginButton = page.locator('#myaccount-login-modal > section > div.modal__footer > div > a.action-button.button > span');
  }

  async loginAdmin() {

    await this.page.goto('https://playwright.quartexcollections.com/');

    await expect(this.accountButton).toBeVisible();
    await this.accountButton.click();

    await expect(this.emailInput).toBeVisible();
    // Admin Email
    await this.emailInput.fill(process.env.PLAYWRIGHT_USER_EMAIL || 'catalin.caila@gmail.com');

    //Admin Password
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(process.env.PLAYWRIGHT_USER_PASSWORD || '$d4hZ6EY8iKs!if');

    await expect(this.loginButton).toBeVisible();
    await this.loginButton.click();
  }
}

    type MyFixtures = {
    adminPage: AdminPage;
    userPage: UserPage;
  };

export * from '@playwright/test';
export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth/adminAuth.json' });
    const page = await context.newPage();
    const adminPage = new AdminPage(page);
  //  await adminPage.loginAdmin(); // Login manually
    await use(adminPage);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'auth/userAuth.json' });
    const page = await context.newPage();
    const userPage = new UserPage(page);
  //  await userPage.loginUser(); // Login manually
    await use(userPage);
    await context.close();
  },
});

