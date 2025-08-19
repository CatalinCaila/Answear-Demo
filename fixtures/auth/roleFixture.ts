// fixtures/auth/roleFixture.ts
import { test as base, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { credentials } from '../../utils/auth/credentials';
import { Role } from '../../utils/config/roleTypes';
import { logger } from '../../utils/logger/logger';
import { UsersPage } from '../../pages/web/LoginPage';
import { CookieBanner } from '../../utils/helpers/cookieBanner';

type Domain = 'ro' | 'it';
type LoginOpts = { domain?: Domain; force?: boolean; accountIndex?: number };

function storagePathFor(role: Role, domain: Domain, idx: number): string {
  const cred = credentials[role][idx % credentials[role].length];
  return path.resolve(process.cwd(), cred.storageState[domain]);
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
 * Apply a saved storageState to the *existing* context and page.
 * This is the correct way to "load" state without creating a new context.
 */
async function applyStorageStateToExistingContext(page: Page, filePath: string): Promise<void> {
  const method = 'applyStorageStateToExistingContext';
  logger.info(`[${method}] Start... ${filePath}`);

  if (!fs.existsSync(filePath)) {
    logger.info(`[${method}] No storage file found at: ${filePath}`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StorageState;

  // 1) Cookies -> context
  if (raw.cookies?.length) {
    await page.context().addCookies(raw.cookies);
  }

  // 2) LocalStorage -> per origin
  for (const origin of raw.origins ?? []) {
    await page.goto(origin.origin, { waitUntil: 'domcontentloaded' });
    for (const kv of origin.localStorage) {
      // eslint-disable-next-line no-await-in-loop
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [kv.name, kv.value] as const);
    }
  }

  logger.info(`[${method}] End.`);
}

/**
 * Core routine: logs in (cookie before/after), waits for token, saves storageState.
 * Single source of truth for generating auth state.
 */
async function doLoginAndSaveState(
  page: Page,
  role: Role,
  domain: Domain,
  accountIndex: number,
  baseURLFromProject?: string
): Promise<string> {
  const method = 'doLoginAndSaveState';
  logger.info(`[${method}] Start... role=${role}, domain=${domain}, accountIndex=${accountIndex}`);

  const cred = credentials[role][accountIndex % credentials[role].length];
  const storagePath = storagePathFor(role, domain, accountIndex);

  const domainURL =
    baseURLFromProject ?? (domain === 'ro' ? 'https://answear.ro' : 'https://answear.it');

  const cookieBanner = new CookieBanner(page);
  const userPage = new UsersPage(page);

  // 1) Navigate home
  await page.goto(domainURL, { waitUntil: 'domcontentloaded' });
  logger.info(`[${method}] Navigated to ${domainURL}`);

  // 2) Accept cookies BEFORE login (if present)
  await cookieBanner.clickIfPresent();
  logger.info(`[${method}] Cookie banner handled (pre-login)`);

  // 3) Login (UI)
  await userPage.loginUsers(cred.email, cred.password);
  logger.info(`[${method}] Login submitted for ${role}`);

  // 4) Deterministic wait for auth side-effect (localStorage token present & looks like JWT)
  await page.waitForFunction(
    () => {
      const t = window.localStorage.getItem('access_token');
      return !!t && t.split('.').length === 3;
    },
    { timeout: 15_000 }
  );

  // 5) Save storage state
  await page.context().storageState({ path: storagePath });
  logger.info(`[${method}] Storage state saved at: ${storagePath}`);

  // (Optional) Persist user token separately only for Role.User (compat with original flow)
  if (role === Role.User) {
    const token = await page.evaluate(() => window.localStorage.getItem('access_token'));
    if (!token || token.split('.').length !== 3) {
      logger.error(`[${method}] Invalid token after login for ${role} on ${domain}`);
      throw new Error(`❌ Invalid token for ${role} on ${domain}`);
    }
    const tokenPath = path.resolve(`auth/userAccessToken-${domain}-${accountIndex}.txt`);
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
   * - Supports domain (ro/it) and accountIndex (0/1)
   * @returns absolute storageState path used
   */
  loginAs: (role: Role, opts?: LoginOpts) => Promise<string>;

  /**
   * Provides a *new* authenticated Page created from the saved storage state.
   * Useful when you want a guaranteed clean, logged-in context.
   */
  authedPage: Page;
}>({
  loginAs: async ({ page }, use, testInfo) => {
    const defaultDomain = (testInfo.project.use.locale as Domain) || 'ro';
    const baseURLFromProject = testInfo.project.use.baseURL as string | undefined;

    await use(async (role: Role, opts?: LoginOpts) => {
      const domain: Domain = opts?.domain ?? defaultDomain;
      const accountIndex = opts?.accountIndex ?? testInfo.workerIndex; // default: worker index
      const storagePath = storagePathFor(role, domain, accountIndex);

      const method = 'loginAs';
      logger.info(
        `[${method}] Start... role=${role}, domain=${domain}, accountIndex=${accountIndex}`
      );

      const canReuse = !opts?.force && storageHasValidToken(storagePath);

      if (canReuse) {
        logger.info(`[${method}] Reusing storageState: ${storagePath}`);
        // IMPORTANT: Do NOT call page.context().storageState({ path }) here — that WRITES.
        await applyStorageStateToExistingContext(page, storagePath);
      } else {
        logger.info(`[${method}] Missing/expired state. Generating fresh...`);
        await doLoginAndSaveState(page, role, domain, accountIndex, baseURLFromProject);
      }

      logger.info(`[${method}] End.`);
      return storagePath;
    });
  },

  authedPage: async ({ browser, loginAs }, use, testInfo) => {
    // Default role/domain for convenience. Adjust per-project or per-test as needed.
    const domain = ((testInfo.project.use.locale as Domain) || 'ro') as Domain;
    const role: Role = Role.Admin;

    const storagePath = await loginAs(role, { domain });
    const context: BrowserContext = await browser.newContext({
      storageState: storagePath,
      baseURL: testInfo.project.use.baseURL as string | undefined,
    });
    const page = await context.newPage();

    try {
      await use(page);
    } finally {
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
