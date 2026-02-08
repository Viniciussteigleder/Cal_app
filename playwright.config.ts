import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    // Override in CI or local runs:
    // PLAYWRIGHT_BASE_URL=https://nutri-app-cal.vercel.app npx playwright test
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    headless: true,
  },
});
