import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./vrt",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-sm",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 30 * 16, height: 720 },
      },
    },
    {
      name: "chromium-md",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 60 * 16, height: 720 },
      },
    },
    {
      name: "chromium-lg",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 62 * 16, height: 720 },
      },
    },
    {
      name: "chromium-xl",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 80 * 16, height: 720 },
      },
    },
  ],

  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
