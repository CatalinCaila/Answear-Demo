import dotenv from 'dotenv';
import { Role } from '../config/roleTypes';
import { logger } from '../logger/logger';

dotenv.config();

type Domain = 'ro' | 'it';

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`❌ Missing env var: ${name}`);
  return value;
}

// Build credentials (keep only the entries you actually use)
export const credentials: Record<Role, { email: string; password: string; storageState: Record<Domain, string> }[]> = {
  [Role.Admin]: [
    {
      email: required(process.env.ADMIN_EMAIL_0, 'ADMIN_EMAIL_0'),
      password: required(process.env.ADMIN_PASSWORD_0, 'ADMIN_PASSWORD_0'),
      storageState: {
        ro: './auth/adminAuth-RO-0.json',
        it: './auth/adminAuth-IT-0.json',
      },
    },
    // If you really need a second admin, uncomment and ensure it's a different email than any user
    // {
    //   email: required(process.env.ADMIN_EMAIL_1, 'ADMIN_EMAIL_1'),
    //   password: required(process.env.ADMIN_PASSWORD_1, 'ADMIN_PASSWORD_1'),
    //   storageState: {
    //     ro: './auth/adminAuth-RO-1.json',
    //     it: './auth/adminAuth-IT-1.json',
    //   },
    // },
  ],
  [Role.User]: [
    {
      email: required(process.env.USER_EMAIL_0, 'USER_EMAIL_0'),
      password: required(process.env.USER_PASSWORD_0, 'USER_PASSWORD_0'),
      storageState: {
        ro: './auth/userAuth-RO-0.json',
        it: './auth/userAuth-IT-0.json',
      },
    },
    // Same here—only if needed and must be unique across roles
    // {
    //   email: required(process.env.USER_EMAIL_1, 'USER_EMAIL_1'),
    //   password: required(process.env.USER_PASSWORD_1, 'USER_PASSWORD_1'),
    //   storageState: {
    //     ro: './auth/userAuth-RO-1.json',
    //     it: './auth/userAuth-IT-1.json',
    //   },
    // },
  ],
};

// --- Validation: no email can be both Admin and User ---
(function validateExclusiveEmails() {
  const adminEmails = new Set(credentials[Role.Admin].map(c => c.email));
  const userEmails = new Set(credentials[Role.User].map(c => c.email));
  const duplicates = [...adminEmails].filter(e => userEmails.has(e));
  if (duplicates.length) {
    throw new Error(`❌ Role conflict: the following email(s) are assigned to BOTH Admin and User: ${duplicates.join(', ')}`);
  }
})();

logger.info('✅ Credentials loaded successfully.');
