// utils/helpers/credentials.ts
import dotenv from 'dotenv';
import { Role } from './roleTypes';

dotenv.config();

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`❌ Missing env var: ${name}`);
  return value;
}

export const credentials: Record<Role, { email: string; password: string; storageState: string }> = {
  [Role.Admin]: {
    email: required(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL'),
    password: required(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD'),
    storageState: './auth/adminAuth.json',
  },
  [Role.User]: {
    email: required(process.env.USER_EMAIL, 'USER_EMAIL'),
    password: required(process.env.USER_PASSWORD, 'USER_PASSWORD'),
    storageState: './auth/userAuth.json',
  },
};
