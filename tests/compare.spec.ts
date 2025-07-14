// tests/compare.user.spec.ts
import { test } from '../fixtures/auth/roleFixture';
import { SearchPageWeb } from '../pages/web/SearchPageWeb';


test('User can compare products', async ({ page}) => {


  const searchPage = new SearchPageWeb(page);
  await page.goto('https://answear.ro/c/barbati', { waitUntil: 'networkidle' });

  await searchPage.compareValueOfPage1And2();
});
