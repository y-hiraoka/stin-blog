---
title: "Next.js App Router の Static Exports の可能性を探るためにブログでやってみた話"
createdAt: "2023-12-04T12:55:35.646Z"
tags: ["nextjs"]
---

Next.js Advent Calendar 2023 の12月4日の記事です。

https://qiita.com/advent-calendar/2023/next

## Static Exports とは

Next.js の Static Exports は Next.js のビルド結果として完全に静的な HTML, CSS, JS, その他画像などの Assets のみを生成させる機能です。

https://nextjs.org/docs/app/building-your-application/deploying/static-exports

Next.js は普通に開発して普通にデプロイする場合、Node.js ランタイムでサーバーを動かすことになります。しかし `next.config.js` の設定1行で、ビルド結果にサーバー用コードが含まれなくなり、静的なファイルだけをまとめた `out` ディレクトリが生成されるようになります。この `out` ディレクトリを好きな静的サイトホスティングでHTTP配信するだけで、Webサイトにすることができます。AWS S3 や Firebase Hosting、GitHub Pages などにファイルを置くだけでよくなります。

Next.js なので SSG によって HTML はちゃんとコンテンツを含んでいます。なので SEO 的にも問題ありません。また next/link も prefetch してくれたり SPA のクライアントサイドナビゲーションなので画面遷移も爆速です。

### Static Exports の制約

もちろんデプロイ後の Node.js ランタイムがなくなるので、使えなくなる機能があったり、Dynamic Routes で `generateStaticParams` が必須になったりします。

[https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features)

サーバーがないので Request に依存する処理は軒並み書けません。Request に依存するというのは、cookie を見たり header を見たりリダイレクトしたりですね。

また、 `app/articles/[slug]/page.tsx` のようなパスパラメーターを受け取る、いわゆる Dynamic Routes は `generateStaticParams` が必須になります。`generateStaticParams` はビルド時に実行されて、事前に SSG しておきたい `slug` の一覧を Next.js に伝えるための関数です。

Static Exports しない場合は Node.js サーバーがリクエストを受け取ったタイミングで初めてページを生成したり Not Found を返したりと判断できます。一方 Static Exports はビルドタイムですべてのページのパスパラメーターが決定される必要があるので、`generateStaticParams` が必須になるということですね。

### Static Exports でも使える機能

[https://nextjs.org/docs/app/building-your-application/deploying/static-exports#supported-features](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#supported-features)

普通のReactコンポーネントは全部使えます。名前が紛らわしいですが Server Components も使えます。もちろん Server Components の中で `cookies()` や `headers()` は使えませんけどね。

そして僕はこの Static Exports 調査で初めて気づいたのですが、条件付きで Route Handlers も Static Exports できます。その条件は Request に依存しない `GET` ハンドラーであることです。ビルド時にそのハンドラー関数を実行し、`Response.body` をファイルに書き出しておいてくれます。例えば RSS Feed 用の xml ファイルを設置したり、記事検索用の JSON ファイルを置いておくなどに使えそうです。

## Static Exports を使ってみた

個人ブログは Static Exports でも十分と思い、置き換える可能性も考えてこのブログサイトでコネコネと試していました。

ブランチをわけて Static Exports できるようにソースコードを調整し、GitHub Pages にデプロイしたものがこちらです↓

https://blog-static.stin.ink/

ブランチはこちら↓

https://github.com/y-hiraoka/stin-blog/tree/static-export

先に結論を述べると、まだ全然使えないと判断したのでこちらのサイトもブランチも今後更新されません。ご注意ください。なんならそのうち消す可能性もありますのでご了承ください。

## Static Exports 対応のためにやったこと

### noindex 指定

いきなり本題とはあまり関係ないのですが、仮に2つ目のブログサイトが Google bot に見つかると重複コンテンツとみなされてしまうので、`robots` に `noindex, nofollow` を指定しておきます。これは `app/layout.tsx` の `metadata` に指定することで、全ページに反映されます。

### `next.config.js` を修正

`output: "export"` を指定します。Next.js の Static Exports のすべてがこの1行から始まります。

また、 `images.unoptimized` を `true` にします。これは next/image コンポーネントが行う画像最適化機能を停止します。というのも next/image の画像最適化は Node.js サーバーありきの機能なので、Static Exports では使えません。またはカスタム画像URLビルダーとして `loader` を指定することも可能です。デフォルトの Next.js による画像最適化ではなく Cloudflare Images のような画像サーバーを使っている場合、next/image の src に指定される URL は外部サーバーなので、Node.js サーバーがなくても問題ないからです。

僕は画像最適化をオフにすることにしました。それのせいでトップページでの画像の読み込みがかなり遅いですね。next/image の効果すごいなと再認識しました。気軽に使いすぎて Vercel の画像最適化APIの利用上限に達しそうなのですが…。

### `app/tags/[tagName]/opengraph-image.png` がエラーを吐いた

Next.js App Router では `opengraph-image.png` という名前で画像を置いておくだけで、同じ階層の `page.tsx` の og:image, og:image:width, og:image:height を指定したことになります。

Dynamic Routes でも適用できて、全てのパスに対して同じ画像が og:image として設定されます。が、Static Exports でビルドしたらエラーになってしまいました。`generateStaticParams()` がないよというものです。

```plaintext
Error: Page "/tags/[tagName]/opengraph-image.png" is missing "generateStaticParams()" so it cannot be used with "output: export" config.
```

いやそれ画像ファイルなんだけど…。

仕方がないので、`opengraph-image.png` を public ディレクトリに移動して、`generateMetadata` で og:image を直書きするように修正しました。

```tsx
// app/tags/[tagName]/page.tsx

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  // 省略

  return {
    // ...
    openGraph: {
      // ...
      images: [
        {
          url: "/images/opengraph-image.png",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};
```

### `app/articles/[slug]/opengraph-image.tsx` もエラーを吐いた

このソースファイルも同じ階層の `page.tsx` に対する og:image を設定するものですが、TypeScript ファイルになっています。画像を JSX から動的生成する next/og を内部で使用しています。記事タイトルを埋め込んだ画像を og:image にするために利用しています。これが開発ビルドで次のエラーを吐いていました。

```plaintext
Error: Page "/articles/[slug]/opengraph-image/[[...__metadata_id__]]/route" is missing exported function "generateStaticParams()", which is required with "output: export" config.
```

ファイル名が変わっているので、おそらく `opengraph-image.tsx` は `opengraph-image/[[...__metadata_id__]]/route` という Route Handler に変換されるのでしょう。そして、その変換後のファイルで `generateStaticParams` が存在しないと言われています。

`page.tsx` には設置しているのでそれを使ってくれればいいのにと思いつつ、`page.tsx` の `generateStaticParams` をコピペしました。それでもエラーは消えませんでした。Next.js の不具合でしょう。次の issue で報告されているので修正されるのを期待します…。

[https://github.com/vercel/next.js/issues/51147](https://github.com/vercel/next.js/issues/51147)

これも仕方ないので、プレーンな Route Handler なら Static Exports できることを利用して、`app/articles/[slug]/opengraph-image.png/route.tsx` を用意しました。

```tsx
// app/articles/[slug]/opengraph-image.png/route.tsx

import { ImageResponse } from "next/og";

type Props = {
  params: {
    slug: string;
  };
};

const handler = async (_: unknown, { params }: Props) => {
  // 省略

  return new ImageResponse(/* 省略 */);
};

export { handler as GET };

export const generateStaticParams = async () => {
  /* 省略 */
};
```

ポイントは次の3つです。

- ディレクトリ名に画像拡張子が含まれていること
- `handler` の第1引数を使わないようにしていること
- `generateStaticParams` があること

上の方で紹介しましたが、Route Handlers が Static Exports できる条件を満たすには Request を使わない GET であること必要があります。Route Handler なので第1引数は `Request` なのが明らかですが、間違えて使わないように変数名をアンダースコアにして `unknown` 型にしています。第2引数は `page.tsx` の Props と同じ型のオブジェクトなのでパスパラメーターはそこから取得します。

また、上記の Route Handler はビルド時に画像を生成するだけなので、`page.tsx` に og:image を付与するのは手動になります。`generateMetadata` に `openGraph.images` を加えました。

```tsx
// app/articles/[slug]/page.tsx

export const generateMetadata = async ({
  params,
}: {
  params: Params;
}): Promise<Metadata> => {
  // 省略

  return {
    // 省略
    openGraph: {
      // 省略
      images: [
        {
          url: `/articles/${params.slug}/opengraph-image.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};
```

### ビルドする

ビルドコマンドに違いはなく、 `next build` でビルドを開始することですべて静的ファイルに変換されて `out` ディレクトリに格納されます。あとはこのディレクトリをよしなに配信するだけで良いです。ローカルで試すには同じく Vercel が開発している `serve` がおすすめです。

```bash
npx serve out
```

これを GitHub Pages に公開したものがこちら（再掲）

[https://blog-static.stin.ink/](https://blog-static.stin.ink/)

## まとめ

Next.js App Router の Static Exports の可能性を探るため、このブログサイトのソースコードをこねくり回して GitHub Pages にデプロイするまでの挑戦をご紹介しました。

Dynamic Routes 周りで不具合が多く、まだまだ本活用は難しそうと感じました。しかし、Static Routes のみであれば当然使えるし、単純に稼働するサーバーを減らせるので、まず Static Exports の構成にできないか考えると思います。また、Dynamic Routes を使うにしても og:image を動的生成せずに CMS で指定するようなケースなら使えるかもしれません。

next/image については外部の画像サーバーを使ったり、[Static Exports 時も next/image の画像最適化を有効化するツール](https://next-export-optimize-images.vercel.app/)などで対策はできそうです。

今回の調査で Route Handlers が Static Exports をサポートしていることを知れたのが個人的に大きな学びでしたね。活用できるケースは多いと思います。

それでは良い Next.js ライフを！
