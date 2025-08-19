// setup/auth.setup.spec.ts
import { test } from '../fixtures/auth/roleFixture';  // adjust relative path if needed
import { Role } from '../utils/config/roleTypes';

const domains = ['ro', 'it'] as const;
const accounts = [0, 1] as const;

test.describe('@auth @setup', () => {
  for (const domain of domains) {
    for (const accountIndex of accounts) {
      for (const role of [Role.User, Role.Admin]) {
        test(`Generate auth state for ${role} on ${domain.toUpperCase()} (acc ${accountIndex})`, async ({ loginAs }) => {
          // This will log in and save storageState JSONs
          await loginAs(role, { domain, accountIndex, force: true });
        });
      }
    }
  }
});
