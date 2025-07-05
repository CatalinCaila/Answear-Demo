// tests/auth.setup.spec.ts
import { test } from '@playwright/test';
import { generateAuthState } from '../utils/helpers/generateAuthState';
import { credentials } from '../utils/helpers/credentials';
import { Role } from '../utils/helpers/roleTypes';

for (const role of Object.keys(credentials) as Role[]) {
  test(`Generate auth state for ${role}`, async ({ page }) => {
    await generateAuthState(page, role);
  });
}
