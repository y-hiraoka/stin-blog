---
title: "ポケモンBGMループ再生サイトを Cloudflare Pages に載せ替えた"
createdAt: "2023-12-10T06:21:26.640Z"
updatedAt: "2023-12-10T07:49:39.030Z"
tags: ["cloudflare", "nextjs"]
---

## Intro

https://pokemon-soundlibrary.stin.ink/

このポケモンのBGMを無限ループで再生できる Next.js 製サイトは、これまで Vercel にデプロイしていました。しかし Vercel にデプロイすることはいくつか問題点を抱えていました。

- 大量の音声ファイルを public ディレクトリに入れてデプロイのたびにアップロードしていた
- 音声ファイルを gitignore しているため Vercel の GitHub 連携デプロイができず、デプロイはローカル端末から直接していた
- 不要なサーバーを起動していた

これらを解決するため、、、ではなくただ Cloudflare デビューとしてちょうどよいと思ったので Vercel から載せ替えることにしました。結果としてこれらの問題は解決されています。

この記事では僕の Cloudflare デビュー戦の模様をお届けします(？)

## システム構成を考える

前述の通り、件のサイトは Next.js の public ディレクトリに音声ファイルを詰めて一緒くたにデプロイしていました。音声ファイルを取得するときは、`fetch("/sounds/dp/1.wav")` のように相対 URL で fetch しています。これを、別の URL を割り当てて `fetch("https://.../sounds/dp/1.wav")` と取得するようにすれば、デプロイも別、リポジトリも別にできて GitHub へのコミットきっかけで実行される Vercel デプロイが有効にできます。しかし相対 URL でのアクセスは変更したくありませんでした。理由としては次のようなものです。

- ローカル開発中も本番の音声ファイルサイトにアクセスするか、環境変数で取得先を分岐するなどしなければならない
- Cloudflare ならリクエストパスによる取得元の振り分けができると予想した
- パスによる振り分けが実現できれば、URL で取得元を抽象化している感じがなんかかっこいい

ということで、次のような構成で実現することに決めました。

![システム構成図。ブラウザからCloudflareに「/*」というテキスト付きの矢印が伸びている。CloudflareからCloudflare R2に「/sounds/*」というテキスト付きで矢印が伸びている。CloudflareからCloudflare Pagesに「/sounds/* 以外」というテキスト付きで矢印が伸びている。](/images/contents/pokemon-soundlibrary-on-cloudflare/system-flowchart.png)

Web サイトは Cloudflare Pages にホスティングし、音声ファイルは Cloudflare R2 に保存しておきます。リクエストが `/sounds/*` の場合は Cloudflare R2 から音声ファイルをレスポンスして、それ以外は Cloudflare Pages からレスポンスするようなルーティングも用意します。

まだこのときは Cloudflare の設定だけでルーティングができると思っていました。

## 音声ファイルを R2 に置く

音声ファイルは Cloudflare R2 に置くことにしました。R2 は AWS S3 互換のストレージサービスです。音声ファイルのような静的リソースを置いておくのに相応しく、サイトとは切り離されているのでデプロイなどにもお互い影響しません。

ところで、ポケモン公式から配布されている音声ファイルは「赤・緑」と「ダイヤモンド・パール」合わせて 194 個あります。Cloudflare の管理画面からディレクトリ選択の一括アップロードをしようとしたら、100個以上アップロードするならAPI使ってねと断られてしまいました。2回にわけてアップロードすればいいだけなのですが、こういうときってどうするのが一般的なんだろうと思ったので調べてみたところ、Rclone という CLI を使うらしいということを知りました。なので今後のためにも Rclone を使ってみることにしました。

https://rclone.org/

Rclone は色々なクラウドストレージサービスに対応しているファイル同期ソフトウェアです。AWS S3 に対応しているので、S3 と互換のある R2 も同様に対応しています。

Rclone を自分の PC にインストール([インストール手順](https://rclone.org/downloads/#script-download-and-install))して R2 用のセットアップ([セットアップ手順](https://rclone.org/s3/#cloudflare-r2))を行いました。CLI に言われるがままに API キーやURLを入力するだけでよく、さくっと Rclone と R2 の接続が完了しました。

そして、手元のプロジェクトの public ディレクトリを R2 にコピーするコマンドを実行するだけです。

```bash
rclone copy public r2:pokemon-soundlibrary-sounds
```

`r2:` の部分はセットアップ中に指定した設定名なのでもっと具体的な命名ができると思います。`pokemon-soundlibrary-sounds` の部分は実際の R2 バケット名ですね。コマンドも直感的で嬉しい。

これで R2 に音声ファイルを保存することが出来ました。

## Cloudflare Pages に Next.js をデプロイ

Cloudflare Pages は Vercel 同様、フレームワークベースのリポジトリを指定するだけでブランチの変更を検知して勝手にデプロイしてくれる機能があります。これを使って Next.js プロジェクトをデプロイすることにしました。

Cloudflare Pages に Next.js をデプロイする場合、Static Exports が有効かどうかで対応方法が大きく異なります。Cloudflare Pages は、基本的には静的ページを配信する用途で使うものなので、サーバー機能を停止した Static Exports であれば素直に `out` ディレクトリを配信するだけで良いです。逆に、通常のビルドモードの場合はデプロイ後もサーバーサイドのランタイムが必要なので、色々追加で設定が必要になるようですね。ビルドしたら Workers に変換してくれるプラグイン的なものを入れることになるのだろうか。使うことになったら調べます…。

今回移行するサイトは今まで Vercel で無駄にサーバーを起動していましたが、サーバーサイドランタイムは全く不要でした。なのでビルドモードを Static Exports に変更してデプロイすることにしました。`next.config.js` に `output: "export"` を加える以外に何もしなくてもビルドできたので、本当に無駄にリソースを消費していました。Vercel さんすみません…。

`next.config.js` の変更だけ push して、Cloudflare の管理画面で Cloudflare Pages のセットアップをポチポチしていきます。GitHub のアカウントを連携してリポジトリを指定するだけで完了です。操作にまったく迷うことなくサイトの公開が完了しました。開発者体験が良すぎる。

デフォルトでは `https://project-name.pages.dev` というドメインでページが公開されています。Cloudflare に登録しているドメインのサブドメインをカスタムドメインとして指定すると、DNS 設定まですべてやってくれました。ありがたい。

## 音声ファイルまでのルーティング方法

R2 にファイルを保存して Cloudflare Pages をデプロイするところまで完了しましたが、ここまでだと音声ファイルの取得リクエストは R2 に向いていないので再生ができません。音声ファイルの取得を R2 に向ける方法を探します。

### オリジンルールでできるらしい？

AWS S3 にはバケットを静的 Web サイトとして公開する機能があります。同様に Cloudflare R2 にもドメインを繋げばリソースをそのまま HTTP 配信してくれる機能がありました。これを使って音声ファイルを R2 から HTTP 取得できるようにしておき、パスによってリクエスト先を振り分けておけばいいだろうと考えていました。当初は。

Cloudflare にはオリジンルールというものがあります。これによってパスによるリクエスト先の振り分けができるらしいと、先人のブログなどで知りました。

https://developers.cloudflare.com/rules/origin-rules/

が、実際に自分の Cloudflare 管理画面を探しても、オリジンルールの設定にドメインを変更するような選択肢が出てきませんでした。嘘ブログかよ〜と思っていたのですが、よくよく調べてみるとどうやらパスによるリクエスト先の振り分けは有料プランでしかできないようです…。無料枠ユーザーではポートの変更しかできないらしい。

### Pages Functions を用意する

ということで代替案を調べました。Cloudflare Pages には Pages Functions というサーバーレス関数を置く機能があるらしい。内部的には Cloudflare Workers で関数を処理していて、R2 からリソースを引っ張ってきてレスポンスに乗せられることもわかりました。

Pages Functions を始めるには、Cloudflare Pages プロジェクトのリポジトリに `functions` ディレクトリを設置します。TypeScript で書く場合は `functions/tsconfig.json` も置きます([参考](https://developers.cloudflare.com/pages/platform/functions/typescript/))。Pages Functions は Next.js ユーザーなら馴染みのある file-based Routing を採用していて、ファイルのパスと URL のパスが一致します。

音声ファイルは `fetch("/sounds/dp/1.wav")` で取得されるので、これを捌くために `functions/sounds/[version]/[fileName].ts` を用意します。

```tsx
import { EventContext, R2Bucket } from "@cloudflare/workers-types";

interface Env {
  SOUNDLIBRARY_BUCKET: R2Bucket;
}

export const onRequest = async (
  context: EventContext<Env, "version" | "fileName", never>,
): Promise<Response> => {
  if (
    typeof context.params.version !== "string" ||
    typeof context.params.fileName !== "string"
  ) {
    return new Response("Bad Request", { status: 400 });
  }

  const file = await context.env.SOUNDLIBRARY_BUCKET.get(
    `sounds/${context.params.version}/${context.params.fileName}`,
  );

  if (file === null) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(file.body as ReadableStream);
};
```

(`as ReadableStream` で型を強引解決しているのが気になりますが後述します。)

Pages Functions は `onRequest` 関数を named export しておくと、パスがマッチしているリクエストに対してその関数が起動します。

引数の `context` には色々詰め込まれていて、`Request` オブジェクトも入っていればパスパラメーターだけの `params` も入っています。

そして R2 クライアントとしての `env.SOUNDLIBRARY_BUCKET` も含まれています。これは Cloudflare 管理画面から R2 と Pages Functions をバインディングしているとアクセスできるクライアントインスタンスです([参考](https://developers.cloudflare.com/pages/platform/functions/bindings/#r2-buckets))。`SOUNDLIBRARY_BUCKET` の部分は管理画面で自由な名前に決められます。

この Functions でやっていることは、リクエストを受け取ったら適当なパスパラメーターのチェックをして(type-narrowing が主目的)、R2 から音声ファイルの取得を試み、なければ Not Found、あれば Response に乗せて返すだけです。

これを GitHub にプッシュしたら Cloudflare Pages のデプロイが行われて、無事音声ファイルの取得ができ、音楽の再生ができるようになりました。ちなみに、ローカル開発中は引き続き public ディレクトリに音声ファイルがあるので、Pages Functions が動いていなくても Next.js がファイルをレスポンスしてくれます。Pages Functions のローカル実行は必要になったら調べます。

### Pages Functions の型エラーについて

公式ドキュメントに従って Pages Functions の型定義は `@cloudflare/workers-types` を使ってやっていたのですが、よくわからないエラーに遭遇しました。具体的には、次のようなコードを書いたときです。

```tsx
import { PagesFunction, R2Bucket, Response } from "@cloudflare/workers-types";

interface Env {
  SOUNDLIBRARY_BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env, "version" | "fileName"> = async (context) => {
  // 省略

  return new Response(file.body);
};
```

このコードは `as` キャストで型を誤魔化すこともなく、ドキュメント通り `PagesFuction` を使った素直な書き方です。しかしこれをデプロイしてみると、ビルドエラーになって次のようなログが Cloudflare 管理画面に表示されました。

```plaintext
13:22:53.488	✘ [ERROR] No matching export in "../node_modules/@cloudflare/workers-types/index.ts" for import "Response"
13:22:53.488
13:22:53.489	    sounds/[version]/[fileName].ts:1:34:
13:22:53.489	      1 │ ... { PagesFunction, R2Bucket, Response } from "@cloudflare/workers...
13:22:53.489	        ╵                                ~~~~~~~~
```

`@cloudflare/workers-types` には `Response` がないと。PC で node_modules の中にある型定義ファイルを見てもあるように見えるのですが…。

もしかしたら `@cloudflare/workers-types` の `Response` は実態を伴わない型だけの export で、ランタイムには存在しないから起きているエラーなのかもしれないと思い、import から削除して Web 標準の `Response` を参照するようにしてみました。しかし次は `PagesFunction` 型の戻り値として Web 標準の `Response` はふさわしくないと tsc に怒られます。また、Web 標準の `Response` のボディとして R2 から取得した `file.body` の型も合わずエラーになっていました。

色々試してみたのですがダメだったので、Web 標準の `Response` を使いつつ、ボディの型エラーは潰すことにしました。もしこの記事をご覧になった人で正しい書き方を知っていれば教えてください…。

#### (追記)正しい書き方を教えてもらいました

https://twitter.com/karibash/status/1733745537290281112

そもそも `@cloudflare/workers-types` は `import` して使うものではなかったようです。tsconfig.json の `types` に指定することでグローバルに型が反映されて、Web 標準の `Response` を上書きしたり `PagesFunction` 型を追加したりしてくれるものでした。

開発中に `import` して使えるように見えていたのは、`functions/tsconfig.json` を追加したばかりで VS Code に再読み込みされていなかったからと思われます。VS Code で当該プロジェクトを再度開いてみると、import 文の箇所がエラーになっていました…。

教えていただき本当にありがとうございます。

## まとめ

ポケモンBGMループ再生サイトを Vercel から Cloudflare に載せ替えることで Cloudflare デビューを果たした話を書きました。

音声ファイルを Cloudflare R2 に保存して Web サイトは Cloudflare Pages にデプロイ、Pages Functions によって音声ファイルリクエストを捌く構成にしました。これで巨大な public ディレクトリをデプロイする必要もなくなったし、GitHub 連携によるデプロイもできるようになって管理が楽になりました。Happy。

駆け出し Cloudflare ユーザーですが色々できて楽しいですね。Cloudflare Pages にサーバーランタイムが必要な Next.js をデプロイする方法も今後試していきたい。

それでは良い Cloudflare ライフを！
