---
title: "React でキーボードショートカットを設定するためのカスタムフックを実装する"
createdAt: "2022-06-19T07:40:51.568Z"
tags: ["react"]
---

以前、『ポケットモンスターダイヤモンド・パール』の BGM をループ再生できる Web サイトを作成しました。

https://dp-soundlibrary.stin.ink/

この Web サイトの実装については過去に Zenn に投稿しているのでそちらも御覧ください。

https://zenn.dev/stin/articles/about-dp-soundlibrary

自分が一番のヘビーユーザーなのですが、YouTube や Spotify のようにスペースキーで再生・停止ができないのが不便だと感じていました。不便と感じつつ放置していたのですが、重い腰を上げてやっとキーボードショートカット機能を実装しました。

キーと操作の対応は次の通りです。

| キー                | 操作         |
| ------------------- | ------------ |
| `space`             | 再生・停止   |
| `alt(option)` + `→` | 次の曲を再生 |
| `alt(option)` + `←` | 前の曲を再生 |
| `alt(option)` + `↑` | 音量を上げる |
| `alt(option)` + `↓` | 音量を下げる |

この機能を実装するに当たり、React で keybind を簡単に実装する汎用カスタムフックがあると便利だと思って考えてみました。本記事はそのカスタムフックの実装方法を紹介します。

## インターフェイス

まずはカスタムフックのインターフェイスから検討します。

どのキーが入力されたらどんな処理を行うかを受け取ればいいですね。また、修飾キーが押されている必要があるかどうかも受け取りたいです。ということでこんな感じにしてみます。

```tsx
type KeybindProps = {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  key: KeyboardEvent["key"];
  onKeyDown?: (event: KeyboardEvent) => void;
  targetRef?: RefObject<HTMLElement>;
};

function useKeybind(props: KeybindProps): void;
```

修飾キーの要不要を指定は、 `altKey`, `ctrlKey`, `metaKey`, `shiftKey` に対して `boolean` 値を渡すことで制御します。

`key` でメインのキーを指定してもらいます。型を `KeyboardEvent["key"]` と書いていますがその実ただの `string` です。が、 `KeyboardEvent.key` と比較される値なんだなということが伝わると思い、あえてこのように書いています。

`targetRef` については実装の節に説明します。

戻り値は `void` です。何かを計算して返却する関数ではなく、 keybinding を設定する副作用を発生させるタイプの関数なので `void` にしています。

このインターフェイスにしておけば、コンポーネントにするのも簡単です。

```tsx
export const Keybind: FC<KeybindProps> = (props) => {
  useKeybind(props);
  return null;
};
```

コンポーネントを用意するメリットは、条件分岐で付け外しが簡単にできることです。カスタムフックは条件分岐で実行するしないを制御できないので、コンポーネントにする意味はあります。

```tsx
export const App:FC = () => {
  // これはやっちゃダメ
  if(condition) {
    useKeybind({...});
  }

  return (
    <>
      {/* これはやっていい */}
      {condition && <Keybind {...} />}
      <SomeComponent />
    </>
  );
}
```

## 実装

まず、 `useLatest` を用意しておきます。

```tsx
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
```

これは常に最新の値を保持しておくのに使います。今回は `onKeyDown` の最新版を参照するために使用します。コールバック関数を受け取るカスタムフックやコンポーネント内部の `useEffect` で受け取ったコールバック関数を使用する場合、参照の変化に注意する必要があります。

カスタムフックを使う側で `useKeybind({ onKeyDown: () => {} })` のように毎回異なる関数が渡される場合、そのまま `useEffect` の依存配列に入れるとレンダリングの度に effect が発火されてしまいます。かと言って、使う側で `useCallback` してもらうのをルールにするのは内部実装に依存してもらうことになりナンセンスです。代わりに `useKeybind` が `onKeyDown` の依存配列を受け取るようにすることも考えられますが、インターフェイスが煩雑になるし依存配列の渡し漏れを eslint-plugin-react-hooks で検出できなくなります(プラグインのオプションで依存配列渡し漏れを検出するカスタムフックを追加できますが、インターフェイスを `useEffect` 等に合わせる必要があるのと、[あまりそのオプションを使うべきではないということが言及されています](https://github.com/facebook/react/tree/0f216ae31d91f882134707af99d5da9c01e1f603/packages/eslint-plugin-react-hooks#advanced-configuration))。

こんなときに、コールバック関数の最新を参照しつつ、 `useEffect` の依存配列には渡さなくても問題ない方法として `useRef` を使った `useLatest` が便利です。 `useRef` の戻り値は常に同じオブジェクトなので、依存配列に含めても `useEffect` の発火要因にはなりません。同じオブジェクトでも、その `.current` プロパティはレンダリング毎に最新の値に書き換えられるので、 `useEffect` 内で最新のものを取得できます。

ちなみに、新しい React Hooks として検討されている `useEvent` がこれを解消してくれそうです。多分。

---

本題の `useKeybind` では実質 DOM に対して `keyDown` イベントをアタッチする `useEffect` を用意するだけですね。

```tsx
export function useKeybind({
  altKey,
  ctrlKey,
  metaKey,
  shiftKey,
  key,
  onKeyDown,
  targetRef,
}: KeybindProps) {
  const onKeyDownLatest = useLatest(onKeyDown);

  useEffect(() => {
    const eventListener = (event: KeyboardEvent) => {
      if (altKey && !event.altKey) return;
      if (ctrlKey && !event.ctrlKey) return;
      if (metaKey && !event.metaKey) return;
      if (shiftKey && !event.shiftKey) return;
      if (event.key !== key) return;

      event.preventDefault();
      onKeyDownLatest.current?.(event);
    };

    if (targetRef?.current) {
      const target = targetRef.current;

      target.addEventListener("keydown", eventListener);
      return () => target.removeEventListener("keydown", eventListener);
    } else {
      window.addEventListener("keydown", eventListener);
      return () => window.removeEventListener("keydown", eventListener);
    }
  }, [altKey, ctrlKey, key, metaKey, onKeyDownLatest, shiftKey, targetRef]);
}
```

alt キー(Mac では option キー)や ctrl キーが一緒に押下されているかどうかは `event.altKey` などで判定できます。メインキーは `event.key` で取得できるので、それを引数の `key` と突き合わせて、満たしていなければそこで `eventListener` の 処理は終了です。

修飾キーも含めて指定したキーが押下されていれば、 `event.preventDefault()` でブラウザ標準動作を停止します。そして対応する処理が格納された `onKeyDownLatest.current` を関数実行します(`onKeyDown` をオプショナルにしているので、オプショナルチェーン記法で `undefined` の場合を避けています)。

`HTMLElement` が格納されている `targetRef` が引数で渡されている場合、その DOM にイベントをアタッチします。 `targetRef` が渡されていない、または渡されていても `.current` に要素が格納されていない場合は `window` オブジェクトに直接アタッチします。どちらのケースでも、 `removeEventListener` によるクリーンアップを忘れないようにしましょう。 `useEffect` は何回実行されても問題ない**冪等性**が求められます。

## 使い方

コンポーネント内でキーと関数を渡すだけです。

```tsx
const App: FC = () => {
  useKeybind({
    key: "f",
    shiftKey: true,
    onKeyDown: () => console.log("Foo!!"),
  });

  useKeybind({
    key: "b",
    altKey: true,
    onKeyDown: () => console.log("Bar!!"),
  });

  return <>...</>;
};
```

Shift + f を押せばコンソールに `"Foo!!"` と表示され、 Alt(Option) + b を押せばコンソールに `"Bar!!"` と表示されるようになるでしょう。

https://dp-soundlibrary.stin.ink のソースコードでは次の箇所で使用しています。

https://github.com/y-hiraoka/dp-soundlibrary/blob/9e6efb15e0528513c093f9b3474b0d5cb7a6c5b5/src/components/AudioController.tsx#L57-L70

## まとめ

React でキーボードショートカットを実装するためのカスタムフックを作成する手順を紹介しました。

キーボードメインで Web を操作するユーザーにとってキーボードショートカットの存在は非常にありがたいので積極的に実装していきたいですね。僕はトラックパッドを使いますが。

この記事が誰かの参考になれば幸いです。

それではよい React ライフを！
