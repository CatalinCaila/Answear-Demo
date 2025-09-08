import { test, expect } from '@playwright/test';
import { makeSearchService } from '../../utils/factories/serviceFactory';

test.describe('@dev @qa @prod @api @search @smoke @regression', () => {
  test('returns products via flexible stack', async () => {
    // choose auth source with env var if you want:
    // STORAGE (default) | TXT | ENV
    const mode = (process.env.AUTH_MODE?.toLowerCase() ?? 'storage') as
      | 'storage'
      | 'txt'
      | 'env';

    const svc = makeSearchService(mode);
    const result = await svc.search('pantaloni');

    expect((result.items ?? []).length).toBeGreaterThan(0);
  });
});
