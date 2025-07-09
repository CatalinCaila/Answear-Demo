// utils/helpers/generateAuthState.ts
import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UsersPage } from '../../pages/UsersPage';
import { CookieBanner } from '../../pages/CookieBanner';
import { credentials } from './credentials';
import { Role } from './roleTypes';

export async function generateAuthState(page: Page, role: Role) {
  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);

  await page.goto('https://answear.ro', { waitUntil: 'domcontentloaded' });
  await cookieBanner.clickIfPresent();

  await userPage.loginUsers(credentials[role].email, credentials[role].password);
  await page.waitForURL('**/contul-meu', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const authPath = path.resolve(process.cwd(), credentials[role].storageState);
  await page.context().storageState({ path: authPath });

  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token) throw new Error(`❌ Token not found for ${role}`);

  if (role === Role.User) {
    fs.writeFileSync(path.resolve('auth/userAccessToken.txt'), token, 'utf-8');
    console.log('✅ Saved access token for user');
  }
}
