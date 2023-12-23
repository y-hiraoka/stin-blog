import { test, expect } from "@playwright/test";
import { allArticles } from ".contentlayer/generated/index.mjs";

allArticles.forEach((article) => {
  test(article.slug, async ({ page }) => {
    await page.goto(`/articles/${article.slug}`);

    await expect(page).toHaveScreenshot({
      fullPage: true,
    });
  });
});
