import { test, expect } from "@playwright/test";
import { allArticles } from "contentlayer/generated";

// Twitter ウィジェットは読み込み後に iframe を動的リサイズし、サイズが安定せず
// フレーキーになる。読み込み自体をブロックし、決定的なフォールバック
// (リンクの blockquote)のまま撮影する。
test.beforeEach(async ({ page }) => {
  await page.route(/platform\.twitter\.com/, (route) => route.abort());
});

allArticles.forEach((article) => {
  test(article.slug, async ({ page }) => {
    await page.goto(`/articles/${article.slug}`);
    // リッチリンクカード等の外部画像が非同期で読み込まれ、撮影中に
    // レイアウトが揺れてフレーキーになるため、通信が落ち着くまで待つ。
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot({
      fullPage: true,
      // アニメーション GIF はフレームが止まらず撮影ごとに差分が出るためマスクする
      // (GIF を含む記事のみ対象。他の記事ではマッチせず影響なし)。
      mask: [page.locator('img[src$=".gif"]')],
    });
  });
});
