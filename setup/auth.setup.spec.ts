import { test } from '../fixtures/auth/roleFixture';
import { Role } from '../utils/config/roleTypes';

const accounts = [0, 1] as const;

test.describe('@auth @setup', () => {
  for (const accountIndex of accounts) {
    for (const role of [Role.User, Role.Admin]) {
      test(`Generate auth state for ${role} (acc ${accountIndex})`, async ({ loginAs }, testInfo) => {
        const domain = (testInfo.project.metadata as any)?.domain ?? 'ro';
        testInfo.title = `Generate auth state for ${role} on ${domain.toUpperCase()} (acc ${accountIndex})`;

        await loginAs(role, { domain, accountIndex, force: true });
      });
    }
  }
});
