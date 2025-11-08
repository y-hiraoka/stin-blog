---
title: "ts-rest や他色々を試すために Todo アプリを作る"
createdAt: "2025-11-08T05:57:49.268Z"
tags: ["ts-rest", "better-auth", "drizzle", "hono"]
---

ts-rest という RPC ライブラリを見かけて気になったので、実際に Todo アプリを作って試してみました。

## ts-rest とは

https://ts-rest.com/

ts-rest は、REST API を型安全に実装するためのライブラリです。サーバーサイドだけでなく、REST API にアクセスするクライアントサイドも型安全に記述できるようになります。

サーバーコfードの実装からクライアントコードの型が生成される方式ではなく、contract (契約)をまず用意して、それに従ってサーバーがバックエンドロジックを実装する流れになります。

contract は TypeScript で記述しますが、そのまま OpenAPI まで吐き出すことも可能です。なので TypeScript 以外の言語で実装されたクライアントも OpenAPI を挟めば型安全なコードが書けます。

比較対象としては Hono RPC や oRPC が挙げられます。Hono はサーバーコードからクライアントコードが推論されるパターンですね。oRPC は名前しか知らないので分かりません(？)

TypeScript の RPC ライブラリとしては tRPC も有名ですが、あれは REST API ではないのでレイヤーが違います。

## 完成物

以下にソースコードを公開しています。クローンして README 通りに実行すれば動くはずです。

https://github.com/stinbox/ts-rest-todo-app

デプロイはしていないので、ローカルで動かしてみてください。

## コード解説

### スタック

ts-rest 以外にも色々新しいことを試すために、以下のスタックで構築しました。

- Vite + React
- better-auth
- Hono
- Drizzle ORM (SQLite)
- ts-rest
- daisyUI
- Turborepo

とりわけ、better-auth でユーザー認証を行いつつ、ts-rest で API を定義する組み合わせを試してみたいと思っていました。

React は SSR (Server Side Rendering) を伴わない古典的な SPA (Single Page Application) です。バックエンドは別プロセスの Hono (node-adapter) で起動します。

### monorepo 構成

ts-rest の売りとして、contract を npm などに公開すればユーザーに API を型安全に利用してもらえるという点があります。

これを想定して、server, client, contract という3つのパッケージに分けました。まるで Todo Enterprise ですね。

```
.
├── client
│   ├── src
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── contract
│   ├── src
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

### pnpm catalog でバージョンを揃える

better-auth は server と client の両方で使います。必ず同じバージョンの better-auth がインストールされることを保証したいですね。

また、ts-rest は `@ts-rest/core` と `@ts-rest/serverless` に分かれています(構成によっては別のパッケージが必要です)。異なるパッケージではありますがバージョン番号を揃えたほうが安全です。

これらのバージョンを管理するために、pnpm catalog で固定しましょう。

```yaml
# pnpm-workspace.yaml

catalog:
  "better-auth": 1.3.27
  "@ts-rest/core": "3.53.0-rc.1"
  "@ts-rest/serverless": "3.53.0-rc.1"
```

使う側

```jsonc
// package.json

  "dependencies": {
    // ...
    "@ts-rest/serverless": "catalog:",
    "better-auth": "catalog:",
  },
```

### server は Node.js 24 で TypeScript のまま実行する

server プロセスは Node.js Type Stripping で TypeScript をそのまま実行するようにしてみました。初めて試しました。本当に TypeScript が Node.js で動いてすごい。

Node.js 公式ドキュメントに TypeScript をそのまま実行するためのセットアップを紹介するページがあります。

https://nodejs.org/api/typescript.html#type-stripping

このページの存在に気づかず手探りで以下の `tsconfig.json` を模索しました(Node.js ドキュメントとはやや異なる)。

```jsonc
{
  "compilerOptions": {
    "target": "es2024",
    "module": "nodenext",
    "noEmit": true,
    "types": ["node"],
    "strict": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
  },
  "include": ["src"],
}
```

重要な値は以下です。

- `allowImportingTsExtensions`
  - import 文に `.ts` 拡張子が使われることを tsc に伝える
  - Node.js Type Stripping では TypeScript ファイルを `.js` で import できない(しなくてもよい、ではなくできない。)
- `erasableSyntaxOnly`
  - 古い namespace や enum などの TypeScript 文法を許可しない
  - これらは型を削ぐだけでは JS に変換できないため
- `verbatimModuleSyntax`
  - import する変数が型のときは import type の記述を強制する
  - Node.js が import された型を安全に除去するため

一方で Node.js 公式ドキュメントでは、`allowImportingTsExtensions` ではなく `rewriteRelativeImportExtensions` の有効化を紹介しています。

両者は import の拡張子に `.ts` を許可する点で似ていますが、`allowImportingTsExtensions` は `noEmit: true` と共に有効化する必要があることに対して、`rewriteRelativeImportExtensions` は `noEmit: true` でも使えます。

ただ、Node.js Type Stripping によって TypeScript を実行するなら noEmit でいいはずなので、どちらを有効化しても変わらないのではと思います(むしろ `allowImportingTsExtensions` のほうがわかりやすいオプション名になっていて好み)。開発中は TypeScript のまま実行し、本番サーバーでは JavaScript を実行するような構成の場合は `allowImportingTsExtensions` が必要になりますね。

### ts-rest は RC 版を入れる

執筆時点の最新安定版の ts-rest はバリデーションに zod が使えますが、zod v4 を使うと型推論が壊れて any まみれになります。

ts-rest RC 版では zod v4 や Standard Schema をサポートしています。zod v4 がリリースされてからけっこう経つので v4 を使いたいですよね。今すぐ試す人は RC 版を入れてください。

pnpm catalog でバージョンを固定するので、pnpm-workspace.yaml に RC 版のバージョンを明記します。

```yaml
# pnpm-workspace.yaml

catalog:
  "better-auth": 1.3.27
  "@ts-rest/core": "3.53.0-rc.1"
  "@ts-rest/serverless": "3.53.0-rc.1"
```

### contract は tsc でコンパイルする

contract は npm registry に publish することを想定し、tsc でコンパイルしています(想定するだけでこの Todo アプリの contract は publish していません)。なぜ tsup などではなく素の tsc なのかと言いますと、、、特に理由はないです。

contract は server や client から利用されるため、ライブラリとしてセットアップします。具体的には、`package.json` の `exports` にパッケージとしてのエントリーポイントを宣言します。

```jsonc
{
  "name": "@monorepo/contract",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
    },
    "./models/*": {
      "types": "./dist/models/*.d.ts",
      "import": "./dist/models/*.js",
    },
  },
}
```

server や client の `package.json` では、依存関係として contract を追加します。

```jsonc
{
  "name": "@monorepo/server",
  "dependencies": {
    "@monorepo/contract": "workspace:*",
    // ...
  },
}
```

### server は Hono で待ち受ける

server はまず Hono でリクエストを受けます。Hono でルーティングを行い、 `/api/auth` へのリクエストは better-auth に流し、それ以外の `/api` へのリクエストは ts-rest のハンドラーに流すようにしています。

Hono が Web 標準の Request / Response を扱うので、同じく Request / Response を処理する better-auth や ts-rest を容易にアタッチできます。

これはまさに、Hono Conf 2025 で nakasyou 氏が語ったことですね。Web 標準ゆえに他のライブラリ･フレームワークの前段に立たせることができます。

```ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { contract } from "@monorepo/contract";
import { fetchRequestHandler } from "@ts-rest/serverless/fetch";
import { auth } from "./auth.ts";
import { tsRestRouter } from "./ts-rest.ts";

export const app = new Hono()

  .use(logger())

  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })

  .all("/api/*", async (c) => {
    // 認証チェック省略(後述)

    return fetchRequestHandler({
      router: tsRestRouter,
      contract,
      request: new Request(c.req.raw),
      platformContext: { session: session.session },
      options: {},
    });
  });
```

ただし、ts-rest はひと工夫必要でした。具体的には Hono の Request オブジェクトを ts-rest にパスする際、Request オブジェクトの作り直しをする必要があります。上記コードで `new Request(c.req.raw)` を実行している箇所です。

`c.req.raw` をそのまま ts-rest の `fetchRequestHandler` に渡すと、以下のようなエラーになります。

```
TypeError: Cannot read private member #state from an object whose class did not declare it
    at new Request (node:internal/deps/undici/undici:10426:27)
    at new TsRestRequest (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/@ts-rest+serverless@3.53.0-rc.1_@ts-rest+core@3.53.0-rc.1_@types+node@24.8.0_/node_modules/@ts-rest/serverless/types.esm.mjs:27:9)
    at fetchRequestHandler (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/@ts-rest+serverless@3.53.0-rc.1_@ts-rest+core@3.53.0-rc.1_@types+node@24.8.0_/node_modules/@ts-rest/serverless/fetch.esm.mjs:22:27)
    at file:///Users/example/ts-rest-better-auth-todo-app/server/src/app.ts:25:12
    at async dispatch (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/hono@4.9.12/node_modules/hono/dist/compose.js:22:17)
    at async logger2 (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/hono@4.9.12/node_modules/hono/dist/middleware/logger/index.js:38:5)
    at async dispatch (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/hono@4.9.12/node_modules/hono/dist/compose.js:22:17)
    at async file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/hono@4.9.12/node_modules/hono/dist/hono-base.js:201:25
    at async responseViaResponseObject (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/@hono+node-server@1.19.5_hono@4.9.12/node_modules/@hono/node-server/dist/index.mjs:412:13)
    at async Server.<anonymous> (file:///Users/example/ts-rest-better-auth-todo-app/node_modules/.pnpm/@hono+node-server@1.19.5_hono@4.9.12/node_modules/@hono/node-server/dist/index.mjs:551:14)
```

原因は特定していませんが、`@hono/node-adapter` が悪さしているのではと予想しています。`@hono/node-adapter` は Node.js の http モジュールと Web 標準 `Request` / `Response` の変換を効率よく変換するために色々工夫しています。それが ts-rest と相性が悪いかもしれません(あくまで予想です)。

### better-auth で認証して ts-rest に渡す

better-auth で認証できたユーザーだけが ts-rest で記述した API をコールできるようにします。

better-auth のサーバーサイド API である `auth.api.getSession` を使ってユーザーの認証を確認します。

```ts
  .all("/api/*", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    return fetchRequestHandler({
      router: tsRestRouter,
      contract,
      request: new Request(c.req.raw),
      platformContext: { session: session.session },
      options: {},
    });
  });
```

セッションがなければ 401 を返し、セッションがあれば `fetchRequestHandler` に流します。ts-rest 側で認証情報をリクエストコンテキストとして利用できるように、`platformContext` にセッションオブジェクトを渡します。

ts-rest にも middleware の機構が用意されているので、こちらを使っても良いかもしれないです(むしろこちらが正攻法かも)

https://ts-rest.com/server/serverless/options#middleware

### ts-rest のサーバー実装

ts-rest のルーターに実装を入れていきます。雑にコードをペーストしてしまいますが、具体的なロジックは関数を分けているのでイメージを掴みやすいかと思います。

```ts
import type { Session } from "better-auth";
import { contract } from "@monorepo/contract";
import { tsr } from "@ts-rest/serverless/fetch";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./todo-service.ts";

export const tsRestRouter = tsr.platformContext<{ session: Session }>().router(contract, {
  listTodos: async (_, { session }) => {
    return {
      status: 200,
      body: await listTodos(session.userId),
    };
  },

  createTodo: async ({ body }, { session }) => {
    const created = await createTodo(session.userId, body.content);
    return {
      status: 201,
      body: created,
    };
  },

  updateTodo: async ({ body, params }, { session }) => {
    const updated = await updateTodo(
      session.userId,
      params.id,
      body.content,
      body.completed,
    );
    if (!updated) {
      return { status: 404, body: { message: "Todo not found" } };
    }
    return { status: 200, body: updated };
  },

  deleteTodo: async ({ params }, { session }) => {
    await deleteTodo(session.userId, params.id);
    return { status: 204, body: undefined };
  },
});
```

上記コードでは、contract で宣言された型に従って `params` や `body`、戻り値に正しく型が付きます。contract 側でコードを変更すれば、型が伝播して server 側でも型エラーとして修正すべき箇所を炙り出せるようになっています。

### ts-rest の client 側実装

```ts
import { contract } from "@monorepo/contract";
import { initClient } from "@ts-rest/core";

export const tsRestClient = initClient(contract, { baseUrl: "/" });

const response = await tsRestClient.createTodo({
  body: { content: "todo" },
});
```

client 側もメソッドを型安全に呼び出せるようになっています。メソッド名や引数の型が contract によって決まるため、contract を修正したら client の要修正箇所も型エラーとしてすぐに特定できます。

戻り値もステータスコードレベルで型が決まります。例えば 200 OK のレスポンスボディを参照したい場合、`response.status === 200` で分岐する必要があります。

### client は daisyUI で装飾

Tailwind CSS ベースかつ shadcn UI ではない選択肢を試してみたく、daisyUI を使ってみました。

名前は知っていたのですが、「それって Bootstrap の再来じゃね？」と感じて食わず嫌いをしていました。

daisyUI は React コンポーネントではなく、Tailwind CSS のクラス群を提供します。例えばボタンは次のように装飾します。

```tsx
<button className="btn btn-primary">Primary</button>
```

めっちゃ Bootstrap ですね。ただ、Tailwind CSS ベースということもあり、VS Code の入力補完が効くので悪くないなと思いました。

導入もとても簡単で、Tailwind CSS 本体のセットアップ + 1 行で完了します(デフォルトテーマの場合)。

```css
@import "tailwindcss";
/* これだけ */
@plugin "daisyui";
```

結局クライアントコード書くの面倒になって Codex にほとんど書かせたんですけどね。AI が使い方を知っているというのもひとつのメリットと言えます(？)

## 感想

ts-rest の contract ファーストな API 開発は好みです。contract 自体も OpenAPI ではなく TypeScript で記述できるので、とっつきやすいです。いざとなれば OpenAPI のほうを生成可能ですしね。

ts-rest の懸念点は、半年ほど(執筆時点)コミットがない点です。メンテナンスが放棄されているのか判断が微妙に難しい…。

better-auth や ts-rest のハンドラーを Hono に簡単にアタッチできるのは嬉しいですね。同じ Web 標準インターフェイスを実装しているからできることです。Hono はその入口になれるのが強い。

daisyUI はけっこう良いなと思いました。shadcn UI はコード生成したり依存を大量に追加しないといけませんが、daisyUI は Tailwind CSS のクラスだけで済んでスッキリしています。見た目も、最近のギークでダークで Vercel に似たりよったりな UI ライブラリとは違って、ポップな感じがかわいくて良いです。

Todo アプリで色々試すの楽しいですね。

それでは！
