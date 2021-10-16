---
title: "react-router の型定義が知らない間にきれいになっていたので使い方を再考する"
createdAt: "2021-10-16T07:17:47.890Z"
tags: ["react", "react-router"]
---

# @types/react-router v5.1.9 から型定義がきれいになっていた

`react-router` の型定義は受け取るパスが全て文字列のため、以前は TS コンパイラでパスの間違いを検出できませんでした。

そのため僕は `typed-path-builder` というライブラリを作って次の記事を書きました。

https://zenn.dev/stin/articles/introduce-typed-path-builder

`typed-path-builder` は TypeScript の template literal types を駆使していますが、 @types/react-router v5.1.9 もそれを利用してパスパラメータを推論するように変更が加えられていました。

業務で v4 系を使っていて更新していなかったためこの変更にまったく気づいていませんでした。「いつの間に…！」と思って DefinitedlyTyped のプルリクエストを探してみたら、なんと 2020 年 12 月 28 日 にマージされています。

https://github.com/DefinitelyTyped/DefinitelyTyped/pull/50295

`typed-path-builder` を作る前にすでにマージされています。気づかずに `typed-path-builder` を作っていたのが非常に恥ずかしい…。

そんなことはさておき、強化された型定義を最大限活用して型安全なアプリケーションを構築する書き方を考え直しました。この記事ではそんな話をしようと思います。

## 用語の定義

本記事内だけの用語を予め定義します。

- 抽象パス

  `/foo/:fooId/bar/:barId` のようにパスパラメータが入力される箇所を指定したパス文字列を指します。 `react-router` では `<Route>` の `path` props が一つの例です。

- 具象パス

  `/foo/1234/bar/5678` のようにパスパラメータに具体的な値を指定したあとのパス文字列を指します。 `react-router` では `<Link>` の `to` props (string 型の場合) が一つの例です。

## どのような変更がされているか

template literal types を使って抽象パスからパスパラメータを推論できるようになっていました。
対象は `<Route>` コンポーネントと `generatePath` 関数です。

### `Route`　コンポーネント

```tsx
<Route
  path="/:fooId/:barId"
  render={({ match }) => (
    <div>
      <p>{match.params.fooId}</p>
      <p>{match.params.barId}</p>
      <p>{match.params.bazId}</p> {/* error! */}
    </div>
  )}
/>
```

`<Route>` コンポネントの `path` props に文字列リテラルを渡すと、パスパラメータを推論して `match.params` の型が確定します。

上記では `render` props を例にしていますが、 `children` の render prop でも同様です。 (render prop とは: https://ja.reactjs.org/docs/render-props.html)

### `generatePath`

```ts
const route = generatePath("/:fooId/:barId", {
  fooId: "foo",
  barId: "bar",
  bazId: "baz", // error!
});
```

`generatePath` の第 1 引数に文字列リテラルを渡すと第 2 引数のオブジェクトに渡すべきプロパティの型が確定します。

template literal types を使っているため、文字列リテラルではなく string 型を渡すと当然推論できなくなります。

```ts
let base = "/:fooId/:barId";
const route = generatePath(base, {
  fooId: "foo",
  barId: "bar",
  bazId: "baz", // error …じゃない！
});
```

`<Route>` も同様です。

## どのように使えば安全になるかを考える

型定義がどのように型安全になっているかを把握した上で、使い方を考えていきます。使い方次第では、やりたい放題書いても TS コンパイラが検出してくれないのでルールを作ります。

### 抽象パスは一元管理する

抽象パスからパスパラメータを推論させるためには文字列リテラル型で渡す必要があります。が、 `<Route>` を使用するたびに `path` に文字列を直接入力していたのでは、アプリケーションにとって存在しない抽象パスを指定できてしまいます。

そこで、アプリ全体の抽象パスを一元管理するオブジェクトを用意して、抽象パスを指定する時はこのオブジェクトのプロパティから取り出すことにします。アプリ改修によってルーティングの追加、削除が行われる場合はまずこのオブジェクトを修正することでコンパイルエラーを検出します。

```ts
export const Paths = {
  users: "/users",
  user: "/users/:userId",
  userTweets: "/users/:userId/tweets",
  userTweet: "/users/:userId/tweets/:tweetId",
  settings: "/settings",
} as const;
```

`as const` をつけることで値が書き換えられることがなく、 各プロパティは文字列リテラル型になります。

`<Route>` の `path` を始めとした、抽象パスを指定する箇所では `Paths` オブジェクトから読み取ることをコーディングルールにします。

```tsx
import { Route } from "react-router-dom";
import { Paths } from "./path/to/constant";

<Route
  path={Paths.userTweet}
  render={({ match }) => (
    <div>
      <p>{match.params.userId}</p>
      <p>{match.params.tweetId}</p>
    </div>
  )}
/>;
```

### 具象パス指定には必ず `generatePath` を使う

`<Link>` コンポーネントの `to` などは以下のように型推論をさせる方法がないため、依然として string 型を全て受け付けてしまいます。

```ts
type LinkProps = {
  to: `/foo/${string}/bar/${string}`; // このように推論させることはできない
};
```

`to` が受け付ける型の制約を強くすることはできないので、値の渡し方に決まりを設けます。 型定義のアップデートで改良された `generatePath` を使うことです。

```tsx
import { generatePath } from "react-router-dom";
import { Paths } from "./path/to/constant";

<Link to={generatePath(Paths.userTweets, { userId: "stin_factory" })}>
  go to user tweet list
</Link>;
```

`Paths` から文字列リテラル型の抽象パスを取り出して `generatePath` と組み合わせることで具象パスを指定します。

`history` のメソッドにわたす具象パスも同様ですね。

```ts
import { useHistory, generatePath } from "react-router-dom";
import { Paths } from "./path/to/constant";

const history = useHistory();

history.push(generatePath(Paths.user, { userId: "stin_factory" }));
history.replace(generatePath(Paths.userTweets, { userId: "stin_factory" }));
```

このように記述するようにしておけば、抽象パスの修正によってコンパイルエラーを吐き出させることが可能です。

### `useParams` について

v5.1.9 以降も `useParams` の型定義はアップデートされていません。つまり、相変わらず使用者が自分で型を指定することになります。

```ts
const { fooId } = useParams<{ fooId: string }>(); // fooId 本当に取り出せる？？？
```

これではせっかく抽象パスを一元管理するようにしたのに、存在しないパスを指定できてしまいます。

`useParams` についての僕の考えは「使わない」です。

そもそも `useParams` は `<Route path="foo/:fooId">` が祖先コンポーネントにいる場合に初めて `fooId` パラメータを取得できるようになります。
しかしそれはしばしば React 界隈で話題になる「親と子の密結合問題」そのままではないでしょうか？

- 子は親が `<Route>` の中に自分をレンダリングしてくれることを知っているから `useParams` を使用できる
- 親は子が `useParams` を使うことを知っているから `<Route>` で囲ってやる必要がある

パスパラメータは高頻度で使用する値のため、そこら中でこの問題が起こることになります。それはあまり嬉しくないかもしれません。

そこで `useParams` は使わずに props 経由でパスパラメータで受け取ることをルールにします。

```tsx
type Props = {
  userId: string;
  tweetId: string;
};

const TweetView: VFC<Props> = ({ userId, tweetId }) => {
  const { data } = useSWR(
    [userId, tweetId],
    (userId, tweetId) => `Tweet: ${userId} ${tweetId}`,
  );

  return <p>{data}</p>;
};
```

こうすることで、子は `<Route>` の中でしか使えないという親依存から開放されます。
また、子の `Props` は親に対してパスパラメータを渡すことを義務付けており、必ず値を取得することができます。

親側では、 `<Route>` の `render` がパスパラメータの型推論されているため、 render prop パターンを用いて型安全にパスパラメータを子に引き継ぎます。

```tsx
const Parent: VFC = () => {
  return (
    <Route
      path={Paths.userTweet}
      render={({ match }) => (
        <TweetView userId={match.params.userId} tweetId={match.params.tweetId} />
      )}
    />
  );
};
```

このように親子を構成すれば `useParams` は不要になり、親子の依存は `Props` インターフェイスで義務付けられた部分のみ、 型の安全性も担保されている状態にできます。

## まとめ

この記事では強化された `react-router` の型定義を最大限活用する React アプリケーションの作り方を考えてきました。

抽象パスはオブジェクトで一元管理、具象パスは必ず `generatePath` で生成、 `useParams` は使用しないのが自分の中のルールになっています。

これらのコーディングルール自体に違反した場合は(eslint-rules でも作らない限り)当然ながら型安全性は失われてしまいます。
コーディングルールではなくすべて TS コンパイラで検出したんだという場合はルーティングライブラリを乗り換えるしかないでしょう。 ([Rocon](https://rocon.uhyohyo.net/) 等)

僕自身は @types/react-router の更新でかなり開発者体験がよくなったと感じています。

それではまた！
