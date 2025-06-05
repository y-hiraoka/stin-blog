---
title: "resend-local というツールを作った"
createdAt: "2025-06-05T15:12:49.603Z"
tags: ["resend", "nextjs"]
---

Resend というメール送信サービスがあります。
そのAPIエミュレーターをローカルで起動する npm パッケージを作りました。次のコマンドでサーバー `http://localhost:8005` で起動します。

```bash
# npm
npx resend-local
# pnpm
pnpm dlx resend-local
```

Resend SDK は Base URL を環境変数経由で変更できます。`.env`などで次のように指定すれば、エミュレーターに SDK からリクエストが飛びます。

```
RESEND_BASE_URL="http://localhost:8005"
```

Node.js SDK、Rust SDK で環境変数の Base URL を参照することを確認済みです（他のプログラミング言語用 SDK もそうなっているのではと思います）。

http://localhost:8005 をブラウザで Web ページとして開けば、SDK から送信した結果が見れます。現在サポートしているのは次のリソースです

- Emails
- Batch Emails
- Domains
- API Keys

API Keys は保存していますがリクエスト検証に使っているわけではありません。あくまでインターフェイスのエミュレートですので。

## 作った理由

Resend を使う機会ができたのですが、ローカル開発中は実際のメール送信をしたくないと思っていました。依存の逆転で依存注入でなんじゃらほいすれば、開発中はメールを送信せずに `console.log` に流すだけの実装に差し替えられますが、どうせなら送信したメールをいい感じに表示したいなと思いました。

Resend ならローカルエミュレーターくらい提供してるやろと思ったんですけど、ありませんでした。なければ作ればいいじゃない。エンジニアだもの。

AWS SES には aws-ses-v2-local という非公式エミュレーターがあります。これと同じ体験を Resend でもできるようにしたかったのです。

## 作り方

### Next.js standalone モード

ベースのフレームワークは Next.js を使っています。

Next.js には standalone モードというビルドモードがあります。

ソースコードや node_modules 内の JS コードを可能な限りバンドルしてしまい、バイナリなどの関係でバンドルできない node_modules 内の依存を抽出して別ディレクトリに括りだしてくれるビルドモードです。これにより、package.json に書いてあるすべての依存を node_modules に入れた状態で稼働させるよりも少なく小さいファイル数で、実行可能な JS を生成できます。Docker コンテナで Next.js を使うときに、イメージサイズを小さくするために使用するビルドモードですね。

resend-local では、standalone モードビルドによる成果物を npm レジストリに公開することで、動くサーバーコードを配布しています。

npm に公開されているパッケージをインストールするとき、そのパッケージの package.json の `dependencies` に列挙されている依存パッケージもすべてインストールされてしまいます。standalone モードではほとんどの node_modules はバンドルされているため、ユーザーの node_modules に含まれる必要はありません。なので、多くの依存は `dependencies` ではなく `devDependencies` に列挙しました。こちらに書いてある依存なら、resend-local をインストールしても降ってくることはありません。

ただし一部のパッケージは node_modules に残す必要があります。具体的には next.config.ts の `serverExternalPackages` に列挙されているモジュールたちです。自分で指定しなくても、ビルトインで指定済みのパッケージ名があります。

https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages

ここにあるものは `dependencies` に残しておきました。

これによって最小限のパッケージサイズにしています(vite と適当なサーバーフレームワークにしておけばもっと小さくできると思うけどね。ワシは Next.js が好きなんや)。

### API エミュレーター

Resend が OpenAPI spec を公開していました。

https://github.com/resend/resend-openapi

これに従って裏側を適当に書けばエミュレーターになると考えました。

OpenAPI からソースコードにするのは、以前 Zenn で見かけた hono-takibi を使いました。

https://zenn.dev/mini_bg_pro_n/articles/018e9cc483f02e

これを使って `@hono/zod-openapi` の `createRoute`まではほぼ自動生成でいけました(Resend OpenAPI がやや雑で手直しは必要でした)。

Hono のインスタンスを Next.js の Route Handler にアタッチして使っています。

### データベース

データを永続化しておきたかったので、データベースを使うことにしました。SQLite の物理ファイルを npm 配布物に含めています。

データベースクライアントには Drizzle ORM を使っています。SQL に近くて書き心地が良いので好きです。JOIN 書くの面倒で結局 query シンタックス使うんですけど。

パッケージのビルド時に drizzle-kit push を実行して resend-local.sqlite というファイルを生成します。これを配布物ディレクトリに保存しておきます。

### UI デザイン

UI ライブラリ(語弊)として Shadcn UI を使っています。

コピペ CLI という提供方法は実はそんなに好きではないのですが、なんとなくクールな UI を TailwindCSS ベースで作れるからという理由で選んでいます。本当は普通の UI ライブラリを使いたい。

Text メールの表示確認のときはリンクらしき文字列を `a` 要素で表示します。便利じゃない？HTML メールはレンダリングして表示したり、シンタックスハイライトされた `HTML` 文字列として表示したりできます。どう？便利じゃない？

## まとめ

Resend API をローカルでエミュレートする resend-local というツールを作りました。

よかったら使ってみてください。
