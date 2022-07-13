---
title: "React + TypeScript 用の eslint セットアップメモ書き"
createdAt: "2022-07-13T15:23:30.263Z"
tags: ["react", "typescript", "eslint"]
---

Vite で立ち上げた React + TypeScript プロジェクトには eslint のセットアップはされていない。プライベートでちょっとライブラリを試すみたいなケースでしか Vite を使っていなかったので eslint なしで作業していたが、やっぱり `useEffect` の依存配列の渡し漏れをして混乱することが何度もあった。

なので今後 eslint のセットアップを勝手にやってくれないスターターを使うときにサクッと eslint を入れられるように手順をメモっておく。

create-react-app にはデフォでインストールしてあるので心配無用。 Next.js は独自の eslint パッケージを作っているのでそちらの慣習に従おう。

## 前提

React & TypeScript の Vite アプリケーション。

prettier でコードフォーマットを行う。

## 必要なパッケージ

- `eslint`
- `eslint-config-react-app`
- `eslint-config-prettier`

```bash
npm install --save-dev eslint eslint-config-react-app eslint-config-prettier
```

`eslint-plugin-react` とか `@typescript-eslint/parser` とか色々あってどれ入れたらええんやとなるけど、 create-react-app のリポジトリで管理されている `eslint-config-react-app` が React + TypeScript プロジェクトの eslint に必要なプラグインパッケージを全部引き連れてくるので、これだけインストールすれば問題ない。ありがてぇ。

`eslint-config-prettier` は eslint と prettier で競合しうる rule をオフにしてくれるもの。プロジェクトで eslint と prettier を併用する場合はこれをインストールしておく。 `eslint-plugin-prettier` と `eslint-config-prettier` という名前の似たライブラリが存在しているが、 `eslint-plugin-prettier` はもう使用する必要がなくなっていることが言及されている。

https://prettier.io/docs/en/integrating-with-linters.html#notes

## eslint 設定ファイル

```jsx
// .eslintrc.js

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app",
    "prettier",
  ],
  rules: {
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useRecoilCallback|useRecoilTransaction_UNSTABLE)",
      },
    ],
    "no-duplicate-imports": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/button-has-type": "warn",
    "react/no-access-state-in-setstate": "error",
    "react/jsx-boolean-value": "warn",
    "react/jsx-equals-spacing": ["warn", "never"],
    "react/jsx-fragments": "warn",
    "react/self-closing-comp": ["warn", { component: true, html: true }],
    "react/void-dom-elements-no-children": "error",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
  },
};
```

`eslint-config-react-app` は `"eslint:recommended"` や `plugin:@typescript-eslint/recommended"` を指定してくれていないので、それぞれの recommended 設定を有効にしたい場合は明示的に `extends` に含める必要がある。

`rules` の部分は好みで `"off"` にしたり `"warn"` にしたり `"error"` にしてよい。

`rules["react-hooks/exhaustive-deps"]` の部分は、依存配列の漏れをチェックしたいカスタムフックを追加するときに追記する。上記は[ステート管理ライブラリ Recoil を導入する時の例](https://recoiljs.org/docs/introduction/installation/#eslint)。ちなみに、あまり依存配列を受け取るようなカスタムフックは作らないほうがいいということが[言及されている](https://github.com/facebook/react/tree/7a4336c4040bb26d8fe143f96d842acae4c728b5/packages/eslint-plugin-react-hooks#advanced-configuration)。 Recoil のような低レイヤーライブラリならともかく、アプリレイヤーで作るカスタムフックが依存配列を引数に持つのはやめておこう。

## まとめ

Vite のような eslint をセットアップしない React プロジェクトスターターに eslint を入れるときに必要なライブラリと、自分好みの設定ファイルをメモしておいた。

設定ファイルのほうは好みの変遷によってアップデートしていくかもしれない(多分しない)。
