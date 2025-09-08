import { productsResponseSchema, type ProductResponse } from '../../schemas/products.schema';
import type { HttpClient } from '../http/httpClient';
import type { AppConfig } from '../../config/env';
import type { AuthContext } from '../auth/authProviders';
import { buildHeaders } from '../http/headerBuilder';
import { buildSearchPayload } from '../pay/searchPay';
import { logger } from '../logger/logger'; // your existing logger

export class SearchService {
  constructor(private client: HttpClient, private cfg: AppConfig, private auth: AuthContext) {}

  async search(query: string): Promise<ProductResponse> {
    logger.info(`[SearchService] Start... query="${query}", baseURL="${this.cfg.baseURL}"`);

    const headers = buildHeaders(this.auth, {
      locale: this.cfg.locale,
      site: this.cfg.site,
      tamagoHeaderName: 'Tamago', // change if needed
      extra: {
        'x-tamago-api-version': '3.13',
        'x-tamago-app': 'frontApp',
        'x-tamago-locale': this.cfg.locale.replace('-', '_'),
      },
    });

    const payload = buildSearchPayload(query);
    const { data } = await this.client.post<ProductResponse>('/api/products', payload, headers);

    const parsed = productsResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`[SearchService] ❌ Zod validation failed: ${JSON.stringify(parsed.error.format())}`);
    }

    logger.info(`[SearchService] ✅ ${parsed.data.items?.length ?? 0} products`);
    logger.info(`[SearchService] End.`);
    return parsed.data;
  }
}
