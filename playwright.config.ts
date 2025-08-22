import { defineConfig, devices } from '@playwright/test';
import dotenvFlow from 'dotenv-flow';

// ✅ Dynamically load environment variables
dotenvFlow.config({
  path: './',
  node_env: process.env.NODE_ENV || 'prod', // Defaults to dev
});

export default defineConfig({
  testDir: './tests',
  timeout: 400_000, //
  expect: {
    timeout: 50_000, // Timeout for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    viewport: { width: 1920, height: 1080 },
    trace: 'on',
    screenshot: 'on',
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 },
    },
    testIdAttribute: 'data-test',
    ignoreHTTPSErrors: true,
  },

  projects: [
  // ✅ Setup login/auth state for user and admin roles
 {
  name: 'setup-RO',
  testDir: './setup',
  testMatch: 'setup/auth.setup.spec.ts',               // serialize setup to avoid races
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://answear.ro',
    locale: 'ro',
  },
  metadata: {
    domain: 'ro',
  },
},
{
  name: 'setup-IT',
  testDir: './setup',
  testMatch: 'setup/auth.setup.spec.ts',

  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://answear.it',
    locale: 'it',
  },
  metadata: {
    domain: 'it',
  },
},

     {
      name: 'MultiRole',
      testMatch: 'multiRole.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro', 
        locale: 'ro', 
      },
    },

    {
      name: 'compare-product',
      testMatch: 'ui/compare.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro', 
        storageState: './auth/userAuth-RO-0.json',
        locale: 'ro', 
      },
    },

    {
      name: 'search-desktop-RO-account-0',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/userAuth-RO-0.json', 
      },
    },
    {
      name: 'search-desktop-RO-account-1',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/adminAuth-RO-1.json',
      },
    },
    {
      name: 'search-mobile-RO-account-0',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/userAuth-RO-0.json',
      },
    },
    {
      name: 'search-mobile-RO-account-1',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.ro',
        locale: 'ro',
        storageState: './auth/adminAuth-RO-1.json',
      },
    },
    {
      name: 'search-desktop-IT-account-0',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/userAuth-IT-0.json',
      },
    },
    {
      name: 'search-desktop-IT-account-1',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/adminAuth-IT-1.json',
      },
    },
    {
      name: 'search-mobile-IT-account-0',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/userAuth-IT-0.json',
      },
    },
    {
      name: 'search-mobile-IT-account-1',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        baseURL: 'https://answear.it',
        locale: 'it',
        storageState: './auth/adminAuth-IT-1.json',
      },
    },
    {
      name: 'mock-search-element-not-found',
      testMatch: 'mocks/search.mocked.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://answear.ro', 
        storageState: './auth/userAuth-RO-0.json',
        locale: 'ro', 
      },
    },

    {
      name: 'api-web-search',
      testMatch: ['tests/api/webSearch.api.spec.ts'],
      use: {
        baseURL: 'https://answear.ro', 
      },
    },
  ],
});
