import { type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UsersPage } from '../../pages/web/LoginPage';
import { CookieBanner } from '../helpers/cookieBanner';
import { credentials } from './credentials';
import { Role } from '../config/roleTypes';
import { logger } from '../logger/logger';

export async function generateAuthState(
  page: Page,
  role: Role,
  domain: 'ro' | 'it',
  workerIndex: number,
): Promise<void> {
  logger.info(`[AuthState] Start auth for role: ${role}, domain: ${domain}, worker: ${workerIndex}`);

  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);
  const domainURL = domain === 'ro' ? 'https://answear.ro' : 'https://answear.it';

  await page.goto(domainURL);
  logger.info(`[AuthState] Navigated to ${domainURL}`);

  await page.getByTestId('cookiesPopupContainer').waitFor({ state: 'visible', timeout: 60000 });
  await cookieBanner.clickIfPresent();
  logger.info(`[AuthState] Cookie banner handled`);

  const creds = credentials[role][workerIndex % credentials[role].length];
  await userPage.loginUsers(creds.email, creds.password);
  logger.info(`[AuthState] Logged in as ${role} with worker ${workerIndex}`);

  await page.waitForFunction(() => {
    const token = localStorage.getItem('access_token');
    return token && token.split('.').length === 3;
  });

  const authPath = path.resolve(process.cwd(), creds.storageState[domain]);
  await page.context().storageState({ path: authPath });
  logger.info(`[AuthState] Storage state saved at: ${authPath}`);

  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token || token.split('.').length !== 3) {
    logger.error(`[AuthState] Invalid token for ${role} on ${domain}, worker ${workerIndex}`);
    throw new Error(`❌ Invalid token for ${role} on ${domain}, worker ${workerIndex}`);
  }

  if (role === Role.User) {
    const tokenPath = path.resolve(`auth/userAccessToken-${domain}-${workerIndex}.txt`);
    fs.writeFileSync(tokenPath, token, 'utf-8');
    logger.info(`[AuthState] ✅ Saved User token at ${tokenPath}`);
  }

  logger.info(`[AuthState] ✅ Authentication state generated for ${role} on ${domain}, worker ${workerIndex}`);
}
