import fs from 'fs';
import path from 'path';

export type AuthContext = {
  token?: string;
  tamago?: string;
  extraHeaders?: Record<string,string>;
};

function readJSON(p: string) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function fromStorageState(file = './auth/userAuth-RO-0.json'): AuthContext {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) throw new Error(`StorageState not found: ${abs}`);
  const ss = readJSON(abs);

  const token = ss.origins
    ?.flatMap((o: any) => o.localStorage ?? [])
    .find((e: any) => e.name === 'access_token')?.value;

  // Tamago from cookies or localStorage (name may differ in your app)
  const tamagoCookie = ss.cookies?.find((c: any) => c.name.toLowerCase().includes('tamago'))?.value;
  const tamagoLs = ss.origins?.flatMap((o: any)=>o.localStorage ??[])
                   .find((e: any)=> e.name.toLowerCase().includes('tamago'))?.value;

  return { token, tamago: tamagoCookie ?? tamagoLs };
}

export function fromTxtToken(file = './auth/userAccessToken-ro-0.txt'): AuthContext {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) throw new Error(`Token file not found: ${abs}`);
  const token = fs.readFileSync(abs, 'utf-8').trim();
  return { token };
}

export function fromEnv(): AuthContext {
  return {
    token: process.env.ACCESS_TOKEN,
    tamago: process.env.TAMAGO,
  };
}
