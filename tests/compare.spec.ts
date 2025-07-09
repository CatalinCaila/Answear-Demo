// tests/compare.user.spec.ts
import { test } from '../fixtures/auth/roleFixture';
import { SearchPage } from '../pages/SearchPage';


test('User can compare products', async ({ page}) => {


  const searchPage = new SearchPage(page);
  await page.goto('https://answear.ro/c/barbati', { waitUntil: 'networkidle' });

  await searchPage.compareValueOfPage1And2();
});
