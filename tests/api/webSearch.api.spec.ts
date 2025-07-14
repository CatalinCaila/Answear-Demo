import { test, expect } from '@playwright/test';
import { fetchSearchResults } from '../../utils/api/products';


test.describe('@api @search', () => {
test('should return products when search query is valid via direct API', async () => {
  const results = await fetchSearchResults('pantaloni');

  expect(results.items.length).toBeGreaterThan(0);
  console.log('✅ First product:', results.items[0]?.name ?? 'No products found');
});
});