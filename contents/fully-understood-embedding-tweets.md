---
title: "Twitter ツイート埋め込み機能完全に理解した"
createdAt: "2022-03-25T15:25:46.747Z"
tags: ["react", "twitter"]
---

# Tweet URL を Tweet 埋め込みに変換して表示するように実装しました

Tweet の URL だけを Markdown に記述すると ↓

```txt
https://twitter.com/jack/status/20
```

Tweet 埋め込みの `iframe` が展開されるようにブログを実装しました！↓

https://twitter.com/jack/status/20

この記事では Twitter Embedded Tweets について調べたことと、それを React コンポーネントに落とし込む際に考えたことを書きたいと思います。

## 結論

React コンポーネントの実装を見たい人 ↓

https://github.com/y-hiraoka/stin-blog/blob/5c95bd1c452b79966b9d3a6a163724e44728b453/src/components/shared/EmbeddedTweet.tsx

Twitter の埋め込みツイートについて知りたい人 ↓

https://developer.twitter.com/en/docs/twitter-for-websites

## 調べたこと

このブログサイトに Tweet 表示機能を実装するに当たり、まず catnose さんの以下の記事を思い出しました。

https://zenn.dev/catnose99/articles/329d7d61968efb

ざっくり読んで軽く把握した上で、公式ドキュメントに当たります。

ウェブサイトに Twitter のウィジェット類を表示する解説は下記の URL にぶら下がる形で公開されています。

https://developer.twitter.com/en/docs/twitter-for-websites

### 一番手っ取り早い方法

Twitter の Tweet 詳細ページで三点リーダーをクリックすると、「ツイートを埋め込む」という項目があります。ここから埋め込み要素のコードをコピペできます。

例として jack さんのツイートの「ツイートを埋め込む」からコードをコピペすると次のようになっています(整形してあります)。

```html
<blockquote class="twitter-tweet">
  <p lang="en" dir="ltr">just setting up my twttr</p>
  &mdash; jack⚡️ (@jack)
  <a href="https://twitter.com/jack/status/20?ref_src=twsrc%5Etfw">March 21, 2006</a>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

これをウェブサイトに貼り付ければ、ブラウザに読み込まれて目に見える頃には `blockquote` 要素がまるっと `iframe` に置き換えられます。置き換えているのは `"https://platform.twitter.com/widgets.js"` で指定された JavaScript です(以後、このスクリプトのことを単に widgets.js と呼びます)。

widgets.js による変換後の HTML ↓

```html
<div class="twitter-tweet twitter-tweet-rendered">
  <iframe
    id="twitter-widget-1"
    src="https://platform.twitter.com/embed/Tweet.html..."></iframe>
</div>
```

しかしこの手順だと同一ページに複数個のツイートを埋め込むと、その個数分だけ widgets.js を読み込む `<script>` が挿入されることになります。それに埋め込む方法があまりに面倒。 URL だけ指定してサクッと `iframe` を表示してほしいですね。

### 複数個の script タグを回避する

これについては公式が方法を提示してくれています(catnose さんの記事でも言及されています)。

https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites

次のスクリプトを 1 度だけ実行すればいいです。

```html
<script>
  window.twttr = (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function (f) {
      t._e.push(f);
    };

    return t;
  })(document, "script", "twitter-wjs");
</script>
```

このスクリプトを `<head>` に配置しておけば、後から widgets.js を読み込んだとしても実行されません。ただし、このスクリプトを読み込んだ後に動的に追加された `blockquote` に関しては置換されずに放置されてしまいます。

その場合は、 widgets.js のロードによって生成された `twttr.widgets.load()` 関数を実行します。この関数は `document.body` の中から `<blockquote class="twitter-tweet">` を探して `iframe` に置き換えていきます(widgets.js ロード時に置き換えが発生するのもこの関数の実行によるものでしょう)。

`document.body` は範囲が広すぎるので特定の要素の中だけの探索に限定したいという場合は、 `twttr.widgets.load(target)` のように引数に `Element` を渡します。

https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-loading-and-initialization

### 埋め込み要素をカスタマイズする

`blockquote` に予め決められた `data-*` 属性を渡しておくことで、 `iframe` 内の見た目や言語を指定できます。どんな `data-*` 属性があるかは次のリンク先のページに一覧されています。

https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/embedded-tweet-parameter-reference

```html
<blockquote class="twitter-tweet" data-lang="ja" data-theme="dark">
  <p lang="en" dir="ltr">just setting up my twttr</p>
  &mdash; Jack (@jack) <a href="https://twitter.com/jack/status/20">March 21, 2006</a>
</blockquote>
```

### その他の方法

他にも widgets.js を読み込むことで生成される `twttr.widgets.createTweet` を使うことで iframe を生成することができますが、 `blockquote` を用意しておき `twttr.widgets.load` を実行することでできるものと違いがないため、 `twttr.widgets.load` だけ把握しておけば良いと思われます。

https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/scripting-factory-functions#:~:text=text%20where%20appropriate.-,Tweets,-createTweet%C2%A0takes%20the

## React コンポーネントに落とし込む

さて、ここからが本題です。

僕は React ユーザーなので、 React で扱えるようにする必要があります。毎回 `<blockquote className="twitter-tweet">` を書くのはしんどいので、使いやすいインターフェイスを備えたコンポーネント化を目指します。

### スクリプト読み込み用コンポーネント

```tsx
export const EmbeddedTweetScript: VFC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
  window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);
  
    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };
  
    return t;
  }(document, "script", "twitter-wjs"));
  `,
      }}
    />
  );
};
```

~~公式が提供してくれている効率化版のスクリプトをまるっと `script` タグの `dangerouslySetInnerHTML` にぶち込みます。React では通常の HTML のように `<script>console.log("foo")</script>` と書いてもスクリプトは実行されませんが、 `dangerouslySetInnerHTML` に文字列のスクリプトを渡すと実行してくれます(用法用量に注意)。これをアプリのルート位置 (このブログサイトは Next.js なので \_app.tsx) に差し込みます。~~

#### 追記修正

Next.js 環境では上記のコンポーネントを差し込むだけではだめでした(Chrome がよしなにやってくれていたっぽく、開発中と執筆中はまったく気づかなかった)。

次の節で紹介する React コンポーネントには「ツイートを埋め込む」でコピペする HTML とは違いスクリプトタグを含まないため、上記コードのように 1 度だけ widgets.js が読み込まれることを保証する必要なんてなかった。

Next.js 環境の場合は次のような Next.js 提供の `Script` コンポーネントを \_app.tsx に差し込むことで解決しました。

```tsx
import Script from "next/script";

<Script
  id="twitter-embed-script"
  src="https://platform.twitter.com/widgets.js"
  strategy="beforeInteractive"
/>;
```

`strategy="beforeInteractive` によってページが操作可能になる前にスクリプトを読み込むことを指定します([参照](https://nextjs.org/docs/api-reference/next/script))。

完全に理解したと宣言した人らしく、全然理解していませんでした。（追記終わり）

### `iframe` になるコンポーネント

こちらはまずインターフェイスから考えます。

React のコンポーネントなので、 `props` でツイートの URL を指定することで `iframe` になることを期待するのではないでしょうか。

```tsx
const App = () => {
  return <EmbeddedTweet url="https://twitter.com/jack/status/20" />;
};
```

また、 `<blockquote>` の `data-*` 属性で渡す予定のパラメーターもオプショナルな `props` として受け付けてもらえると便利です。

```tsx
const App = () => {
  return (
    <EmbeddedTweet
      url="https://twitter.com/jack/status/20"
      theme="dark"
      align="center"
      lang="ja"
    />
  );
};
```

ということで、型定義は次のようになります。

```tsx
type EmbeddedTweetProps = {
  url: string;
  id?: number;
  cards?: "hidden";
  conversation?: "none";
  theme?: "light" | "dark";
  width?: number;
  align?: "left" | "right" | "center";
  lang?: string;
  dnt?: true;
};

const EmbeddedTweet:VFC<EmbeddedTweetProps> = (props) => { ... }
```

`EmbeddedTweet` コンポーネントは `blockquote` を返しますが、その内側の要素には `url` を持った `a` タグを起きます。「ツイートを埋め込む」でコピーされる HTML には `p` タグも含まれますが実は必須では有りません(ただし `iframe` に変換される前は画面に描画されるため、予測可能な UI の提供という観点ではあるべきかもしれません)。

それでは実装しましょう。

```tsx
export const EmbeddedTweet: VFC<EmbeddedTweetProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current !== null) {
      twttr.widgets.load(rootRef.current);
    }
  }, []);

  return (
    <div ref={rootRef}>
      <blockquote
        className="twitter-tweet"
        data-id={props.id}
        data-cards={props.cards}
        data-conversation={props.conversation}
        data-theme={props.theme}
        data-width={props.width}
        data-align={props.align}
        data-lang={props.lang}
        data-dnt={props.dnt}>
        <a href={props.url} target="_blank" rel="noreferrer noopener">
          {props.url}
        </a>
      </blockquote>
    </div>
  );
};
```

`className="twitter-tweet"` を渡した `blockquote` の内側に、 `href={props.url}` を渡した `a` タグを置いています。また、 `blockquote` には先程紹介したパラメーターが `data-*` 属性で渡されています。

`blockquote` を `div` で囲い、その実 DOM を `useRef` で掴んでいます。 マウント後に実行される `useEffect` 内で `twttr.widgets.load(rootRef.current)` によって無駄な探索なしに `blockquote` を `iframe` に変換してもらえます。

これでひとまずは埋め込みツイートが表示されます。

しかしこれだと React 的ではない問題を孕んでいます。 `props` を変更しても再描画されないということです。

`props` は `blockquote` にアタッチされていますが、 `useEffect` 実行後は `twttr.widgets.load` の効果で `blockquote` は消えて `iframe` になっています。しかしこの変更を React は把握していません。React が管理している仮想 DOM は `<blockquote>` が生きていると信じ込んでいます。

その状態で `props` が変更されると(`theme="light"` から `theme="dark"` に変更されたとしましょう)、仮想 DOM 上は `<blockquote data-theme="light">` から `<blockquote data-theme="dark">` の変更なので、 React は差分から `blockquote.setAttribute("data-theme", "dark")` を実行しようとするでしょう。しかしその頃には `blockquote` の実 DOM は存在しないため、その更新に失敗します(厳密には DOM ツリーから外れただけでインスタンスとしては残っているので画面外で成功している)。よって `props` の変更は見た目の変更を発生させません。

これを解決するには、 `props` が変更されたら実 DOM から消えていた `blockquote` を復活させた後、再度 `twttr.widgets.load()` を実行する必要があります。

では消えた実 DOM はどうやって復活させればいいのでしょう？ `key` を変化させればいいのですね。

```tsx
export const EmbeddedTweet: VFC<EmbeddedTweetProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const key = JSON.stringify(props);

  useEffect(() => {
    if (rootRef.current !== null) {
      twttr.widgets.load(rootRef.current);
    }
  }, [key]);

  return (
    <div ref={rootRef} key={key}>
      {/* 属性一部省略 */}
      <blockquote className="twitter-tweet" data-id={props.id} data-dnt={props.dnt}>
        <a href={props.url} target="_blank" rel="noreferrer noopener">
          {props.url}
        </a>
      </blockquote>
    </div>
  );
};
```

`key` は配列から `JSX.Element` を生成する際に指定しますが、ある要素やその子要素を強制的に作り直すようなケースでも利用可能です。

今回の場合、 `props` をまるっと文字列化した値を最上位要素の `div` に渡しているため、 `props` の変化を検知して `blockquote` も作り直されます。そして実 DOM に反映された後、同じく `props` を文字列化した `key` の変化を検知して発火する `useEffect` によって `twttr.widgets.load` が実行され、 `blockquote` が `iframe` に変換されます。

この実装によって React コンポーネントらしく `props` の変化に従って再レンダリングが行われる様になりました(`blockquote` から作り直しなのでちらついてしまうのはご愛嬌)。

この `key` を使ったテクニックは、この Twitter のケースだけでなく、jQuery などの仮想 DOM をスルーして実 DOM を破壊してくる様々なライブラリに応用できそうですね(絶対にやりたくないですが)。

## `EmbeddedTweet` を使う

実装した `EmbeddedTweet` コンポーネントを Markdown の変換に使いましょう。

リンクカードを表示している箇所で `href` が `"twitter.com/:user_name/status/:tweet_id"` を指していたら、リンクカードの代わりに `EmbeddedTweet` を返すようにするだけです。

https://github.com/y-hiraoka/stin-blog/blob/986d9623d2364beb67decec7a432bf0fcc34eb4b/src/components/shared/MarkdownRenderer.tsx#L151-L160

このブログサイトは Chakra UI の theming 機能によってライトモード・ダークモードの切り替えができるようになっているため、 `useColorMode` で取得した値を `theme` に渡しておきました。僕の一番伸びたツイートを貼り付けておくので(?)、ページ右上のモード切り替えボタンをクリックして埋め込みツイートのカラーテーマも切り替わることを確認してみてください。

https://twitter.com/stin_factory/status/1220323305829195781

## まとめ

Twitter のツイートを埋め込む機能を実装するに当たって調べたことと、React コンポーネントに落とし込む方法を紹介しました。

ちなみに、 npm にはツイートを埋め込む React 用ライブラリがいくつか存在するので自作する必要はなさそうです(？)

https://developer.twitter.com/en/docs/twitter-for-websites/tools-and-libraries

Instagram などの他のサービスの埋め込みも頑張って作ります〜。

それではまた！
