---
title: "@vercel/og を使ってブログに動的 og:image 生成を実装した"
createdAt: "2022-10-14T17:32:29.816Z"
tags: ["nextjs", "vercel"]
---

# Vercel で og:image の動的生成するなら一択

先日 Vercel から HTML&CSS で画像を生成できるライブラリ @vercel/og が発表されました。

https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images

それを使ってこのブログにもタイトルが埋め込まれた og:image を動的生成する機能を実装しました。Twitter 等でシェアするときにちょっとリッチになるのでワクワクしますね。シェアしてください(切望)。

## 過去に動的 og:image を諦めた話

半年ほど前に、同じく og:image を動的生成してシェアのときに記事タイトル入りのカードがばーんと表示されるようにしたいと思って試行錯誤していました。

その時は [node-canvas](https://github.com/Automattic/node-canvas) で画像生成する処理を Next.js の API Routes に仕込む方法で試しました。ローカル PC ではうまく画像が生成されて、簡単にできるやんと思いデプロイしたはいいものの、Vercel 上ではなぜか動かず。調べると、node-canvas は cairo というツールを使っていてそれが Vercel (AWS Lambda)では使えないと。回避策が issues に上がっていたりしたのですが結局うまくいかずに挫折していました。

og:image のために Cloud Run などで別のサービス立てないといけないか〜とか考えているとめんどくさなくなって放置していました。で、忘れた頃に発表されたのが @vercel/og です。

## 実装方法

実装方法を軽く紹介しますが、まだ出たばっかり(2022/10 現在)で変更される可能性がありますし、API が非常に少ないので公式ドキュメントを見ていただいたほうがいいです。

https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation

基本は API Routes のハンドラから `ImageResponse` のインスタンスを返すだけで実装完了です。

```tsx
import { ImageResponse } from "@vercel/og";
import { NextApiHandler } from "next";

export const config = {
  runtime: "experimental-edge",
};

const handler: NextApiHandler = () => {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        Hello World!
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
};

export default handler;
```

@vercel/og は Edge Runtime でしか動作を想定されていないようです。上記コード例のように `runtime: "experimental-edge"` を指定した `config` を export しておくことで Edge Runtime で実行することを宣言します。

`ImageResponse` のコンストラクタに JSX を渡して API Routes のハンドラから return するだけで、JSX を画像に変換したものをレスポンスしてくれます。またレスポンスヘッダーをいい感じに設定してくれるので、Vercel の CDN によしなにキャッシュしておいてくれます。また `ImageResponse` の第 2 引数のオプションで画像サイズを指定できます。 og:image のサイズは 1200x630 がよく使われるのですが、デフォルトでそのサイズになっているので省略しても問題ありません。

## 注意点

### 使用可能な CSS プロパティに制限あり

HTML と CSS から画像を生成するためのレンダリングメソッドとしては同じく Vercel が開発している satori というライブラリを使用されています。任意の CSS プロパティが使えるわけではないので、使用可能な CSS の一覧は satori のドキュメントを御覧ください。

https://github.com/vercel/satori

### 画像の埋め込みに工夫が必要

`<img>` や `background-image` に URL 指定で画像を使うことはできるようです。

```tsx
return new ImageResponse(
  (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <img src="https://github.com/y-hiraoka.png" />
    </div>
  ),
);
```

ただ、 `public` ディレクトリにあるような画像を埋め込む方法が不明でした。 [Examples](https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples) を見ると dataURL 形式の文字列をぶちこむ例があるので、このブログでもそれに倣って画像を dataURL に変換してハードコーディングしています。

https://github.com/y-hiraoka/stin-blog/blob/10a089fbfe978f327ba4b089153bf7eef8fc1dd8/src/pages/api/og-image.tsx#L25-L30

`<img>` 要素を使うときは `width`, `height` を指定することが[推奨されています](https://github.com/vercel/satori#images)。

### Node.js では動かない

先述の通り、 @vercel/og は Edge Runtime で動作することを前提に作られているので Node.js では動きません。ローカルの Next.js で動くのはよくわかりませんが Vercel の魔法でしょう…(？)

ただしそれは @vercel/og の話で、 satori 自体は環境依存ではなく Node.js でもブラウザでも使えるようです。

https://github.com/vercel/satori#runtime-and-wasm

なので、単純に HTML&CSS から画像を生成したいだけであれば @vercel/og ではなく satori を直接使う方法を取ることができます。

## JSX を渡せるとは

ここからは余談ですが、JSX を渡せるのってどういうことだろうと疑問に思いました。Next.js によるビルドなら JSX は `React.createElement` に変換される(厳密には `_jsxRuntime` 的なやつだけど)ので、それって React 依存になるのではと考えた次第です。

一方で、 satori のドキュメントには [**Use without JSX**](https://github.com/vercel/satori#use-without-jsx) という節が用意されていて、プレーンなオブジェクトを渡すコード例が載っています。

```ts
await satori(
  {
    type: "div",
    props: {
      children: "hello, world",
      style: { color: "black" },
    },
  },
  options,
);
```

では `React.createElement` も同じ形のプレーンオブジェクトを生成するだけであれば辻褄が合います。ということで facebook/react のリポジトリを覗きます。

https://github.com/facebook/react/blob/a6bf466892c23a100991580895ddd80667c1b777/packages/react/src/ReactElement.js#L442-L450

なるほど、 `React.createElement` は `ReactElement({...})` を返すそう。じゃあ `ReactElement` 関数は何を返すのかを見ます。

https://github.com/facebook/react/blob/a6bf466892c23a100991580895ddd80667c1b777/packages/react/src/ReactElement.js#L149-L161

予想通りプレーンなオブジェクトでした。しかも、satori に渡されるプレーンオブジェクトと同じ構造をしています。JSX って結局全部プレーンオブジェクトになるんですね〜。

## まとめ

@vercel/og を使ってこのブログにも動的 og:image を実装しました。

@vercel/og は内部で同じく Vercel 製の satori というライブラリを使って HTML&CSS から画像を生成します。

@vercel/og は Edge Runtime でしか動作しませんが、 satori だけなら環境非依存で Node.js でも動作します。

それではよい Next.js ライフを！
