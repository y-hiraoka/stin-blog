---
title: "ブログに next-seo を導入した"
createdAt: "2022-04-02T13:28:45.485Z"
tags: ["react", "nextjs"]
---

# 適当にやってた meta タグ設定をちゃんとしました

Next.js のプロジェクトの meta タグ類を設定してくれるライブラリ next-seo をインストールしました。

今まで適当に meta タグをセットしていて、特に OGP 系は必須プロパティとかも入れずにやっていましたが、今回 next-seo を導入するにあたってちゃんと調べました。

ちなみに next-seo という名前ですが、 Search Engine Optimization は meta タグ設定したくらいでは良くなるとは思っていないので、どちらかと言うと Twitter 等でリンクシェアしてもらった時にきれいなリンクカードが展開されてほしいという考えから入れました。

## Open Graph Protocol

OGP(Open Graph Protocol) は Facebook が策定した meta タグの埋め込み方のルールです。ルールに沿って HTML に meta タグを埋め込むことで、他のサイトや Web サービスが同じ meta データを取得することができ、リッチなリンクカードの表示にデータを使用してもらえたりします。このブログのリンクがカード形式になっているのも、OGP のおかげです。

OGP には必須のプロパティがあります。(以前はこれを知らずに含めていないプロパティがありました…)

- `og:title`
- `og:type`
- `og:image`
- `og:url`

さらに `og:type` の値によっては追加で必須になるプロパティも存在します。詳しくは公式ドキュメントを御覧ください。

https://ogp.me/

このサイトはブログサイトなので、 `og:type` が `"article"` と `"website"` だけを指定できれば十分です。プロフィールページを作ったら `profile` が指定できるようにまた改修します。

## SEO コンポーネント

next-seo から export されている `NextSeo` コンポーネントは受け取る `props` が多く、そのまま各ページで使うには記述が煩雑になりそうでした。

なので `NextSeo` をラップした独自の `SEO` コンポーネントを宣言して、各ページで使用します。 `SEO` コンポーネントは `NextSeo` に比べて `props` の数を大幅に絞っており、コンポーネントとして扱いやすくなっているのではないでしょうか。

型定義は以下のようにしました。

```tsx
type BaseProps = {
  pagePath: string;
  title?: string;
  description?: string;
  noindex?: boolean;
};

type ForWebsiteProps = {
  type: "website";
  publishedTime?: undefined;
  modifiedTime?: undefined;
  tags?: undefined;
};

type ForArticleProps = {
  type: "article";
  publishedTime: string;
  modifiedTime: string | undefined;
  tags: string[];
};

export const SEO: React.VFC<BaseProps & (ForWebsiteProps | ForArticleProps)> = {...};
```

`BaseProps` は全画面で必須のプロパティです。 `ForWebsiteProps` と `ForArticleProps` は `<meta property="og:type">` の値によって必須にするかしないかが決まるプロパティになります。

前節で触れたとおり、 `og:type` によって指定できるプロパティが変化します。それを TypeScript の Discriminated Union で条件付きの必須を表現しました。

実装はこんな感じです。

```tsx
export const SEO: React.VFC<BaseProps & (ForWebsiteProps | ForArticleProps)> = ({
  type,
  pagePath,
  title,
  description,
  noindex,
  publishedTime,
  modifiedTime,
  tags,
}) => {
  const siteTitle = config.siteTitle;

  return (
    <NextSeo
      title={title}
      titleTemplate={`%s | ${siteTitle}`}
      defaultTitle={siteTitle}
      noindex={noindex}
      twitter={{
        cardType: "summary_large_image",
        handle: `@${config.social.twitter}`,
      }}
      openGraph={{
        type: type,
        url: config.siteUrl + pagePath,
        title: title,
        description: description,
        site_name: siteTitle,
        images: [
          {
            url: config.siteUrl + staticPath.images.ogimage_png,
            width: 1200,
            height: 630,
          },
        ],
        article:
          type === "article"
            ? {
                authors: [`https://twitter.com/${config.social.twitter}`],
                publishedTime: publishedTime,
                modifiedTime: modifiedTime,
                tags: tags,
              }
            : undefined,
      }}
    />
  );
};
```

`config` オブジェクトは SNS のユーザー名やこのサイトがデプロイされている URL の文字列を持っている定数です。どう考えても環境変数 `proccess.env` に持たせたほうがいいと思います。

`props` を `NextSeo` に渡すだけで特殊な処理はしません。 `title` と `openGraph.title` など重複する項目がいくつかあるので、同じ `props` が渡るようにしています。

他に `NextSeo` の `props` として指定できるものは公式の README を参考にしてください。

https://github.com/garmeeh/next-seo#next-seo

## まとめ

このブログサイトに next-seo を導入しつつ、 OGP をちゃんと調べたよというお話でした。

必須プロパティくらいはちゃんと埋めような！
