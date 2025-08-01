import { test, expect } from '@playwright/test';
import { fetchSearchResults } from '../../utils/api/products';
import { logger } from '../../utils/logger';
import path from 'path';
import fs from 'fs';

test.describe('@dev @qa @prod @api @search', () => {
  test('should return products when search query is valid via direct API', async ({}, testInfo) => {
    const searchTerm = 'pantaloni';

    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error('❌ baseURL is not defined in the project configuration.');
    }

    logger.info(`[API Search][${baseURL}] Initiating API search for "${searchTerm}".`);

    // Path to storageState file (adjust based on your configuration)
    const storageStatePath = path.resolve(process.cwd(), './auth/userAuth-RO-0.json');
    
    if (!fs.existsSync(storageStatePath)) {
      throw new Error(`❌ Storage state file not found at: ${storageStatePath}`);
    }

    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));

    // Find the access_token from localStorage data in storageState
    const tokenEntry = storageState.origins
      .flatMap((origin: any) => origin.localStorage)
      .find((entry: any) => entry.name === 'access_token');

    if (!tokenEntry || !tokenEntry.value) {
      throw new Error('❌ No access token found in storage state file.');
    }

    const token = tokenEntry.value;

    const results = await fetchSearchResults(searchTerm, token, baseURL);

    expect(results.items.length).toBeGreaterThan(0);
    logger.info(`[API Search][${baseURL}] ✅ Search returned ${results.items.length} products.`);

    const firstProduct = results.items[0]?.name ?? 'No products found';
    logger.info(`[API Search][${baseURL}] ✅ First product: ${firstProduct}`);
  });
});