import { type Page, expect } from '@playwright/test';

/**
 * Verifies that Answear homepage is loaded correctly by checking logo visibility.
 * @param page - Playwright page object.
 */
export async function assertHomepageLoaded(page: Page): Promise<void> {
  const methodNameName = 'assertHomepageLoaded';
  console.log(`[${methodNameName}] Start...`);

  const logoLocator = page.locator('img[alt="logo answear"]');
  await expect(logoLocator).toBeVisible();

  console.log(`[${methodNameName}] End...`);
}
