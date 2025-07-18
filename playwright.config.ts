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
    timeout: 50_000 // Timeout for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
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
//   ✅ Setup login/auth state for user and admin roles
    {
      name: 'setup',
      testMatch: 'setup/auth.setup.spec.ts',
       use: {
        ...devices['Desktop Chrome']
      },
    },


    {
      name: 'compare-product',
      testMatch: 'ui/compare.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },


    {
      name: 'search-cross-browser-desktop',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'], 
        storageState: './auth/userAuth.json'
      },
    },
    {
      name: 'search-cross-browser-mobile',
      testMatch: ['tests/cross-browser/search.cross.spec.ts'],
      use: { 
        ...devices['Galaxy S9+'], 
        storageState: './auth/userAuth.json'
      },
    },

        {
      name: 'mock-search-element-not-found',
      testMatch: 'mocks/search.mocked.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },

    {
    name: 'api-web-search',
    testMatch: ['tests/api/webSearch.api.spec.ts'],
    use: {} // no device emulation needed
  },


  ],

  
});
