---
title: "Cloudflare Workers Tech Talks in Tokyo #8 に参加してきたので感想を書く"
createdAt: "2026-08-27T19:46:14.512Z"
tags: ["cloudflare"]
---

こんにちは、ハロー！プロジェクトのファンです。

2026年8月27日に開催された Cloudflare Workers Tech Talks in Tokyo #8 に参加してきました。宮本佳林さんが出演するということで、行ってきました。一応僕も Web エンジニアを名乗っているので、ただのファンとしてではなく、エンジニア的興味も持って行きました。

## 総評

めちゃくちゃ楽しかったです。僕は Cloudflare をプライベートで軽く使っているだけのですが、本気で使う人達の熱量を感じてワクワクしました。

知ってるけど使ったことがないサービスの活用事例や、名前も知らないサービスをたくさん知れて非常に有意義な時間でした。

## 「全てをCloudflareで完結させる（仮）」

https://www.youtube.com/live/pDdK_gHt8fQ?si=6DTkCArx0mtl0Gkh&t=901

Cloudflare Email Service はいずれ使ってみたいですよね。AWS SES は個人開発だと申請が面倒臭そうというイメージが強い。Resend は個人開発でもとっつきやすいですが、Cloudflare Workers で開発するのであれば、Worker Bindings として使える Cloudflare Email Service のほうがより簡単かつセキュアに使えそうです(API トークンを引き渡さなくて良いという意味で)。

## 「Performance Tuning Containers - AWS Lambda MicroVMへの挑戦」

https://www.youtube.com/live/pDdK_gHt8fQ?si=AF3J3kTGXW4U8Ro8&t=1482

Cloudflare Containers もまだ使ったことがなかったので、現地で聞いているときはちょっと理解が追いつきませんでした。この感想文を書きながら、配信を見返しつつ、Cloudflare のドキュメントを読んでみて、Containers の仕組みについてちょっとわかった気がします。

Containers 内部から R2 などのを呼び出すときは Outbound Handlers という Workers を経由するのですが、そのレスポンスを Workers Cache でキャッシュしてしまおうという話でした。そうすることで Workers の実行時間も R2 からのダウンロード時間も省略でき、パフォーマンス改善できるとのこと。

Cloudflare Containers はただイメージを Cloudflare 上で起動できるだけでなく、D1 や R2 などへの容易なアクセス方法も提供しているということが学びになりました。重い処理が必要になったら思い出して使ってみよう。

## 「大企業向けSaaSを作ろうとして Cloudflare を調べたら、自分のアーキテクチャの常識が1つ壊れた」

https://www.youtube.com/live/pDdK_gHt8fQ?si=AF3J3kTGXW4U8Ro8&t=1482

Cloudflare D1 については、10GB しか扱えずクエリがシングルスレッドで実行されるというのが懸念点なのは僕も感じていました。しかし Cloudflare 的には、テナント毎に D1 インスタンスを作ることを推奨しているようです。

確かに明確なテナント境界があるなら、D1 インスタンスをテナントごとに用意してしまえば、10GB も十分足りますしシングルスレッドのボトルネックも気にならないでしょう。ただ、テナントが明確に分離されない toC サービスとかだとちょっと作りにくいのかな。あとマイグレーション管理難しそう。

## 「Laravel × Durable Objectsで実現するイベント向けライブ翻訳」

https://www.youtube.com/live/pDdK_gHt8fQ?si=NwiM14zvR38omnxr&t=2649

リアルタイム翻訳ツールを Durable Objects で実装していました。実物を使いながら発表されていたのですが、同時に180人くらいが接続しても全然遅延していませんでした。Durable Objects の性能がすごすぎる。Durable Objects の後ろにいる Translation API もめちゃくちゃ速いということですね。何を使っているか気になる。

Durable Objects も使ってみたい Cloudflare サービスの1つですね。Websocket を使ったサービス開発はインフラ構築が面倒なイメージがありますが、Durable Objects なら簡単に実装できるどころか、無料枠でも使えてしまう。ちょっとしたオンラインゲームを作るのも楽しそうです。

## 「メルカリがCloudflare Imagesを導入した話」

https://www.youtube.com/live/pDdK_gHt8fQ?si=XZysYBZFX3mNETPr&t=4193

メルカリが Cloudflare Images を導入する前は、画像配信基盤を Terraform 使わずに画面からの設定で管理していたらしいです。メルカリくらいの会社でも、そういう危ない運用をしていることもあるんだなと驚きでした。それでも、Cloudflare Images ベースの画像配信基盤にダウンタイムゼロで移行しているのが本当にすごい。

Cloudflare Images は Next.js の `next/image` と組み合わせて使うこともできるので、Next.js 好きな僕としてはとても嬉しいですね。

## 「15分でCloudflareのサービス全部紹介できるかな？」

https://www.youtube.com/live/pDdK_gHt8fQ?si=AmGItDyVjiNgXkxJ&t=5131

Cloudflare にはまだまだ僕の知らないサービスが大量にあることを知りました。でもこの発表のおかげで今日から Cloudflare の全サービスを知っていると豪語できます（？）

## 「アイドルから見たもの作りの本質」

https://www.youtube.com/live/pDdK_gHt8fQ?si=v7sFr9g99dRr4Lei&t=6050

宮本佳林さんの発表でした。

宮本さんは、ただ AI に興味を持ったからバイブコーディング一発で作ってみた、というレベルではまったくありませんでした。アーティストである自分をより広めるために、ターゲットを定義して、ターゲット毎に必要なシステムの要件を整理して、設計書を書いて実装する。しかもフェールセーフを心がけて、システムが落ちてもリカバリーが簡単にできることを念頭に設計している。コーディングこそエージェントに任せてご自身はコードを読めないと言っているけど、これってちゃんとエンジニアリングですよね。

他者への配慮を絶やさないのも宮本さんらしいなと思いました。自分が作ったものが誰かを悲しませるかどうかをまず考える。「見れない人がいたらその方々が悲しくなってしまう」と仰っていましたが、これってアクセシビリティの話じゃんとなりました(本当か？)。

Cloudflare は本当に安くて、無料枠で色々できすぎるのがすごい、やばい。Workers Paid に課金するとしても、最初は $5 で済むのが経済的ですね。たった $5 払うだけで、無料枠の 100 倍とか使えるようになる。Workers Free Plan の D1 は DB が 10 個しか作れないけど、Workers Paid にすると 50,000 個作れる様になるんですよ。Vercel だと最初の料金が $20 なので、個人利用では Cloudflare に軍配が上がる。Cloudflare が何で売上を立てているか本当にわからない。

宮本さんの今回の発表というか、その前から[話題になっていたブログ記事](https://ameblo.jp/miyamotokarin-official/entry-12974432505.html)を読んでから、僕はエンジニアをやめたほうがいいのではと思ったりしていました。自信を失ったとか、AI に仕事を奪われるのが不安とか、そういうのではないです。アーティストが自分の活動のためにエンジニアリングスキルを身に着けている。自分も、エンジニアだからエンジニアリングするのではなく、〇〇のためにエンジニアリングする、みたいな方向で進んだほうが楽しいかもしれないと。〇〇が何かはわかりませんし、本当に〇〇を見つけてそれにジョブチェンジするのかもわかりませんが。

## まとめ

Cloudflare Workers Tech Talks めちゃめちゃ楽しかったです。絶対また行きます。

## 余談

宮本佳林さんの「佳林」の発音は「かりん⤵️」ではなく「かりん⤴️」です。

これは Java と JavaScript くらい違います。

ご本人の自己紹介の部分を聞いて確認してみてね。
