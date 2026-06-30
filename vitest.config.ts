import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // vrt/ は Playwright の VRT テスト（playwright.config.ts の testDir）なので
    // vitest の対象からは除外し、src 配下のユニットテストのみを実行する。
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
