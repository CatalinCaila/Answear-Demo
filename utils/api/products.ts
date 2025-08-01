import { request, type APIRequestContext, expect } from '@playwright/test';
import { productsResponseSchema, type ProductResponse  } from '../../schemas/products.schema';
import { logger } from '../logger';

/**
 * Fetches search results dynamically using provided token and environment URL.
 *
 * @param query - Search query string.
 * @param token - Auth token passed explicitly from test context.
 * @param baseURL - Environment URL (e.g., 'https://answear.ro').
 */
export async function fetchSearchResults(
  query: string,
  token: string,
  baseURL: string
): Promise<ProductResponse > {
  logger.info(`[Products API] Starting API search for query: "${query}" at ${baseURL}`);

  const context: APIRequestContext = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      accept: 'application/json, text/plain, */*',
      authorization: `Bearer ${token}`,
      'x-device-id': '607cd3c5-87fd-4732-912f-d515a024888f',
      'x-tamago-api-version': '3.13',
      'x-tamago-app': 'frontApp',
      'x-tamago-locale': 'ro_RO',
      origin: baseURL,
      referer: `${baseURL}/k/barbati/imbracaminte`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'content-type': 'application/json'
    },
  });

  const response = await context.post('/api/products', {
    data: {
      queryString: query,
      sort: '',
      filters: {},
      productsPerPage: 80,
      category: 'barbati',
      page: 1
    },
  });

  expect(response.status(), 'Expected 200 OK from /api/products').toBe(200);
  logger.info(`[Products API] ✅ Received successful response for query "${query}"`);

  const json = await response.json();
  const parsed = productsResponseSchema.safeParse(json);

  if (!parsed.success) {
    logger.error(`❌ Schema validation errors: ${JSON.stringify(parsed.error.format())}`);
    throw new Error('❌ Schema validation failed for /api/products');
  }

  logger.info(`[Products API] ✅ Schema validation successful.`);
  return parsed.data;
}
