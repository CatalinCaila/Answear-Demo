// tests/ui/multi-role.dashboard.same-context.spec.ts
import { test, expect } from '../../fixtures/auth/roleFixture';
import { Role } from '../../utils/config/roleTypes';

test.describe('@dev @qa @stage @ui @multi-role @cart @state @regression', () => {
  test('Admin and User have different cart count state (same context)', async ({ page, loginAs }, testInfo) => {
    // --- User in SAME context ---
    await loginAs(Role.User, { accountIndex: 0, page });
    await page.goto('/c/barbati');

    const userCartCount = page.getByTestId('cart_count');
    await expect(userCartCount).toBeVisible();
    await expect(userCartCount).toHaveText('1'); // adjust if UI shows '0'

    // --- Switch to Admin in SAME context ---
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await loginAs(Role.Admin, { accountIndex: 1, page, force: true });
    await page.goto('/c/barbati');

    const adminCartCount = page.getByTestId('cart_count');
    // Use the assertion matching your app’s behavior:
    await expect(adminCartCount).toHaveCount(0);
  });
});
