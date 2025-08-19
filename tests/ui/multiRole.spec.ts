// tests/ui/multi-role.dashboard.same-context.spec.ts
import { test, expect } from '../../fixtures/auth/roleFixture';
import { Role } from '../../utils/config/roleTypes';

test.describe('@ui @multi-role', () => {
  test('Admin and User have different cart count state (same context)', async ({ page, loginAs }, testInfo) => {
    // land on site so origin exists (uses project's baseURL)
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // --- User in SAME context ---
    await loginAs(Role.User, { accountIndex: 0, page });
    await page.goto('/c/barbati', { waitUntil: 'domcontentloaded' });

    const userCartCount = page.getByTestId('cart_count');
    await expect(userCartCount).toBeVisible();
    await expect(userCartCount).toHaveText('1'); // adjust if your UI shows '0' for user

    // --- Switch to Admin in SAME context ---
    // Clear previous auth traces to avoid mixing sessions
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await loginAs(Role.Admin, { accountIndex: 1, page, force: true });
    await page.goto('/c/barbati', { waitUntil: 'domcontentloaded' });

    const adminCartCount = page.getByTestId('cart_count');
    // Choose the assertion that matches your UI:
    // If the widget exists and shows "0":
    await expect(adminCartCount).toHaveCount(0);
    // If the widget disappears entirely, use:
    // await expect(adminCartCount).toHaveCount(0);
  });
});
