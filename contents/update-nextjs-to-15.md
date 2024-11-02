---
title: "Next.js 15にアップデートした"
createdAt: "2024-11-02T13:41:02.000Z"
tags: ["nextjs"]
---

このサイトで使っているNext.jsをv15にアップデートしました。

所詮ブログサイトなのでほとんど大きな変更はないですが、変更した内容を残しておきます。

## 内容

### パッケージのアップデート

使っているNext.js関連のパッケージを一気にアップデートします。

```bash
npm i next@latest react@rc react-dom@rc @types/react@latest @types/react-dom@latest @next/bundle-analyzer@latest @next/third-parties@latest
```

注意点は、Next.js自体はv15が正式リリースされていますが、React v19はまだRC版です。なのでインストール時は `@rc` をつけてインストールします。

### Async Request APIs

Next.js 15から`page.tsx`や`layout.tsx`の`params`は`Promise`で渡されるようになります。Async Request APIsと呼ばれている破壊的変更です。

このブログで例を挙げると、`app/articles/[slug]/page.tsx`はもともと次のように`slug`パラメーターを取得できていました。

```tsx
type Params = {
  slug: string;
};

const ArticlePage: React.FC<{ params: Params }> = async ({ params }) => {
  const { slug } = params;
  const article = getArticle(slug);

  if (!article) notFound();

  return <Article article={article} />;
};
```

Next.js 15からは、次のように`Promise`で渡されるため、`await`で取得する必要があります。

```tsx
type Params = {
  slug: string;
};

const ArticlePage: React.FC<{
  params: Promise<Params>;
}> = async ({ params }) => {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  return <Article article={article} />;
};
```

このブログでは2箇所だけAsync Request APIsを使っているので、それぞれ手で修正しました。codemodが公式提供されているため、大規模プロジェクトでもある程度自動で書き換えが可能です。

他にもこれまで同期関数やプレーンオブジェクトだったものが非同期関数や`Promise`オブジェクトに変わっています。`page.tsx`, `layout.tsx`のコンポーネントだけでなく、`route.ts`や`opengraph-image.tsx`、`generateMetadata`関数なども対象です。

- `cookies()`
- `headers()`
- `draftMode()`
- `params`
- `searchParams`

詳しくはこちら。

https://nextjs.org/blog/next-15#async-request-apis-breaking-change

リクエストに依存しない部分はどんどん先にレンダリングして、本当にリクエストが必要な部分のレンダリングのときに初めて`await`するように変更していくという方針転換のようですね。

### Client Router Cacheを復活させる

Next.js 15からClient Router Cacheが廃止されました。今までは一度訪問したページはしばらくNext.jsのrouterが記憶していて、再訪問してもページ取得リクエストしないようになっていましたが、この挙動がなくなります。同じページに訪問した回数だけリクエストが飛ぶようになるわけです。

ブログサイトの更新頻度は非常に少ないので、これまでのClient Router Cacheは維持されていてほしいところです。これはnext.configに新たに追加された`experimental.staleTimes.dynamic`にキャッシュタイムを指定することで以前の挙動と同じようにできます。

```js
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
```

詳しくはこちら。

https://nextjs.org/blog/next-15#client-router-cache-no-longer-caches-page-components-by-default

### ESLint Flat Config移行

Next.jsの`next lint`がESLint v9をサポートしたので、Flat Configを使うように変更しました。

初めてFlat Configの設定ファイルを書くので、TypeScript ESlintのサイトを参考に、eslint:recommendedとtypescript-eslint/recommendedを読み込みました。

https://typescript-eslint.io/getting-started/

続いて、Next.jsのESLintプラグインもいれるのですが、eslint-config-nextがFlat Configに対応していないので、次のGitHub Discussionを参考に、eslint-plugin-next、eslint-plugin-react、eslint-plugin-react-hooksを明示的に読み込むようにしました。

https://github.com/vercel/next.js/discussions/49337

このブログサイトの完全なeslint設定ファイルは次のリンクを御覧ください。

https://github.com/y-hiraoka/stin-blog/blob/defc0b9da546f648e4bcdba14960c09571561c79/eslint.config.js

### Turbopackの使用は諦めた

Next.js 15から、開発ビルドでのTurbopackが使えるようになりました。

```json
scripts: {
  "dev": "next dev --turbo",
}
```

しかし、このブログサイトではcontentlayerを使ってマークダウンファイルの処理をしていますが、これがWebpackに依存しており、Turbopackで動きませんでした。

ただ、途中までTurbopackを使おうと試していてわかったことを残しておきます。

Turbopackではnext.configの`experimental.typedRoutes`がまだサポートされていないようです。なので一旦`typedRoutes`を無効にしました(というかなぜか型チェックできてなかった)。

Turbopackを有効化するときに`src/app/favicon.ico`でエラーが出ました。なぜか素のfaviconをビルドしようとして失敗しているようでした。GitHub Issueにすでに報告されていました。

https://github.com/vercel/next.js/issues/71609

`favicon.ico`をビルドが通らない`public`ディレクトリに移動することで、とりあえず解決しました。`src/app/favicon.ico`と`public/favicon.ico`では、レスポンス時の`Cache-Control`が次のように微妙に異なります。

- `src/app/favicon.ico`: `cache-control: public, max-age=0, must-revalidate`
- `public/favicon.ico`: `Cache-Control: public, max-age=0`

faviconの`must-revalidate`の有無は大した問題ではないのでよいでしょう。

## まとめ

このブログサイトのNext.jsをv15にアップデートしました。キャッシュ周りやAsync Request APIsなどの破壊的変更によるインパクトが大きいですね。でも、React Server ComponentsやApp Routerで最強になったNext.jsが大好きなので今後も使い続けます。

それでは良いNext.jsライフを！
