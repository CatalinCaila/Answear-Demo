// utils/helpers/generateAuthState.ts
import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UsersPage } from '../../pages/UsersPage';
import { CookieBanner } from '../../pages/common/CookieBanner';
import { credentials } from './credentials';
import { Role } from './roleTypes';

export async function generateAuthState(page: Page, role: Role) {
  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);

  await page.goto('https://answear.ro', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('cookiesPopupContainer').waitFor({state: "visible", timeout : 60000});
  await cookieBanner.clickIfPresent();

  await userPage.loginUsers(credentials[role].email, credentials[role].password);

  // ✅ Explicitly wait until the token is complete and has the correct JWT structure:
  await page.waitForFunction(() => {
    const token = localStorage.getItem('access_token');
    return token && token.split('.').length === 3;
  }, null, { timeout: 15000 });

  // Now, reliably save the storage state
  const authPath = path.resolve(process.cwd(), credentials[role].storageState);
  await page.context().storageState({ path: authPath });

  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token || token.split('.').length !== 3) {
    throw new Error(`❌ Invalid or incomplete token found for ${role}`);
  }

  if (role === Role.User) {
    fs.writeFileSync(path.resolve('auth/userAccessToken.txt'), token, 'utf-8');
    console.log('✅ Saved access token for user');
  }
}
