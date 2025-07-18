// tests/api/api.search.spec.ts

import { test, expect } from '@playwright/test';
import { fetchSearchResults } from '../../utils/api/products';
import { logger } from '../../utils/logger';

/**
 * API test suite verifying product search functionality via direct API.
 */
test.describe('@dev @qa @prod @api @search', () => {
  test('should return products when search query is valid via direct API', async () => {
    const searchTerm = 'pantaloni';
    logger.info(`[API Search] Initiating API search for "${searchTerm}".`);

    const results = await fetchSearchResults(searchTerm);

    expect(results.items.length).toBeGreaterThan(0);
    logger.info(`[API Search] ✅ Search returned ${results.items.length} products.`);

    const firstProduct = results.items[0]?.name ?? 'No products found';
    logger.info(`[API Search] ✅ First product: ${firstProduct}`);
  });
});
