// fixtures/auth/roleFixture.ts
import { test as base, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { credentials } from '../../utils/auth/credentials';
import { Role } from '../../utils/config/roleTypes';
import { logger } from '../../utils/logger/logger';
import { UsersPage } from '../../pages/web/LoginPage';
import { CookieBanner } from '../../utils/helpers/cookieBanner';

type Domain = 'ro' | 'it';
type LoginOpts = {
  domain?: Domain;
  force?: boolean;
  accountIndex?: number;
  /** Use a specific page; if omitted, uses the test's default page. */
  page?: Page;
};

function inferDomain(
  optsDomain?: Domain,
  baseURL?: string,
  projectLocale?: unknown
): Domain {
  if (optsDomain) return optsDomain;
  if (baseURL?.includes('.it')) return 'it';
  if (baseURL?.includes('.ro')) return 'ro';
  const lc = String(projectLocale ?? '').toLowerCase();
  if (lc.startsWith('it')) return 'it';
  if (lc.startsWith('ro')) return 'ro';
  return 'ro';
}

function storagePathFor(role: Role, domain: Domain, idx: number): string {
  const cred = credentials[role][idx % credentials[role].length];
  const mapped = cred.storageState[domain];
  if (!mapped) {
    throw new Error(
      `[storagePathFor] Missing storageState mapping for role=${role}, domain=${domain}`
    );
  }
  return path.resolve(process.cwd(), mapped);
}

function parseJwtExp(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function storageHasValidToken(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const token = state?.origins
      ?.flatMap((o: any) => o.localStorage)
      ?.find((e: any) => e.name === 'access_token')?.value as string | undefined;
    if (!token) return false;
    const exp = parseJwtExp(token);
    if (!exp) return true; // if no exp in JWT, assume valid when present
    const now = Math.floor(Date.now() / 1000);
    return exp - now > 120; // keep 2m safety margin
  } catch {
    return false;
  }
}

type StorageState = {
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Lax' | 'None' | 'Strict';
  }>;
  origins?: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

/**
 * Apply a saved storageState to the *existing* context + page.
 */
async function applyStorageStateToExistingContext(targetPage: Page, filePath: string): Promise<void> {
  const method = 'applyStorageStateToExistingContext';
  logger.info(`[${method}] Start... ${filePath}`);

  if (!fs.existsSync(filePath)) {
    logger.info(`[${method}] No storage file found at: ${filePath}`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StorageState;

  // 1) Cookies -> context
  if (raw.cookies?.length) {
    await targetPage.context().addCookies(raw.cookies);
  }

  // 2) LocalStorage -> per origin
  for (const origin of raw.origins ?? []) {
    await targetPage.goto(origin.origin, { waitUntil: 'domcontentloaded' });
    for (const kv of origin.localStorage) {
      // eslint-disable-next-line no-await-in-loop
      await targetPage.evaluate(([k, v]) => localStorage.setItem(k, v), [kv.name, kv.value] as const);
    }
  }

  logger.info(`[${method}] End.`);
}

/**
 * Logs in via UI, waits for token, saves storageState (single source of truth).
 */
async function doLoginAndSaveState(
  targetPage: Page,
  role: Role,
  domain: Domain,
  accountIndex: number,
  baseURLFromProject?: string
): Promise<string> {
  const method = 'doLoginAndSaveState';
  logger.info(`[${method}] Start... role=${role}, domain=${domain}, accountIndex=${accountIndex}`);

  const cred = credentials[role][accountIndex % credentials[role].length];
  const storagePath = storagePathFor(role, domain, accountIndex);

  const domainURL = baseURLFromProject ?? (domain === 'ro' ? 'https://answear.ro' : 'https://answear.it');

  const cookieBanner = new CookieBanner(targetPage);
  const userPage = new UsersPage(targetPage);

  // 1) Navigate home
  await targetPage.goto(domainURL, { waitUntil: 'domcontentloaded' });
  logger.info(`[${method}] Navigated to ${domainURL}`);

  // 2) Accept cookies BEFORE login (if present)
  await cookieBanner.clickIfPresent();
  logger.info(`[${method}] Cookie banner handled (pre-login)`);

  // 3) Login (UI)
  await userPage.loginUsers(cred.email, cred.password);
  logger.info(`[${method}] Login submitted for ${role}`);

  // 4) Deterministic wait: localStorage token is JWT-like
  await targetPage.waitForFunction(
    () => {
      const t = window.localStorage.getItem('access_token');
      return !!t && t.split('.').length === 3;
    },
    { timeout: 15_000 }
  );

  // 5) Save storage state
  await targetPage.context().storageState({ path: storagePath });
  logger.info(`[${method}] Storage state saved at: ${storagePath}`);

  // Optional: also persist User token to a file
  if (role === Role.User) {
    const token = await targetPage.evaluate(() => window.localStorage.getItem('access_token'));
    if (!token || token.split('.').length !== 3) {
      logger.error(`[${method}] Invalid token after login for ${role} on ${domain}`);
      throw new Error(`❌ Invalid token for ${role} on ${domain}`);
    }
    const tokenPath = path.resolve(`auth/userAccessToken-${domain}-0.txt`.replace('-0', `-${accountIndex}`));
    fs.writeFileSync(tokenPath, token, 'utf-8');
    logger.info(`[${method}] ✅ Saved User token at ${tokenPath}`);
  }

  logger.info(`[${method}] End.`);
  return storagePath;
}

export const test = base.extend<{
  /**
   * Logs in the CURRENT context as the given role.
   * - Reuses storageState if present & valid (token not near-expiry)
   * - Regenerates if missing/expired or opts.force=true
   * - Applies saved state to current context on reuse (cookies + localStorage)
   * - Supports domain (ro/it), accountIndex (0/1), and optional page override
   * @returns absolute storageState path used
   */
  loginAs: (role: Role, opts?: LoginOpts) => Promise<string>;
}>({
  loginAs: async ({ page }, use, testInfo) => {
    const baseURLFromProject = testInfo.project.use.baseURL as string | undefined;

    await use(async (role: Role, opts?: LoginOpts) => {
      const targetPage = opts?.page ?? page; // allow overriding the page
      const domain: Domain = inferDomain(opts?.domain, baseURLFromProject, testInfo.project.use.locale);
      const accountIndex = opts?.accountIndex ?? testInfo.workerIndex; // default: worker index
      const storagePath = storagePathFor(role, domain, accountIndex);

      const method = 'loginAs';
      logger.info(
        `[${method}] Start... project=${testInfo.project.name}, baseURL=${baseURLFromProject ?? 'N/A'}, role=${role}, domain=${domain}, accountIndex=${accountIndex}`
      );

      const canReuse = !opts?.force && storageHasValidToken(storagePath);

      if (canReuse) {
        logger.info(`[${method}] Reusing storageState: ${storagePath}`);
        // IMPORTANT: do NOT call page.context().storageState({ path }) here — that WRITES.
        await applyStorageStateToExistingContext(targetPage, storagePath);
      } else {
        logger.info(`[${method}] Missing/expired state. Generating fresh...`);
        await doLoginAndSaveState(targetPage, role, domain, accountIndex, baseURLFromProject);
      }

      logger.info(`[${method}] End.`);
      return storagePath;
    });
  },
});

export { expect } from '@playwright/test';
