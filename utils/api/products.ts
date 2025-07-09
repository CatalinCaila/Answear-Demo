import { request, expect, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { productsResponseSchema } from '../../schemas/products.schema';
import type { z } from 'zod';

export type ProductsResponse = z.infer<typeof productsResponseSchema>;

export async function fetchSearchResults(query: string): Promise<ProductsResponse> {
  //Read the user access token from a file
  const tokenPath = path.resolve(__dirname, '../../auth/userAccessToken.txt');

  // Ensure the token file exists
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`❌ Token file not found at: ${tokenPath}`);
  }

  // Read the token from the file
  // Use 'utf-8' encoding to read the file as a string
  const token = fs.readFileSync(tokenPath, 'utf-8').trim();

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
    },
  });

  const response = await context.post('https://answear.ro/api/products', {
    data: {
      queryString: query,
      sort: '',
      filters: {},
      productsPerPage: 80,
      category: 'barbati',
      page: 1,
    },
    headers: {
      'content-type': 'application/json',
    },
  });

  expect(response.status(), 'Expected 200 OK from /api/products').toBe(200);

  const json = await response.json();
  // Validate the response against the schema
  const parsed = productsResponseSchema.safeParse(json);
  expect(parsed.success, '❌ Schema validation failed for /api/products').toBeTruthy();

  if (!parsed.success) {
    console.error('❌ Schema validation errors:', parsed.error.format());
    throw new Error('Invalid products API response schema');
  }

  return parsed.data;
}
