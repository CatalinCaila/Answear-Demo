// pages/web/UsersPage.ts

import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Represents the user authentication page and its interactions.
 */
export class UsersPage {
  private readonly accountButton: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  /**
   * Initializes locators for user authentication interactions.
   *
   * @param page - Playwright Page object for browser interactions.
   */
  constructor(private readonly page: Page) {
    this.accountButton = page.getByTestId('my_account_icon');
    this.emailInput = page.locator('#_username');
    this.passwordInput = page.locator('#_password');
    this.loginButton = page.locator(
      '.LoginPanelTemplate__loginStepWrapper__pTsw3 button[type="submit"]',
    );

    logger.info(`[UsersPage] Initialized all login locators.`);
  }

  /**
   * Logs in a user with the specified email and password.
   *
   * @param email - User email address.
   * @param password - User password.
   */
  async loginUsers(email: string, password: string): Promise<void> {
    logger.info(`[UsersPage] Initiating login process.`);

    // Click on account button to open login modal/form
    await expect(this.accountButton).toBeVisible();
    logger.info(`[UsersPage] Account button visible. Clicking to open login.`);
    await this.accountButton.click();

    // Wait for email input visibility and fill email
    await expect(this.emailInput).toBeVisible();
    logger.info(`[UsersPage] Email input visible. Filling email.`);
    await this.emailInput.fill(email);

    // Wait for password input visibility and fill password
    await expect(this.passwordInput).toBeVisible();
    logger.info(`[UsersPage] Password input visible. Filling password.`);
    await this.passwordInput.fill(password);

    // Wait for login button visibility and click to submit login form
    await expect(this.loginButton).toBeVisible();
    logger.info(`[UsersPage] Login button visible. Clicking to submit.`);
    await this.loginButton.click();

    logger.info(`[UsersPage] Login action completed.`);
  }
}
