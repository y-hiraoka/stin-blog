---
title: "Hono Conf 2025 に参加してきたので感想を書く"
createdAt: "2025-10-19T03:53:28.156Z"
tags: ["hono"]
---

2025年10月18日に開催された Hono Conf に現地参加したので、自分が見たセッションについて覚えている限りで感想を書きます。

https://honoconf.dev/2025

以下、「発表タイトル by 発表者名」で区切って書いていきます。発表資料が見つかったものについてはリンクも貼っておきます。

## 令和最新技術で伝統掲示板を再構築: HonoXで作る型安全なスレッドフロート型掲示板 / Modernizing a Classic Forum with HonoX: A Type-Safe, Japanese-Style Bulletin Board. by かろっく / calloc134

https://speakerdeck.com/calloc134/karotuku-at-calloc134-hono-conference-2025

個人開発で HonoX を使ってみたという話。
HonoX は Hono をコアにして Vite でビルドするフレームワークで、JSX(not React) が使えるので TypeScript の型チェックを行いながら HTML を返すサーバーが書けるやつ。

その掲示板サイトの目標が JavaScript なしでも完全に動作することを目指しているようで、HonoX を使うことで実現できたとのこと。

現代において一般的に想定するユーザーが JavaScript をオフにしていることは考えられないが、JavaScript なしでも動くということはページを開いてからユーザーインタラクションを受け付けるまでが速いということでユーザー体験向上につながるので良い。

それともうひとつ、SafeQL の紹介があった。ORM(Object-Relational Mapper) ではなく生のSQLを書くような開発では、SQL と TypeScript の型不一致が問題になりがち。SafeQL は ESLint Plugin で、実際の開発用データベースや SQL の静的解析結果と TypeScript の型が不一致のときに Lint エラーを出す仕組みらしい。ESLint がデータベースアクセスするって発想が面白い。

## Hono × Cloudflare Workers by Kristian Freeman

https://kristianfreeman.com/hono-conf-talk

Kristian Freeman 氏 は Cloudflare で yusukebe 氏の上司らしい。

2017年に Cloudflare Workers の提供が開始されたが、ルーティングができないことが課題だったとのこと。Workers ランタイム自体は Request / Response を扱うだけの最低限の機能だけを提供するので、URL パスにどの処理を対応付けるか(ルーティング)はユーザーが自力で書く必要があった。でも Workers でも使える Web フレームワークがなかったので if 文で頑張るしかなかった。そこに現れたのが yusukebe 氏の Hono だったという話。

Cloudflare の内部でもどんどん Hono で構築されたサービスが増えている。Cloudflare のプライベートコードを載せていた。すごい。

[スライド](https://honoconf.signalnerve.workers.dev/) をめくると Hono のロゴがメラメラと大きくなるアニメーションが入っていてみてて楽しい。

## The Journey of the Node.js Adapter through Performance and Portability by Taku Amano

https://speakerdeck.com/usualoma/the-journey-of-the-node-dot-js-adapter-through-performance-and-portability

Hono の Node.js Adapter について。

Hono はもともと Cloudflare Workers のためということもあって、Web Standard の Request / Response を扱う。一方で Node.js は独自の http モジュールで HTTP サーバーの構築をする必要がある。この差を埋めるのが `@hono/node-server` の役割で、それのパフォーマンス改善方法やプルリクエストの歴史の話。

当初、 Node.js v18 未満 で Web Standard をサポートするために、Remix が作った polyfill を借りていたというのが面白いなと思った。誰でも車輪の再発明はしたくないからですからね(諸説あり)。Node.js v18 で Web Standard API が提供されるようになってからそれらの polyfill も不要になって一気に軽量化できたとのこと。

`@hono/node-server` の目的が Web Standard Request /Response を Node.js http Request / Response に変換することだから、Hono 無関係に使えるというのが意外な気付きだった。

パフォーマンス改善についてはひたすら泥臭いことの積み重ねという印象ですね…。
こういった積み重ねを享受して我々ライブラリ利用者のサーバーも速くなるので、この話を聞けてより一層 Hono を含む OSS のありがたみを感じる。

## Hono runs everywhere: 3 lessons from building a Fastly adapter by Katsuyuki Omuro & Kei Sawada

CDN やエッジコンピューティングランタイムを提供する Fastly で Hono が使えるという話。

Fastly のエッジランタイムに Hono をデプロイするためのAdapterライブラリをいくつか提供してくれているとのこと。

Fastly 提供の関数名を Hono が提供する関数名に寄せたり(`fire` とか `serveStatic` とか)、環境変数の注入を Hono の `c.env` に寄せたりと、開発者が迷わずに Fastly でも Hono を扱えるようにしているのが好感度高い。

## Exploring Hono on Vercel by Shohei Maeda

Vercel で Hono を扱う話。

Hono on Vercel それ自体よりも、Vercel Middleware がリネームされた理由とか、Vercel Edge Middleware の実態が Cloudflare Workers でしたというのを直々に聞けたのが興味深かった。

Vercel は AWS 上に構築されていて、一昔前は AWS ラッパーと揶揄されていたが今はまったくそうではない。Vercel Fluid Compute は AWS Lambda では解決できない問題を解決する。

Vercel Fluid Compute は本当に革新的な発明だと思う。1つの vm で I/O 待ち時間を効率的に使って複数のリクエストを捌けるのが Lambda との違いだが、かと言って単なる Node.js on VPS とも違って自動スケールもする。それを管理画面のボタンワンクリックで有効にできるからすごい。

それと Fluid Compute を有効にすると CPU 実行時間だけが課金対象になるのも大きい。もとは I/O 待ち時間も実行時間にカウントされていたので、Fluid Compute 料金体系によって一気に Vercel Functions 周りの利用料が下がる。これは Next.js の SSR とか `route.ts` も含むのでインパクトは大きい。

ところで最近 Vercel が Hono をネイティブサポートし始めたこと(`hono/vercel` なしで動かせること)を発表していたけど、それについては触れられていなかったな（？）

https://vercel.com/docs/frameworks/backend/hono

## Interesting memory leak with Hono on Bun by Sosuke Suzuki

Bun で Hono を動かすとメモリリークする原因と Bun 側の対応について。

僕はガベージコレクタの気持ちになれないので難易度が高かった（？）

Response と ReadableStream が循環参照するようなコードを書くとガベージコレクション(GC)できずにメモリリークとなる。ただし、JavaScript Core は mark & sweep による GC を採用しているので、単なる循環参照ではメモリリークすることはない。ここでは Respose から ReadableStream への参照が Strong Ref であることが原因だった。

ガベージコレクションのアルゴリズムとして mark & sweep とか ref counting というのがあるのを知った。おれたちは JavaScript を使っているが JavaScript ランタイム/エンジンのことを何も知らない…。

## 大規模メディアでのHono実運用 ～「現代ビジネス」でのNext.jsからの移行～ / Running Hono in Production at Scale: Lessons from Migrating off Next.js by 矢口 裕也 / Yuya Yaguchi

「現代ビジネス」が Next.js から Hono + JSX に置き換えたときの苦悩話。

当初は HonoX に移行しようとしたが、Vite によるモジュール解決のエラーが解消できず挫折。HonoX が Vite を使って解決していること(特に Hydration)を hono + JSX で自作したとのこと。

hydration 対象のコンポーネントをひとつずつ手動で `$island` 関数(自作)で囲ったり、hydration 対象のリストに登録したりしているらしい。`$island` が `div` を増やすのがやや気になるところではある。

## LT 6本

時間厳守の LT が6本あった。

hono-takibi は使ったことがあり、便利だった。コードファーストではなくコントラクトファーストな API 開発をするときに使える。

yusukebe 氏が直々に(？)銅鑼でタイムマネジメントしてたのが面白かった。

## Keynote Speech by nakasyou

Hono RPC の型計算が遅いとか、開発が停滞しているとか、他に替わりがあるといったネガティブキャンペーンかと思いきや、全部 Hono で作れるから Hono を使おうといった、愛のあるスピーチだった。

開発が停滞しているというかコミット数が減少しているのはHono のコアだけで、コアは枯れてコードが安定してきていると言える。各種ミドルウェアはガンガン開発されていて、それに伴って Hono のユースケースは広がっている。

Hono RPC の代わりに tRPC や oRPC でいいじゃんというのも、Hono は REST API になるからネイティブアプリでも使えるという主張だった。

Hono RPC の型計算が遅いという点だけ答えがなかったけど、そのうち tsgo が来るからヨシ!

## One More Thing by yusukebe

Hono CLI を開発している。人間向けでもあり AI 向けでもある。

```sh
npm i -g @hono/cli
```

`hono docs` で hono.dev のドキュメントをマークダウンで取得できたり、`hono search` で hono の使い方を検索したり、`hono request` で開発している hono app を実際に動かしたりできる。これらを AI エージェントに使わせれば、Hono アプリケーションを開発させられるというのがコンセプトらしい。

`RegExpRouter` の事前ビルド版である `PreparedRegExpRouter` を導入する。`RegExpRouter` の弱点は、正規表現をランタイムで組み立てるのが遅いことと正規表現を組み立てるためのコードサイズが大きいこと(バンドルが必要なランタイムに影響する)。事前に正規表現を組み立ててハードコードした Router を使えば、起動は速くなるしアプリサイズは小さくなるというアイデア。そして、実装コードから RegExp を事前ビルドするのが `hono optimize` コマンドの役割。

`PreparedRegExpRouter` については CLI ではなくバンドラープラグインとして出すほうがありがたいのでは？と思わなくもない。

## 終わり

Hono Conf でみんなが Hono をどう活用しているのか知れたり、プラットフォーマー側が Hono をどうサポートしようとしているかを見れて本当によかったです。

自分はまだまだ Hono の単なるルーティングライブラリとしてしか使えていないので、Hono の可能性を探っていきたい。

世界的に有名になった Hono の開発者の方々がずっと楽しそうにトークされているのを見て、自分ももっと OSS に積極的にコミットしていきたいと思いましたね。OSS って楽しい。
