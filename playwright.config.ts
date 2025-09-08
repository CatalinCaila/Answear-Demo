// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';

// Load .env files: .env, .env.dev, .env.prod, etc.
dotenvFlow.config({
  path: './',
  node_env: process.env.NODE_ENV || 'dev', // default to dev
});

export default defineConfig({
  // Use repo root; each project selects its own tests
  testDir: './',
  timeout: 400_000,
  expect: { timeout: 50_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
  ['line'], // consola clasică
  ['allure-playwright'], // fișiere JSON Allure
  ['html'], // opțional, păstrezi și raportul Playwright
],

  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },
    trace: 'on',
    screenshot: 'on',
    video: { mode: 'retain-on-failure', size: { width: 1280, height: 720 } },
    testIdAttribute: 'data-test',
    ignoreHTTPSErrors: true,
  },

  projects: [
    // ---------- SETUP (must run first) ----------
    {
      name: 'setup-RO',
      testMatch: ['setup/auth.setup.spec.ts'], 
      use: { ...devices['Desktop Chrome'], baseURL: 'https://answear.ro', locale: 'ro' },
      metadata: { domain: 'ro' },
    },
    {
      name: 'setup-IT',
      testMatch: ['setup/auth.setup.spec.ts'],
      use: { ...devices['Desktop Chrome'], baseURL: 'https://answear.it', locale: 'it' },
      metadata: { domain: 'it' },
    },

 //   ---------- EXAMPLE TESTS (depend on setup) ----------
    // {
    //   name: 'MultiRole',
    //   testMatch: ['multiRole.spec.ts'],
    //   use: { ...devices['Desktop Chrome'], baseURL: 'https://answear.ro', locale: 'ro' },
    //   dependencies: ['setup-RO'],
    // }

    {
      name: 'compare-product',
      testMatch: ['ui/compare.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        // User = account 1
        storageState: './auth/userAuth-RO-1.json',
      },
      dependencies: ['setup-RO'],
    },

    // ---------- CROSS-BROWSER SEARCH (RO) ----------
    {
      name: 'search-desktop-RO-account-0', // Admin acc 0
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/adminAuth-RO-0.json',
      },
    //  dependencies: ['setup-RO'],
    },
    {
      name: 'search-desktop-RO-account-1', // User acc 1
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/userAuth-RO-1.json',
      },
      dependencies: ['setup-RO'],
    },
    {
      name: 'search-mobile-RO-account-0', // Admin acc 0
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/adminAuth-RO-0.json',
      },
      dependencies: ['setup-RO'],
    },
    {
      name: 'search-mobile-RO-account-1', // User acc 1
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/userAuth-RO-1.json',
      },
      dependencies: ['setup-RO'],
    },

    // ---------- CROSS-BROWSER SEARCH (IT) ----------
    {
      name: 'search-desktop-IT-account-0', // Admin acc 0
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/adminAuth-IT-0.json',
      },
      dependencies: ['setup-IT'],
    },
    {
      name: 'search-desktop-IT-account-1', // User acc 1
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/userAuth-IT-1.json',
      },
      dependencies: ['setup-IT'],
    },
    {
      name: 'search-mobile-IT-account-0', // Admin acc 0
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/adminAuth-IT-0.json',
      },
      dependencies: ['setup-IT'],
    },
    {
      name: 'search-mobile-IT-account-1', // User acc 1
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/userAuth-IT-1.json',
      },
      dependencies: ['setup-IT'],
    },

    // ---------- MOCKS ----------
    {
      name: 'mock-search-element-not-found',
      testMatch: ['mocks/search.mocked.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/userAuth-RO-1.json', // run as User
      },
      dependencies: ['setup-RO'],
    },

    // ---------- API ----------
    {
      name: 'api-web-search',
      testMatch: ['tests/api/webSearch.api.spec.ts'],
      use: { baseURL: 'https://answear.ro' },
      // No storageState needed for pure API tests unless you require auth cookies
    },
  ],
});
