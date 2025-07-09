// fixtures/auth/fixtures.ts
import { test as base } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';
import fs from 'fs';
import path from 'path';
export const test = base.extend<{
  loginAs: (role: Role) => Promise<void>;
}>({
  // Define a custom Playwright fixture: `loginAs`
  loginAs: async ({ page }, use) => {
    // Provide the actual implementation of the loginAs function to the test context
    await use(async (role: Role) => {
      const filePath = path.resolve(__dirname, `../../../auth/${role}Auth.json`);

      // If the auth state file already exists, reuse it to avoid login
      if (fs.existsSync(filePath)) {
        await page.context().storageState({ path: filePath });
        return;
      }

      // Otherwise, perform the login flow and save the state to file
      await generateAuthState(page, role);
    });
  },
});

// Re-export expect for convenience in test files
export { expect } from '@playwright/test';

/**
 * Where fixture of loginAs can be apply, I don't have an admin role, to do the test
 * this is just a use case of the custom fixture.
 * SCENARIO: Admin applies discount, User verifies discount
 *
 * ROLES:
 * - Admin: logs into admin dashboard and creates a 10% discount
 * - User: logs into storefront and verifies the discounted price is visible
 *
 * FLOW:
 * 1. Admin logs in and navigates to product management
 * 2. Admin searches for the product and sets a discount
 * 3. Admin saves the discount and verifies success message
 * 4. User logs in, searches for the same product
 * 5. User verifies that the discounted price is lower than the original
 *
 * TECHNIQUES:
 * - Uses loginAs(Role) fixture to switch roles dynamically within one test
 */