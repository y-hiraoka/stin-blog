---
title: "Immutable.js で React ステートのモデルクラスを作る"
createdAt: "2021-10-09T02:13:44.134Z"
tags: ["react", "immutable-js"]
---

# Immutable.js で React ステート用モデルクラスを作る

昨今の React は関数コンポーネント一辺倒になり、 React エンジニアがクラス定義する場面はかなり減ってきているんじゃないかと思います。
関数コンポーネント内部で取り回されるステートもクラスインスタンスではなくプレーンなオブジェクトで、それを immer を用いてミュータブル感覚で更新していくのが主流(私調べ)だと思います。

そんな中ワケあって Immutable.js を触っていたのですが、 Immutable.js の `Record` をベースにしてモデルクラスを作成し、そのインスタンスを React ステートに持つと開発体験が割といいことを知りました。また、この記事を執筆している前日 2021/10/08 に Immutable.js v4 がリリースされて `Record` の型定義が強化されたことで、 TypeScript ユーザーにとってはよりこの手法が書きやすくなりました。

この記事ではそんなことを書いていこうと思います。

## 実装例

### モデルとなる対象を考える

ありきたりなサンプルになりますが、「ファーストネーム」と「ラストネーム」を入力してもらうフォームを考えます。つまりモデルクラスが持つべきプロパティは `string` 型の値を２つですね。

また、名前の入力は必須なのでバリデーションがほしいところでしょうか。

ファーストネームとラストネームを空白を挟んで結合したフルネームを一発で取得するような機能も欲しくなるかもしれません。

### モデルのベースを生成する

`Record` にはモデルクラスで管理したいプロパティ名とその初期値をセットにしたオブジェクトを渡します。

```ts
import { Record } from "immutable";

const ModelBase = Record({ firstName: "", lastName: "" });
```

ここで作成した `ModelBase` はすでにひとつの `Record` クラスになっています。ですのでこのインスタンスを生成することができます。

```ts
const value = new ModelBase();
```

値を取り出したりセットしたりができますが、最初に指定したプロパティ名 (ここでは `firstName`, `lastName`) 以外は指定することができないようになっています。

```ts
value.get("firstName"); // OK
value.set("lastName", "hiraoka"); // OK
value.set("familyName", "hiraoka"); // compile error!
```

(`compile error!` と書きましたが、 v3 ではコンパイラに検知されません。)

名前の通りイミュータブルなデータ構造を提供するライブラリのため、 `value.set` は破壊的変更をインスタンスに加えるのではなく、セットした結果の新しいインスタンスを生成して返します。

```ts
const value = new ModelBase({ lastName: "stin" });
const value2 = value.set("lastName", "hiraoka");

console.log(value.get("lastName")); // "stin"
console.log(value2.get("lastName")); // "hiraoka"
console.log(value === value2); // false
```

### 独自のロジックを載せたクラスを作成

そんな Record の性質を持った `ModelBase` は、そのままではただのレコードクラスですが、これを継承してクラス定義することで独自のロジックを追加することができます。

```ts
class NameFormModel extends ModelBase { ... }
```

例えばセッターメソッド。

```ts
class NameFormModel extends ModelBase {
  setFirstName(value: string) {
    return this.set("firstName", value);
  }
  setLastName(value: string) {
    return this.set("lastName", value);
  }
}
```

例えば computed property。

```ts
class NameFormModel extends ModelBase {
  get fullName() {
    return this.firstName + " " + this.lastName;
  }
  get hasError() {
    return this.firstName === "" || this.lastName === "";
  }
}
```

(v4 から `instance.firstName` でアクセスできます。 v3 は TS コンパイラが怒ってくるので `instance.get("firstName")` を使います。が、 `.get` の戻り値の型は `any` なのだ…。)

例えば static メソッド。

```ts
class NameFormModel extends ModelBase {
  static createWithInitialValue(firstName: string, lastName: string) {
    return new NameFormModel({ firstName, lastName });
  }
}
```

これらの例のようにロジックをモデルクラスに閉じ込めることが可能になり、ビューにロジックが漏れ出すことなくきれいに保つことができるはずです。(理想)

### ビュー層で使ってみる

ビューでの使い方は次のようになります。

```tsx
type Props = {
  firstName: string;
  lastName: string;
};

const NameForm: React.VFC<Props> = ({ firstName, lastName }) => {
  const [model, setModel] = useState(
    NameFormModel.createWithInitialValue(firstName, lastName),
  );

  return (
    <form>
      <label>
        <div>first name</div>
        <input
          name="firstName"
          value={model.firstName}
          onChange={e => setModel(prev => prev.setFirstName(e.target.value))}
        />
      </label>
      <label>
        <div>last name</div>
        <input
          name="lastName"
          value={model.lastName}
          onChange={e => setModel(prev => prev.setLastName(e.target.value))}
        />
      </label>
      <div>Your full name is {model.fullName}</div>
      {model.hasError && <p style={{ color: "red" }}>あんたちゃんと入力しぃや</p>}
    </form>
  );
};
```

static メソッドで生成した初期値を `useState` に渡して戻り値を `model`, `setModel` として保持します。

`<input>` には `model.firstName` をバインドして `onChange` イベントで `setFirstName` を実行します。`setFirmstName` は新しいインスタンスを返すメソッドなので、それを `setModel` に放り込むことでステート更新を行います。 last name も同様ですね。

管理すべきステートも普通なら `firstName` と `lastName` 2 つありそうなところが `model` ただひとつになり、スマートになりました。

## 余談

Facebook が開発しているエディターライブラリ Draft.js はこの手法で `ContentState` や `ContentBlock` などのモデルクラスを実装しています。

実は僕自身が半年ほどずっと Draft.js につきっきりだったのですが、モデルクラスの設計についてはあまり関心を持っていませんでした。最近になって試しに真似してみたところ、複雑なオブジェクトをいろんなロジックで扱う場合にコードが散らからなくていいなと感じていました。

ただ Draft.js が依存している Immutable.js は (2021/10/09 現在) v3.7.4 で、`Iterable.map` などの型定義に明らかな間違いが混ざっています。また先述の通り、 `Record` もジェネリクスになっておらず `.get` 等のメソッドは全て `any` を叩きつけてきます。

一日でも早く Draft.js の依存をアップデートして v4 にしてほしいのですが、 Draft.js リポジトリのコミットが停滞しているように見えます…。どうなることでしょうか…。

## まとめ

Immutable.js の `Record` を使用してモデルクラスを作成することでロジックの分離を実現できるという話をしました。
Facebook 開発の Draft.js 内部でも利用されている手法なので、設計手法として検討する価値はあるかと思います。

ちなみに、真面目にフォームを丁寧かつ迅速に作成するなら react-hook-form のようなライブラリを使います…。

それではまた！
