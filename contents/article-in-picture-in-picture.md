---
title: "記事をPicture-in-Pictureで読めるようにしてみた"
createdAt: "2024-11-27T15:29:46.648Z"
tags: ["web-api"]
---

Document Picture-in-Picture APIというWeb APIがあります。まだブラウザの実装が限定的ですが、Chromeなら116から使えるようです。

https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API

Picture in Picture(以下PiP)と言えば、動画を再生しながら別のタブを開いたり別のアプリケーションを開いたりできる機能ですが、**"Document"** Picture-in-PictureはそれをHTML要素でも可能にするAPIです。最近Google MeetがこのAPIを使い始めて、別タブに移動したタイミングで勝手にPiPを表示するようになりました。なんか賛否あった気がしたけど僕は便利に使っています。決してミーティングに集中していないわけではないです、えぇ。

このブログサイトでも、Document Picture-in-Picture APIを使って記事をPiPで読めるようにしてみました。APIをサポートしているブラウザで記事詳細ページを開いているなら、記事タイトルの右下あたりにPiPに切り替えるボタンが表示されています。ボタンをクリックすると、記事だけを表示したPiPウィンドウが開きます。

この記事ではこの機能の実装方法について紹介します。

## 実装

### `documentPictureInPicture` の型定義

執筆時点で、Document Picture-in-Picture APIはまだTypeScriptの標準型定義ファイルに含まれていないようでした。そのため、適当に型を誤魔化すか型定義を自力で用意する必要があります。書く量は多くなかったので自分で用意しました。

型はちゃんと仕様を参考にしました。Document Picture-in-Picture APIの仕様はこちら。

https://wicg.github.io/document-picture-in-picture/#api

グローバルに生えているJavaScript APIに対して型定義する記述する方法は、次の記事が非常に参考になります。

https://zenn.dev/qnighy/articles/9c4ce0f1b68350#declare-global%E3%81%A8globalthis%E3%81%A8interface-window

上の仕様と記事を参考に、次のように型定義を書きました。

```ts
declare global {
  interface DocumentPictureInPictureOptions {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
    preferInitialWindowPlacement?: boolean;
  }
  interface DocumentPictureInPicture {
    requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>;
  }

  // eslint-disable-next-line no-var
  var documentPictureInPicture: DocumentPictureInPicture;
}
```

ポイントは`declare global`の内側に`var`です。

### サポートのチェック

Document Picture-in-Picture APIはまだ一部のブラウザだけで利用可能です。Webページを読み込んだブラウザがサポートしているかどうかは、`documentPictureInPicture`が存在するかどうかで判定できます。

```ts
if ("documentPictureInPicture" in window) {
  // サポートしている
} else {
  // サポートしていない
}
```

さらにサーバーサイドレンダリングによるハイドレーションミスマッチを避けるために、`useSyncExternalStore`を使ってステート管理することにしました。

```tsx
const noop = () => () => {};

export const ArticlePicureInPicture: React.FC = () => {
  const isDocumentPipSupported = useSyncExternalStore(
    noop,
    () => "documentPictureInPicture" in window,
    () => false,
  );

  return <button hidden={!isDocumentPipSupported} />;
};
```

`useSyncExternalStore`は本来、React外のステートをReactの世界のステートとして読み取るためのReactフックですが、今回はサーバーサイドレンダリング時とクライアントサイドレンダリング時が区別できるツールとして使っています。よって、第一引数は何も購読しない関数を渡しています。第二引数はクライアントサイドレンダリング時のステート取得なので`window`オブジェクトが参照可能で、第三引数はサーバーサイドレンダリング時のステート取得なので`false`固定にしています。

`useSyncExternalStore`で計算できた`isDocumentPipSupported`をボタンの`hidden`属性に指定しました。

あんまり良い使い方ではないと思いつつ、なんか有名なライブラリも`isServer`の判定に`useSyncExternalStore`を使っていた気がする。多分。

### Picture-in-Picture Windowの生成

Document Picture-in-Pictureは`iframe`などと同様にひとつのWindowオブジェクトとして扱います。`documentPictureInPicture.requestWindow`メソッドを使ってPiPのWindowを生成します。

```tsx
const pipWindow = await documentPictureInPicture.requestWindow({
  width: 320,
  height: 480,
});
```

サイズは適当です。

DOMのAPIにしては珍しく(？)非同期処理なので`await`で待機しています。

### 記事の読み込み

PiPのWindowは生成直後は空っぽで、自由にDOMを挿入できます。元ページで記事を表示している要素をそのままPiPのWindowでも表示すればよいと考えました。

記事の要素にはもともとIDを振っていたので、それを使ってDOMを取得し、PiPに挿入します。

```tsx
const articleElement = document.querySelector("#markdown-renderer")?.cloneNode(true);

if (!articleElement) return;

pipWindow.document.body.appendChild(articleElement);
```

ここで`cloneNode`を使わないと、元ページから要素を削除した上でPiPに挿入することになります。単純に移動しているだけなので、PiPを閉じても元には戻りません。`cloneNode`を使うことで元ページも維持しつつPiPにも表示できました。`cloneNode`の引数は「子孫要素を含めるかどうか」のフラグです。

### スタイルのコピー

PiPは元ページとは分離されたWindowなので、JSもCSSも分かれています。記事要素をコピーするだけでは、それに付与されたclassを色付けするCSSは存在しないということです。

次の記事を見ると、過去には`copyStyleSheets`オプションがあったようですが、仕様策定が進む間に廃止されてしまいました。

https://zenn.dev/cybozu_frontend/articles/picture-in-picture-api

ということで、ちょっと力技なのですが、元ページに存在するスタイルシートに関係する要素をまるっとコピーすることにしました。

```tsx
const styleElements = document.querySelectorAll(`link[rel="stylesheet"], style`);

const clonedStyleElements = Array.from(styleElements).map((s) => s.cloneNode(true));

pipWindow.document.head.append(...clonedStyleElements);

pipWindow.document.documentElement.dataset.colorMode =
  document.documentElement.dataset.colorMode;
```

`querySelectorAll`で元ページにある`link`要素または`style`要素を取得し、それを`cloneNode`ですべてクローンします。クローンした要素を`pipWindow`の`document.head`に追加しました。また、サイトのテーマカラーを継承するために`document.documentElement.dataset.colorMode`もコピーしました。

これでコピーしたDOM要素に対して付与されていたスタイルがPiPの中でも有効になります。`link`要素のappendは`pipWindow`内でCSSファイルの再fetchになりますが、普通は強いHTTPキャッシュが効いているはずなので問題ないでしょう。

## 使っているときのイメージ

ボタンをクリックすると次の画像のようにPiPとして小さいウインドウが開きます。PC Chromeで閲覧中の人はぜひご自身で開いてみてください。

![このサイトのこの記事をPicture-in-Pictureで開いている様子。画面上の中央にPiPが位置している。PiPのURLバーにはlocalhost:3000と書かれている](/images/contents/article-in-picture-in-picture/pip-open.png)

## 感想

ボタンをクリックしたタイミングでDOM要素をコピーしているだけなので、その瞬間の画面の状態をスナップショットのようにPiP固定します。元のタブで画面遷移をしてもPiPの中のDOMは変更されません。

元の画面の状態からPiPの状態を書き換える方法もあるようです(PiPもただのWindowなので`postMessage`を使うことになるかな？)

PiPに対してDOM操作ができるので、react-domでReactアプリをマウントしてやることも考えましたが、CSSやJSって元ページの所有物(バンドル)になるのでできなくね…？と思ってやめました。PiP内の画面をReactでいい感じに構築する方法を模索したいですなぁ。

## まとめ

Document Picture-in-Picture APIを使って記事をPiPで読めるようにしてみました。

開いたPiPに対してDOM要素をコピーすることで、ページを再現する方法を取りました。スタイルシートのコピーはちょっと力技でしたが、なんかいい感じに表示できました。

これでみなさんが別タブに移動しても僕の記事を表示し続けられてハッピーですね(？)

それでは良いWebライフを！
