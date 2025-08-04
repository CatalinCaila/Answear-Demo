// tests/rolefixtures.ts
import { test as base } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import ro from './ro.json' with { type: 'json' };
import it from './it.json' with { type: 'json' };
import { generateAuthState } from '../../utils/auth/generateAuthState';
import { credentials } from '../../utils/auth/credentials';
import { Role } from '../../utils/config/roleTypes';

type Translations = { [key: string]: string };
type Domain = 'ro' | 'it';

export const test = base.extend<{
  loginAs: (role: Role) => Promise<void>;
  translations: Translations;
}>({
  loginAs: async ({ page }, use, testInfo) => {
    const locale: Domain = testInfo.project.use.locale as Domain;
    const workerIndex = testInfo.workerIndex; // Using worker index

    await use(async (role: Role) => {
      const creds = credentials[role][workerIndex % credentials[role].length];
      const filePath = path.resolve(process.cwd(), creds.storageState[locale]);

      if (fs.existsSync(filePath)) {
        await page.context().storageState({ path: filePath });
        return;
      }

      await generateAuthState(page, role, locale, workerIndex);
    });
  },

  translations: async ({}, use, testInfo) => {
    const locale = testInfo.project.use.locale || 'ro';
    const translations = locale === 'it' ? it : ro;
    await use(translations);
  },
});

export { expect } from '@playwright/test';
