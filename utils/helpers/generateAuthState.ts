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
export async function generateAuthState(page: Page, role: Role): Promise<void> {
  logger.info(`[AuthState] Starting authentication state generation for role: ${role}`);

  // Initialize page objects
  const userPage = new UsersPage(page);
  const cookieBanner = new CookieBanner(page);

  // Navigate to the homepage
  await page.goto('https://answear.ro', { waitUntil: 'domcontentloaded' });
  logger.info(`[AuthState] Navigated to homepage`);

  // Wait explicitly for cookie popup visibility
  await page.getByTestId('cookiesPopupContainer').waitFor({ state: 'visible', timeout: 60000 });
  logger.info(`[AuthState] Cookie popup container is visible`);

  // Accept cookies if the cookie banner appears
  await cookieBanner.clickIfPresent();
  logger.info(`[AuthState] Cookie banner handled`);

  // Perform user login using provided credentials
  await userPage.loginUsers(credentials[role].email, credentials[role].password);
  logger.info(`[AuthState] Logged in successfully as ${role}`);

  // Ensure access token is fully loaded and has a valid JWT structure (header.payload.signature)
  await page.waitForFunction(() => {
    const token = localStorage.getItem('access_token');
    return token && token.split('.').length === 3;
  }, null, { timeout: 15000 });
  logger.info(`[AuthState] Verified access token structure`);

  // Save storage state (cookies, localStorage) for future use
  const authPath = path.resolve(process.cwd(), credentials[role].storageState);
  await page.context().storageState({ path: authPath });
  logger.info(`[AuthState] Storage state saved at: ${authPath}`);

  // Retrieve and validate the access token explicitly from local storage
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  if (!token || token.split('.').length !== 3) {
    logger.error(`[AuthState] Invalid or incomplete token found for ${role}`);
    throw new Error(`❌ Invalid or incomplete token found for ${role}`);
  }

  // If role is 'User', save the access token separately for API usage
  if (role === Role.User) {
    const tokenPath = path.resolve('auth/userAccessToken.txt');
    fs.writeFileSync(tokenPath, token, 'utf-8');
    logger.info(`✅ Saved user access token separately at ${tokenPath}`);
  }

  logger.info(`[AuthState] ✅ Authentication state generation complete for role: ${role}`);
}
