---
title: "WebSocket を使ってみたくて簡単なチャットアプリを作って Google Cloud Run にデプロイしてみる"
createdAt: "2022-06-12T04:41:36.606Z"
tags: ["react", "websocket", "fastify", "docker", "cloudrun"]
---

# WebSocket でリアルタイム通信したいんじゃ

WebSocket 通信を使ってみたいので調べた学習ノート。Node.js 用ライブラリの ws を使わずに WebSocket サーバー実装とかできたらかっこいいけどとりあえずライブラリに甘えます。

## ws による最小構成

```bash
npm i ws @types/ws
```

サーバーを起動する最小構成。

```tsx
import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 7777 });

wss.on("connection", (ws: WebSocket) => {
  console.log("connected!");

  ws.on("message", (data, isBinary) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    }
  });

  ws.on("close", () => console.log("closed!"));
});
```

このコードをコンパイルして Node.js で実行すると `ws://localhost:7777` で WebSocket サーバーが起動して接続を待ち受ける。クライアントから接続があるとまず `“connected!”` と表示する。そして、接続中のクライアント全てに受け取った値を送りつける。クライアントの接続が切れたら `"closed!"` を表示する。

クライアントは vite でさくっと React アプリを構築する。

```bash
npm create vite@latest client --template react-ts
```

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const webSocketRef = useRef<WebSocket>();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:7777");
    webSocketRef.current = socket;

    socket.addEventListener("message", event => {
      setMessage(event.data);
    });

    return () => socket.close();
  }, []);

  const [inputText, setInputText] = useState("");
  const submit: React.FormEventHandler = useCallback(
    event => {
      event.preventDefault();
      webSocketRef.current?.send(inputText);
    },
    [inputText],
  );

  return (
    <div className="App">
      <h1>{JSON.stringify(message)}</h1>
      <form onSubmit={submit}>
        <input value={inputText} onChange={e => setInputText(e.target.value)} />
        <button>送信</button>
      </form>
    </div>
  );
}

export default App;
```

ブラウザ側の WebSocket 通信は Web API の `WebSocket` クラスを使用する。 ws の API である `WebSocket` とは別物であることに注意。

`WebSocket` のインスタンスを掴んでおくための `useRef` を用意する。 `useEffect` 内で `localhost:7777` と接続する `WebSocket` インスタンスを生成して `useRef` に格納する。

`socket.addEventListener` でメッセージを受信したら `setMessage` に渡す。そうすると `h1` 要素に受信したメッセージが格納される。

テキスト入力を受け付けるフォームを作り、サブミットされたら `socket.send` でデータを送信する。サーバーサイドでは接続されたクライアントすべて(自分含む)に転送されるので、 `socket.addEventListener` が動くはず。

![2つのブラウザで同じアプリを開き、一方での変更がもう一方に作用する様子](/images/contents/build-chat-app-with-websocket/sync_example.gif)

できた！

## HTTP サーバーとの共存

websocket エンドポイントだけで完結する Web サービスは存在しないので、HTTP サーバーと共存する方法を調べる。

大抵の Web フレームワークには ws のプラグインがあるっぽい。今回は fastify を試してみる。ちなみに fastify 自体も使ったことがなかった。

```bash
npm install fastify
```

まずは fastify で簡単な GET リクエストを受け取ってレスポンスを返す書き方。

```tsx
import fastify from "fastify";

const server = fastify({ logger: true });

server.get("/", async (request, reply) => {
  return { hello: "wolrd" };
});

const start = async () => {
  try {
    await server.listen(7777);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
```

Express と似てるようで違う。 `server.get` に渡したコールバック関数からオブジェクトを return すると、それが json 形式のレスポンスになるらしい。 Express っぽく `reply.send({hello: "world"})` と書いてもいけるらしいけど、コールバック関数の戻り値がそのままレスポンスになるのは、HTTP メソッド = コールバック関数 という捉え方ができて直感的になっている気がする。

`server.get` の戻り値が `server` 自体になっているのでメソッドチェーンで書けてスマート。

```tsx
server
  .get("/", () => {
    return { hello: "world" };
  })
  .post("/", () => {
    return { message: "nice post method!" };
  });
```

さくっと fastify の書き方を学んだところで、WebSocket エンドポイントを実装するためのプラグインをインストールする。

```bash
npm install @fastify/websocket
```

`fastify-websocket` をインストールして実装する記事が多いが、最近(2022/04) `@fastify` 名前空間に移動されたらしい。それと同時に `fastify-websocket` は更新停止され非推奨になった。

```tsx
import websocketPlugin from "@fastify/websocket";
import fastify from "fastify";

const server = fastify({ logger: true });

server.register(websocketPlugin);

server.get("/", { websocket: true }, (connection, request) => {
  connection.socket.on("message", (data, isBinary) => {
    for (const client of server.websocketServer.clients) {
      client.send(data, { binary: isBinary });
    }
  });
});

server.get("/hello", async (request, reply) => {
  return { hello: "world" };
});

const start = async () => {
  try {
    await server.listen(7777);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
```

ws だけで実装したものと同様の機能と、単純な JSON を返す HTTP GET を実装したサーバーのコード。 `fastify.get` を宣言する時にオプションで `{ websocket: true }` を渡すと、WebSocket エンドポイントになる。 `connection.socket` に ws の `WebSocket` クラスのインスタンスが格納されている。ws サーバーの本体は `server.websocketServer` に入っているので、接続中クライアントすべてのリストは `server.websocketServer.clients` で取得できる。

ポート番号は同じにしてあるので、この fastify サーバーを起動すればクライアント側は修正不要でいける。同時に `http://localhost:7777/hello` に GET リクエストも送信できる。

## 簡単なチャットアプリを作ってみる

クライアントは React で、サーバーは fastify と ws でチャットアプリを作ってみる。

### 要件

- ログイン機能はなし
- ブラウザのローカルストレージに `userId` を保存して、それで送信者を識別するだけ
- `userId` はクライアント側で採番する
- メッセージが送信されたらリアルタイムに他のクライアントに通知する
- メッセージの ID はサーバー側で採番する
- メッセージはサーバー側のインメモリに有限個数保存する

### サーバーサイド

まずはクライアントからサーバーに送信するメッセージのデータ型を決める。大規模なことはしないけど、本格的な開発を見据えて zod を使ってちゃんとバリデーションもする。

```tsx
import * as z from "zod";

export const chatMessageValidator = z.object({
  userId: z.string(),
  content: z.string().max(500),
});
```

クライアントからくるデータは `userId` と `content` の 2 つのプロパティを持つ JSON とする。巨大なデータな持たされるのも困るので `content` は 500 文字まで。

続いて、メッセージのデータを管理するサービス層。

```tsx
type ChatMessage = {
  id: string;
  userId: string;
  createdAt: string;
  content: string;
};

const chatData: ChatMessage[] = [];
const CHAT_MAX_LENGTH = 50;

export function getChatMessages(): readonly ChatMessage[] {
  return chatData.slice();
}

export function addChatMessage(
  message: Omit<ChatMessage, "id" | "createdAt">,
): readonly ChatMessage[] {
  chatData.unshift({
    ...message,
    id: Math.random().toString(36).slice(-8),
    createdAt: new Date().toISOString(),
  });

  if (chatData.length > CHAT_MAX_LENGTH) {
    chatData.length = CHAT_MAX_LENGTH;
  }

  return chatData.slice();
}
```

`ChatMessage` 型の配列をモジュールスコープの変数で保持しておく。

全件取得の関数 `getChatMessages()` は保持している配列のコピーを返す。

メッセージを追加する `addChatMessage()` は `ChatMessage` のプロパティのうち `id` と `createdAt` を除いたデータを受け取り、内部で `id` と `createAt` を計算して配列の先頭にデータを追加する。 `CHAT_MAX_LENGTH` より配列の要素数が大きい場合は切り落とす。その後、配列のコピーを返却する。

そしてクライアントとの接続部分。

```tsx
server.get("/chat", { websocket: true }, connection => {
  connection.socket.on("message", data => {
    const rawData = JSON.parse(data.toString());
    try {
      const message = chatMessageValidator.parse(rawData);

      const newMessages = addChatMessage(message);

      for (const client of server.websocketServer.clients) {
        client.send(JSON.stringify(newMessages));
      }
    } catch (error) {
      console.error(error);
    }
  });

  connection.socket.send(JSON.stringify(getChatMessages()));
});
```

接続が確立されたらまず現在のメッセージ全件を送信する(最終行)。

クライアントからデータが送信されてきたら、zod で作った `chatMessageValidator` でデータチェックして、違反していたらコンソールにエラー表示だけして無視する(良くない)。正しいデータの構造をしていたら、 `addChatMessage()` に渡してメッセージデータとして追加し、最新の配列を全クライアントに通知する。

ちゃんとアカウントがあって個人間やグループ内チャットの場合はクライアントの選別が必要になるが、それはまた今度(？)。

クライアントアプリは引き続き vite で React SPA として作るが、fastify で配信してもらうように @fastify/static を設定しておく。

```bash
npm install @fastify/static
```

```tsx
import fastifyStatic from "@fastify/static";

...

server.register(fastifyStatic, {
  root: path.join(__dirname, "../client/dist"),
});
```

vite でビルドすると `dist` ディレクトリに全部のアセットが吐き出されるので、それを fastify で配信させる。

サーバーアプリケーションは起動しておいてクライアントアプリ開発に入る。

### クライアントサイド

`userId` を新規生成するか既存のものをローカルストレージから取得するカスタムフックを用意する。

```tsx
import { useMemo } from "react";

const localStorageKey = "__chat-app-user-id";

export function useUserId(): string {
  return useMemo(() => {
    const fromStorage = window.localStorage.getItem(localStorageKey);
    if (fromStorage == null) {
      const generated = Math.random().toString(36).slice(-8);
      window.localStorage.setItem(localStorageKey, generated);
      return generated;
    } else {
      return fromStorage;
    }
  }, []);
}
```

`useMemo` に渡す factory 関数の中でローカルストレージにアクセスし、 `userId` が保存されていればそれを返すしなければランダム生成する(したものはローカルストレージに保存する)。カスタムフックを使う側にとってはローカルストレージの存在やランダム生成ロジックを隠蔽されていて、ただ文字列を受け取るだけのシンプルなインターフェイスになってよい。`window` オブジェクトを使っているのでこのまま SSR 環境に持っていくと死ぬけど。

ブラウザ側の WebSocket 通信部分もカスタムフックに隠蔽しよう。次のようなインターフェイスのカスタムフックがあれば、使う側は通信プロトコルを意識することなくチャットメッセージを扱える。

```tsx
type UseChatMessagesReturn = {
  messages: ChatMessage[];
  addMessage: (content: string) => void;
};

function useChatMessages(userId: string): UseChatMessagesReturn;
```

引数の `userId` は先程のカスタムフック `useUserId` で取得したものを渡す想定。戻り値の `messages` はサーバーサイドのメッセージ配列と同期されたリアクティブなステートで、 `addMessage` はメッセージを新規作成する関数。内部実装はこんな感じ。

```tsx
export const useChatMessages = (userId: string): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const webSocketRef = useRef<WebSocket>();

  useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const socket = new WebSocket(`${protocol}://${window.location.host}/chat`);
    webSocketRef.current = socket;

    socket.addEventListener("message", event => {
      setMessages(JSON.parse(event.data));
    });

    return () => socket.close();
  }, []);

  const addMessage = useCallback((content: string) => {
    webSocketRef.current?.send(JSON.stringify({ userId, content }));
  }, []);

  return { messages, addMessage };
};
```

`useState` で `messages` 配列を用意する。 `useEffect` の中で `WebSocket` をインスタンス化して、サーバーと接続する。データの受信イベントで受け取ったデータをパースして `setMessages` に渡す。 `addMessage` では、引数で取った文字列とカスタムフック自体の引数の `userId` をセットでサーバーに送信する。カスタムフックからは `messages` ステートと `addMesage` 関数だけに限定して return することで、内部実装を隠蔽する。

あとは作った 2 つのカスタムフックを使う側とビュー。

```tsx
function App() {
  const userId = useUserId();
  const { addMessage, messages } = useChatMessages(userId);

  return (
    <Layout>
      <LayoutMain>
        <Container>
          <Messages userId={userId} messages={messages} />
        </Container>
      </LayoutMain>
      <LayoutBottom>
        <Container>
          <MessageInputForm onSubmit={addMessage} />
        </Container>
      </LayoutBottom>
    </Layout>
  );
}
```

`userId` の採番や WebSocket 通信をカスタムフックに隠蔽したのでビュー部分は非常にクリーンにできている。 ちなみにスタイリングメソッドには [stitches](https://stitches.dev/) を使ってみているので[コードを参照されたい](https://github.com/y-hiraoka/websocket-chat-app/blob/main/client/src/components/Messages.tsx)。

この状態で vite サーバーを起動すれば、チャットアプリが動作する(開発中は WebSocket 通信が fastify サーバーに振り分けられるように [vite.config.ts](https://github.com/y-hiraoka/websocket-chat-app/blob/main/client/vite.config.ts) を修正しておく)。

### Docker コンテナセットアップ

もうひとつ習得したい知識として、最近話題に上がってた Google Cloud Run を使ってみたいと思っていた。ついでなので、このチャットアプリを Google Cloud Run でデプロイしてみるため、まずは Dockerfile を書く。

サーバーもクライアントも TypeScript で書いており、それぞれでビルドが必要なのでマルチステージビルド構成で書く。最終的なコンテナはひとつで、React アプリを一緒に配信してくれる fastify サーバーを起動する。実際の Web サービスだと、React アプリは Cloud Storage に置いて DNS か何かでルートマッピングするのがいいのかな。

まずはクライアントのビルドフェーズ。

```docker
# STAGE-0 build client
FROM node:16-slim AS client

WORKDIR /usr/src/app

COPY ./client/package*.json ./

RUN npm install

COPY ./client ./

RUN npm run build
```

ステージ名を `client` にしておいて、ホストマシンからファイルをコピーして依存モジュールをインストールしてビルドを実行するだけ。シンプル。

続いてサーバーのビルドフェーズとコンテナ起動コマンド。

```docker
# STAGE-1 build server
FROM node:16.14.2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY tsconfig.json ./

RUN npm run build

COPY --from=client /usr/src/app/dist ./client/dist

EXPOSE 7777
CMD ["node", "dist/main.js"]
```

同じくホストマシンからファイルをコピーして依存をインストールしてからビルドを実行する。その後、 `client` ステージで生成した React アプリもコピーしておく。ビルド後のルートモジュールは `dist/main.js` なので、それを Node.js で起動する。

### Cloud Run のセットアップ

Google Cloud Run のセットアップは、Dockerfile を含む GitHub リポジトリを指定するだけでアプリ化してくれる。めちゃくちゃ便利。

管理画面は日本語で表示されているし日本語ドキュメントも充実しているので、操作に迷うことがなかったため、Cloud Run のセットアップについては特筆することがない。

ということでデプロイされたアプリがこちら。

[https://websocket-chat-app-qffx35euza-an.a.run.app/](https://websocket-chat-app-qffx35euza-an.a.run.app/)

インメモリでデータを持つため、クライアントが接続するコンテナ次第ではデータが共有されないことがあるが、データベースを持つまではしたくないので妥協。

気分次第では上の URL で配信されているサービスを停止するかもしれないので、もしこの記事を読む時にすでに停止されていれば、リポジトリを clone してローカルで Docker を起動して動作を確認していただきたい。

[https://github.com/y-hiraoka/websocket-chat-app](https://github.com/y-hiraoka/websocket-chat-app)

## 所感

WebSocket 使ってチャットアプリを作ってみて感じたことがあって、WebSocket ってそのまま使うものじゃない気がしてる。WebSocket というプロトコルの上にさらにフレームワークが乗っかって色々やってくれるのがいいのかなと。

WebSocket 通信が開始されたあとは、クライアントサイドもサーバーサイドも究極的には `ws.on("message", () => {})` と `ws.send(data)` をするだけになってる。HTTP のように受信したデータを検証して 400 番台を返す、のようなレスポンスステータスの概念もない。

なので、WebSocket 通信の上にデータ検証やデータパースをしてくれるレイヤーを設けて、その上にアプリケーション層を構築するのがいいと思った。GraphQL はその役割を担っている。

## まとめ

WebSocket を勉強するためにチャットアプリを作った。ついでに stitches(CSS in JS) とか Docker とか Cloud Run とか fastify とか一気に調べて使ってみた。

楽しかったです(小学生並みの感想)
