---
title: "見た目が同じなだけのコンポーネントを共通化すべきでない"
createdAt: "2022-05-14T02:31:47.452Z"
tags: ["react"]
---

# WET is better than DRY

https://twitter.com/stin_factory/status/1522521205080989696

こんなツイートをしたらちょっと反響がありました。

> 大した事ないツイートがプチバズりしているの不思議

ではありますが、みんな似た経験をしているのでしょう。

本記事では、このツイートの裏にある自分の考え方を書き残しておきます。

## とあるアプリの初期デザインとその実装

著者リストと記事リストのデザインが次の画像のようになっているとします。

![著者リストと記事リストのデザインサンプル](/images/contents/write-everything-twice-in-react/design-example.png)

それぞれのリストアイテムには、サムネイル・太字のテキスト・小さいテキストがありますが、それらは**内容が異なるだけでまったく同じ CSS で表現できる**ようになっています。これは同じコンポーネントで実装できるんじゃないかと次のようなコードを書くかもしれません。

```tsx
import styles from "./card.module.css";

export const Card: FC<{
  image: string;
  name: string;
  description: string;
}> = ({ image, name, description }) => {
  return (
    <div className={styles.card}>
      <div className={styles.image}>
        <img alt={name} src={image} />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};
```

`image`, `name`, `description` を props として受け取る `Card` コンポーネントを作りました。このコンポーネントは `card.module.css` でスタイリングされています。

著者リストや記事リストのアイテムは次のように `Card` に props の値を流し込むことで実装できるでしょう。

```tsx
 // 著者リストのアイテム
 <Card
   image={author.iconUrl}
   name={author.displayName}
   description={author.description}
 />

 // 記事リストのアイテム
 <Card
   image={article.thumbnailUrl}
   name={article.title}
   description={article.description}
 />
```

## デザインが変更されて別物になる

しばらく運用した後、デザインを変更しようという話になります。例えば次のような変更点が挙げられるとします。

- 著者リストのサムネイル画像は円形切り抜きがいい
- 記事リストには投稿日も表示したい
- 著者リストには個人サイトへのリンクが欲しい
- 記事リストはいいねの数もほしい

なんということでしょう。もはや同じ見た目ではなくなってしまいますが、すでに共通化して実装されているため、共通化されたまま修正してしまいがちです。

```tsx
import styles from "./card.module.css";

export const Card: FC<{
  image: string;
  isImageRounded: boolean;
  name: string;
  description: string;
  url?: string;
  postedAt?: string;
  likeCount?: number;
}> = ({ image, isImageRounded, name, description, url, postedAt, likeCount }) => {
  return (
    <div className={styles.card}>
      <div className={styles.image} data-is-rounded={isImageRounded}>
        <img alt={name} src={image} />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.description}>{description}</p>
        {url && <p className={styles.url}>{url}</p>}
        {postedAt && <p className={styles.postedAt}>投稿日: {postedAt}</p>}
        {likeCount && <p className={styles.likeCount}>いいね数: {likeCount}</p>}
      </div>
    </div>
  );
};
```

特定の props に値を渡されたらそれを表示するというような書き方で、分岐だらけになっています。サムネイルが円形かどうかは、boolean フラグを渡すことでスタイルを制御しようとしています。かなりナンセンスです。

このコンポーネントは内部実装がゴチャゴチャしているだけでなく、使う側を混乱させます。

```tsx
<Card
  image={author.iconUrl}
  isImageRounded
  name={author.displayName}
  description={author.description}
  // 著者リストアイテムなのにサイトURLを undefined にできてしまう！！！
  url={undefined}
  // 著者リストアイテムなのに投稿日を雑に入れられてしまう！！！
  postedAt={new Date().toISOString()}
/>

<Card
  image={article.thumbnailUrl}
  // 記事リストアイテムなのに isImageRounded を指定できてしまう！！！
  isImageRounded
  name={article.title}
  description={article.description}
  postedAt={article.postedAt}
  // 記事リストアイテムなのにいいねの数を undefined にできてしまう！！！
  likeCount={undefined}
/>
```

これでは神クラスならぬ**神コンポーネント**です。なぜこんなことになってしまったのでしょう…。

それはこのコンポーネントが著者リストアイテムと記事リストアイテムの**両方を表示する責務を抱え込もうとしたから**ですね。

## モデル毎にコンポーネントを用意する

最初の段階でモデル毎にビューコンポーネントを用意していればこんなことにはなっていませんでした。つまり最初から次の 2 つのコンポーネントを用意します。

```tsx
import styles from "./AuthorCard.module.css";

export const AuthorCard: FC<{ author: Author }> = ({ author }) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <img alt={author.displayName} src={author.iconUrl} />
      </div>
      <div className={styles.info}>
        <p className={styles.displayName}>{author.displayName}</p>
        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};
```

```tsx
import styles from "./ArticleCard.module.css";

export const ArticleCard: FC<{ article: Article }> = ({ article }) => {
  return (
    <div className={styles.card}>
      <div className={styles.thumbnail}>
        <img alt={article.title} src={article.thumbnailUrl} />
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{article.title}</p>
        <p className={styles.description}>{article.description}</p>
      </div>
    </div>
  );
};
```

注目すべきは「まったく同じ見た目を実装しているのに異なる CSS でスタイリングしている」点です。まったく同じスタイルだからコンポーネントを共通化したくなるのをぐっと我慢して、CSS をコピペで書きます(クラス名は使用される文脈で調整します)。

このように **1 つのコンポーネントは 1 つのモデルだけをビューに変換する責務を持つようにする**と、将来のデザインの変更に対して柔軟に対応することができます。例えば「著者リストのサムネイル画像は円形切り抜きがいい」という修正要望に対しては `AuthorCard` だけを修正すれば達成されます。その時、神コンポーネントで発生した「記事リストアイテムなのに画像を円形にできてしまう」現象は起こり得ません。単一責務を持つようにしたことで無関係なバグを孕む可能性を排除できました。

DRY(Don't Repeat Yourself) に対して WET(Write everything twice) というアクロニムがありますが、殊 React に関して言えば、**見た目が同じだからといって DRY を適用するのは破滅への選択**です。スタイリングが同じなだけならば WET でいきましょう。共通化すべきかどうかはモデルを見て判断すべきです。

## でもやっぱり CSS が重複するのは気持ち悪い…

そうはいっても、同じ CSS を何度も書くのは嫌だと思われるかもしれません。また、フロントエンド開発ではバンドルサイズも気にすべき点で、特別なビルドツールを用意しない限りコピペされた分だけサイズが膨らんでいきます。

それを解決するには、**見た目が同じことに意味を見出すレイヤー**を設ける必要があります。つまり、**デザインシステム**とその実装である**コンポーネントライブラリ**です。

今回の例で言えば、次のような見た目を提供するコンポーネントが必要になります。

- カード型の見た目を提供する `Card`
- 正方形や円形に画像を表示する `ShapedImage`
- 子要素を縦並びに表示する `Stack`
- 子要素を横並びに表示する `HStack`
- `font-size` や `font-weight` を調整できる `Paragraph`

(名前や粒度は適当です。)

これらを組み合わせて、改めて各モデルに対応するビューコンポーネントを用意してやります。

```tsx
export const AuthorCard: FC<{ author: Author }> = ({ author }) => {
  return (
    <Card>
      <VStack>
        <ShapedImage variant="rounded" alt={author.displayName} src={author.iconUrl} />
        <Stack>
          <Paragraph fontSize="5" fontWeight="bold">
            {author.displayName}
          </Paragraph>
          <Paragraph fontSize="3">{author.description}</Paragraph>
        </Stack>
      </VStack>
    </Card>
  );
};
```

```tsx
export const ArticleCard: FC<{ article: Article }> = ({ article }) => {
  return (
    <Card>
      <VStack>
        <ShapedImage variant="square" alt={article.title} src={article.thumbnailUrl} />
        <Stack>
          <Paragraph fontSize="5" fontWeight="bold">
            {article.title}
          </Paragraph>
          <Paragraph fontSize="3">{article.description}</Paragraph>
        </Stack>
      </VStack>
    </Card>
  );
};
```

このようにすれば重複した CSS を書く必要がなく、バンドルサイズ軽減が期待できます(コンポーネントライブラリ分は増えます)。しかしあくまでモデルをビューに変換する責務を持つコンポーネントを用意することを念頭に置き、`AuthorCard` と `ArticleCard` のそれぞれでコンポーネントを作成します。

## まとめ

見た目が同じなだけのコンポーネントを共通化すべきでないという話をしてきました。

見た目が同じことを理由にコンポーネントに括りだすのはやめて、モデル単位でコンポーネントを作成すべきです。CSS の重複が気になる場合はコンポーネントライブラリという形で見た目に意味を見出したレイヤーを設けましょう。サードパーティでもいいです、おすすめは Chakra UI です。

それではよい React ライフを！
