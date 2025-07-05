// fixtures/auth/fixtures.ts
import { test as base } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';
import fs from 'fs';
import path from 'path';

export const test = base.extend<{
  loginAs: (role: Role) => Promise<void>;
}>({
  loginAs: async ({ page }, use) => {
    await use(async (role: Role) => {
      const filePath = path.resolve(__dirname, `../../../auth/${role}Auth.json`);
      if (fs.existsSync(filePath)) {
        await page.context().storageState({ path: filePath });
        return;
      }
      await generateAuthState(page, role);
    });
  },
});

export { expect } from '@playwright/test';
