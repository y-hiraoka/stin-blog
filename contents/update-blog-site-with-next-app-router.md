---
title: "ブログサイトを Next.js App Router に移行したので学びを書く"
createdAt: "2023-05-14T16:55:21.607Z"
tags: ["nextjs"]
---

このサイトを Next.js App Router で実装し直しました。Server Components が扱えてなんか便利なやつです。

移行にあたって学んだことや App Router の嬉しいポイントなどを書いておきます。

## スタイリングメソッドの移行

このブログサイトのスタイリングは vanilla-extract で書かれていました。Next.js の最新ドキュメントでは App Router でも vanilla-extract をサポートしたと書かれていましたが、ランタイム JS を必要とする CSS in JS 同様に Client Components でサポートしていると書かれていました。vanilla-extract は CSS in JS ですが完全に静的な CSS に変換されるため、Server Components でも使えそうな気はします。が、ドキュメントがそう言うのであれば仕方ありません。ということで CSS Modules に移行しました。

vanilla-extract はこのブログサイトでは短い命でした。CSS Variables を型安全に定義できるので良さげに感じたのですが、vanilla-extract 独特の書き方が多すぎて煩わしさを感じました。やはり CSS は CSS の記法のまま書けるのが好きです。

GitHub Copilot を使っているので書き換えは一瞬でした。vanilla-extract のコードをコメントアウトして CSS ファイルに残し、同じクラス名を書き始めると後は全部 Copilot が続きを書いてくれます。Copilot なしではもうコーディングできない身体になってしまいました。

## 非同期処理をコンポーネントに直接書ける

Server Components の一番の特徴ですね。

このブログサイトには URL を 1 つの段落に記述するとその URL からメタデータを取得してリッチなリンクカードとして表示する機能を実装しています。例えば次のような感じ。

https://zenn.dev/stin

いかにもブログサービスっぽいですね。これまでの実装ではクライアントサイドレンダリングで実現していました。

まず Next.js の API Routes で、URL を受け取るとそのサイトの HTML のメタデータを取得してきてレスポンスしてくれるエンドポイントを用意します。クライアントサイドで伝統的な `useEffect` 内 fetch をその API Routes に対して行い、取得したメタデータをステートに保存した上でリンクカードを描画するということをやっていました。ブラウザ JavaScript からは任意の URL にアクセスできるわけではないので、このような回りくどい実装方法になっています。

Server Components を使えば、もっと素直に書くことができるようになります。指定された URL の HTML を取得してメタデータを抽出しリンクカードを描画するということを、コンポーネント内部で `await` しながら書けるのです:

```tsx
const RichLinkCardInner: React.FC<Props> = async ({ href, isExternal }) => {
  const metadata = await fetchSiteMetadata(href);

  if (!metadata) {
    return <RichLinkCardError href={href} />;
  }

  return (
    <a className={classes.cardRoot} href={metadata.url} target="_blank" rel="noreferrer">
      ...
    </a>
  );
};
```

非常に直感的に書けていることがわかります。 Server Components はコードの可読性を格段に高めることができます。記事執筆時点では TypeScript が非同期コンポーネントに対応していないので `@ts-expect-error` をつける必要があることに注意が必要です。

もちろん制約はたくさんあります。Server Components はサーバーサイドで実行されて仮想 DOM の完成品のようなものだけがクライアントサイドに送られ、JavaScript は生成されません。そのため React Hooks が使用できません。また、DOM に対してイベントハンドラーも設定できません。Client Components から Server Components を使用することもできません。うまく使い分けることが求められますね。

Server Components をうまく使用することで、ほとんど静的ページだけど一部分だけ動的にする、といった実装も可能になります。このブログのリンクカードはまさにそれです(リンク先のメタデータの変更に追随するため)。コメント機能付きのブログサイトなどでは、記事本文は静的生成でコメント部分は最新コメントを動的に表示する、といったことも可能になります。嬉しいですね。

## Not Found ページのナビゲーションがうまく動かなかった

旧来の Pages Router の `pages/404.tsx` が担っていた Not Found ページの役割は、App Router では `app/not-found.tsx` で実装することができます。

しかし、存在しない URL を叩いて表示された `app/not-found.tsx` から next/link でトップページに戻る導線を設置しましたがこれが機能しませんでした。next/link をクリックするとブラウザの URL は変化しますが画面の再描画が走らないという状態でした。

これについては同じ不具合を訴える issue が立てられていたので様子を見ることにしました。

https://github.com/vercel/next.js/issues/49736

しかし Not Found ページを実装しないのもまずいので、Not Found ページだけは Pages Router で実装することにしました。Pages Router の `pages/404.tsx` に設置した next/link からは App Router のトップページに戻ることを確認済みです。

ただし Pages Router と App Router はレイアウト(`pages/_app.tsx` と `app/layout.tsx`)を共有しないので、そこは重複していて少し気持ち悪い状態です。また、Not Found ページに JavaScript は必要ありませんが、Pages Router では JavaScript が生成されてしまうので、パフォーマンスには少し影響があります。まぁ滅多に訪問されるページでもないので許容範囲ですが。

## useSearchParams を使うときは要注意

`useSearchParams` は URL のクエリパラメーターを取得するカスタムフックです。`URLSearchParams` の読み取り専用オブジェクトが取得できます。

カスタムフックなので Client Components でのみ使用できます。クエリパラメーターによって表示を切り替えたいようなケースは多いと思うので、このカスタムフックが活用できます。僕は今回 Google Analytics の集計のために `usePathname` と併せて使うことになりました。すこし逸れますが App Router の `useRouter` には Pages Router の `router.events` に相当するものがないため、 `usePathname` と `useSearchParams` のどちらかが変更したら実行されるような `useEffect` を設置する必要があります(先日このような `useEffect` の使い方は良くないという[過激派の記事](https://zenn.dev/uhyo/articles/useeffect-taught-by-extremist)が上がっていて心苦しいですが)。

他の Client-Side-Rendering(CSR)用ルーティングライブラリにも同様のカスタムフックがあり、気軽に使ってサクッとクエリパラメーターを読み取ることができます。しかし Next.js App Router で気軽にこの `useSearchParams` を使うと、思わぬ現象が起きました。完全に静的なページなのに HTML が pre-rendering されないようになり、全体が CSR になってしまいました。本来不要なはずの JavaScript が生成されてブラウザに送信されてしまうのです。これはドキュメントに説明されていました。

https://nextjs.org/docs/app/api-reference/functions/use-search-params#static-rendering

> If a route is statically rendered, calling useSearchParams() will cause the tree up to the closest Suspense boundary to be client-side rendered.

`useSearchParams` を使っているコンポーネントから親方向に最も近い `Suspense` までが CSR になるとのこと。 JavaScript を減らしたい場合は適切な範囲を `Suspense` で囲う必要があります。このブログサイトでは `app/layout.tsx` の子コンポーネントを Client Component にして `useSearchParams` を呼んでいたので全体が CSR になってしまっていました。 `Suspense` を使うことで最大限 pre-rendering されるようになりました。

他のルーティングライブラリに慣れていると `useSearchParams` を気軽に使ってしまいそうですが、App Router では少々気をつけて使う必要がありますね。

## TypedRoutes(experimental) がかなり嬉しい

まだ experimental ですが、App Router のディレクトリ構造から next/link の `href` の型を生成してくれる機能があります。これを有効にすることで、今まで外部ツールである pathpida で頑張っていたリンクの型安全性をビルトインで担保できるようになりました。

experimental ではありますがユーザー体験に影響するものではないので積極的に ON にしていいと思います。

## バンドルサイズの削減

やはり App Router(Server Components) の一番のメリットと言えばこれだと思います。バンドルサイズが圧倒的に削減されました。before-after を比較してみましょう。

**before**

```txt
Route (pages)                                                 Size     First Load JS
┌ ● / (ISR: 86400 Seconds) (535 ms)                           1.54 kB         117 kB
├   └ css/5ae3c401f528394f.css                                1.34 kB
├   /_app                                                     0 B            75.9 kB
├ ○ /404                                                      667 B           109 kB
├   └ css/307423e33d978a82.css                                1 kB
├ ℇ /api/og-image                                             0 B            75.9 kB
├ λ /api/site-metadata                                        0 B            75.9 kB
├ ● /articles (307 ms)                                        1.7 kB          117 kB
├   └ css/fcc7a7e4e0795be7.css                                1.47 kB
├ ● /articles/[slug] (4764 ms)                                289 kB          404 kB
├   └ css/25e4b5cc10c03bc7.css                                2.09 kB
├   ├ /articles/add-next-seo-to-blog (710 ms)
├   ├ /articles/build-chat-app-with-websocket (687 ms)
├   ├ /articles/add-google-adsense-to-blog (670 ms)
├   ├ /articles/do-not-export-react-context (651 ms)
├   ├ /articles/add-vercel-og (600 ms)
├   ├ /articles/assign-admin-right-to-firebase-user (584 ms)
├   ├ /articles/add-rss-feed-to-nextjs-blog
├   └ [+14 more paths]
├ ● /articles/zenn (ISR: 86400 Seconds) (846 ms)              1.64 kB         117 kB
├   └ css/4bfbfa0775969453.css                                1.43 kB
├ λ /feed                                                     243 B          76.1 kB
└ ● /tags/[tagName] (3464 ms)                                 1.49 kB         117 kB
    └ css/1e11ccf86ddd3eb8.css                                1.3 kB
    ├ /tags/nextjs (495 ms)
    ├ /tags/react (329 ms)
    ├ /tags/adsense
    ├ /tags/vercel
    ├ /tags/firebase
    ├ /tags/websocket
    ├ /tags/fastify
    └ [+12 more paths]
+ First Load JS shared by all                                 78 kB
  ├ chunks/framework-50116e63224baba2.js                      45.4 kB
  ├ chunks/main-0ad5b17c521127c1.js                           27.2 kB
  ├ chunks/pages/_app-e7f983ef1f5563ca.js                     2.3 kB
  ├ chunks/webpack-880e48e2fc817058.js                        1 kB
  └ css/180b63cac3835a78.css                                  2.09 kB
```

**after**

```txt
Route (app)                                  Size     First Load JS
┌ ○ /                                        501 B            88 kB
├ ○ /articles                                0 B                0 B
├ ● /articles/[slug]                         3.16 kB        90.7 kB
├   ├ /articles/add-google-adsense-to-blog
├   ├ /articles/add-next-seo-to-blog
├   ├ /articles/add-rss-feed-to-nextjs-blog
├   └ [+18 more paths]
├ ○ /articles/zenn                           0 B                0 B
└ ● /tags/[tagName]                          686 B          88.2 kB
    ├ /tags/nextjs
    ├ /tags/adsense
    ├ /tags/react
    └ [+16 more paths]
+ First Load JS shared by all                82.8 kB
  ├ chunks/139-50fba2e43360fae7.js           24.5 kB
  ├ chunks/2443530c-f71adb2edbb15f84.js      50.5 kB
  ├ chunks/414-11093a3b3144272a.js           5.64 kB
  ├ chunks/main-app-cd4042ae2e781e0c.js      215 B
  └ chunks/webpack-e8979742ae5f80d5.js       1.91 kB

Route (pages)                                Size     First Load JS
┌   /_app                                    0 B             120 kB
├ ○ /404                                     3.7 kB          123 kB
├   └ css/fb35adf017966a35.css               331 B
├ λ /api/feed                                0 B             120 kB
└ ℇ /api/og-image                            0 B             120 kB
+ First Load JS shared by all                123 kB
  ├ chunks/main-ef990111cc8aa819.js          88.1 kB
  ├ chunks/pages/_app-bde1753f47ce9721.js    29.5 kB
  ├ chunks/webpack-e8979742ae5f80d5.js       1.91 kB
  └ css/17040f5eaad05a76.css                 3.1 kB
```

どのページも軒並み小さくなっているのがわかりますが、明らかなのは `/articles` の `0 B` ですね。一切 JavaScript が含まれていません(React や Next.js 本体の分は別にあります)。サイトの規模が大きくなればなるほど効果も大きくなっていくので、大規模サイトこと App Router を採用する価値がありそうです。

## まとめ

すてぃんのブログを Pages Router から App Router に移行した学びや気付きを紹介しました。App Router を使うことで開発者体験もユーザー体験も向上させることが期待できるので、積極的に使っていきたいですね。新しい概念が一気に増えて全てを把握するのは時間がかかりますが、使いこなすことに価値はあると確信しています。

それでは良い Next.js ライフを！
