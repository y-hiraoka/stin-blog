---
title: "Google AdSense を Next.js 製ブログに入れるのに一手間かかる話"
createdAt: "2022-05-15T15:55:30.780Z"
tags: ["nextjs", "adsense"]
---

# ブログに広告を入れてみたので許してください

ブログにちょっとでも広告収入あると嬉しいなと思っていたものの、Adsense は審査が厳しいと聞いていたので手を出していませんでした。でもふとダメ元で申請してみたらなんと承認されて広告を貼り付けられるようになったので導入しました。煩わしく感じない程度の広告数にしておくのでどうかお許しを…。

## 導入までの流れ

「すてぃんのブログ」はドメインが `blog.stin.ink` です。Adsense はサブドメインの申請を拒否するので、 `stin.ink` で申請する必要があります(これも Adsense に手を出していなかった理由の一つです)。

一方 [stin.ink](https://stin.ink) は自己紹介ページと位置づけています。なので有益なコンテンツはほとんどありません。一応ブログサイトまでのリンクは貼り付けているので、辿って読み込んでもらえたのかもしれませんが。

とにかく、Adsense の申請は `stin.ink` で提出せざるを得なかったのでそちらで提出しました。~~なぜか~~めでたく通過して、Adsense の管理画面でサブドメインを登録するところがあったので、 `blog.stin.ink` を登録して運用開始です。

## ソースコードの編集

### ads.txt 配信

Adsense の管理画面から `ads.txt` をダウンロードして `https://blog.stin.ink/ads.txt` で配信するようにします。なんのためのファイルかは知りません(？)。なにやら収益を横取りされないようにするとかなんとか書いてありました。 User Generated なサイトだと重要になったりするんですかね？アドテクなんもわからん。

### 広告コードを挿入する

ブログの広告を挿入したい箇所に広告コードを挿入します。AdSense の管理画面で広告ユニットを作成すると HTML が生成されます。これを貼り付ける…前に。

このブログサイトは Next.js 製です。Next.js の `Link` コンポーネントによるページ遷移は、ブラウザによる全画面ロードを停止させて代わりに JSON を取得して JavaScript で画面を書き換えます(つまり SPA)。そのまま広告の HTML を貼り付けるだけではダメな気がしてググってみると、やっぱりひと手間必要らしいです。

[https://b.0218.jp/202104021830.html](https://b.0218.jp/202104021830.html)

[https://imatomix.com/imatomix/notes/1637308371772](https://imatomix.com/imatomix/notes/1637308371772)

ということで先人の知恵を借りて自分も実装していきます。(AdSense のヘルプに SPA で使う場合の注意点とか、Next.js リポジトリの examples にコード例とか、あると思ったけど意外となかった)

AdSense 管理画面のコード生成ツールからコピペできる広告ユニットの HTML は次のようなものです。

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_PUBLISHER_ID"
  crossorigin="anonymous"
></script>
<!-- スクエアの広告 -->
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="YOUR_PUBLISHER_ID"
  data-ad-slot="9999999999"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

「スクエアの広告」というコメントの前の script 要素で指定されている `adsbygoogle.js` は Web サイト全体で一度だけ読み込まれていればいいようです(「スクエアの広告」は僕がつけた広告ユニットの名前です)。これだけ切り取って、 `pages/_document.tsx` で読み込むようにします。

```tsx
// import 省略
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_PUBLISHER_ID"
            crossOrigin="anonymous"
          />
          {/* 省略 */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

ins 要素の部分は JavaScript によって広告に変換される要素ですかね。これを React コンポーネントにしておきます(`<div>` で括った理由は後述)。

```tsx
export const AdSense: VFC = () => {
  return (
    <div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="YOUR_PUBLISHER_ID"
        data-ad-slot="999999999"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
```

ins 要素の下にある script は ins 要素を広告に変換する処理をキックしていると予想します。つまり、ページ遷移する度に再実行されてほしいコード。さきほど参考で挙げた 2 つの記事でも、URL(`asPath`) の変更を検知する `useEffect` で実行しています。

```tsx
declare global {
  var adsbygoogle: unknown[];
}

export const AdSense: VFC = () => {
  const { asPath } = useRouter();

  useEffect(() => {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error(error);
    }
  }, [asPath]);

  return <div>...</div>;
};
```

広告のスクリプトによって `window` オブジェクトに `adsbygoogle` プロパティが生やされるので、 `useEffect` でアクセスできるように `declare global {}` します。 `interface Window {}` よりこのほうが好ましいということは **[TypeScript の declare や interface Window を勘で書くのをやめる 2022](https://zenn.dev/qnighy/articles/9c4ce0f1b68350)** で学びました。

URL の変更を検知して広告を作り直すのですが、すでに広告になっているものに対して再度広告に変換する処理を適用しようとするとエラーになるようです。そのため、一度広告を DOM から削除する必要があります。これは簡単にできて、ラップしている div 要素に `key` を渡します。

```tsx
// 省略

export const AdSense: VFC = () => {
  // 省略

  return <div key={asPath}>...</div>;
};
```

このようにしておくことで、 `asPath` が変わると div 以下の実 DOM がまるっと作り直されます。その後 `useEffect` が走るので、URL の変更によって正しく広告が再読込される仕組みになるわけですね。

## Web デザインとの兼ね合い

試しに記事本文ページの、記事タイトルの下と記事終わり直後に広告を差し込んでデプロイしてみたんですが…。一気にサイトからチープな印象が漂い始めてめちゃくちゃショックを受けました…。

サイトのドメイン料くらいは賄いたくて広告を入れてみたんですが、デザインとの兼ね合いが難しいですね…。記事本文のファーストビューに広告が見えてくると本文を読む気を失くす気がしました。

とりあえず記事終わり直後の 1 箇所だけにして運用してみます。

## まとめ

Google AdSense の審査がなぜか通ったので、すてぃんのブログに広告を入れてみたというお話をしました。

Next.js のようなシングルページで稼働する Web アプリケーションでは、AdSense の導入に一手間かける必要がありました。

デザインとの兼ね合いは研究していきます…。

それではよいブログライフを！
