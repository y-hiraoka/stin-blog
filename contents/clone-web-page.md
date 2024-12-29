---
title: "指定したWebページを動く状態でクローンする方法"
createdAt: "2024-12-29T10:01:15.082Z"
tags: ["wget"]
---

ふと、指定したURLのWebページをクローンして別の環境で再現する方法がないかと考えました。

HTMLとそれが参照するCSS, JavaScript, 画像ファイルなどをダウンロードして保存しておき、静的ファイルとして配信すれば同じWebページを再現できるはずです。

## wget を使う

wgetコマンドを使えば、HTMLと付随するファイルを一括でダウンロードできることを知りました。

まだwgetをインストールしてない場合はHomebrewでインストールできます。

```sh
brew install wget
```

例えば `https://zenn.dev` のWebページをクローンする場合、次のようにコマンドを実行します。

```sh
wget --convert-links --page-requisites --no-parent --adjust-extension -e robots=off --span-hosts --no-host-directories https://zenn.dev
```

このコマンドを実行すると、指定したURLのWebページを再帰的にダウンロードしてくれます。

`--page-requisites` オプションが、HTMLが参照している他のリソースも同時に取得することを意味しています。`--convert-links` によって、HTML内のリンクをローカルファイルに変換してくれます。

`--span-hosts`によって別のホストにあるリソースもダウンロードします。サイトによっては静的ファイルに別のドメインを割り当てていることもあるためです。

デフォルトではドメインごとにディレクトリを作成するのですが、`--no-host-directories`オプションを指定することですべてのファイルをカレントディレクトリに保存していきます。

もし個人認証が必要なページをクローンするときは `--headers` オプションでCookieを指定するなども可能です。

このコマンドによって次のようなディレクトリが作成されます(一部省略。ディレクトリ構成はHTMLが参照するファイルに依存します)。

```
.
├── _next
│   └── static
│       ├── chunks
├── a
│   └── AGNmyxYXmR9IioXsFRjmCTlq_eKpoLXuNyTaxFfRkfnhkA=s96-c
├── a-
│   └── AOh14GjWnn1oFQ-k4F8hThOoPDlfnD4_CJWUc9OTIcC2=s96-c
├── default-avatars
│   └── dark
│       └── y.png
├── fonts
│   └── inter-v3-latin-700.woff2
├── gtag
│   └── js
├── images
│   └── logo-transparent.png
├── index.html
├── js
│   └── listen-embed-event.js
├── manifest.json
├── permanent
│   └── hackathon
│       └── 2024-google-cloud-japan-ai-hackathon
│           └── bannerIcon.png
└── zenn
    └── image
        └── fetch
            ├── s--wHe5R2uy--
            │   └── c_limit,f_auto,fl_progressive,q_auto,w_70
            │       └── https:
            │           └── storage.googleapis.com
            │               └── zenn-user-upload
            │                   └── avatar
            │                       └── 4c19e0aac4.jpeg
            └── s--wx1ypgRS--
                └── c_limit,f_auto,fl_progressive,q_auto,w_70
                    └── https:
                        └── storage.googleapis.com
                            └── zenn-user-upload
                                └── avatar
                                    └── 02cde43f9e.jpeg
```

HTMLファイルやCSS、JavaScriptなどがダウンロードされていることがわかります。

このディレクトリを静的ファイルとしてHTTP配信すれば、Webページとして機能させることができます。

## 静的ファイルとして配信する

例えばローカルでWebページとして表示確認するには、Vercelが提供している`serve`コマンドが便利です。

```sh
npx serve
```

これで`http://localhost:3000`でクローンしたWebページが表示されます。

同様に、ディレクトリを丸ごとHTTP配信してくれるサービスにアップロードすればインターネットに公開することもできます。例えば次のようなサービス。

- Vercel
- GitHub Pages
- Cloudflare Pages

インターネットに公開するときは著作権的なやつに気をつけよう。

## まとめ

wget で指定したURLのWebページを再帰的にダウンロードできます。それを`npx serve`などで静的ファイルとして配信することで、Webページとして再現できます。

HTMLファイルではなくちゃんとCSSやJavaScriptも含めてクローンするので、ちゃんと動いた状態のWebページが再現できますね。
