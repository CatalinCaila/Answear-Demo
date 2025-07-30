// utils/helpers/generateAuthState.ts

import { type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { UsersPage } from '../../pages/UsersPage';
import { CookieBanner } from '../../pages/common/CookieBanner';
import { credentials } from './credentials';
import { Role } from './roleTypes';
import { logger } from '../logger';

/**
 * Generates authentication state (storageState) for the given user role.
 * This allows tests to reuse logged-in sessions without repeated logins.
 *
 * @param page - Playwright Page instance for browser interaction.
 * @param role - User role to generate the authentication state for (Admin/User).
 */
export async function generateAuthState(page: Page, role: Role, domain: 'ro' | 'it'): Promise<void> {
  logger.info(`[AuthState] Starting authentication for role: ${role}, domain: ${domain}`);

  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);
  
  // Define correct domain URL explicitly
  const domainURL = domain === 'ro' ? 'https://answear.ro' : 'https://answear.it';

  // Navigate explicitly to the specified domain
  await page.goto(domainURL);
  logger.info(`[AuthState] Navigated to ${domainURL}`);

  // Handle cookie banner explicitly
  await page.getByTestId('cookiesPopupContainer').waitFor({ state: 'visible', timeout: 60000 });
  logger.info(`[AuthState] Cookie popup container is visible`);
  
  await cookieBanner.clickIfPresent();
  logger.info(`[AuthState] Cookie banner handled`);

  // Perform user/admin login clearly based on role
  const { email, password } = credentials[role];
  await userPage.loginUsers(email, password);
  logger.info(`[AuthState] Logged in successfully as ${role}`);

  // Wait explicitly for access token
  await page.waitForFunction(() => {
    const token = localStorage.getItem('access_token');
    return token && token.split('.').length === 3;
  }, null, { timeout: 15000 });
  logger.info(`[AuthState] Verified access token structure`);

  // Clearly define storage state path per role and domain
  const authPath = path.resolve(process.cwd(), credentials[role].storageState[domain]);
  await page.context().storageState({ path: authPath });
  logger.info(`[AuthState] Storage state saved at: ${authPath}`);

  // Validate and optionally save token separately for User role
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token || token.split('.').length !== 3) {
    logger.error(`[AuthState] Invalid token for ${role} on ${domain}`);
    throw new Error(`❌ Invalid or incomplete token found for ${role} on ${domain}`);
  }

  if (role === Role.User) {
    const tokenPath = path.resolve(`auth/userAccessToken-${domain}.txt`);
    fs.writeFileSync(tokenPath, token, 'utf-8');
    logger.info(`[AuthState] ✅ Saved User token at ${tokenPath}`);
  }

  logger.info(`[AuthState] ✅ Authentication state generated for ${role} on ${domain}`);
}
