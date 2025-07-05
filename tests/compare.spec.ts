// tests/compare.user.spec.ts
import { test } from '../fixtures/auth/fixtures';
import { SearchPage } from '../pages/SearchPage';
import { Role } from '../utils/helpers/roleTypes';

test('User can compare products', async ({ page, loginAs }) => {


  const searchPage = new SearchPage(page);
  await page.goto('https://answear.ro/c/barbati', { waitUntil: 'networkidle' });

  await searchPage.compareValueOfPage1And2();
});
