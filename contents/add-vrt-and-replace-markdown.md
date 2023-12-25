---
title: "ブログに Playwright で VRT を導入した"
createdAt: "2023-12-25T14:51:59.876Z"
tags: ["playwright"]
---

## Intro

記事ページのスタイルを維持したまま内部実装に大きめの変更を加えたかったので、Visual Regression Test(VRT)を導入しました。

といってもあまりに簡易的な内容です。CI で自動化とか Chromatic とか大規模なことはしていません。ただローカルPCで Playwright を動かして、変更前と変更後のスクリーンショットを比較するだけです。

大したことはしていないので日記だと思って読んでいただけると良いかと思います。

## Playwright とは

https://playwright.dev/

Playwright は Microsoft が開発している e2e テストツールです。コードでブラウザを操作して、状態を確認することでテストを行います。

また、ブラウザが描画した画面のスクリーンショットを撮影しておくこともできます。複数回同じページを撮影して、その画像を比較することでスタイルのデグレを検知することが可能です。

## やったこと

### Playwright のセットアップ

まずは[ドキュメントの通りに](https://playwright.dev/docs/intro)セットアップコマンドを実行します。

```bash
npm init playwright@latest
```

テストコードの保存ディレクトリは `vrt` にしました。

### テストコード

セットアップコマンドで生成されたテストコードを書き換えます。今回は記事ページの変更を検知したいので、すべての記事データを含む配列 `allArticles` をインポートして、それをもとにスクリーンショットの撮影をしています。

```ts
import { test, expect } from "@playwright/test";
import { allArticles } from "contentlayer/generated";

allArticles.forEach((article) => {
  test(article.slug, async ({ page }) => {
    await page.goto(`/articles/${article.slug}`);

    await expect(page).toHaveScreenshot({
      fullPage: true,
    });
  });
});
```

初めてのテスト実行時に `.toHaveScreenshot()` によってスクリーンショットを撮影し、テストコードと同じディレクトリに保存しておいてくれます。2回目以降にテストコードが実行される時は、保存されたスクリーンショットと比較して差分があるかどうかを判定してくれます。テストの実行が終わったときにわかりやすいレポートを表示してくれるサーバーを起動してくれます。

`fullPage: true` によって、ページ全体を1枚に収めるように撮影してくれます。

### 問題発生

`npx playwright test` でテストを実行すると次のエラーが発生しました。

```
Error: require() of ES Module /Users/stin/stin-blog/node_modules/contentlayer/dist/client/index.js from /Users/stin/stin-blog/.contentlayer/generated/index.mjs not supported.
```

モジュール関連のエラーです。JavaScript 使ってて一番見たくない、よく分からないので…。

### 解決方法を探る

CJS から ESM を `require()` できないことは知ってるなと思い出しました。そこで、プロジェクト自体を ESM にしてみることにしました。

package.json に `"type": "module"` を追加します。すると `next.config.js` が ESM として扱われるので、`next.config.js` に書かれた `require()` を `import` に書き換えます。

しかし、`next.config.js` を ESM にすると別の問題が起きることがわかっています。それは、[以前の記事でも触れた](https://blog.stin.ink/articles/introduce-contentlayer#nextjs-config-%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)、`next.config.js` を ESM として `withContentlayer` を使用すると、大量の警告が吐かれることです。黄色い警告が表示される以外何も問題なく動作しているのですが、Vercel にデプロイする際に警告がエラー扱いされるため、なんとか解消する必要があります。

そこで、明示的に CJS として扱ってもらうために `next.config.cjs` にリネームしてみました。しかし残念ながら Next.js の config ファイルは `next.config.js` or `next.config.mjs` しか許容されていないようでした。つまり、CJS プロジェクトで config を ESM にすることはできるが、ESM プロジェクトで config を CJS にすることはできないということですね。

そこで package.json は `"type": "module"` のまま、強引な解決として `withContentlayer` を re-export するだけの `next-contentlayer.cjs` を用意してみました。

```js
module.exports = require("next-contentlayer");
```

これを ESM である `next.config.js` から `import` してみたところ、警告が出なくなりました。本当に `withContentlayer` が CJS であれば良いだけだったようです。

ESM プロジェクトにしたことでテストも実行できるようになりました。全記事ページのスクリーンショットを撮影して、スクリーンショットを撮影しておいてくれました。

ちなみに記事ページへの大きめの変更というのは既に済ませていて、Playwright の VRT 機能のおかげでスタイル崩れを一切することなく完了できました。便利。どんな変更をしたかはまたいずれ記事にすると思います。

## まとめ

記事ページの実装を変更する前に簡単な VRT を導入してみました。e2e テストツールの Playwright ですが、VRT にも使えて便利ですね。おかげで記事ページの内部実装も無事成功しました。

VRT 導入中に遭遇したモジュール関連のエラー対応で、ちょっとだけ JS モジュール力が上がった気がします。(本当か？)

それでは良い VRT ライフを！
