---
title: 'Chakra UI は "use client" なしで使えるようになった「だけ」'
createdAt: "2023-11-23T03:18:56.708Z"
tags: ["chakraui"]
---

## Chakra UI が自分で `"use client"` を付けている

最近 Chakra UI が `"use client"` を付けずとも Next.js の App Router で使えるようになったと話題になりました。しかし調べてみると、どうやら JS 非依存なコードに書き換えられた訳ではなく、Chakra UI 自身がビルド時に `"use client"` を付けるようになっただけらしいです。

https://github.com/chakra-ui/chakra-ui/commit/754d9d4f48b4fef8d38cb1d5e342f3776d18e7c6

なので「自分たちで付ける必要があった `"use client"` をあらかじめ付けておいてくれるようになった」という認識が正しいと言えそうです。

ここで注意したいのは、変わらず `"use client"` は付いているので、Server Components になったわけではないということです。引き続き Chakra UI の分の JS コードはバンドルされてブラウザに転送されます。

## Chakra UI が JS なしになるのは難しそう

とはいえ、Chakra UI を JS なしの Server Components にするのも難しそうだなと予想します。その理由。

色やサイズのトークンを `ChakraProvider` 経由で変更するテーマ機能があります。`Context.Provider` でテーマを差し替えるので、各コンポーネントは `useContext` でテーマ情報を読み込む必要があります。そうすると、必然的に Client Component にならざるを得ません(`use` が使えるようになったらこれも解決するのかな)。

また、Chakra UI はアクセシビリティ対応をビルトインでしてくれます。例えば `FormControl` で括った範囲の Input に id をセットして、同じ値を `FormLabel` の `htmlFor` に渡すことを勝手にやってくれます。それを実現するのも React Context が必要で、Client Component にしないといけません。

他にもオンオフするやつとか開閉するやつとか、ちょっとした見た目の状態制御に `useState` などを使っていることでしょう。置くだけでいい感じのデザインや操作性を提供してくれる UI ライブラリは、内部で泥臭い JS 処理を行ってくれているんですね。

## 変更自体はありがたい

しかし、ライブラリ側で `"use client"` を付けてくれるのはとても嬉しいことだと思います。

まず単純に楽です。 VSCode がサジェストするまま、`import {Button} from “@chakra-ui/react”` と書けばよくなります。 `"use client"` を付けたいがための re-export は不要になりますね。

人によっては、「Chakra UI を使っているから、自分のアプリのコードに `"use client"` を付けている」という人もいるかもしれません。次のようなコードです。

```tsx
"use client";
import { Button } from "@chakra-ui/react";

const MyPage = () => {
  return <Button>Click me!</Button>;
};
```

`"use client"` を付けたファイルからの re-export ではなく `@chakra-ui/react` から直接 import しているので、ページコンポーネントのソースファイル自体に `"use client"` を付けています。これは、ページコンポーネント分の JS ファイルがバンドルされることを意味します。

今までこれで凌いでいた場合は余分に JS ファイルを転送していたかもしれません。でもこれからは自分のコードに `"use client"` をつける必要がなくなるので、純粋に Chakra UI の分だけに絞られてバンドルされるでしょう。

まとめ

Chakra UI は確かに `"use client"` なしで使えるようになりましたが、ライブラリ内部で付けてくれるようになっただけで、引き続き JS ファイルになってブラウザに届きます。

でも、Chakra UI の開発者は Emotion 非依存な PandaCSS を作っているようなので、もしかしたら Chakra UI のバンドルサイズは今後どんどん減っていくかもしれませんね。知らんけど。

それでは良い React ライフを！
