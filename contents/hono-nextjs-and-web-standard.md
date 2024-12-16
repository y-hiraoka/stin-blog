---
title: "Honoの捉え方、またはNext.jsとの組み合わせ方"
createdAt: "2024-12-16T15:22:54.204Z"
tags: ["hono", "nextjs"]
---

この記事は「Hono Advent Calendar 2024 シリーズ 2」17日目の記事です。

https://qiita.com/advent-calendar/2024/hono

HonoというWebフレームワークがあります。Express.jsのような書き方でWebアプリケーションを作れるものです。

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello, Hono!" }));

export default app;
```

HonoはWeb標準準拠を謳っているフレームワークです。それを聞くとなんだか小難しく感じます。

Web標準とは [`Request`](https://developer.mozilla.org/ja/docs/Web/API/Request) と [`Response`](https://developer.mozilla.org/ja/docs/Web/API/Response) のインスタンスを扱うということです。これらは主にブラウザ上のJavaScriptの`fetch`関数が取り扱うオブジェクトですね。

`Request`は`fetch`でHTTPリクエストを送信するときに、データをまとめておくオブジェクトです。例えば送信先のURLやHTTPメソッド、リクエストヘッダーなどが含まれます。

`Response`はHTTPレスポンスを表現するオブジェクトになります。レスポンスボディやステータスコード、レスポンスヘッダーなどが含まれます。これら２つの意味は、ブラウザ上で`fetch`を使う人なら馴染がありますね。

ネットワーク上で通信していることに目を瞑れば、`fetch`は単に`Request`を渡すと`Response`を生成するだけの関数と捉えることができますね。型で表現すれば、

```ts
function fetch(request: Request): Promise<Response>;
```

と見ることができます。(実際はオーバーロードでURL文字列だけを受け取ったりしますが)

Honoもまったく同じ捉え方ができ、Web標準とかフレームワークとか難しいことは考えず、単に`Request`オブジェクトを渡すと`Response`オブジェクトを返す関数として捉えることができます。というかまさに`fetch`という名のメソッドを備えています。

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello, Hono!" }));

const response = await app.fetch(new Request("/"));
```

Honoを単なる`Request => Response`変換関数として捉えることで、どんなところでも動くことがわかります。

例えば、Next.jsのRoute Handlersは、`GET`や`POST`という名前の関数を置いておくと`NextRequest`オブジェクトを渡して実行してくれます。関数から`NextResponse`オブジェクトを返すことで、それをブラウザにレスポンスしてくれます。ここで`NextRequest`/`NextResponse`は`Request`/`Response`を継承しているため、実質的には`Request`/`Response`として扱うことができます。つまり、Next.jsのRoute Handlersが要求している関数型は、Honoの`fetch`メソッドそのままです。よって、次のようにRoute Handlers上でHonoを使うことができます。

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello, Hono!" }));

export const GET = app.fetch; // これが動く
```

これができると何が嬉しいかというと、Next.jsのRoute HandlersにREST APIを起きつつ、HonoのRPC機能で型安全にクライアントコードを書くことができます。

```ts
// app/api/[...path].ts
import { Hono } from "hono";

const app = new Hono()
  .basePath("/api")

  .get("/users", (c) => c.json(getUsers()))
  .post("/users", (c) => c.json(createUser(c.body)))
  .get("/users/:id", (c) => c.json(getUser(c.params.id)))
  .put("/users/:id", (c) => c.json(updateUser(c.params.id, c.body)))
  .delete("/users/:id", (c) => c.json(deleteUser(c.params.id)))

  .get("/tweets", (c) => c.json(getTweets()))
  .post("/tweets", (c) => c.json(createTweet(c.body)))
  .get("/tweets/:id", (c) => c.json(getTweet(c.params.id)))
  .put("/tweets/:id", (c) => c.json(updateTweet(c.params.id, c.body)))
  .delete("/tweets/:id", (c) => c.json(deleteTweet(c.params.id)));

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;

export type HonoAppType = typeof app;
```

```tsx
// app/some-client.tsx
import { hc } from "hono/client";
import { HonoAppType } from "@/api/[...path]";

export const honoClient = hc<HonoAppType>("/");

// コンパイルエラー！！！！型安全！！！！
await honoClient.api.tweeeets[":id"].$delete({
  param: { id: "1" },
});
```

別の例として、Next.jsのMiddlewareにもHonoを利用できます。Next.jsのMiddlewareはプロジェクトにただひとつしか設置できず、そのひとつを全てのリクエストが通過することになります。MiddlewareもRoute Handlers同様に`NextRequest => NextResponse`型の関数を要求するのですが、素の`NextRequest`でパスやメソッドを見て処理分岐をするのがつらすぎるのです。

```ts
import { NextMiddleware, NextResponse } from "next/server";

export const middleware: NextMiddleware = (request) => {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // パスが /admin スタートだったら…
  }

  if (request.nextUrl.pathname === "/tweets" && request.method === "POST") {
    // パスが /tweets でメソッドが POST だったら…
  }

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    ["POST", "DELETE", "PUT"].includes(request.method)
  ) {
    // パスが /admin でメソッドが POST, DELETE, PUT だったら…
  }

  return NextResponse.next();
};
```

上記サンプルコードのように、一個ずつパスやメソッドをチェックするチェックする分岐を書く必要があります。Honoを使えばこのつらさを解消できます。

```ts
import { NextResponse } from "next/server";
import { Hono } from "hono";

const honoApp = new Hono()
  .use("/admin", async (c, next) => {
    await next();
  })
  .post("/tweets", async (c, next) => {
    await next();
  })
  .on(["POST", "DELETE", "PUT"], "/admin", async (c, next) => {
    await next();
  })
  .all("*", () => NextResponse.next());

export const middleware = honoApp.fetch;
```

Honoのルーティング記法を借りることで、if文による命令的なコードではなくパスとメソッドを宣言して処理を実行する宣言的なコードにできました。これもHonoが表面だけ見れば`Request => Response`変換関数に過ぎないからできることです。

このNext.jsのMiddlewareにHonoを使うアイデアは次の記事で学びました。

https://zenn.dev/coefont/articles/using-hono-in-next-middleware

他にもCloudflare WorkersやBun(筆者エアプ)、Deno(筆者エアプ)など、`Request => Response`を要求するサーバーランタイムにそのままアタッチできるのがHonoの強みです。そうでなくても、`Request => Response`に合うようなアダプターを噛ませてやれば、やはりHonoは動くのです。Node.jsの`createServer`が`Request => Response`ではない例で、`@hono/node-server`がそのアダプターということですね。

Web標準の`Request`/`Response`はアプリケーションを書く人にとって嬉しいことは決して多くないです。型安全じゃないし、HTTPを一枚ラップした程度の低レイヤー具合が扱いにくいです。そもそもブラウザAPIが出自なので、サーバーランタイムのAPIとしては不足している機能もあります。しかし、ライブラリやランタイムが共通のWeb標準APIをサポートすることで、同じライブラリを異なる目的で活用することができます。Honoを覚えれば、Next.jsでもいい感じに使えるしCloudflare Workersでもそのまま動くし、DenoやBunもすぐに開発ができる可能性を持てるのです。そこにWeb標準大統一時代の魅力を感じます。
