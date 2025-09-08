import fs from 'fs';
import path from 'path';

export interface AuthContext {
  token: string;
  tamago?: string;
}

export function getAuthContextFromStorage(fileName = 'userAuth-RO-0.json'): AuthContext {
  console.info(`[getAuthContextFromStorage] Start... Reading from ${fileName}`);

  const storageStatePath = path.resolve(process.cwd(), `./auth/${fileName}`);
  if (!fs.existsSync(storageStatePath)) {
    throw new Error(`❌ Storage state file not found at: ${storageStatePath}`);
  }

  const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));

  // 1) Find access_token in localStorage
  const tokenEntry = storageState.origins
    .flatMap((origin: any) => origin.localStorage)
    .find((entry: any) => entry.name === 'access_token');

  if (!tokenEntry?.value) {
    throw new Error('❌ No access token found in storage state file.');
  }

  // 2) Try to find Tamago (cookie or localStorage)
  let tamago: string | undefined;

  // Check cookies
  const tamagoCookie = storageState.cookies.find(
    (c: any) => c.name.toLowerCase().includes('tamago')
  );
  if (tamagoCookie) {
    tamago = tamagoCookie.value;
  }

  // Check localStorage
  if (!tamago) {
    for (const origin of storageState.origins) {
      const entry = origin.localStorage.find((e: any) =>
        e.name.toLowerCase().includes('tamago')
      );
      if (entry?.value) {
        tamago = entry.value;
        break;
      }
    }
  }

  console.info(`[getAuthContextFromStorage] ✅ Token + Tamago read successfully`);
  console.info(`[getAuthContextFromStorage] End...`);

  return { token: tokenEntry.value, tamago };
}
