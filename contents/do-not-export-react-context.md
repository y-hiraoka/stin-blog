---
title: "React Context を export するのはアンチパターンではないかと考える"
createdAt: "2021-02-21T12:14:46.525Z"
tags: ["react"]
---

# Context を export するな

みなさんは React Context を使っていますか？非常に便利ですよね。
え、使ってない？みんな React Context 使っとる。使ってへんのお前だけ。

冗談はさておき、この記事では Context を export するなという内容をお話しします。

## React Context とは

その前に React Context についてざっと解説していきます。

Context は、コンポーネントをまたいだ値の共有を実現するためのオブジェクトです。
`createContext` で生成することができます。

```tsx
import { createContext } from "react";

const context = createContext<string>("initial value");
```

使い方は、まず `context.Provider` の `value` に共有したい値を渡します。 `Provider` というだけあって値を配信する役割を持ちます。

```tsx
const StringProvider: React.FC = ({ children }) => {
  return <context.Provider value="another value">{children}</context.Provider>;
};
```

値を配信する側がいれば、値を購読する側もいるということですね。購読する側は `useContext` というフック関数を使用します。 ( `context.Consumer` という方法もありますが、日本書紀に載っている古い書き方なので割愛。 )

```tsx
import { useContext } from "react";

const StringConsumer: React.VFC = () => {
  const stringValue = useContext(context);

  return <span>{stringValue}</span>;
};
```

配信コンポーネントと購読コンポーネントの位置関係が大切で、購読コンポーネントは配信コンポーネントの配下に存在する必要があります。

```tsx
export default function App() {
  return (
    <StringProvider>
      <StringConsumer /> {/* another value と表示される */}
    </StringProvider>
  );
}
```

購読コンポーネントが配信コンポーネントの配下にいればいいので、間に無関係のコンポーネントがいくつ挟まっていても値を取得することができます。

購読コンポーネントの上位層に配信コンポーネントが複数存在する場合は、最も近い配信コンポーネントが配信する値を取得します。

配信コンポーネントを配置していない場合、 `createContext` に渡された初期値 (ここでは `"initial value"`) を取得します。

`Provider` の `value` に渡す値を `useState` 等で生成すれば、購読コンポーネントの値を配信コンポーネントが制御することができます。

## よくある使用例

React でグローバルステートを宣言する最もシンプルな方法として使用されます。

ログイン中のユーザーの情報をアプリ全体で共有したり、選択されたテーマカラーを共有してアプリ全体の配色を一元管理したり、などです。

例えばログインユーザー情報共有の実装は以下のようになります。

```tsx
type User = { id: string; name: string };

const userContext = createContext<User | null>(null);

const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then(user => setUser(user));
  }, []);

  return <userContext.Provider value={user}>{children}</userContext.Provider>;
};

const UserInfo: React.VFC = () => {
  const user = useContext(userContext);

  if (user === null) return <div>Loading...</div>;

  return (
    <div>
      <div>id: {user.id}</div>
      <div>name: {user.name}</div>
    </div>
  );
};

export default function App() {
  return (
    <UserProvider>
      <UserInfo />
    </UserProvider>
  );
}
```

## 他のモジュールからも参照したくなる

ユーザー情報は当然アプリ全体で同じ値を参照します。Web アプリがひとつのソースファイルで完結するはずもないので、何かしらを `export` することになりますね。

真っ先に思いつくのが Context オブジェクトを `export` することです:

```tsx
export const userContext = createContext<User | null>(null);
```

このオブジェクトを他のモジュールに `import` することで、ユーザー情報を参照することができるようになります:

```tsx
import { userContext } from "./user";

const Greeting: React.VFC = () => {
  const user = useContext(userContext);
  return <p>こんにちは、{user.name}さん</p>;
};
```

しかしこれは悪手と言えるでしょう。

## 手段と目的を履き違えている

Context はコンポーネントをまたいだ値の共有を実現するための手段です。一方、購読側コンポーネントが欲しいのは値そのものです。「ドリルを買いに来た客が求めているのはドリルではなく穴である」ということですね。

購読側コンポーネントが `userContext` と `useContext` を `import` して、両者を組み合わせて初めてユーザー情報が参照できるのはあまりに不親切ではないでしょうか。

さらにもうひとつ、直前に購読側の例で挙げた `Greeting` コンポーネントは実は正常に機能しません。なぜなら `userContext` で共有される値は `null` になり得るからです。
購読側コンポーネントは「なぜ `null` になるか」を考えないといけません。未ログインなのか、取得中なのか、エラーでコケているのか。購読する側がこういった可能性を考えることを強いられてしまうと、そのコンポーネント自身の責務に集中することができませんし、そこらじゅうにハンドリングを書く必要がありコードが無駄に肥大化します。

## カスタムフックに隠蔽しよう

購読側コンポーネントからすると、下のようなインターフェイスをしたカスタムフックがあると非常に扱いやすいはずです。

```tsx
function useLoginUser(): User;
```

呼び出せばログイン中のユーザーオブジェクトが `null` や `undefined` になることなく取得できるとわかるインターフェイスですね。

`userContext` や `useContext` は手段でしかないので、これらを `useLoginUser` の中に隠蔽してしまいましょう。しかしユーザー情報取得中は `null` になることは間違いありません。どうやってその可能性を取り除けばいいでしょうか。

`Provider` でハンドリングすればいいのです。

```tsx
const UserProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then(user => setUser(user));
  }, []);

  if (user === null) return <div>Loading...</div>; // <- 取得中は children をマウントさせない

  return <userContext.Provider value={user}>{children}</userContext.Provider>;
};
```

このようにすれば、 `userContext.Provider` に `null` が渡ることはありません。 `UserProvider` 配下で `useContext(userContext)` を実行すると必ず値が取得できます。

逆に言えば、`useContext(userContext)` で `null` が取得されてしまうのは、 `UserProvider` で括られていない位置で実行しようとしているからです。

よって `UserProvider` の外で `useContext(userContext)` を実行されるのは例外とみなすことができるでしょう。

これらを踏まえると `useLoginUser` は以下のような実装になります。

```tsx
export function useLoginUser(): User {
  const user = useContext(userContext);

  if (user === null) throw new Error("UserProvider でラップしてください。");

  return user;
}
```

`user === null` の場合は例外とみなすわけなので、エラーをスローしてしまいます。こうすることで、関数インターフェイスとしては NonNullable なユーザーオブジェクトの取得が可能になるわけです。

そして `userContext` の代わりに `useLoginUser` を `export` します。購読側からは、 `userContext` という配信側の意図がわからない物体の存在が見えないため、迷うことなく `useLoginUser` フックを `import` できるでしょう。また、関数インターフェイス的にも `null` にならないため、取得した値を自身の責務を果たすために素直に使用することができます。

### ただ値を渡すだけだとしてもカスタムフックにすべき

ユーザー情報のように `null` の可能性を排除するなどのロジックが必要ないとしてもカスタムフックにすべきです。

```tsx
const context = createContext<"light" | "dark">("light");

export function useTheme() {
  return useContext(context);
}
```

記述が増えるだけに感じるかもしれませんが、 `context` や `useContext` といった無機質な名前ではなく、 `useTheme` という意味の込められた関数名をつけることが大切です。

## まとめ

React Context を export するなという話をしてきました。

代わりに Context と `useContext` を内部で使用したカスタムフックを作成してそれを export しましょう。
Context value を使用する際に最低限必要なロジックもそのカスタムフックに詰め込むことで購読側コンポーネントに責務を逸脱したロジックを実装させることを避けることができます。

この記事がみなさんの React 設計の足掛かりになれば幸いです。
