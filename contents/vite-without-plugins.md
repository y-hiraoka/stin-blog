---
title: "viteがプラグインなしでできることを探る"
createdAt: "2024-08-04T07:44:18.192Z"
tags: ["vite", "react"]
---

pluginを使わずにviteだけで始めてみることで理解が深まったらいいと思い、やってみる。

## セットアップ

適当なディレクトリ内で、git初期化してnpm初期化してviteとTypeScriptをインストールする。

```json
git init
npm init -y
npm install vite typescript -D
```

package.jsonのtypeはmoduleにして、scriptsに`npm run build`を追加する。

```json
{
  "name": "vite-trial",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "vite": "^5.3.5"
  }
}
```

pluginを持たない空のvite.config.tsを用意する。

```js
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
});
```

試しにここで一旦ビルドしてみよう。

```bash
vite v5.3.5 building for production...
✓ 0 modules transformed.
x Build failed in 5ms
error during build:
Could not resolve entry module "index.html".
    at getRollupError (file:///Users/y-hiraoka/vite-trial/node_modules/rollup/dist/es/shared/parseAst.js:392:41)
    at error (file:///Users/y-hiraoka/vite-trial/node_modules/rollup/dist/es/shared/parseAst.js:388:42)
    at ModuleLoader.loadEntryModule (file:///Users/y-hiraoka/vite-trial/node_modules/rollup/dist/es/shared/node-entry.js:19221:20)
    at async Promise.all (index 0)
```

`index.html`が存在しないからエラーになった。viteが「`index.html`をソースコードのエントリポイントとして扱う」と言っている理由がこれか。

https://ja.vitejs.dev/guide/#index-html-and-project-root

> お気づきかもしれませんが、Vite プロジェクトでは `index.html` は `public` 内に隠れているのではなく、最も目立つ場所にあります。これは意図的なものです。開発中、Vite はサーバーで、`index.html` はアプリケーションのエントリーポイントです。

ということで、`index.html`を用意する。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body></body>
</html>
```

そして`npm run build`してみる。

```bash
vite v5.3.5 building for production...
✓ 1 modules transformed.
dist/index.html  0.26 kB │ gzip: 0.19 kB
✓ built in 24ms
```

ビルド成功！といってもルートにある`index.html`を`dist/index.html`にコピーしただけである。

## スクリプトを追加する

続いて、TypeScriptを追加してみる。viteのスターターでは`index.html`がscript要素で直接TypeScriptファイルを参照していることを思い出したのでやってみた。

まず`src/index.ts`を適当に用意する。

```ts
console.log("FOOOOOOOOOOOOOOOO");
```

そしてHTMLにscript要素を差し込む。とりあえずbody要素の中。

```html
<body>
  <script src="src/index.ts"></script>
</body>
```

そしてビルド。

```bash
vite v5.3.5 building for production...
<script src="src/index.ts"> in "/index.html" can't be bundled without type="module" attribute
✓ 1 modules transformed.
dist/index.html  0.30 kB │ gzip: 0.22 kB
✓ built in 26ms
```

なるほど、`type="module"`で読み込んだスクリプトしかビルドできないとのこと。ES Modulesしか扱わないという強い意志を感じる。ステキ。

ということで`type="module"`を追加する。

```html
<body>
  <script type="module" src="src/index.ts"></script>
</body>
```

そしてビルド。

```bash
vite v5.3.5 building for production...
✓ 3 modules transformed.
dist/index.html                0.34 kB │ gzip: 0.24 kB
dist/assets/index-DHOL2SoK.js  0.74 kB │ gzip: 0.42 kB
✓ built in 38ms
```

お〜、何も設定していないのにTypeScriptをJavaScriptに変換してくれているようだ。そのときの`dist/index.html`はこちら。

```bash
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="module" crossorigin src="/assets/index-DHOL2SoK.js"></script>
  </head>
  <body>
  </body>
</html>

```

ちゃんと変換後のJavaScriptがscript要素によって差し込まれている。完璧ですね。

## Reactを入れていく

Reactをインストールする。

```bash
npm i react react-dom @types/react @types/react-dom
```

ここらでtsconfig.jsonをちゃんと設置する。

```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "useDefineForClassFields": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
```

設定値については、次のドキュメントのページを参考にした。react-tsスターターのtsconfig.jsonもカンニングしたけど。

[https://ja.vitejs.dev/guide/features.html#typescript](https://ja.vitejs.dev/guide/features.html#typescript)

ポイントは

- `"types": ["vite/client"]`
  - TypeScriptでviteがセットする値の型定義を読み込む
  - `import.meta.env`などが型レベルで有効になる
- `"isolatedModules": true`
  - TypeScript以外でも正確にトランスパイルできるようにするため
- `"noEmit": true`
  - TypeScript本体ではなくviteが内部利用しているrollup or esbuildがトランスパイルするため
- `"moduleResolution": "Bundler"` と `"allowImportingTsExtensions": true`
  - [別のページ](https://ja.vitejs.dev/guide/performance.html#%E8%A7%A3%E6%B1%BA%E6%93%8D%E4%BD%9C%E3%81%AE%E5%89%8A%E6%B8%9B)に記述があった
    > TypeScript を使用している場合は、tsconfig.json の compilerOptions で "moduleResolution": "bundler" および "allowImportingTsExtensions": true を有効にして、コード内で直接 .ts および .tsx 拡張子を使用できるようにしてください。

`App.tsx`でカウンターコンポーネントを用意する。`useState`を使うことで、Reactの機能がちゃんと有効になっているか確認するため。

```tsx
import { useState } from "react";

export const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Decrement</button>
    </div>
  );
};
```

続いて、`src/index.ts`を`src/index.tsx`にリネームし、`App`をHTMLにマウントする処理を書く。

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("react-root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

ソースファイル名を変更したので`index.html`でも変更する。ついでにReactをマウントするための空のdiv要素を追加しておく。idが一致していることも確認する。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="react-root"></div>
    <script type="module" src="src/index.tsx"></script>
  </body>
</html>
```

これでReactアプリをHTMLにマウントするまで書けたので、実際にビルドしてみる。

```bash
vite v5.3.5 building for production...
✓ 30 modules transformed.
dist/index.html                  0.38 kB │ gzip:  0.26 kB
dist/assets/index-Dozb9eH7.js  142.69 kB │ gzip: 45.81 kB
✓ built in 331ms
```

ビルド成功！viteはout of the boxでTypeScriptもJSXも処理できるし、それらをバンドルして適切なscript要素に変換できるらしい。

試しに`dist`ディレクトリをserveしてみると、ちゃんとReactアプリとして動く。

```bash
npx serve dist
```

@vitejs/plugin-reactはJSXのトランスパイル設定してると思ってたけど、必要あるのか？

## CSS Modulesを読み込んでみる

JSXすらプラグインなしでサポートされているので、CSSなど試さずとも結果が想像できるが、やってみる。

`App.module.css`ファイルを用意する。

```css
.app {
  text-align: center;
}
```

`App.module.css`を`App.tsx`で使ってみる。

```tsx
import { useState } from "react";
import styles from "./App.module.css";

export const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.app}>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Decrement</button>
    </div>
  );
};
```

ビルドする。

```bash
vite v5.3.5 building for production...
✓ 31 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-D-l-WNIh.css    0.03 kB │ gzip:  0.05 kB
dist/assets/index-C_fqnJfB.js   142.73 kB │ gzip: 45.85 kB
✓ built in 402ms
```

当然ビルドに成功する。CSSファイルがリネームされてクラス名にはハッシュ値らしき文字列が追加されていた。

```css
._app_1f4ah_1 {
  text-align: center;
}
```

`dist/index.html`にはCSSを読み込むlink要素が挿入されている。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="module" crossorigin src="/assets/index-C_fqnJfB.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-D-l-WNIh.css" />
  </head>
  <body>
    <div id="react-root"></div>
  </body>
</html>
```

viteすげでゃ。

## TailwindCSS(PostCSS)を試す

普段はとりあえずでTailwindCSSを使っているので導入できるか試してみる。といってもTailwindCSSはPostCSSの上に成り立っているのでPostCSSが通るかどうかの問題だが、PostCSSをTailwindCSS以外で使ったことがないためTailwindCSSの導入をゴールにする。

TailwindCSSをインストールする。

```bash
npm install -D tailwindcss postcss autoprefixer
```

`postcss.config.js`を用意する。

```tsx
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`tailwind.config.ts`を用意する。

```tsx
import { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

`src/index.css`を用意する。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/index.css`を`src/index.tsx`で読み込む。

```tsx
import "./index.css";
```

CSS Modulesの動作確認のために用意した`App.module.css`は削除して、`App.tsx`をTailwindCSSのクラスでスタイリングしてみる。

```tsx
import { useState } from "react";

export const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="text-red-500 font-bold">
      <h1>Count: {count} check it out!</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Decrement</button>
    </div>
  );
};
```

ビルドしてみる。

```bash
vite v5.3.5 building for production...
✓ 31 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-CvAV5ag6.css    4.84 kB │ gzip:  1.45 kB
dist/assets/index-Cg2UYiug.js   142.74 kB │ gzip: 45.85 kB
✓ built in 433ms
```

ちゃんとCSSが生成されていて、そのCSSの中身はPreflight(TailwindCSSのreset CSS)と自分が用意したクラスだけが含まれている。当然`dist/index.html`はそのCSSを参照している。完全に意図した挙動だ。

ということでTailwindCSS(PostCSS)もvite本体でサポートされていることがわかった。

ドキュメントにもそう書いてある

[https://ja.vitejs.dev/guide/features.html#postcss](https://ja.vitejs.dev/guide/features.html#postcss)

## Hot Reload / Hot Module Replacement

ここまではプロダクションビルド(`vite build`)での挙動を確認していて、開発ビルド(`vite dev`)は見て見ぬ振りをしていた。

「ソースコードを保存したらブラウザが更新される」機能の名前としてHot ReloadとHot Module Replacementがあるが、正直厳密な違いがわからない。一応僕の理解(=この記事での定義)を書いておく。

- Hot Reload
  ソースコードを保存したらブラウザが自動でリロードされる。HTMLの再取得が実行され、付随するJSやCSSもすべて取得し直す。
- Hot Module Replacement
  ソースコードを保存したら、変更された分のJS/CSSファイルだけが更新される。HTMLの再取得は行われず、変更されていないファイルもそのまま。Reactステートなどは維持される。

挙動を確認するためにpackage.jsonのscriptsに開発サーバー起動コマンドを追加する。

```json
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build"
  },
```

関係ないけど`vite dev`がデフォルトでは覚えにくいポート番号でサーバーを起動するのが嫌いなので、いつも3000を指定している。

開発サーバーを起動する。

```bash
npm run dev
```

TypeScriptファイルを変更すると、ブラウザはリロードされた。HTMLが再取得されるので、画面が一瞬チラッと動く。リロードされているので当然Reactステートは初期化される。つまりHot Reloadの挙動になる。

`src/App.module.css`をもう一度作成して読み込み、更新してみる。CSS Modulesファイルに対する変更もHot Reloadになった。

`src/index.css`に対して適当な変更を加えて保存してみる。このファイルはCSS Modulesではなく(PostCSSは適用されているが)プレーンなCSSファイルである。プレーンなCSSへの変更では、ブラウザリロードされることなく、適用されるスタイルだけが変更された。Reactステートも維持されている。つまりHot Module Replacement的な挙動。

上の方で@vitejs/plugin-reactの必要性に疑問を感じたが、Hot Module Replacementを提供するのが役割なんだろうと想像するようになった。どんな実装でステートを持っているかはビューライブラリやフレームワーク次第で変わるので、viteだけではHot Module Replacementを提供できないのだろう。しかし最低限ソースコードの変更をリアルタイムに届けるためのHot Reload機能が備わっているようだ。

## 終わり

vite本体だけで普通のことがおおよそできてすごい。

次はHot Module Replacementを自作してみたい。
