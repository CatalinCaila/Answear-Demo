// setup/auth.setup.spec.ts
import { test } from '@playwright/test';
import { generateAuthState } from '../../utils/helpers/generateAuthState';
import { Role } from '../../utils/helpers/roleTypes';

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
