// fixtures/auth/roleFixture.ts
import { test as base, Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { credentials } from '../../utils/auth/credentials';
import { Role } from '../../utils/config/roleTypes';
import { logger } from '../../utils/logger/logger';
import { LoginPage } from '../../pages/web/LoginPage';
import { CookieBanner } from '../../utils/helpers/cookieBanner';

type Domain = 'ro' | 'it';

type LoginOpts = {
  domain?: Domain;
  force?: boolean;
  accountIndex?: number;
  /** Use a specific page; if omitted, uses the test's default page. */
  page?: Page;
};

/** Infer domain from opts → project baseURL → project locale. */
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

/** Deterministic storage path: <repo>/auth/<role>Auth-<DOMAIN>-<index>.json */
function storagePathFor(role: Role, domain: Domain, idx: number): string {
  const methodName = 'storagePathFor';
  const rolePrefix = role === Role.Admin ? 'admin' : 'user';
  const abs = path.resolve(process.cwd(), `auth/${rolePrefix}Auth-${domain.toUpperCase()}-${idx}.json`);
  logger.info(`[${methodName}] Path resolved: ${abs}`);
  return abs;
}

/** Parse  JSON Web Token exp (seconds since epoch) if present; otherwise null. */
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

/** Check storageState file has a not-near-expiry 'access_token' in localStorage. */
function storageHasValidToken(filePath: string): boolean {
  const methodName = 'storageHasValidToken';
  if (!fs.existsSync(filePath)) {
    logger.info(`[${methodName}] No file at ${filePath}`);
    return false;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const state = JSON.parse(raw) as {
      origins?: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>;
    };

    const token = state?.origins
      ?.flatMap((o) => o.localStorage)
      ?.find((e) => e.name === 'access_token')?.value as string | undefined;

    if (!token) {
      logger.info(`[${methodName}] No access_token in ${filePath}`);
      return false;
    }

    const exp = parseJwtExp(token);
    if (!exp) {
      logger.info(`[${methodName}] Token has no exp claim — treating as valid.`);
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now;
    const ok = remaining > 120; // 2m safety margin
    logger.info(`[${methodName}] Token remaining=${remaining}s => valid=${ok}`);
    return ok;
  } catch (err) {
    logger.info(`[${methodName}] Failed to read/parse ${filePath}: ${(err as Error).message}`);
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
 * - Adds cookies to the context
 * - Restores localStorage per origin via a temporary page, to avoid nuking the test's current page
 */
async function applyStorageStateToExistingContext(targetPage: Page, filePath: string): Promise<void> {
  const methodName = 'applyStorageStateToExistingContext';
  logger.info(`[${methodName}] Start... ${filePath}`);

  if (!fs.existsSync(filePath)) {
    logger.info(`[${methodName}] No storage file found at: ${filePath}`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StorageState;

  // 1) Cookies -> context
  if (raw.cookies?.length) {
    await targetPage.context().addCookies(raw.cookies);
  }

  // 2) LocalStorage -> per origin
  for (const origin of raw.origins ?? []) {
    const tmpPage = await targetPage.context().newPage();
    try {
      await tmpPage.goto(origin.origin, { waitUntil: 'domcontentloaded' });
      for (const { name, value } of origin.localStorage ?? []) {
        // eslint-disable-next-line no-await-in-loop
        await tmpPage.evaluate(([k, v]) => localStorage.setItem(k, v), [name, value] as const);
      }
      logger.info(`[${methodName}] Restored ${origin.localStorage.length} localStorage items for ${origin.origin}`);
    } finally {
      await tmpPage.close();
    }
  }

  logger.info(`[${methodName}] End.`);
}

/**
 * Logs in via UI, waits for token, saves storageState (single source of truth).
 * - Uses accountIndex as provided (no modulo)
 * - Falls back to cred[0] if cred[accountIndex] not present
 * - Saves user JWT to auth/userAccessToken-<domain>-<index>.txt
 */
async function doLoginAndSaveState(
  targetPage: Page,
  role: Role,
  domain: Domain,
  accountIndex: number,
  baseURLFromProject?: string
): Promise<string> {
  const methodName = 'doLoginAndSaveState';
  logger.info(`[${methodName}] Start... role=${role}, domain=${domain}, accountIndex=${accountIndex}`);

  // Resolve credentials with safe fallback
  const list = credentials[role] ?? [];
  if (!list.length) {
    throw new Error(`[${methodName}] ❌ No credentials configured for role=${role}`);
  }
  const cred = list[accountIndex] ?? list[0]; // fallback lets you keep only *_EMAIL_0

  const storagePath = storagePathFor(role, domain, accountIndex);
  const domainURL = baseURLFromProject ?? (domain === 'ro' ? 'https://answear.ro' : 'https://answear.it');

  const cookieBanner = new CookieBanner(targetPage);
  const loginPage = new LoginPage(targetPage);

  try {
    // 1) Navigate home
    await targetPage.goto(domainURL, { waitUntil: 'domcontentloaded' });
    logger.info(`[${methodName}] Navigated to ${domainURL}`);

    // 2) Accept cookies BEFORE login (if present)
    await cookieBanner.clickIfPresent();
    logger.info(`[${methodName}] Cookie banner handled (pre-login)`);

    // 3) Login (UI)
    await loginPage.loginUsers(cred.email, cred.password);
    logger.info(`[${methodName}] Login submitted for ${role} using email=${cred.email}`);

    // 4) Wait for JWT-like token to appear in localStorage
    await targetPage.waitForFunction(
      () => {
        const t = window.localStorage.getItem('access_token');
        return !!t && t.split('.').length === 3;
      },
      { timeout: 15_000 }
    );

    // 5) Save storage state
    await targetPage.context().storageState({ path: storagePath });
    logger.info(`[${methodName}] Storage state saved at: ${storagePath}`);

    // Optional: also persist User token to a file (use exact accountIndex)
    if (role === Role.User) {
      const token = await targetPage.evaluate(() => window.localStorage.getItem('access_token'));
      if (!token || token.split('.').length !== 3) {
        logger.error(`[${methodName}] Invalid token after login for ${role} on ${domain}`);
        throw new Error(`❌ Invalid token for ${role} on ${domain}`);
      }
      const tokenPath = path.resolve(`auth/userAccessToken-${domain}-${accountIndex}.txt`);
      fs.writeFileSync(tokenPath, token, 'utf-8');
      logger.info(`[${methodName}] ✅ Saved User token at ${tokenPath}`);
    }

    logger.info(`[${methodName}] End.`);
    return storagePath;
  } catch (err) {
    try {
      await targetPage.screenshot({
        path: `auth/_login-failure-${role}-${domain}-${accountIndex}.png`,
        fullPage: true,
      });
    } catch {
      // ignore
    }
    logger.error(`[${methodName}] ❌ Failed: ${(err as Error).message}`);
    throw err;
  }
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
      const methodName = 'loginAs';
      const targetPage = opts?.page ?? page;
      const domain: Domain = inferDomain(opts?.domain, baseURLFromProject, testInfo.project.use.locale);

      // Default account per role: Admin→0, User→1
      const defaultIdx = role === Role.Admin ? 0 : 1;
      const accountIndex = opts?.accountIndex ?? defaultIdx;

      const storagePath = storagePathFor(role, domain, accountIndex);

      logger.info(
        `[${methodName}] Start... project=${testInfo.project.name}, baseURL=${baseURLFromProject ?? 'N/A'}, role=${role}, domain=${domain}, accountIndex=${accountIndex}`
      );

      const canReuse = !opts?.force && storageHasValidToken(storagePath);
      if (canReuse) {
        logger.info(`[${methodName}] Reusing storageState: ${storagePath}`);
        // IMPORTANT: do NOT call page.context().storageState({ path }) here — that WRITES.
        await applyStorageStateToExistingContext(targetPage, storagePath);
      } else {
        logger.info(`[${methodName}] Missing/expired state. Generating fresh...`);
        await doLoginAndSaveState(targetPage, role, domain, accountIndex, baseURLFromProject);
      }

      logger.info(`[${methodName}] End.`);
      return storagePath;
    });
  },
});

export { expect };
