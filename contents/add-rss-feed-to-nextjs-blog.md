---
title: "Next.js ～RSS フィードの実装方法探訪記、或いは、 getServerSideProps での res.end() の考察について～"
createdAt: "2022-04-08T13:01:51.375Z"
tags: ["nextjs"]
---

この個人ブログに RSS フィード機能を実装しました。

RSS フィードとはブログの記事のタイトルや公開日などの情報を XML 形式で配信するものです。

実装方法自体はググって出てきた記事を参考に行いましたが、その中で一つ疑問があったので調べてみました。

## 参考記事

https://zenn.dev/catnose99/articles/c7754ba6e4adac

「Next.js RSS」とかで検索したらヒットした catnose さんの記事を参考に実装しました。ありがとうございます。

## 実装方法

参考記事の通りですが、 `getServerSideProps` から `res.end(feed)` とする方法で行いました。

```tsx
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const feed = await generateFeed();

  res.statusCode = 200;
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  res.setHeader("Content-Type", "text/xml");
  res.end(feed);

  return { props: {} };
};

const Page = () => null;
export default Page;
```

`getServerSideProps` で `props` を生成するのではなく、 `res` オブジェクトに直接レスポンスデータを渡しています(`feed` は string 型です)。

`Page` コンポーネントは何も受け取らず、何も描画せず、ただ Next.js のルールに則って関数を `export default` しています。

こうすることで本来の挙動である SSR(Server Side Rendering) された React アプリをブラウザに返すのではなく、 XML を返却するエンドポイントになりました。 RSS フィードの実体は XML なので、これで目的を達成できます。

余談ですが、 XML 自体の生成方法として参考記事では [rss](https://www.npmjs.com/package/rss) という npm ライブラリを紹介していましたが、僕は [feed](https://www.npmjs.com/package/feed) という npm ライブラリを使いました(`generateFeed` の内部実装)。 feed のほうがダウンロード数が多かったからという理由だけで、どちらが優れているかは調べていません。

## `getServerSideProps` で `res.end()` していいのか

ここでひとつ疑問が浮かびました。 **`getServerSideProps` が受け取る `res` オブジェクトで `res.end()` を呼んでしまっていいのだろうか** というものです。

Next.js の SSR の流れは

1. ブラウザが Next.js サーバーにリクエストする
1. `getServerSideProps` が実行され `props` が生成される
1. `props` がページコンポーネントに渡されてサーバー内で HTML が生成される
1. HTML がブラウザに返却される
1. ブラウザ上で hydration が行われる

ですが `res.end()` が実行されている場合、この処理の流れはどうなってしまうのかがわかりません。参考記事でも触れられていませんでした。

`res` オブジェクトは Node.js の組み込みライブラリである http 由来のオブジェクトなので、 `end` メソッドが生えているのは自然です。ただ、それが自由に呼ばれることを Next.js が意図しているかは不明です。

この疑問に関する答え、そして今回の実装をやっていい根拠が欲しかったので調べました。

### ドキュメントに記載なし

下記 2 つのページと、ドキュメントサイトの検索機能で調べてみましたが、 `res.end()` についての記載は見つかりませんでした。

https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props

https://nextjs.org/docs/api-reference/data-fetching/get-server-side-props

### ソースコードから探す

ドキュメントにないなら実装を読み解くしかありません。どんなコードになっているでしょうか。

(該当コードへの GitHub のリンクと、そのコードを貼り付けたコードブロックをセットで記述していますが、記事に prettier をかけているので完全一致しません。ご了承ください。)

Next.js のリポジトリ上で `getServerSideProps` を実行している箇所があるはずなのでコードの検索をします。こういう場合、ローカルマシンに git clone してもいいのですが、 github.dev を使うとブラウザ上に VSCode を展開できて便利ですね 🎉

[packages/next/server/render.tsx](https://github.com/vercel/next.js/blob/9110b5a4f1def444986744bd9fa68eb22b340ed6/packages/next/server/render.tsx#L1094)

```ts
data = await getServerSideProps({
  req: req as IncomingMessage & {
    cookies: NextApiRequestCookies;
  },
  res: resOrProxy,
  // 省略
});
```

`await getServerSideProps` の記述を見つけました。これが書いてあるのは `renderToHTML` という名前の関数の中です。名前からして見るべき部分は間違ってなさそうですね。

肝心の `res` オブジェクトは `resOrProxy` という変数が渡されており、 production 環境ではないときだけ `Proxy` で `res` 本体をラップしているようです。

[packages/next/server/render.tsx](https://github.com/vercel/next.js/blob/9110b5a4f1def444986744bd9fa68eb22b340ed6/packages/next/server/render.tsx#L1063)

```ts
let canAccessRes = true;
let resOrProxy = res;
let deferredContent = false;
if (process.env.NODE_ENV !== "production") {
  resOrProxy = new Proxy<ServerResponse>(res, {
    get: function (obj, prop, receiver) {
      if (!canAccessRes) {
        const message =
          `You should not access 'res' after getServerSideProps resolves.` +
          `\nRead more: https://nextjs.org/docs/messages/gssp-no-mutating-res`;

        if (deferredContent) {
          throw new Error(message);
        } else {
          warn(message);
        }
      }
      const value = Reflect.get(obj, prop, receiver);

      // since ServerResponse uses internal fields which
      // proxy can't map correctly we need to ensure functions
      // are bound correctly while being proxied
      if (typeof value === "function") {
        return value.bind(obj);
      }
      return value;
    },
  });
}
```

`canAccessRes` というフラグが `false` のときに `res` にアクセスしようとするとエラーで弾くようになっていて、要するに開発中にアクセスしてはいけないタイミングでアクセスしようとすると教えてくれる親切設計なのでしょう。 `Proxy` でラップされていることは本題とは関係ありませんでした。

`resOrProxy` の出現箇所はこれだけなので、本体の `res` を追いかけてみます。

すると下の方でまさに確認したかったコードを見つけることができます。

[packages/next/server/render.tsx](https://github.com/vercel/next.js/blob/9110b5a4f1def444986744bd9fa68eb22b340ed6/packages/next/server/render.tsx#L1224)

```ts
if (isResSent(res) && !isSSG) return null;
```

`isResSent(res)` が `true` かつ SSG ではない場合、 `renderToHTML` は `null` を返却するようです。 `isResSent(res)` は `res.end()` が呼ばれていると `true` を返すのでしょう。一応 `isResSent` の実装も確認しておきます。

[packages/next/shared/lib/utils.ts](https://github.com/vercel/next.js/blob/9110b5a4f1def444986744bd9fa68eb22b340ed6/packages/next/shared/lib/utils.ts#L302-L304)

```ts
export function isResSent(res: ServerResponse) {
  return res.finished || res.headersSent;
}
```

ということで、 `res.end()` が `getServerSideProps` で呼ばれていると、 HTML は生成されないことがわかりました。 HTML が生成されないということは React アプリも当然構築されないはずです。

`renderToHTML` が `null` を返却した後も追ってみましょう。

`renderToHTML` が使用されている箇所は複数あって一番それっぽいものを追いかけます(間違っていたらすみません…)。

[packages/next/build/webpack/loaders/next-serverless-loader/page-handler.ts](https://github.com/vercel/next.js/blob/5feb400aff8e7b8968174b4e339b98ce48412180/packages/next/build/webpack/loaders/next-serverless-loader/page-handler.ts#L296-L310)

```ts
let result = await renderToHTML(
  req,
  res,
  page,
  Object.assign(
    {},
    getStaticProps ? { ...(parsedUrl.query.amp ? { amp: "1" } : {}) } : parsedUrl.query,
    nowParams ? nowParams : params,
    _params,
    isFallback ? { __nextFallback: "true" } : {},
  ),
  renderOpts,
);
```

なぜここが「一番それっぽい」と判断したかというと、 `result` 変数が使用されている箇所に根拠があります。

[packages/next/build/webpack/loaders/next-serverless-loader/page-handler.ts](https://github.com/vercel/next.js/blob/5feb400aff8e7b8968174b4e339b98ce48412180/packages/next/build/webpack/loaders/next-serverless-loader/page-handler.ts#L382-L396)

```ts
sendRenderResult({
  req,
  res,
  result: _nextData
    ? RenderResult.fromStatic(JSON.stringify(renderOpts.pageData))
    : result ?? RenderResult.empty,
  type: _nextData ? "json" : "html",
  generateEtags,
  poweredByHeader,
  options: {
    private: isPreviewMode || renderOpts.is404Page,
    stateful: !!getServerSideProps,
    revalidate: renderOpts.revalidate,
  },
});
```

`_nextData` は boolean 型で、それをフラグにして `type` を `"json"` か `"html"` か切り替えています。 `next/link` の `Link` コンポーネントを使ったページ遷移では、 HTML を要求するのではなく遷移先のデータを JSON で受け取りクライアントサイドでレンダリングすることで画面を書き換えます(開発者は意識する必要はありません)。 `_nextData` はそれを判断するためのフラグなのだろうと予想し、ここに目をつけました。

`result` 変数は `sendRenderResult` に渡されるときに null 合体演算子によって `null` の場合は `RednerResult.empty` が代わりに渡されています。では `sendRenderResult` の実装を見てみましょう。

[packages/next/server/send-payload/index.ts](https://github.com/vercel/next.js/blob/5feb400aff8e7b8968174b4e339b98ce48412180/packages/next/server/send-payload/index.ts#L16-L72)

```ts
export async function sendRenderResult({
  req,
  res,
  result,
  type,
  generateEtags,
  poweredByHeader,
  options,
}: {
  req: IncomingMessage;
  res: ServerResponse;
  result: RenderResult;
  type: "html" | "json";
  generateEtags: boolean;
  poweredByHeader: boolean;
  options?: PayloadOptions;
}): Promise<void> {
  if (isResSent(res)) {
    return;
  }

  /* 中略 */

  const payload = result.isDynamic() ? null : await result.toUnchunkedString();

  /* 中略 */

  if (req.method === "HEAD") {
    res.end(null);
  } else if (payload) {
    res.end(payload);
  } else {
    await result.pipe(res);
  }
}
```

`isResSent` がまた出てきました！そして `isResSent(res)` が `true` のときは何もしないとのこと。下の方で `res.end()` をしているのでこの関数は `res.end()` を呼ぶ担当なのでしょうが、既に呼ばれている場合は無視するということですね。

以上で、Next.js はユーザーサイドで先に `res.end()` が呼ばれているのを考慮しているので、 `getServerSideProps` の内部で `res.end()` を呼んでも問題ないということがわかりました。

## まとめ

このブログサイトに RSS フィードを実装している最中に感じた疑問を、Next.js のコードリーディングによって解決しました。

`getServerSideProps` で `res.end()` は実行できまーす！

HTML ではない動的コンテンツだけど `/api` ではない URL から配信したいエンドポイントを作る場合に応用できそうですね。

それではよい Next.js ライフを！
