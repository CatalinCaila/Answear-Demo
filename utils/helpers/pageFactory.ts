import { Page } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { SearchPageMobile } from '../../pages/mobile/SearchPageMobile';
import { SearchPageBase } from '../../pages/base/SearchPageBase';

type Platform = 'web' | 'mobile';

export class PageFactory {
  static getSearchPage(platform: Platform, page: Page): SearchPageBase {
    if (platform === 'web') return new SearchPageWeb(page);
    if (platform === 'mobile') return new SearchPageMobile(page);

    throw new Error(`Unknown platform: ${platform}`);
  }
}