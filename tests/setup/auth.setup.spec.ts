// tests/setup/auth.setup.spec.ts

import { test } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';
import { logger } from '../../utils/logger';

/**
 * Authentication setup tests to generate auth state files for user roles.
 */
test.describe('@auth @setup @helper', () => {
  for (const role of Object.values(Role)) {
    test(`Generate auth state for ${role}`, async ({ page }) => {
      logger.info(`[Auth Setup] Generating authentication state for role: ${role}`);
      await generateAuthState(page, role);
      logger.info(`[Auth Setup] ✅ Authentication state generated for role: ${role}`);
    });
  }
});
