---
title: "Drizzle ORM を使った書き捨てスクリプトから Cloudflare D1 にアクセスしたい（2）"
createdAt: "2026-08-02T12:53:38.061Z"
tags: ["cloudflare", "drizzle"]
---

## Intro

以前 [Drizzle ORM を使った書き捨てスクリプトから Cloudflare D1 にアクセスしたい](/articles/drizzle-cloudflare-remote-d1) という記事を書きました。

こちらの記事では、Cloudflare Workers 環境ではないスクリプトから Cloudflare D1 にアクセスするための方法を模索して見つけた方法を紹介しました。

今回、より公式かつ簡単な方法を知ったので紹介します。

## やりたいこと

改めて、達成したいことは以下のようなことです。

- Cloudflare Workers 環境ではない Node.js スクリプトから D1 にアクセスする
- Drizzle ORM を使ってクエリを発行する

これによって、次のようなことが実現できます。

- サービス開始時に初期データを登録する書き捨てスクリプトから D1 にアクセスする
- GitHub Actions で定期実行しているスクリプトからアクセスする
- データの不具合調査をローカル端末でするためにアクセスする

D1 は Workers 環境からアクセスすることが前提となっていて、コード上は Workers の Binding として D1 インスタンスを受け取ることになります。以下は Workers で D1 インスタンスを受け取るサンプルコードです。

```ts
export default {
  async fetch(request, env) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM Customers WHERE CompanyName = ?",
    )
      .bind("Bs Beverages")
      .run();
    return Response.json(results);
  },
};
```

Node.js は当然 Workers ではないため、上記の `env.DB` のような Binding は存在しません。

前回の記事では、Cloudflare D1 の REST API 経由でクエリを発行する方法を紹介しました。しかし、REST API のためにローカル端末に API トークンを保存する必要があり、手間がかかったりセキュリティ上の懸念が残ります。

## 解決策

Cloudflare の開発環境のために使用する Wrangler CLI は JavaScript API を提供しています。このうち `getPlatformProxy` を使うことで、Node.js 環境で Workers の Bindings を取得できるようになります。

https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy

しかも、Wrangler CLI の認証情報を使ってリモートにある D1 に接続しつつ Bindings を構成することもできます。これを使えばやりたいことが実現可能です。

`getPlatformProxy` は主に Node.js で開発サーバーを起動するフレームワーク(Vite や Next.js など)での利用を想定しているようですね。

## 使い方

Wrangler のインストールをしておいてください。

```sh
pnpm install wrangler -D
```

Wrangler を使うため、その設定情報である `wrangler.jsonc` (または `wrangler.toml`) を用意します。

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "compatibility_date": "2026-07-30",
  "d1_databases": [
    {
      "binding": "DB",
      "database_id": "<YOUR_D1_DATABASE_ID>",
      "remote": true,
    },
  ],
}
```

`d1_databases` で `"remote": true` を指定することで、リモートにホストされている D1 にアクセスができます。もちろん `"remote": false` を指定すれば、ローカルの SQLite を使うこともできます。

Drizzle ORM と `getPlatformProxy` を組み合わせた TypeScript コードは以下のようになります。

```ts
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";

type Params<Schema> = {
  schema: Schema;
};

export const createRemoteD1Drizzle = async <Schema extends Record<string, unknown>>({
  schema,
}: Params<Schema>) => {
  const { env } = await getPlatformProxy<{ DB: D1Database }>();
  return drizzle(env.DB, { schema });
};
```

`getPlatformProxy` から取得する `env` が Worker Bindings になります。`env.DB` が D1 インスタンスなので、これを `drizzle` に渡すことで、Drizzle インスタンスを作成できます。`getPlatformProxy` の型引数部分は `wrangler.jsonc` の `binding` に合わせてください。または、`wrangler types` で生成される型を使って `getPlatformProxy<Cloudflare.Env>()` のように書くこともできます。

あとは適当なスクリプトで好きに使うだけ。

```ts
import { createRemoteD1Drizzle } from "./drizzle-remote-d1.ts";
import * as schema from "./db/schema.ts";
import { eq } from "drizzle-orm";

const db = await createRemoteD1Drizzle({ schema });

const [gif, aichi, tokyo] = await db.batch([
  db.insert(schema.prefecture).values({ id: 1, name: "岐阜県" }),
  db.select().from(schema.prefecture).where(eq(schema.prefecture.name, "愛知県")),
  db.delete(schema.prefecture).where(eq(schema.prefecture.name, "東京都")).returning(),
]);

console.log("result", { gif, aichi, tokyo });

process.exit(0);
```

`getPlatformProxy` がプロセスを起動し続けるようで、`process.exit(0)` を入れることでスクリプトを終了させるようにしています。

このスクリプトを実行したときにまだ `wrangler login` をしていない場合、スクリプト実行中にブラウザが開いて Cloudflare アカウントの認証を求められます。

## ブラウザがない環境

`getPlatformProxy` は Wrangler CLI が未ログインの場合はブラウザを起動してログインを催促するため、そのままでは GitHub Actions などの環境で使えません。

GitHub Actions などの環境で使う場合は API トークンを使うことになります。Wrangler はプロセス環境変数から特定の名前の値を自動で参照してくれるので、GitHub Actions なら次のように `env` を設定しておくだけで良いです(コードで `.env` を読むステップの追加は不要)。

```yaml
env:
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Cloudflare ダッシュボードから API トークンを発行して GitHub Actions の Secrets に登録してから実行してください。

ちなみに API トークンに必要な権限はよくわかりませんでした…。D1 への read/write だけあればよいわけではなく、403 エラーを見ても不足している権限がわかりませんでした。ひとまずフル権限のトークンなら動くことは確認済みです。

## まとめ

リモートの D1 にアクセスする方法として、Wrangler CLI の `getPlatformProxy` を使う方法を紹介しました。

前回の記事で紹介した方法では Drizzle の sqlite-proxy と Cloudflare API を組み合わせつつSQL を API 用に調整するコードをごちゃごちゃ書いていたんですが、`getPlatformProxy` を使うことでほとんど普通の Drizzle + D1 と同じように書けるようになりました。`getPlatformProxy` とても便利です。

今回は D1 にアクセスする方法を紹介しましたが、`getPlatformProxy` の本質は Cloudflare Workers の環境を Node.js に擬似的に提供することなので、D1 以外の Cloudflare サービスも同様に Node.js からアクセスできるようになります。応用が捗りそうですね。

今回のコードの全体サンプルはこちらにありますので、興味があれば見てみてください。

https://github.com/stinbox/drizzle-d1-script

それでは。

## 余談

`getPlatformProxy` を使う方法は Claude Code が見つけてくれました。
