// utils/helpers/pageFactory.ts
import { Page } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { SearchPageMobile } from '../../pages/mobile/SearchPageMobile';

export class PageFactory {
  static getSearchPage(page: Page, platform: 'desktop' | 'mobile') {
    if (platform === 'desktop') return new SearchPageWeb(page);
    if (platform === 'mobile') return new SearchPageMobile(page);
    throw new Error(`Unknown platform: ${platform}`);
  }
}
