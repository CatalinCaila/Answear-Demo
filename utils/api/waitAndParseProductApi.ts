// utils/api.ts

import type { Page } from '@playwright/test';
import { productsResponseSchema, type ProductResponse } from '../../schemas/products.schema';
import { logger } from '../logger';

/**
 * Waits explicitly for the products API response and validates it against the Zod schema.
 *
 * @param page - Playwright Page object.
 * @returns Parsed API response adhering strictly to ProductResponse schema.
 * @throws Error if the API response does not match the expected schema.
 */
export async function waitAndParseProductApi(page: Page): Promise<ProductResponse> {
  logger.info(`[api] Waiting for products API response`);

  const response = await page.waitForResponse(
    res => res.url().includes('/api/products') && res.status() === 200
  );

  const json = await response.json();

  // Validate JSON response clearly against Zod schema
  const parsed = productsResponseSchema.safeParse(json);

  if (!parsed.success) {
    logger.error(`[api] API response schema validation failed: ${JSON.stringify(parsed.error.format())}`);
    throw new Error('❌ API response schema is invalid');
  }

  logger.info(`[api] API response schema validated successfully.`);
  return parsed.data;
}
