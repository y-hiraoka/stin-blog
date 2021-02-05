---
title: "Fragment をコンポーネントのトップに置くのはアンチパターンではないかと考える"
createdAt: "2021-02-05T12:46:41.234Z"
tags: ["react"]
---

# Fragment をコンポーネントのトップに置くな

「Fragment をコンポーネントにトップに置く」というのは下のようなコンポーネントを作成することを指します。

```tsx
export const MyComponent = () => {
  return (
    <>
      <h1>This is a sample code.</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
        irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </p>
    </>
  );
};
```

これは、この `MyComponent` が生成する HTML 要素が `h1` と `p` のふたつあるということを意味します。
この書き方がアンチパターンではないかということを感じていたので言語化したいと思います。

## 親コンポーネントは子コンポーネントが何を表示するかを知るべきではない

一言で言えばこれに尽きます。

例えば下のような 2 つのコンポーネントがあるとします。 (CSS Modules でスタイリングされていると読んでください)

```tsx
import styles from "./userListStyles.module.css";

export const UserItem = ({ user }) => {
  return (
    <li className={styles.user}>
      <div className={styles.userId}>{user.id}</div>
      <div className={styles.userName}>{user.name}</div>
      <div className={styles.userDescription}>{user.description}</div>
    <li>
  )
}
```

```tsx
import styles from "./userListStyles.module.css";

export const UserList = ({ users }) => {
  return (
    <ul className={styles.list}>
      {users.map(user => (
        <UserItem key={user.id} user={user}>
      ))}
    </ul>
  );
};
```

`ul` の中に `users.length` の数だけ `li` が描画されるため、 HTML の意味としては間違っていません。

ここでは同じ `userListStyles.module.css` で CSS が当てられていますね。つまり `UserItem` は `UserList` 専用のコンポーネントのつもりで作成されたと考えられます。

`UserList` は `UserItem` が トップレベルに `li` を持つことを知っているから、それを自分の `ul` の中に配置することができるわけです。

では `UserItem` コンポーネントを単体で他の `div` の中で使用したくなったらどうでしょうか。
そのまま `UserItem` を流用すれば、`<div><li /></div>` という HTML のセマンティクスに違反するコンポーネントが出来上がってしまいます。

`UserItem` を修正してトップレベルを `div` にしたとしても、 既存のコードが `<ul><div /></ul>` という形になり、やはり HTML のセマンティクスを破壊します。

`UserList` と `UserItem` を共に `div` にしちゃえばいいでしょうか？それだと「ユーザーが **リストアップ** されている」という情報が HTML から消え去ってしまいます。(気にしない人もいるかも知れない)

そもそも HTML において `ul` と `li` はセットで一つのリストを表示する責務を果たします。責務の観点からすると、これらの Element は分離されるべきではないのではないでしょうか？

つまり、上記の 2 つのコンポーネントはかくあるべきだと。

```tsx
import styles from "./userInfoStyles.module.css";

export const UserInfo = ({ user }) => {
  return (
    <div className={styles.user}>
      <div className={styles.userId}>{user.id}</div>
      <div className={styles.userName}>{user.name}</div>
      <div className={styles.userDescription}>{user.description}</div>
    <div>
  )
}
```

```tsx
import styles from "./userListStyles.module.css";

export const UserList = ({ users }) => {
  return (
    <ul className={styles.list}>
      {users.map(user => (
        <li key={user.id}>
          <UserItem user={user}>
        </li>
      ))}
    </ul>
  );
};
```

1 つ目のコンポーネントの名前が `UserItem` から `UserInfo` になりました。コンポーネント名 (に加えて TypeScript なら型定義) から、 ユーザー情報を渡せばいい感じに表示してくれて、かつどこでも使えるだろうと推測できます。
CSS も `UserList` とは別のファイルを参照することで、独立しているのがわかります。

2 つ目のコンポーネントでは、内部で `ul` と `li` を同時に使用しています。 `UserInfo` を `li` でラップすることで、 HTML のセマンティクスを保ちつつ、 ユーザー情報の表示を共通化しています。

こうすることで、 `UserInfo` コンポーネントはユーザー情報を表示する責務、 `UserList` は `UserInfo` をリストアップする責務、というように責務を一つずつ持つことができます。

親コンポーネントが「子コンポーネントが何の HTML 要素を表示するか」を知っているということは、一つの責務が複数のコンポーネントにまたがっている状態と言えるでしょう。

ちなみに、ここまでで僕が言わんとしていることは TypeScript コミッターで有名な [uhyo さん](https://twitter.com/uhyo_) が下記のブログ記事で詳細に解説してくださっているため、僕の文章が下手すぎて伝わらなかった場合は当該記事を参照してください。

https://blog.uhy.ooo/entry/2020-10-15/react-paired-css/

## 本題の場合も、親が「子が Fragment を返すこと」を知っている可能性が高い

ここから本題に入ります。

下記のような Web アプリ全体をグリッド表示するためのコンポーネントをイメージしてください。

```tsx
import Logo from "components/Logo";
import Header from "components/Header";
import SideMenu from "components/SideMenu";
import Contents from "components/Contents";

export const GridItems = () => {
  return (
    <>
      <Logo />
      <Header />
      <SideMenu />
      <Contents />
    </>
  );
};
```

```tsx
export const GridContainer = () => {
  return (
    <div style={{ display: "grid", gridTemplate: "auto 1fr / auto 1fr" }}>
      <GirdItems />
    </div>
  );
};
```

`GridContainer` ではインラインスタイルによって 2 \* 2 のグリッド表示を構成しています。

`GridItems` は `GridContainer` が 2 \* 2 であるため、4 つの要素を `Fragment` で括って返しています。

この時点で既に親子間に依存が発生しているのがわかります。

子である `GridItems` は、親が `GridContainer` であり 2 \* 2 の grid で待ち受けているから 4 つの要素を返しています。

親である `GridContainer` は、子の `GridItems` が Fragment によって 4 つの要素を返すことを知っているから grid 表示ができるのです。

グリッド表示される要素の数をお互いに知っていなければこのようなコンポーネントは出来上がりません。
グリッド表示するというひとつの責務が、複数のコンポーネントにわけられてしまっています。(サンプルが極端な例であることは否めませんが…。)

`GridItems` のレンダリングの結果、 HTML 要素が間違いなく 4 つならば正しく表示されるでしょう。
ただ、 `Fragment` をコンポーネントトップに置くことが常態化している場合、HTML 要素がちょうど 4 つであることを保証することに非常に労力をかけなければなりません。

なぜなら `Logo`, `Header`, `SiteMenu`, `Contents` たちもまた、それぞれのトップに `Fragment` を持っている可能性が出てくるからです。
それらが `Fragment` をトップにもっていたら、 `GridItems` の見かけ上は 4 つの要素を返しているように見えるのに、実際の HTML の要素がちょうど 4 つではなくなります。

上記のコンポーネントはこのようにあるべきでしょう。

```tsx
import Logo from "components/Logo";
import Header from "components/Header";
import SideMenu from "components/SideMenu";
import Contents from "components/Contents";

export const GridContainer = () => {
  return (
    <div style={{ display: "grid", gridTemplate: "auto 1fr / auto 1fr" }}>
      <div>
        <Logo />
      </div>
      <div>
        <Header />
      </div>
      <div>
        <SideMenu />
      </div>
      <div>
        <Contents />
      </div>
    </div>
  );
};
```

`GridItems` というコンポーネントは闇に葬りました。そして `GridContainer` に 4 つの `div` を設けて `Logo` や `Header` などを入れています。
この構成ならば、仮に `SiteMenu` が複数の HTML 要素を生成したとしてもグリッド表示が崩れることはなく、 `GridContainer` の「グリッド表示」という責務を果たすことができます。

またグリッドのセルの数が減って `Logo` を表示する必要がなくなった場合でも、下記のように修正すれば対応できます。

```tsx
import Header from "components/Header";
import SideMenu from "components/SideMenu";
import Contents from "components/Contents";

export const GridContainer = () => {
  return (
    <div style={{ display: "grid", gridTemplate: "auto 1fr / auto 1fr" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <Header />
      </div>
      <div>
        <SideMenu />
      </div>
      <div>
        <Contents />
      </div>
    </div>
  );
};
```

このように考えていくと、各コンポーネントのトップには Fragment を置くべきではないと感じられるのではないでしょうか。

## Fragment をトップに置いていい場合は？

例えばモーダルを表示する場合なんかが考えられます。

```tsx
import { useState } from "react";
import Modal from "components/Modal";

export const MyComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        <p>ボタンを押して削除します</p>
        <button onClick={() => setOpen(true)}>削除ボタン</button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <DeleteConfirm />
      </Modal>
    </>
  );
};
```

React でモーダル画面を作成する場合は [react-modal](https://github.com/reactjs/react-modal) などのライブラリを使用していることが多いでしょう。
正しく作られたライブラリならば、モーダルは通常別の場所 (`<body>` の直下など) にレンダリングされるようになっています。

ですので、上記の `MyComponent` が実際に生成する HTML は `div` 一つだけになることがわかります。

## まとめ

この記事では `Fragment` がコンポーネントのトップに置くのはアンチパターンではないかということを考察してきました。

この記事を書いたきっかけは、先日 Qiita で「余分な `div` を除いて Fragment に書き換えるのが上級者だ」的な記事でトップにあった `<div>` を `<>` に書き換えるのを見かけて考えていたことです。
コンポーネントの責務が何であるかを考えて設計すれば、トップに Fragment を置く機会はかなり少なくなるかと思います。

この記事がみなさんのコンポーネント設計の足掛かりになれば幸いです。
