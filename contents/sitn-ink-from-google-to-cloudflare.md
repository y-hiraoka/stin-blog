---
title: "stin.ink を Google Domains から Cloudflare Register に移管した"
createdAt: "2023-12-02T16:08:22.846Z"
tags: ["cloudflare", "雑記"]
---

## Cloudflare Register に移管した

このブログもサブドメインとして使用されている `stin.ink` は、僕が持つ唯一のドメインです。Google Domains で取得して、色々サブドメインを生やして使っています。

半年ほど前ですが、Google Domains がサービスを終了して事業譲渡されることが発表されていました。悲しい。Google アカウントひとつでドメインが取れたので便利に思い、Google Domains で購入することを決意したのですが、サ終するなら仕方ありません。

そして今日(2023/12/02) Google Domains から更新日のお知らせメールが届いて移管しておかないといけないことを思い出しました。

何もしなくても譲渡先の Squarespace に移管されるようですが、Squarespace は使う予定がなく、ドメインを持つためだけに利用するのも嫌だったので別のサービスを検討しました。ちょうど Google Domains がサービス終了を宣言したとき、移管先は Cloudflare Register がいいと噂が上がっていたので第一候補ではありました。

ところで最近 Cloudflare を使った構成を試してみたいと思っていました。Cloud Run のようなコンテナサービスにフル SSR する Next.js を置いて、それを覆う CDN として Cloudflare を使った構成です。Next.js をとりあえず Vercel にデプロイしてばかりだったので、いろんなスタックを試したいですね。

## 移管で困ったこと

Google Domains も Cloudflare も管理画面は問題なく操作できたのですが、最後の最後に Cloudflare に英文の決済エラーが出て進めませんでした。

> An error occurred while processing the payment hold.

ナンノコッチャさっぱりです。Google で検索しても Cloudflare のコミュニティサイトで「個別対応するから」って回答されているだけでした。

頭を抱えていたんですが、きっと同じ現象に遭遇して嘆いている人がいるだろうと思って Twitter で検索してみたら情報が得られました。どうやら Cloudflare で楽天カードを使って決済しようとすると失敗するらしいです…。同じ現象を綴ったブログを複数見つけたので本当にそうなんだろうと思い、仕方なく PayPal のアカウントを作って決済しました。無事に移管できました。

同じ人が困らないために、僕もこの記事が読まれることを願っています。 An error occurred while processing the payment hold. で検索されたらヒットしてくれ。楽天カードに気をつけろ。

## Google Domains の便利なところ

Google Domains でドメインを所有していると、ドメインの入力を求められる Google のサービスで所有権チェックを自動でパスできました。例えば Search Console や Google Analytics などです。

Cloudflare では当然できないと思うので、今後はちょっとだけ手間が増えますね。TXT レコードとか挿入することになるんだろうか。 head に meta タグ？わからん。

## まとめ

`stin.ink` を Google Domains から Cloudflare Register に無事移管できました。楽天カードを使っている人は PayPal を Cloudflare に登録しましょう…。

Cloudflare はどんどん活用していきたいですね。このブログも Vercel から載せ替えようかな。

それでは！
