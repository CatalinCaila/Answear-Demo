// setup/auth.setup.spec.ts
import { test } from '@playwright/test';
import { generateAuthState } from '../utils/auth/generateAuthState';
import { Role } from '../utils/config/roleTypes';

const domains = ['ro', 'it'] as const;
const roles = [Role.User, Role.Admin];

test.describe('@auth @setup', () => {
  domains.forEach(domain => {
    roles.forEach(role => {
      test(`Generate auth state for ${role} on ${domain.toUpperCase()}`, async ({ page }, testInfo) => {
        await generateAuthState(page, role, domain, testInfo.workerIndex);
      });
    });
  });
});
