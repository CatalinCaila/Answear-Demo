import { defineConfig, devices } from '@playwright/test';

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
      name: 'Setup',
      testMatch: 'auth.setup.spec.ts',
       use: {
        ...devices['Desktop Chrome']
      },
    },


    {
      name: 'Compare product',
      testMatch: 'compare.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },




    // {
    //   name: 'desktop',
    //   testMatch: ['tests/cross/search.cross.spec.ts'],
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     storageState: './auth/userAuth.json',
    //   },
    // },
    // {
    //   name: 'mobile',
    //   testMatch: ['tests/cross/search.cross.spec.ts'],
    //   use: {
    //     ...devices['Galaxy S9+'],
    //     storageState: './auth/userAuth.json',
    //   },
    // },

  //       {
  //     name: 'Mock Search',
  //     testMatch: 'search.mocked.spec.ts',
  //     use: {
  //       ...devices['Desktop Chrome'],
  //       storageState: './auth/userAuth.json',
  //     },
  //   },

  //   {
  //   name: 'api',
  //   testMatch: ['tests/api/webSearch.api.spec.ts'],
  //   use: {} // no device emulation needed
  // },

    // ✅ Optional: Firefox (cross-browser support)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // ✅ Optional: Microsoft Edge
    // {
    //   name: 'edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
  ],

  // ✅ Optional: run local dev server before starting tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
