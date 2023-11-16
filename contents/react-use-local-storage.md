---
title: "localStorage に同期する React State を作るカスタムフック"
createdAt: "2023-05-27T15:28:41.103Z"
tags: ["react"]
---

React の `useState` と似た使い方で localStorage に保存されるカスタムフック `useLocalStorage` の実装を紹介します。このブログサイトのソースコードで使用しています。

react-use に同じ目的同じ名前のカスタムフックが入っていることは知っていますが、インターフェイスも内部実装も気に入らなかったので自作しました。

## コード

https://github.com/y-hiraoka/stin-blog/blob/a13e388f812c20d71baec23b417b931f288b6803/src/lib/useLocalStorage.ts

## インターフェイス

```tsx
type UseLocalStorageParams<T> = {
  storageKey: string;
  initialState: T;
  isValidValue: (value: unknown) => value is T;
};

function useLocalStorage<T>(
  params: UseLocalStorageParams<T>,
): [T, React.Dispatch<React.SetStateAction<T>>];
```

引数では

- localStorage のキーを指定する `storageKey`
- ステートの初期値 `initialState`
- localStorage に格納されている値を検証する `isValidValue`

の 3 つを受け取ります。localStorage の中身はプログラマーの意図しない値を容易に格納できるので、検証関数を必須としています。

戻り値は標準の `useState` とまったく同じタプル型にしてあります。

## 使い方

```tsx
type ColorMode = "light" | "dark";

function isColorMode(v: unknown): v is ColorMode {
  return ["light", "dark"].includes(v as string);
}

const App: React.FC = () => {
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>({
    storageKey: "site-color-mode",
    initialState: "light",
    isValidValue: isColorMode,
  });

  // ...
};
```

フックの引数だけ localStorage 向けに特殊ですが戻り値は `useState` と全く同じなので、同じ感覚でステート操作を行えます。

## 実装

### 保存時の形式

`T` 型の値をそのまま `JSON.stringify` して localStorage に保存すると、`T` が `undefined` を含む時に正しくシリアライズ・デシリアライズされません。なぜなら `JSON.stringify(undefined)` は `undefined` を返し、`localStorage.setItem(key, undefined)` は localStorage に `"undefined"` という文字列を保存し、`JSON.parse("undefined")` はエラーを吐くからです。

`useState` が `undefined` を扱えるのに `useLocalStorage` が扱えないの悔しかったので、localStorage に格納するときは `{ __value: T }` というオブジェクトにしてからシリアライズして保存します。こうすることで localStorage には最低でも `"{}"` という文字列が保存されるようになり、`JSON.parse` でエラーが出ることはありません。`{}` オブジェクトに対して `__value` でアクセスすれば `undefined` になるので、`undefined` も表現できます。

### 別タブと同期する

別タブで同じ Web サイトを開いていて片方で localStorage を更新した時、もう一方のタブで `storage` イベントが発火します。それをリッスンしておけば、別タブでの操作を検知してメモリ上のステートを更新できます。

```ts
useEffect(() => {
  window.addEventListener("storage", setValueFromStorage);
  return () => window.removeEventListener("storage", setValueFromStorage);
}, [setValueFromStorage]);
```

### `setState` の内部実装

`useLocalStorage` の内部では標準の `useState` を使っていますが、その `setState` をそのまま return するのではなく、ラップして localStorage 更新を含む処理を追加した独自の `setState` を return しています。

```ts
const setState: React.Dispatch<React.SetStateAction<T>> = useCallback(
  (value) => {
    _setState((prevState) => {
      // @ts-expect-error
      const nextState: T = typeof value === "function" ? value(prevState) : value;

      window.localStorage.setItem(storageKey, JSON.stringify({ __value: nextState }));

      return nextState;
    });
  },
  [storageKey],
);
```

`setState` のインターフェイスだけ維持したまま localStorage に保存する機能を追加しようとしているので、なんと updater function の途中に副作用を発生されています…。もっといい方法がありそうな気がしたんですが、`localStorage.setItem` 冪等なので問題になることはないだろうと思ってこの方法を採用しました。いい方法知ってる人がいればぜひ教えてください…。

## 書いてて気づいたダメなこと

`JSON.stringify` ↔ `JSON.parse` するので、ステートの値はシリアライズ可能な値に限定されますね。`Date` の値とかそのままでは使えないということです。`useState` と完全に同じ使い勝手とはいかないですね。引数でさらにシリアライズ関数・デシリアライズ関数を受け取るようにすれば対応できるかもと思ったり、変換レイヤーくらい使う側で用意しろよと思ったりしました(？)

また、別タブのステート同期はできるんですが同一タブで同じ `storageKey` のステートの同期はできないです。localStorage を更新しても、そのタブでは `storage` イベントは発火しないためです。厳密にやろうとすると、React Context を用意して `Provider` を設置してもらって…ということをやる必要が出てきます。面倒でした。

## まとめ

`useLocalStorage` の紹介をしました。`useState` のインターフェイスを守りつつブラウザ API の localStorage にも反映するとなると、ハック的な書き方になってしまいますね。不整合が起きないようにして関数の内部にハッキーさを隠蔽してあれば問題ない派なのでこれでいいや。

それではよい React ライフを！
