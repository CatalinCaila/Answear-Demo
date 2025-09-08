// setup/auth.setup.spec.ts
import { test } from '../fixtures/auth/roleFixture';
import { Role } from '../utils/config/roleTypes';

const roleAccounts: Record<Role, readonly number[]> = {
  [Role.Admin]: [0],
  [Role.User]: [1], // <-- ensures userAuth-*-1.json will be generated
};

test.describe('@auth @setup', () => {
  for (const role of [Role.User, Role.Admin] as const) {
    for (const accountIndex of roleAccounts[role]) {
      test(`Generate auth state for ${role} (acc ${accountIndex})`, async ({ loginAs }, testInfo) => {
        const domain = (testInfo.project.metadata as any)?.domain ?? 'ro';
        testInfo.title = `Generate auth state for ${role} on ${domain.toUpperCase()} (acc ${accountIndex})`;

        // IMPORTANT: do NOT skip based on cred[index] — we allow fallback in the fixture
        console.log(`[SETUP] Generating ${role} auth for ${domain} (acc ${accountIndex})`);
        await loginAs(role, { domain, accountIndex, force: true });
      });
    }
  }
});
