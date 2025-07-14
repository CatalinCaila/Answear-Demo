import { Page, test } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { SearchPageMobile } from '../../pages/mobile/SearchPageMobile';
import { SearchPageBase } from '../../pages/base/SearchPageBase';

type Platform = 'desktop' | 'mobile'; // Match your project names in playwright.config.ts

export class PageFactory {
  static getSearchPage(page: Page): SearchPageBase {
    const platform = test.info().project.name as Platform;

    if (platform === 'desktop') return new SearchPageWeb(page);
    if (platform === 'mobile') return new SearchPageMobile(page);

    throw new Error(`Unknown platform: ${platform}`);
  }
}
