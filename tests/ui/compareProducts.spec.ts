import { test } from '../../fixtures/auth/roleFixture';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';

/**
 * UI test verifying product comparison functionality across pagination for authenticated users.
 */

test('User can compare products across pagination', async ({ page }, testInfo) => {
  // grab it once
  const baseURL = testInfo.project.use.baseURL;
  // fail fast if someone mis-configured
  if (!baseURL) {
    throw new Error(
      '❌ Missing `use.baseURL` in your Playwright config! ' +
      'Please add e.g. `use: { baseURL: "https://my-app.dev" }`.'
    );
  }

  const searchPage = new SearchPageWeb(page);
  await searchPage.navigateToMenCategory(baseURL);
  await searchPage.performSearch('pantaloni');
  await searchPage.compareProductsBetweenPages(1, 2);
});
