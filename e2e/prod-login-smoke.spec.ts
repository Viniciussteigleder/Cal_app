import { test, expect } from "@playwright/test";

test("Prod smoke: login endpoint is healthy (not DB-misconfigured)", async ({ page, baseURL }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, "Set PLAYWRIGHT_BASE_URL to run this test");
  test.skip(!baseURL || !/^https?:\/\//.test(baseURL), "No baseURL configured");

  await page.goto("/login");

  // These labels exist in your UI; if they change, update the selectors.
  await page.getByLabel(/email/i).fill(process.env.PLAYWRIGHT_TEST_EMAIL || "test@example.com");
  await page.locator('input#password').fill(process.env.PLAYWRIGHT_TEST_PASSWORD || "x");

  const respPromise = page.waitForResponse((r) => {
    try {
      const u = new URL(r.url());
      return u.pathname.endsWith("/api/auth/login") && r.request().method() === "POST";
    } catch {
      return false;
    }
  });

  await page.getByRole("button", { name: /^entrar$/i }).click();

  const resp = await respPromise;
  const status = resp.status();
  const bodyText = await resp.text().catch(() => "");

  // Healthy DB/config: wrong credentials should return 401, not 503.
  expect(
    status,
    `login response status=${status} body=${bodyText}`,
  ).not.toBe(503);
});
