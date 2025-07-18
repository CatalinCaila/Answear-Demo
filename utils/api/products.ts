import { request, expect, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { productsResponseSchema } from '../../schemas/products.schema';
import type { z } from 'zod';
import { logger } from '../logger';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the expected response type using the Zod schema
export type ProductsResponse = z.infer<typeof productsResponseSchema>;

/**
 * Fetches product search results from the Answear.ro API.
 * Injects authorization headers and request body, and validates the response schema.
 * @param query - The search string (e.g. "pantaloni")
 * @returns Parsed API response matching the Zod schema
 */
export async function fetchSearchResults(query: string): Promise<ProductsResponse> {
  // Resolve token file path and validate its existence
  const tokenPath = path.resolve(__dirname, '../../auth/userAccessToken.txt');
  if (!fs.existsSync(tokenPath)) {
    logger.error(`Token file missing at ${tokenPath}`);
    throw new Error(`❌ Token file not found at: ${tokenPath}`);
  }

  // Read the Bearer token
  const token = fs.readFileSync(tokenPath, 'utf-8').trim();
  logger.info(`[Products API] Using token from ${tokenPath}`);

  // Create a new Playwright API context with required headers
  const context: APIRequestContext = await request.newContext({
    extraHTTPHeaders: {
      accept: 'application/json, text/plain, */*',
      authorization: `Bearer ${token}`,
      'x-device-id': '607cd3c5-87fd-4732-912f-d515a024888f',
      'x-tamago-api-version': '3.13',
      'x-tamago-app': 'frontApp',
      'x-tamago-locale': 'ro_RO',
      origin: 'https://answear.ro',
      referer: 'https://answear.ro/k/barbati/imbracaminte',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'content-type': 'application/json'
    },
  });

  // POST request to the products API endpoint with the defined payload
  const response = await context.post('https://answear.ro/api/products', {
    data: {
      queryString: query,
      sort: '',
      filters: {},
      productsPerPage: 80,
      category: 'barbati',
      page: 1
    },
    headers: {
      'content-type': 'application/json',
    },
  });

  // Expect the response to be successful (HTTP 200 OK)
  expect(response.status(), 'Expected 200 OK from /api/products').toBe(200);
  logger.info(`[Products API] ✅ Received successful response for query "${query}"`);

  // Parse the response JSON body
  const json = await response.json();

  // Validate the JSON against the Zod schema
  const parsed = productsResponseSchema.safeParse(json);

  // Add detailed debug output if validation fails
  if (!parsed.success) {
    logger.error(`❌ Schema validation errors: ${JSON.stringify(parsed.error.format())}`);
    console.error('❌ Schema validation errors:', parsed.error.format());
  }

  // Expect schema validation to pass
  expect(parsed.success, '❌ Schema validation failed for /api/products').toBeTruthy();
 logger.info(`[Products API] ✅ Schema validation successful.`);
  // Return the parsed and validated data
  return parsed.data as ProductsResponse;
}
