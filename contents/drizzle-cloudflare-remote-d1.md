---
title: "Drizzle ORM を使った書き捨てスクリプトから Cloudflare D1 にアクセスしたい"
createdAt: "2025-09-08T12:32:47.309Z"
tags: ["cloudflare", "drizzle"]
---

Cloudflare D1 (以下 D1) は Cloudflare のリレーショナルデータベースサービスです。実態はリモートにある SQLite です。

Drizzle ORM は TypeScript で各種データベースに接続するデータベースクライアントで ORM です。テーブルスキーマ管理と型安全性に優れています。

## やりたいこと

D1 は Cloudflare Workers 内から利用するデータベースですが、Cloudflare Workers の実行コンテキスト以外から D1 にアクセスしたいこともあります。例えば、以下のようなケース

- サービス開始時に初期データを登録する書き捨てスクリプトから D1 にアクセスする
- GitHub Actions で定期実行しているスクリプトからアクセスする
- データの不具合調査をローカル端末でするためにアクセスする

つまり、単に `node scripts/index.js` とか `npx tsx script/index.ts` を打ち込んで実行するようなケースです。

しかしやり方を調べても、Cloudflare Workers の実行コンテキストから呼び出すコードサンプルしか見つけられませんでした。

また、Drizzle の D1 アダプターも同様に Cloudflare Workers での利用を想定されたインターフェイスをしています。`drizzle-orm/d1` モジュールは Cloudflare Workers の実行コンテキストで受け取れるデータベースバインドを受け取って利用するデザインになっています。

Cloudflare Workers アプリをローカル開発中に wrangler CLI が生成する D1 にアクセスするだけなら、実態が `.sqlite` ファイルなので単に `drizzle-orm/libsql` などを使えばよいですが、リモートにあるプロダクションの D1 にアクセスしたいのです。

色々試していたところ、`drizzle-orm/d1` 以外のモジュールを組み合わせて書き捨てスクリプトでも Drizzle を使って型安全に D1 にアクセスする方法を生み出したので紹介します。

## 先に完成形サンプルコード

https://github.com/stinbox/drizzle-d1-script

このリポジトリの `src/script.ts` が書き捨てスクリプトのイメージです。`npx tsx src/script.ts` で実行可能です(試す場合 Cloudflare D1 はご自身でご用意ください)。

`src/drizzle-remote-d1.ts` に、リモートにある D1 に直接アクセス可能な Drizzle クライアントを生成する関数 `createRemoteD1Drizzle` を実装しています。

## 実現方法

Cloudflare D1 には HTTP API で SQL を POST して実行してもらう API があります。SQL の実行にはこれを使います (API トークンの発行が必要です)。

D1 を含む Cloudflare の各種 HTTP API を実行してくれる公式パッケージがあります。コード中の API 呼び出しはこれを使用します。

https://github.com/cloudflare/cloudflare-typescript

依存パッケージを増やしたくない場合は次の Cloudflare API 仕様書を参考に、単に `fetch` で SQL を載せた HTTP リクエストを投げつけるだけでもいいです。

https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/

SQL を生成する側は Drizzle Proxy を使用します。D1 は SQLite なのでモジュールは `drizzle-orm/sqlite-proxy` です。

https://orm.drizzle.team/docs/connect-drizzle-proxy

Drizzle Proxy は、他の Drizzle クライアントと使い勝手は全く同じですが、クエリの送信部分を自由に差し替えることができるものです。

以下は Drizzle のドキュメントからの引用です。

```
┌───────────────────────────┐                 ┌─────────────────────────────┐
│       Drizzle ORM         │                 │  HTTP Server with Database  │
└─┬─────────────────────────┘                 └─────────────────────────┬───┘
  │                                                ^                    │
  │-- 1. Build query         2. Send built query --│                    │
  │                                                │                    │
  │              ┌───────────────────────────┐     │                    │
  └─────────────>│                           │─────┘                    │
                 │      HTTP Proxy Driver    │                          │
  ┌──────────────│                           │<─────────────┬───────────┘
  │              └───────────────────────────┘              │
  │                                                  3. Execute a query + send raw results back
  │-- 4. Map data and return
  │
  v

```

この送信部分 (HTTP Server with Database) を Cloudflare D1 API に向けるイメージです。

## 実装

### ラッパー関数の型定義

Drizzle クライアントを生成する関数を実装します。`drizzle-orm/sqlite-proxy` から取得できる `drizzle` 関数のラッパーです。

ラッパー関数の名前、引数、戻り値の型は次のようにします。

```ts
import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

type Params<Schema> = {
  credentials: {
    accountId: string;
    databaseId: string;
    apiToken: string;
  };
  schema: Schema;
};

export const createRemoteD1Drizzle: <Schema extends Record<string, unknown>>(
  params: Params<Schema>,
) => SqliteRemoteDatabase<Schema>;
```

関数名は `createRemoteD1Drizzle` としました。

引数では、Cloudflare API を内部で利用するのに必要な `credentials` と、Drizzle クライアントに渡すための `schema` を受け取ります。

戻り値は `drizzle-orm/sqlite-proxy` の `drizzle` 関数の戻り値と同じ `SqliteRemoteDatabase<Schema>` 型です。

### `drizzle-orm/sqlite-proxy` の `drizzle` 関数について

`drizzle-orm/sqlite-proxy` の `drizzle` 関数では、実際に SQL とバインドパラメーターを受け取って送信する関数を2つ引数に取ります。片方は単一クエリの実行用、もう一方はバッチクエリの実行用です。

```ts
import { drizzle } from "drizzle-orm/sqlite-proxy";

const db = drizzle(remoteCallback, batchRemoteCallback, { schema });
```

上記の `remoteCallback` と `batchRemoteCallback` を実際の送信処理として実装する必要があります。

バッチクエリとは、次のように複数のクエリをまとめて実行してくれる機能です。

```ts
await db.batch([
  db.insert(schema.user).values({ name: "Alice" }),
  db.update(schema.user).set({ name: "Bob" }),
  db.delete(schema.user).where(eq(schema.user.name, "Charlie")),
]);
```

特に D1 ではトランザクションのサポートがないため、複数のクエリをまとめて実行するにはバッチクエリを使うことになります。ひとつのバッチクエリの一部のクエリが失敗するとすべてのクエリが実行されなかったことになり、バッチ内の原子性が保証されます。トランザクションの代わりとして使うことになります。

### `remoteCallback`, `batchRemoteCallback` 関数の実装

`remoteCallback` と `batchRemoteCallback` が満たすべき関数の型は次です。

```ts
export type AsyncRemoteCallback = (
  sql: string,
  params: any[],
  method: "run" | "all" | "values" | "get",
) => Promise<{
  rows: any[];
}>;

export type AsyncBatchRemoteCallback = (
  batch: {
    sql: string;
    params: any[];
    method: "run" | "all" | "values" | "get";
  }[],
) => Promise<
  {
    rows: any[];
  }[]
>;
```

ここで `sql` にはバインド変数の `?` が埋め込まれた状態の SQL が渡されます。`params` はバインド変数に指定する値の配列です。

`method` は Drizzle クライアント側でどのメソッドによって発火されたかを示す識別子です。[Drizzle Proxy のドキュメント](https://orm.drizzle.team/docs/connect-drizzle-proxy)には次のように記載があります。

> Drizzle always waits for {rows: string[][]} or {rows: string[]} for the return value.
>
> When the method is get, you should return a value as {rows: string[]}.
> Otherwise, you should return {rows: string[][]}.

つまり、`method` が `"get"` の場合は `remoteCallback` は `{ rows: any[] }` を返し、その他の場合は `{ rows: any[][] }` を返す必要があります。

引数や戻り値の型を見比べると、`AsyncRemoteCallback` の複数クエリ版が `AsyncBatchRemoteCallback` というのがわかりますね。

### Cloudflare D1 API の呼び出し

`remoteCallback` と `batchRemoteCallback` の中で Cloudflare D1 API を呼び出しますが、重要な注意点があります。

Cloudflare D1 API 自体もバッチクエリをサポートしており、複数の SQL をセミコロン(`;`) 区切りで送れば一度に実行してくれます。しかし、バッチクエリを送るときはバインド変数が使えない制約があるようです。

そのため、Drizzle が出力した SQL の `?` に自分でパラメーターを埋め込んで、バインド変数を持たないプレーンな SQL に変換してから D1 API に送る必要があります。その変換をするために `sqlstring` というライブラリを導入しました。

```sh
pnpm install sqlstring
```

ただし `sqlstring` は MySQL 用のライブラリで、シングルクオートのエスケープが MySQL 方言になっていました。MySQL では `'` を `\'` にエスケープするのに対し、SQLite では `''` にエスケープする必要があります。そのため、次のように `sqlstring` を使いつつも追加でエスケープを置き換えています。

```ts
const sqlString = SqlString.format(sql, params).replaceAll("\\'", "''");
```

続いて、`cloudflare` パッケージを使って D1 APIを実行します。`Cloudflare` クラスのインスタンスを生成したら `d1.database.raw` メソッドを呼び出します。

```ts
import Cloudflare from "cloudflare";

const cf = new Cloudflare({ apiToken: credentials.apiToken });

const queryIterable = cf.d1.database.raw(credentials.databaseId, {
  account_id: credentials.accountId,
  sql: sqlString,
});

const results = await Array.fromAsync(queryIterable);
```

メソッドの戻り値にややクセがあり、`AsyncIterable` になっています。`for await` で回すか、上記のように `Array.fromAsync` で配列に変換してから使います。

`results` の中にクエリ結果が格納されます。SELECT や UPDATE 後のデータなど、バッチクエリの数だけ入っています。

### `createRemoteD1Drizzle` の完成形

ここまでを踏まえると、`createRemoteD1Drizzle` の全実装は次のようになります。

```ts
import Cloudflare from "cloudflare";
import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import SqlString from "sqlstring";

type Params<Schema> = {
  credentials: {
    accountId: string;
    databaseId: string;
    apiToken: string;
  };
  schema: Schema;
};

export const createRemoteD1Drizzle = <Schema extends Record<string, unknown>>({
  credentials,
  schema,
}: Params<Schema>) => {
  const cf = new Cloudflare({ apiToken: credentials.apiToken });

  return drizzle<Schema>(
    async (sql, params, method) => {
      const sqlString = SqlString.format(sql, params).replaceAll("\\'", "''");

      const queryIterable = cf.d1.database.raw(credentials.databaseId, {
        account_id: credentials.accountId,
        sql: sqlString,
      });

      const results = await Array.fromAsync(queryIterable);

      if (method === "get") {
        return { rows: results[0]?.results?.rows?.flat() ?? [] };
      } else {
        return { rows: results[0]?.results?.rows ?? [] };
      }
    },

    async (queries) => {
      const batchedSQL = queries
        .map(({ sql, params }) => SqlString.format(sql, params).replaceAll("\\'", "''"))
        .join(";\n");

      const queryIterable = cf.d1.database.raw(credentials.databaseId, {
        account_id: credentials.accountId,
        sql: batchedSQL,
      });

      const allResult = await Array.fromAsync(queryIterable);

      return allResult.map(({ results }, index) => {
        if (queries[index]?.method === "get") {
          return { rows: results?.rows?.flat() ?? [] };
        } else {
          return { rows: results?.rows ?? [] };
        }
      });
    },

    { schema: schema },
  );
};
```

実装のポイントは以下の通り。

- `sqlstring` でバインド変数を埋め込んだリテラルな SQL を生成する(SQLite に合わせてエスケープを調整)
- `Cloudflare.d1.database.raw` メソッドで D1 API を呼び出す(`params` は渡す必要なし)
- `AsyncIterable` を `Array.fromAsync` で配列に変換する
- Drizzle ドキュメントに従い、`method` によって戻り値を切り替える
- バッチクエリの場合は SQL をセミコロンで連結する

あとは通常の `drizzle` 関数と同じように `schema` や `credentials` を渡して呼び出せば、型安全な Drizzle クライアントが得られます。

```ts
import "dotenv/config";
import { createRemoteD1Drizzle } from "./drizzle-remote-d1.js";
import * as schema from "./db/schema.js";

const db = createRemoteD1Drizzle({
  schema,
  credentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DB_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  },
});

// 単一のクエリも実行できる！
await db.insert(schema.user).values({ name: "Alice" });

// バッチクエリも実行できる！
await db.batch([
  db.insert(schema.user).values({ name: "Alice" }),
  db.update(schema.user).set({ name: "Bob" }),
  db.delete(schema.user).where(eq(schema.user.name, "Charlie")),
]);
```

自分が書き捨てスクリプトで必要な分のクエリしか動作確認できていないので、参考にされる場合はちゃんと意図したクエリが発行できているか、戻り値が正しく整形されているかをご確認ください。

## 余談

Drizzle のクエリには実行せずに SQL だけを吐き出す `toSQL()` メソッドがあるのを知りました。これと `sqlstring` を組み合わせれば、Drizzle を使って SQL をファイルに書き出すスクリプトとかも作れます。いきなりデータベースに反映せずに SQL を確認したい場合に使えます。

```ts
const db = drizzle({ schema });

const { sql, params } = db
  .insert(schema.user)
  .values({ id: 99, name: "username" })
  .toSQL();

const sqlString = SqlString.format(sql, params).replaceAll("\\'", "''");

await fs.writeFile("./query.sql", sqlString);
```

## まとめ

Cloudflare Workers の実行コンテキストの外から Cloudflare D1 に Drizzle で型安全にアクセスする方法を紹介しました。

Cloudflare API と Drizzle Proxy の組み合わせで実現できました。ただし Cloudflare D1 API はバッチクエリにバインド変数が使えないので、`sqlstring` で自分で埋め込む必要があります。

自分は書き捨てのスクリプトからリモートの D1 にアクセスする方法を探ってたどり着いたけど、もしかしたらこれによって Cloudflare Workers 以外の普通のバックエンド環境(VPS とか Vercel とか)から D1 を RDB として使えるかも？速度は全然出ないかもしれんけど(推測)
