// utils/helpers/pageFactory.ts

import type { Page } from '@playwright/test';
import { SearchPageWeb } from '../../pages/web/SearchPageWeb';
import { SearchPageMobile } from '../../pages/mobile/SearchPageMobile';
import { logger } from '../logger';

/**
 * Factory class to instantiate platform-specific implementations of search pages.
 */
export class PageFactory {
  /**
   * Factory method to instantiate and return a platform-specific search page instance.
   *
   * @param page - Playwright's Page instance used by the search page classes.
   * @param platform - Platform identifier ('desktop' or 'mobile').
   * @returns An instance of SearchPageWeb or SearchPageMobile.
   */
  static getSearchPage(page: Page, platform: 'desktop' | 'mobile'): SearchPageWeb | SearchPageMobile {
    logger.info(`[PageFactory] Creating search page instance for platform: ${platform}`);

    if (platform === 'mobile') {
      logger.info(`[PageFactory] Mobile search page instance created.`);
      return new SearchPageMobile(page);
    }

    logger.info(`[PageFactory] Web search page instance created.`);
    return new SearchPageWeb(page);
  }
}
