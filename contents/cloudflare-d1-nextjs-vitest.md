---
title: "Next.js on Cloudflare Workers (OpenNext) で Drizzle + D1 を使ったユニットテストを書く"
createdAt: "2025-09-20T12:32:47.309Z"
tags: ["cloudflare", "drizzle", "vitest"]
---

OpenNext は Next.js アプリケーションを Vercel 以外に簡単にデプロイするためのツールです。Cloudflare Workers をサポートしています。

Cloudflare 自体も OpenNext によるデプロイを推奨しており、次のコマンドによって OpenNext による Next.js アプリケーションが作成されます。

```bash
pnpm create cloudflare@latest my-next-app --framework=next
```

Drizzle ORM は TypeScript 向けの型安全な ORM で、Cloudflare D1 をサポートしています。

Cloudflare D1 は Cloudflare のデータベースサービスで、Cloudflare の wrangler CLI を使えばローカルでも起動できます。

## やりたいこと

Cloudflare Workers にデプロイする Next.js アプリケーションのユニットテストを Vitest で書きたい。それも、D1 を動かしてテストをしたいのです。

テスト対象は D1 を利用するバックエンドロジックです。画面側は D1 とか関係ないので普通に書けます。Playwright で e2e テストを書く場合も、Playwright の開発サーバーを起動するコマンドで `pnpm run dev` などを実行すれば D1 も自然と利用されるので問題ありません。

Vitest のモックをいい感じに使って Drizzle D1 クライアントをインメモリ SQLite + Drizzle LibSQL クライアントに差し替えるような方法も考えましたが、問題がありました。Drizzle はエラーまでは抽象化しておらず、例えばユニーク制約エラーを発生させると D1 と LibSQL でそれぞれ異なるエラーオブジェクトが throw されます。それではエラーハンドリングが大変なので、テスト中も実際の D1 を動かしたいと考えました。

Cloudflare Workers ドキュメントには、Workers + D1 によるユニットテスト、インテグレーションテストの書き方が説明されています。

https://developers.cloudflare.com/workers/testing/vitest-integration/

ただし、Next.js でのユニットテストについては書かれておらず、工夫が必要でした。Cloudflare Workers 上にデプロイする Next.js は特殊なビルドが施されるため、単純な Workers アプリケーションの書き方とは異なるからです。

## サンプルコード

本記事で紹介する書き方でユニットテストを書いたサンプルコードを公開しています。

https://github.com/stinbox/d1-nextjs-vitest

## Next.js アプリケーションの作成

OpenNext によって Cloudflare Workers にデプロイできる Next.js アプリケーションを作成します。すでに Next.js アプリケーションがある場合は、この節を読み飛ばせます。

```sh
pnpm create cloudflare@latest d1-nextjs-vitest --framework=next
```

Cloudflare D1 を使うため、`wrangler.jsonc` に D1 の設定を追加します。データベースの名前は `drizzle-d1-script` としています(前回記事の使い回し)。バインドする環境変数名が `DB` であることは覚えておいてください。

```jsonc
{
  // ... 省略 ...
  "d1_databases": [
    {
      "binding": "DB",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "database_name": "drizzle-d1-script",
    },
  ],
}
```

`wrangler.jsonc` に D1 の設定を追記したら、型情報を生成します。次のコマンドを実行すると `cloudflare-env.d.ts` が上書きされます。コマンドはスターターにすでに含まれています。

```sh
pnpm run cf-typegen
```

Drizzle ORM をセットアップします。

```sh
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

`src/db/schema.ts` に以下のようなスキーマを定義します。

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = integer("created_at", { mode: "timestamp_ms" })
  .$defaultFn(() => new Date())
  .notNull();

const updatedAt = integer("updated_at", { mode: "timestamp_ms" })
  .$defaultFn(() => new Date())
  .$onUpdateFn(() => new Date())
  .notNull();

export const prefecture = sqliteTable("prefecture", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt,
  updatedAt,
});
```

`drizzle.config.ts` に以下のように設定を書きます。僕は Drizzle には SQL だけ生成してもらい、wrangler CLI でマイグレーションを適用する手順を取っています。なので、`drizzle.config.ts` には Cloudflare のトークンなどは含めていません。

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
});
```

`package.json` に以下のようなスクリプトを追加します。必要に応じて本番用の `migration:apply` (`--remote`) も追加してください。

```jsonc
{
  // ... 省略 ...
  "scripts": {
    "migration:generate": "drizzle-kit generate",
    "migration:apply": "wrangler d1 migrations apply drizzle-d1-script --local",
  },
}
```

スキーマを反映させるためにマイグレーション SQL を生成します。

```sh
pnpm run migration:generate
```

続いて、マイグレーション適用と同時に `prefecture` テーブルにいくつか値が insert されるように、カスタムマイグレーション を作成します。

```sh
pnpm run migration:generate --custom --name insert_prefectures
```

空の SQL ファイルが `migrations` に生成されるので、以下のように3つの都道府県だけ insert した SQL を書き込んでおきます。

```sql
-- Custom SQL migration file, put your code below! --

insert into prefecture (name, created_at, updated_at) values ('北海道', current_timestamp, current_timestamp);
--> statement-breakpoint
insert into prefecture (name, created_at, updated_at) values ('青森県', current_timestamp, current_timestamp);
--> statement-breakpoint
insert into prefecture (name, created_at, updated_at) values ('岩手県', current_timestamp, current_timestamp);
```

`--> statement-breakpoint` は drizzle-kit が付与するので倣って付けています。テスト時にインメモリでマイグレーションを行うときに使用する drizzle-orm の `migrator` 関数 (`drizzle-orm/libsql/migrator` など)がこのコメントを制御構文として使用しているので、カスタムマイグレーションでも付けておくと安心です。ただし本記事では `migrator` を使用しません。

マイグレーションを適用します。

```sh
pnpm run migration:apply
```

これでローカルの D1 (SQLite) が `.wrangler/state/v3/d1` ディレクトリに作成され、 `prefecture` テーブルの create と 3 つの都道府県が登録されます。

## テスト対象の関数のサンプルを用意

どんなコードをテスト対象と想定しているかをサンプルコードによって示します。

まず、`DrizzleClient` 型を定義しておきます。drizzle-orm の `DrizzleD1Database` に自分のスキーマを渡して定義した型を `src/db/client.ts` に用意します。

```ts
import { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DrizzleClient = DrizzleD1Database<typeof schema>;
```

今回テストしたいバックエンドロジックのサンプル関数は次のようなコードです。`page.tsx` や Server Functions(formerly Server Actions) がこれらを利用するイメージです。

```ts
import { DrizzleClient } from "@/db/client";
import { prefecture } from "@/db/schema";

export async function getPrefectureList(db: DrizzleClient) {
  return db.query.prefecture.findMany();
}

export async function insertPrefecture(db: DrizzleClient, name: string) {
  return db.insert(prefecture).values({ name }).returning().get();
}
```

このサンプル関数が `src/service/pref.ts` にあるとします。

`DrizzleClient` を引数で取るようにして、Dependency Injection(DI) っぽくしています。Next.js で D1 を使う場合は `getCloudflareContext()` 関数で環境変数を参照する必要がありますが、これはバックエンドロジックを利用する側で行うルールにしています。こうすることで、`getCloudflareContext()` を毎回モックしなくてもよくなります。

## Vitest のセットアップ

いよいよ Vitest のセットアップに入ります。

大枠は [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/) の Vitest の説明に従います。

### パッケージのインストール

まずは必要なパッケージのインストールから。

```sh
pnpm install -D vitest@~3.2.0 vite-tsconfig-paths @cloudflare/vitest-pool-workers@0.8.49
```

`@cloudflare/vitest-pool-workers` は Vitest のランタイムを Cloudflare Workers にするためのパッケージだと思います。具体的にどんな役割を果たすかはドキュメントに言及がなくて不明ですが、とにかくインストールします。

僕が動作確認したところ、`@cloudflare/vitest-pool-workers@0.8.49` のバージョンを使わないと、ファイル保存時のテスト再実行でエラーになる致命的なバグがあります。以下の issue で報告されていました。

https://github.com/cloudflare/workers-sdk/issues/9913

`vitest` は `3.2.0` 系を使います。ドキュメントによれば、`@cloudflare/vitest-pool-workers` は Vitest 2.0.x - 3.2.x でしか動作しないとのこと。

`vite-tsconfig-paths` は tsconfig.json で `paths` を使っているなら必要です。Next.js スターターだと `@/` エイリアスがデフォルトなので必要になることが多いと思います。

### tsconfig.json の編集

tsconfig.json に追加の型情報を与える必要があります。 `compilerOptions.types` に `"@cloudflare/vitest-pool-workers"` を追加します。

```jsonc
{
  "compilerOptions": {
    // ... 省略 ...
    "types": ["./cloudflare-env.d.ts", "@cloudflare/vitest-pool-workers", "node"],
  },
}
```

これを追記しておくことで、`import { env } from "cloudflare:test";` のような実在しないモジュールからの import が型エラーにならなくなります。

### Vitest 設定ファイル

`vitest.config.ts` を作成して、次のように書き込みます。

```ts
import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig(async () => {
  // Read all migrations in the `migrations` directory
  const migrationsPath = path.join(__dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [tsconfigPaths()],
    test: {
      setupFiles: ["./src/test/apply-migrations.ts"],
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: {
            configPath: "./wrangler.jsonc",
            environment: "production",
          },
          main: "src/test/dummy-worker.ts",
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
            assets: {
              directory: "./public",
            },
          },
        },
      },
    },
  };
});
```

config 定義には `vitest/config` の `defineConfig` ではなく `@cloudflare/vitest-pool-workers/config` の `defineWorkersConfig` を使います。使い勝手はほとんど同じですが `wrangler` に命令するらしきオプションが生えていますね。`wrangler.jsonc` のパスを指定することで、その設定ファイルで定義された D1 や KV などがテストランタイムでもアクセスできるようになります。

`readD1Migrations` によってテストランタイムで起動する D1 に適用するマイグレーション SQL のディレクトリを読み込みます。読み込んだ後のオブジェクトは `test.poolOptions.workers.miniflare.bindings.TEST_MIGRATIONS` で覚えておきます。`TEST_MIGRATIONS` という名前はテストランタイム中の環境変数になるので、どんな名前でも良いです。

`test.setupFiles` には `TEST_MIGRATIONS` を適用するスクリプトを指定します。中身は次の2行だけ。`cloudflare:test` から import できる `env` が、実際に Workers ランタイムでアクセスできる Bindings で、`env.DB` が D1 インスタンスです。

```ts
// src/test/apply-migrations.ts
import { applyD1Migrations, env } from "cloudflare:test";

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
```

そして次が OpenNext 環境でのポイントですが、`test.poolOptions.workers.main` に適当なダミーのエントリーポイントを指定する必要がありました。というのも、Next.js on Cloudflare Workers のプロジェクトでは、ビルドして初めて `wrangler.jsonc` の `main` に指定されたファイルが生成されます。`main` に指定されたファイルがない状態で Vitest を起動するとエラーになるため、ダミーファイルを作成して指定しておきます。ダミーファイルの中身は空のモジュールで良いです。

```ts
// src/test/dummy-worker.ts
export {};
```

同様に `wrangler.jsonc` の `assets` も Vitest 起動時に存在する必要があります。通常はそこに指定されている `.open-next/assets` が gitignore されているので、必ず存在するディレクトリに上書きする必要があります。それが `test.poolOptions.workers.miniflare.assets` の指定です。Next.js アプリケーションなら `public` ディレクトリはあると思うので、それを指定しています。

### `test/env.d.ts` の作成

ドキュメントに沿って `test/env.d.ts` を作成します。これを作成することで、`"cloudflare:test"` から import できる `env` の型情報を拡張できます。

が、ここも Next.js on Cloudflare Workers の逸脱ポイントがあります。[ドキュメント](https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/#define-types)では `extends Env {}` と記載されていますが、Next.js 環境では `Cloudflare.Env` を継承する必要があります。

```ts
declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Cloudflare.Env {
    TEST_MIGRATIONS: D1Migration[];
  }
}
```

`vitest.config.ts` で `TEST_MIGRATIONS` を定義したので、型情報にも追加しておきましょう。

### package.json の編集

`package.json` の `scripts` に `test` スクリプトを追加します(任意)。

```jsonc
{
  // ... 省略 ...
  "scripts": {
    // ... 省略 ...
    "test": "vitest",
  },
}
```

## ユニットテストの作成

Vitest のセットアップが完了したので、テストを書いていきます。

### テスト時専用の Drizzle クライアントを用意する

先述の通り、バックエンドロジックは `DrizzleClient` を引数で取る DI パターンを採用しています。そこに注入するテスト用クライアントを作成する関数を用意しておきましょう。

```ts
// src/test/d1-test-client.ts
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { DrizzleClient } from "@/db/client";

export const getTestD1Client = (): DrizzleClient => {
  const client = drizzle(env.DB, { schema, logger: true });

  return client;
};
```

ここでも `env.DB` で D1 インスタンスにアクセスできます。それを `drizzle` 関数に渡してクライアントを生成します。`drizzle` 関数は `drizzle-orm/d1` から import できることがポイントです。`drizzle-orm/libsql` などで代用するわけではありません。

### テストコードの作成

適当にテストコードを書いてみます。`pnpm run test` を実行すると、次のテストはすべて正常に通過します。

```ts
// src/service/pref.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getPrefectureList, insertPrefecture } from "@/service/pref";
import { getTestD1Client } from "@/test/d1-test-client";

describe("Drizzle D1 テストコードサンプル", () => {
  const client = getTestD1Client();

  beforeEach(async () => {
    await insertPrefecture(client, "沖縄");
  });

  it("インサートする", async () => {
    const result = await insertPrefecture(client, "東京");

    expect(result.name).toBe("東京");
  });

  it("取得する", async () => {
    const result = await getPrefectureList(client);

    expect(result.length).toBe(4);
  });

  it("インサートしてから取得する", async () => {
    await insertPrefecture(client, "大阪");

    const result = await getPrefectureList(client);

    expect(result.length).toBe(5);
  });
});
```

2つ目のテストで4件取得できていることから、カスタムマイグレーションで insert した3件と `beforeEach` で insert した1件がちゃんと反映できていることがわかります。

1つ目のテストで「東京」を insert しているのに2つ目のテストではマイグレーションと `beforeEach` で insert した4件しか取得できていないことから、テストケース毎に D1 がリセットされていることがわかります。3つ目のテストは insert した「大阪」を含めた5件が取得できているので、確かに insert はできています。

テストケース毎に D1 がリセットされるので、データベースをクリアする処理を書く必要がなくて便利ですね。

これで、Next.js on Cloudflare Workers でも D1 を動かしたユニットテストが書けるようになりました！

## まとめ

Next.js on Cloudflare Workers (OpenNext) で Drizzle + D1 を使ったユニットテストの書き方を紹介しました。

ポイントは以下の通りです。

- 基本はドキュメント通りのセットアップ
- ダミーの Worker エントリーポイントを用意する
- `assets` もダミーを指定する
- `cloudflare:test` の型定義は `Cloudflare.Env` を継承する

それでは良い Cloudflare ライフを！
