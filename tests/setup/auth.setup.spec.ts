// tests/auth.setup.spec.ts
import { test } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';


test.describe('@auth @setup @helper', () => {
for (const role of Object.values(Role)) {
  test(`Generate auth state for ${role}`, async ({ page }) => {
    await generateAuthState(page, role);
  });
}
});
