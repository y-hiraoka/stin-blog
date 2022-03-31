---
title: "Twitter シェアボタン React 作り方"
createdAt: "2022-03-31T10:43:24.084Z"
tags: ["twitter", "react"]
---

# Twitter のシェアボタンをブログに設置しました

記事ページの下部に Twitter のシェアボタンと Buy me a coffee のリンクを設置しました！

Twitter のシェアボタンを作るに当たって考えたことを書いていきます。

## コード

https://github.com/y-hiraoka/stin-blog/blob/3cb5723ac58d4cf4a8b083d83a952ada6b27ed9e/src/components/shared/TwitterIntentTweet.tsx

## 実体はただの `a` 要素

Twitter のシェアボタンはクリックしてもらうと Twitter のサイト(ネイティブアプリをインストールしているスマホならアプリ)が開き、投稿画面にシェアするテキストやサイトの URL が入力された状態になります。

シェアボタンの実体はただの `a` 要素になっていて、 `href` に Twitter のシェア用 URL を指定しておくと、遷移先で Twitter がよしなにやってくれます。

「よしなに」の内容は、 `href` に付いているクエリパラメータを参照してツイートのテキストやハッシュタグ、URL などを投稿画面にセットしてくれることですね。

どの URL にリンクすべきかや、どんなクエリパラメータを受け付けてくれるのかは、次のドキュメントページに記載があります。

https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent

例えば https://twitter.com/intent/tweet?text=hoge を開くと、「hoge」 と入力された Twitter の投稿画面が開くと言った具合です。簡単ですね。

他には `hashtags` なんかは `,` 区切りで複数指定できるようです。 https://twitter.com/intent/tweet?hashtags=foo,bar,baz を開いてみると、 「#foo #bar #baz」と入力された投稿画面が開きます。

ということで、 https://twitter.com/intent/tweet?text=hoge のような URL を `href` に指定した `a` タグをおいておくだけでいいということがわかりました。

## React コンポーネントに落とし込む

ここから React コンポーネントに落とし込むことを考えます。コンポーネント名は、リンクの URL を参考に `TwitterIntentTweet` としました。

### `Props` 型定義

前節で説明したように、実体はただの `a` 要素なので、コンポーネントからは `a` が `return` されます。なので `a` が受け取れる `props` は同様にすべて受け取れるようにしておきたいですね。しかし、 `href` には決まった URL が渡されるため、 `href` は含まないようにしたいです。それと、これは好みですが(ドメイン違いのリンクは新規タブで開いてほしい) `target="_blank"`, `rel="noopener noreferrer"` も強制したいので渡されないようにします。これを実現するのが、 `React.ComponentProps` と `Omit` の組み合わせです。 (ちょうど先日 [Takepepe さんも記事](https://zenn.dev/takepepe/articles/atoms-type-definitions)を書いていましたね)

```tsx
type TwitterIntentTweetProps = Omit<ComponentProps<"a">, "href" | "target" | "rel">;
```

`ComponentProps<"a">` で `a` タグに渡すことができる `props` の型を取得します。そこから `Omit` を使って `"href" | "target" | "rel"` のプロパティだけを除外します。

また、URL のクエリパラメータに渡す値も `props` 経由で受け取りたいですね。上で決まった `Props` とクエリパラメータの分の `Props` をマージします。ドキュメントを参考に、名前と型を指定していきます。

```tsx
type TwitterIntentTweetProps = {
  text?: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  related?: string[];
  in_reply_to?: string;
} & Omit<ComponentProps<"a">, "href" | "target" | "rel">;
```

クエリパラメータに渡る予定の値たちはすべてオプショナルになっています。これは意図通りで、実際にクエリパラメータなしでもツイート投稿画面は開きます(もちろん何も初期値が入らないので意味はありません)。

これが `TwitterIntentTweetProps` の完成形になります。

### コンポーネントの内部実装

`Props` の型定義が決まったので続いて内部実装に入ります。

まず前提として、 `a` 要素が返されることを意図していましたね。つまり `href` 等が渡せないこと以外は通常の `a` 要素と同様の振る舞いをしてほしいです。 `ref` オブジェクトに関しても同様です。

Function Component は何もしないと `ref` を渡せないようになっています。明示的に渡せるようにするためには `forwardRef` 関数でコンポーネントを定義します。

```tsx
export const TwitterIntentTweet = forwardRef<HTMLAnchorElement, TwitterIntentTweetProps>(...);
```

これで実 DOM である `HTMLAnchorElement` の参照を掴むための `ref` を受け取れるようになります。

`props` は分割代入によってクエリパラメータに渡すものと `a` タグに直接渡すものを分割しておきます。

```tsx
export const TwitterIntentTweet = forwardRef<HTMLAnchorElement, TwitterIntentTweetProps>(
  (
    { text, url, hashtags, via, related, in_reply_to, ...intrinsicProps },
    forwardedRef,
  ) => {},
);
```

受け取ったクエリパラメータ用の `props` からシェア用のリンクを組み立てます。ここで使えるのが `URL` クラスです。

```tsx
const _url = new URL("https://twitter.com/intent/tweet");

if (text !== undefined) _url.searchParams.set("text", text);
if (url !== undefined) _url.searchParams.set("url", url);
if (hashtags !== undefined) _url.searchParams.set("hashtags", hashtags.join(","));
if (via !== undefined) _url.searchParams.set("via", via);
if (related !== undefined) _url.searchParams.set("related", related.join(","));
if (in_reply_to !== undefined) _url.searchParams.set("in_reply_to", in_reply_to);
```

各クエリパラメータはオプショナルなので、 `undefined` の可能性を排除した上で `_url.searchParams` に set していきます。 `undefined` を排除しないと `?text=undefined` のような URL ができてしまいます。~~マジでクソ仕様なんだが~~

そして最後に `a` 要素を `return` します。

```tsx
export const TwitterIntentTweet = forwardRef<HTMLAnchorElement, TwitterIntentTweetProps>(
  (
    { text, url, hashtags, via, related, in_reply_to, ...intrinsicProps },
    forwardedRef,
  ) => {
    const _url = new URL("https://twitter.com/intent/tweet");

    if (text !== undefined) _url.searchParams.set("text", text);
    if (url !== undefined) _url.searchParams.set("url", url);
    if (hashtags !== undefined) _url.searchParams.set("hashtags", hashtags.join(","));
    if (via !== undefined) _url.searchParams.set("via", via);
    if (related !== undefined) _url.searchParams.set("related", related.join(","));
    if (in_reply_to !== undefined) _url.searchParams.set("in_reply_to", in_reply_to);

    return (
      <a
        ref={forwardedRef}
        href={_url.toString()}
        target="_blank"
        rel="noopener noreferrer"
        {...intrinsicProps}
      />
    );
  },
);
```

`URL` のインスタンスで `toString()` を呼び出せば目的の URL が得られます。それを `href` に渡します。 `forwardedRef` や `target`, `rel` も忘れず指定しましょう。

分割代入で `a` の `props` 用に避けておいた `intrinsicProps` はスプレッド構文によって一括で渡すことができます。

以上で Twitter のシェアボタンを生成するための `TwitterIntentTweet` コンポーネント完成です！

## `TwitterIntentTweet` を使う

`TwitterIntentTweet` が(レンダリング結果、渡せる `props` 含め)ただの `a` 要素にこだわってきたのには理由があります。それは移植性の高さです。

簡単に言えばコピペで他のプロジェクトで使い回せるということですね。責務がシェア用のリンクを生成することだけに絞られているので、脳死で使い回すことができます。

また、このブログサイトは ChakraUI によってスタイリングされています。 ChakraUI と `TwitterIntentTweet` を組み合わせるには下記のようなコードで書きます。

```tsx
<Button
  as={TwitterIntentTweet}
  text="記事を読んだ！"
  url="https://blog.stin.ink"
  hashtags={["react", "nextjs"]}
  colorScheme="twitter">
  記事をシェアする！
</Button>
```

ChakraUI の `as` を使うと、 `TwitterIntentTweet` で生成した `a` 要素に ChakraUI の `Button` がスタイリングする、といったコンポーネントの融合のような挙動が実現できます。

ChakraUI を使っていなくても、 `a` 要素と全く同様に使えるため、 `className` を与える使い方もできるでしょう。

```tsx
<TwitterIntentTweet className="share-button">記事をシェア</TwitterIntentTweet>
```

このブログサイトで実際に使っている箇所はこちらです ↓

https://github.com/y-hiraoka/stin-blog/blob/3cb5723ac58d4cf4a8b083d83a952ada6b27ed9e/src/components/pages/Article.tsx#L76-L85

## まとめ

Twitter のシェアボタンを React で作る方法を紹介しました。

`href` を渡しただけの `a` 要素を生成するだけに限ることで、使い回しの効くコードになります。

## FAQ

- **Buy me a coffee のリンク貼ってるけどあなたの記事に価値はありますか？**

  すみませんでした。

- **コンポーネントにしなくても `getTweetShareURL(params):string` のような純粋関数でいいのでは？**

  それな。（書き終えてから気づきました）
