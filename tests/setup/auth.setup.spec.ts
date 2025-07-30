// tests/setup/auth.setup.spec.ts

import { test } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';
import { logger } from '../../utils/logger';

/**
 * Authentication setup tests to generate auth state files for user roles.
 */
const domains = ['ro', 'it'] as const;
const roles = [Role.User, Role.Admin];

test.describe('@auth @setup', () => {
  for (const domain of domains) {
    for (const role of roles) {
      test(`Generate auth state for ${role} on ${domain.toUpperCase()}`, async ({ page }) => {
        await generateAuthState(page, role, domain);
      });
    }
  }
});
