---
title: "React useで非同期処理を簡単に扱う"
createdAt: "2024-09-28T05:32:04.215Z"
tags: ["react"]
---

先日 [続・URLシェアを支える技術 CompressionStream](https://zenn.dev/chot/articles/lz-string-vs-compression-stream) という記事をZennに投稿しました。

この記事のためにlz-stringとCompressionStreamの圧縮率を比較できるサイト(以下比較サイト)をVite+Reactで作りました。

https://stinbox.github.io/lz-string-vs-compression-stream

このサイトでは、入力してもらったテキストをURLに反映して、入力状態をそのままシェアできる機能を実装しています。TypeScript PlaygroundやReact Compiler Playgroundのような感じです。

例えば次のようなURLをシェアすることができます。

[https://stinbox.github.io/lz-string-vs-compression-stream?source=eJx73Nj0uHHV48b5jxvXKxSXZObpJuXkpys8blz3uHnV4-bNj5vWP26a9GJH\_-OmyY8blz9u7H3cuOxxY\_\_jpp7HjfseN04Ha137fs98AIzTLqw](https://stinbox.github.io/lz-string-vs-compression-stream/?source=eJx73Nj0uHHV48b5jxvXKxSXZObpJuXkpys8blz3uHnV4-bNj5vWP26a9GJH_-OmyY8blz9u7H3cuOxxY__jpp7HjfseN04Ha137fs98AIzTLqw)

この機能を実現するに当たって、少し困ったけどReactの`use`で解決できたので、その実装方法を紹介します。

## 問題

ソースコード共有機能を実装するには、サイトが開かれたとき、URLのクエリパラメーターからソースコード部分を取得して、それを解凍してからテキストエディターに渡す必要があります。

URLのソースコード部分の圧縮・解凍には、せっかくなのでlz-stringではなく自作したCompressionStream版の`compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`を使いたいと思いました。しかし、Zennの記事にも書いたように、lz-stringは同期処理なのに対してCompressionStreamは非同期処理です。

Reactは非同期処理した結果をステートとして扱うには、ひと工夫必要なのは周知の事実です。でもこの小さいサイトのためにTanstack QueryとかSWRとか使うのはオーバーキル感があるし、かといって`useEffect`で非同期処理してステートにセットするような原始的なやり方もしたくないなと思いました。

## 解決策

React 19から`use`というAPIが提供されます。これは`Promise`の中身を取り出すかのような使い勝手となっています。

```ts
export function use<T>(usable: Usable<T>): T;
```

これを使えば、余計なライブラリを追加することなく、`useEffect`を使うこともなく非同期処理の結果をコンポーネント内で扱うことができると考えました。

## 実装

Vite react-tsテンプレートのセットアップが完了しているものとします。

執筆時点でReactは18が最新メジャーバージョンなので、RCバージョンをインストールする必要があります。

```sh
npm install react@rc react-dom@rc
```

RC版で追加されるAPIの型定義をTypeScriptに認識させる必要があります。最新バージョンに含まれていないAPIの型定義を読み込むには、`@types/react/canary`をどこかで読み込みます。Viteプロジェクトには`vite-env.d.ts`があるので、そこに相乗りしてしまいます。

```ts
// vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="react/canary" />
```

（[React19アップグレードガイド](https://ja.react.dev/blog/2024/04/25/react-19-upgrade-guide#installing)に従うなら`@types/react`を`types-react@rc`で上書きするらしいが、なぜか上書きできなかった）

これで`use`が`react`パッケージからimportできるようになりました。続いてソースコードを書いていきます。

まず、クエリパラメーターからソースコードを取り出して解凍した結果を受け取るPromiseを作ります。

```tsx
const defaultSource = "..."; // 省略

const defaultSourcePromise = useMemo<Promise<string>>(async () => {
  const searchParams = new URLSearchParams(window.location.search);
  const fromParams = searchParams.get("source");
  if (!fromParams) return defaultSource;
  try {
    return await decompressFromEncodedURIComponent(fromParams);
  } catch {
    return defaultSource;
  }
}, []);
```

SSR(サーバーサイドレンダリング)をしないViteプロジェクトなので、`window`オブジェクトを直接参照しています。Next.jsだとエラーになるので注意してください。

`useMemo`を使っているのは、`Promise`の参照がなるべく変わらないようにするためです。厳密には`useMemo`は参照を固定するために使うものではないのですが、雑に使っています。setterを無視した`useState`でもいいです。というかコンポーネント外の変数でもいいですね。

そして、`use`を使って`Promise`から結果を取り出します。

```tsx
const defaultSource = use(defaultSourcePromise);
```

とても単純ですね。まるで`await`しているかのようなシンプルさです。

ただし`await`とは明確に異なり、`use`を実行するとコンポーネントがサスペンドします。つまり`use`を使っているコンポーネントは`Suspense`でラップされる必要があります。

また、サスペンドすることは要するに一旦アンマウントされるということでもあり、`use`に渡した`Promise`がresolveしたとき関数コンポーネントは再度上から関数として実行されます。これは`defaultSourcePromise`を生成するコンポーネントと`use`で値を取り出すコンポーネントは別にしなければならないことを意味します。

なぜなら、`Promise`オブジェクトに`useMemo`が使われているとしても、アンマウントされてしまえばその値は忘れられて再生成されるからです。`Promise`が作り直しになればそれはまたresolveされていない`Promise`となり、再度サスペンドされることになります。サスペンドすればまた`Promise`が再生成され、、、という無限ループに陥ります。

以上を踏まえると、次のようなコンポーネントのツリー構造になります。

```tsx
const App: React.FC = () => {
  const defaultSourcePromise = useMemo<Promise<string>>(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const fromParams = searchParams.get("source");
    if (!fromParams) return defaultSource;
    try {
      return await decompressFromEncodedURIComponent(fromParams);
    } catch {
      return defaultSource;
    }
  }, []);

  return (
    <Suspense>
      <AppBody defaultSourcePromise={defaultSourcePromise} />
    </Suspense>
  );
};

export const AppBody: React.FC<{
  defaultSourcePromise: Promise<string>;
}> = ({ defaultSourcePromise }) => {
  const defaultSource = use(defaultSourcePromise);

  return <>{/*defaultSource を使ってなんやかんやするコンポーネントたち*/}</>;
};
```

上位のコンポーネントで`Promise`を生成し、下位のコンポーネントにprops経由で渡します。下位のコンポーネントは`use`を使ってpropsで受け取った`Promise`から値を取り出します。上位のコンポーネントは下位のコンポーネントを`Suspense`でラップします。

`Suspense`を忘れると上位の`App`までサスペンドすることになります。まるでtry-catchで捕捉されなかったエラーかのように、親コンポーネントを辿ってサスペンドさせていきます。

上のようなツリー構造にすれば、`AppBody`の中でクエリパラメーターから取り出した解凍済みのソースコード(`defaultSource`)が使えるようになるので、あとはテキストエディターに渡すなりなんなり自由に使えます。

## おわり

React 19から提供される`use`を使うことで、非同期処理の結果をコンポーネント内でシンプルに扱えるようになりました。

ただ、ぶっちゃけアプリケーションレイヤーで直接触るようなAPIではない気もします。ライブラリやフレームワークが内部で非同期処理とReactコンポーネントをつなぐためのAPIかなと推測しています。今回の比較サイトのような小さいサイトで、ちょっとした非同期処理を依存なしで扱う分には簡単でよいと思います。

非同期処理とは別に、`use`にはReact Contextを直接読み込む機能もあります。できることは`useContext`と同じですが、`use`は条件分岐やループの中でも使えるAPIなので、`useContext`よりも使い所が多いでしょう。最早`use`の登場で`useContext`の出番がなくなるまであります。

React 19の正式リリースが待ち遠しいですね。

それではよいReactライフを！
