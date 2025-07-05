import { test as base, type Page, type Locator, expect } from '@playwright/test';
import { credentials } from '../utils/helpers/credentials';

export class UsersPage {
    readonly page: Page;
    readonly accountButton : Locator;
    readonly emailInput : Locator;
    readonly passwordInput : Locator;
    readonly loginButton : Locator;
   
    
    constructor(page: Page) {
        this.page = page;
        this.accountButton = page.getByTestId('my_account_icon');
        this.emailInput = page.locator('#_username');
        this.passwordInput = page.locator('#_password')
        this.loginButton = page.locator('.LoginPanelTemplate__loginStepWrapper__pTsw3 button[type="submit"]');
    }

    async loginUsers(email: string, password: string) {
       

        await expect(this.accountButton).toBeVisible();
        await this.accountButton.click();

        // Admin Email
        await this.emailInput.waitFor({ state: 'visible' });
        await expect(this.emailInput).toBeVisible();
        await this.emailInput.fill(email);

        //Admin Paasword
        await this.passwordInput.waitFor({ state: 'visible' });
        await expect(this.passwordInput).toBeVisible();
        await this.passwordInput.fill(password);

        await expect(this.loginButton).toBeVisible();
        await this.loginButton.click();
    }
}