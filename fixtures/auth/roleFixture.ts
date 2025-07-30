import { test as base } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import ro from './ro.json' with { type: 'json' };
import it from './it.json' with { type: 'json' };
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { credentials } from '../../utils/helpers/credentials';
import { Role } from '../../utils/helpers/roleTypes';

type Translations = { [key: string]: string };
type Domain = 'ro' | 'it';

export const test = base.extend<{
  loginAs: (role: Role) => Promise<void>;
  translations: Translations;
}>({
  loginAs: async ({ page }, use, testInfo) => {
    const locale: Domain = testInfo.project.use.locale as Domain;
    await use(async (role: Role) => {
      const filePath = path.resolve(process.cwd(), credentials[role].storageState[locale]);

      if (fs.existsSync(filePath)) {
        await page.context().storageState({ path: filePath });
        return;
      }

      // Generate the storage state if it does not exist
      await generateAuthState(page, role, locale);
    });
  },

  translations: async ({}, use, testInfo) => {
    const locale = testInfo.project.use.locale || 'ro';
    const translations = locale === 'it' ? it : ro;
    await use(translations);
  },
});

export { expect } from '@playwright/test';
