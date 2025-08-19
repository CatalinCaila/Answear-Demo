import { test as base } from '@playwright/test';
import ro from '../auth/ro.json' with { type: 'json' };
import it from '../auth/it.json' with { type: 'json' };

type Domain = 'ro' | 'it';
type Translations = Record<string, string>;

export const test = base.extend<{ translations: Translations }>({
  translations: async ({}, use, testInfo) => {
    const locale = (testInfo.project.use.locale as Domain) || 'ro';
    await use(locale === 'it' ? (it as Translations) : (ro as Translations));
  },
});

export { expect } from '@playwright/test';