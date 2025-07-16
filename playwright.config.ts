import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120_000, // 15 minutes per test
  expect: {
    timeout: 24_000 // Timeout for assertions
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',

  use: {
    headless: process.env.CI ? true : false,
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
    },


    // ✅ UI test that compares paginated content (desktop)
    {
      name: 'Compare product',
      testMatch: 'compare.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },



    // ✅ Mock API response for search results (desktop)
    {
      name: 'MockSearch',
      testMatch: 'search.mocked.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },

    // ✅ Cross-device testing (Pixel 5)


    {
      name: 'desktop',
      testMatch: ['tests/search.cross.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: './auth/userAuth.json',
      },
    },
    {
      name: 'mobile',
      testMatch: ['tests/search.cross.spec.ts'],
      use: {
        ...devices['Galaxy S9+'],
        storageState: './auth/userAuth.json',
      },
    
    },

    {
    name: 'api',
    testMatch: ['tests/webSearch.api.spec.ts'],
    use: {} // no device emulation needed
  }

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
