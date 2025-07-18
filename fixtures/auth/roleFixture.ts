// fixtures/auth/fixtures.ts

import { test as base, expect } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

/**
 * Custom fixture to handle user authentication states dynamically within tests.
 * Allows easy switching between different user roles (Admin, User).
 */
export const test = base.extend<{
  loginAs: (role: Role) => Promise<void>;
}>({
  loginAs: async ({ page }, use) => {
    /**
     * Fixture function: `loginAs`
     * Logs into the application based on specified user role and manages the auth state.
     */
    await use(async (role: Role) => {
      const filePath = path.resolve(__dirname, `../../../auth/${role}Auth.json`);

      // Check if authentication state already exists for the given role
      if (fs.existsSync(filePath)) {
        logger.info(`[Fixture] Reusing existing auth state for role: ${role}`);
        await page.context().storageState({ path: filePath });
        return;
      }

      // Generate new auth state if not already available
      logger.info(`[Fixture] Generating new auth state for role: ${role}`);
      await generateAuthState(page, role);
    });
  },
});

// Re-exporting expect for easier usage in tests
export { expect };

/**
 * USE-CASE EXAMPLE:
 *
 * SCENARIO: Admin applies discount, User verifies discount.
 *
 * ROLES:
 *  - Admin: Logs into admin dashboard and sets a product discount.
 *  - User: Logs into storefront and verifies the discounted price.
 *
 * TEST FLOW:
 *  1. Admin logs in and navigates to product management.
 *  2. Admin sets a 10% discount on a product and verifies success.
 *  3. User logs in, searches for the discounted product.
 *  4. User verifies the product displays the correct discounted price.
 *
 * TEST TECHNIQUES USED:
 *  - Dynamically switches roles within a single test via `loginAs(Role)` fixture.
 *  - Clearly demonstrates end-to-end flows involving multiple user permissions.
 */