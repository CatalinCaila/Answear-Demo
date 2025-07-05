// utils/helpers/generateAuthState.ts
import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { credentials } from './credentials';
import { UsersPage } from '../../pages/UsersPage';
import { CookieBanner } from '../../pages/CookieBanner';
import { Role } from './roleTypes';

export async function generateAuthState(page: Page, role: Role) {
  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);

  await page.goto('https://answear.ro/', { waitUntil: 'domcontentloaded' });
  await cookieBanner.clickIfPresent();

  await userPage.loginUsers(credentials[role].email, credentials[role].password);
  await page.waitForURL('**/contul-meu', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const authPath = path.join(process.cwd(), 'auth', `${role}Auth.json`);
  await page.context().storageState({ path: authPath });

  const tokenHandle = await page.waitForFunction(() => localStorage.getItem('access_token'), {
    timeout: 5000,
  });
  const token = await tokenHandle.jsonValue();

  if (!token) throw new Error(`❌ Token not found for ${role}`);

  if (role === 'user') {
    fs.writeFileSync(path.join(process.cwd(), 'auth/userAccessToken.txt'), token, 'utf-8');
    console.log(`✅ Saved access token for user`);
  }
}
