---
title: "ブログの記事ページに Table of Contents を設置したので実装方法などを書く"
createdAt: "2023-11-18T13:39:20.899Z"
tags: ["react"]
---

画面幅 991px 以上で閲覧すると、記事ページの右側に目次リンクが表示されるように実装しました。

## 目次生成ライブラリ tocbot

tocbot というライブラリを使用しました。

https://tscanlin.github.io/tocbot

今までこちらのライブラリの存在を知らずに、どうやって実装しようか迷子になっていました。そこで Zenn がどのように目次を実装しているか分かるかなと思い、catnose さんが Zenn の技術について回答しているスクラップを確認してみました。

そこでまさに目次の実装方法について回答しているのを見つけ、tocbot を知ることが出来ました。

https://zenn.dev/link/comments/ac74e3336e51ad

## 使い方

tocbot はフレームワーク非依存な JavaScript ライブラリです。セレクターで指定した要素の中を走査して、見つかった見出し(`h1` 〜 `h6`)からリンクを含むリスト要素を生成してくれます。また、単に目次を構築するだけではなく、スクロール位置によって目次リンクにアクティブを示すクラスを自動で付与してくれます。

対応するDOMが用意されているときに、次のようなコードを実行するだけで目次が生成されます。

```ts
tocbot.init({
  tocSelector: `.table-of-contents`,
  contentSelector: "#article-content",
  activeLinkClass: "is-active",
  listClass: "toc-list",
  linkClass: "toc-link",
});
```

上記コード例では、`id="article-content"` の要素から見出しを探索して、見出しの階層に応じて `<ul class="toc-list">` `<li class="toc-link">` `<a>` などの要素を生成し、`class="table-of-contents"` な要素の中に目次リストを生成します。また、スクロール位置によって適切な `<a>` 要素に対して `is-active` クラスを付与します。

目次が不要になったときに実行する `tocbot.destroy()` と、目次を再生成する `tocbot.refresh()` も用意されています。

### React で使う場合

tocbot は React とは関係なく DOM を書き換えるライブラリなので、`useEffect` で処理を実行してやる必要があります。

```tsx
import tocbot from "tocbot";
import classes from "./TableOfContents.module.scss";

export const TableOfContents: FC = () => {
  useEffect(() => {
    tocbot.init({
      tocSelector: `.${classes.toc}`,
      contentSelector: "#markdown-renderer",
      activeLinkClass: classes.tocLinkActive,
      listClass: classes.tocList,
      linkClass: classes.tocLink,
      scrollSmoothDuration: 200,
      scrollSmoothOffset: -92,
    });

    return () => tocbot.destroy();
  }, []);

  return (
    <nav>
      <h2 className={classes.tocTitle}>Table of Contents</h2>
      <div className={classes.toc} />
    </nav>
  );
};
```

上記コードはこのブログの目次コンポーネントに書かれている実際のコードです。React が生成する `<div className={classes.toc} />` 要素の中身に、`useEffect` で実行した `tocbot.init()` が目次を生成してくれます。クリーンアップ関数で `tocbot.destroy()` も実行しています。

↓リポジトリのコードリンク

https://github.com/y-hiraoka/stin-blog/blob/984b3ec3e2087de4a5678afad7b7daac0b97961a/src/components/shared/TableOfContents.tsx

## 注意点

DOM を直接書き換えることと `useEffect` で呼び出すことから想像できますが、サーバーサイドではレンダリングされません。そのため、Next.js がプレビルドする HTML には目次が含まれません。ただ、目次はメインコンテンツではないのでSEO的な方面でも大した影響はないだろうと踏んでいます。

また、`useEffect` での実行になるので、一瞬空っぽのエリアが表示されてから目次がちらっと表示されます。人によってはこの現象を好ましく思わないかもしれません。僕は気にしませんが…。

## 他に検討していたこと

このブログはマークダウンで記事を書いて、 remark(react-markdown) で React コンポーネントに変換しています。そのため、目次もマークダウンから表示できないか試行錯誤していました。

remark ファミリーには remark-toc というプラグインがあります。しかしこれは**記事コンテンツの中に**目次を埋め込むための変換器で、自分がしたいようなコンテンツとは別に目次を用意することはできませんでした。

また、remark-toc が内部で利用している mdast-util-toc を直接使って、自分でマークダウンから目次データだけを取り出すことも試しました。しかし、スクロール位置でリンクをアクティブにする機能も実装することを考えたらめんどくさくなって考えることを放棄しました。

ただ、マークダウンから目次を生成する方法で自作すればプレビルドされるHTMLにも目次を含められるし、実行タイミングが原因のちらつきも防止できます。この辺にこだわる場合は mdast-util-toc や Intersection Observer API などを駆使して自作することになるでしょう。

## まとめ

ブログに Table of Contents を実装したので、使用したライブラリの紹介や悩んだことを書きました。

初めて tocbot を使いましたが、用意されている関数は3つだけでお手軽なライブラリの割に、ほしい機能は十分に揃っていて非常に良かったです。

remark での目次生成は諦めましたが、実装方法を調べる過程で remark にちょっと詳しくなったのと、unified/remark/rehype が面白くてワクワクしたので活用したいですね。

それでは良いブログライフを！
