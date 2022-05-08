---
title: "『プロを目指す人のためのTypeScript入門』読書感想文"
createdAt: "2022-05-08T15:24:57.273Z"
tags: ["typescript", "読書感想文"]
---

https://twitter.com/stin_factory/status/1520251902877118464?s=20&t=ObJNlQRqSKg5E02UCk5xOw

尊敬する TypeScript の師匠(勝手に思ってるだけ)である uhyo さんが書いた『プロを目指す人のための TypeScript 入門』を読了したので感想文を綴ります（ぇ

## 自分のプログラミング経験

前提として、僕自身のプログラミング経験をお伝えします。

新卒で就職するまではプログラミングについてはほとんど触ったことがありませんでした。就職のために基本情報技術者試験を取ることを決めて、そのために Java を学習した程度です。

就職して C# を 2 年ほど業務で使用した後、2019 年 9 月頃から独学で TypeScript を使い始めました。それまでは Web 開発の知識はからっきしでした(C# は Windows Forms アプリケーション用)。この記事の執筆時点で TypeScript 歴(=JavaScript 歴)が 2 年 8 ヶ月くらいになる計算ですね。

## 内容

TypeScript は「JavaScript + Type」なので JavaScript の基礎知識が要求されると思われるかもしれませんがそうではありません。この本では JavaScript の教本で習うような内容が TypeScript の型情報と同時に解説されています。JavaScript を学んだことがなくても TypeScript ごと学習できるのでコスパがいいです。

TypeScript をまったく知らない人向けに、式と文とはなにか、関数宣言の方法、演算子の種類と効果などなど非常に細かい単位で解説されています。昨今の JavaScript/TypeScript 開発で知識として必須であるモジュールシステムや非同期処理についても、それぞれ 1 章分ずつ割かれていてしっかりと学ぶことができます。

逆に、現代ではほとんど使用されなくなった enum や namespace については一切解説がありません。JavaScript には存在しない TypeScript 独自の構文であり、使われなくなったので学習するだけ無駄という判断なのでしょう。

## 感想

この本を一冊マスターしておけば、TypeScript を使った Web アプリの開発で悩むことはないと感じるボリュームでした。初学者の方にとっては、1 周読み終えたらちょっとしたアプリ開発をやってみつつわからないことがあればこの本に立ち返るような、教科書のような使い方でも活用できる内容です。

JavaScript すらやったことがない人でも習得できる内容ですが、注意点があると感じています。TypeScript は「JavaScript + Type」である言語だと本書でも言及されていますが、構文等を解説する章では TypeScript と JavaScript が別け隔てなく記述されています。例えば

> 文（sentence）は TypeScript プログラムの基本的な構成単位であり、

のような書き方です。初学者が JavaScript と TypeScript の境目をはっきり認識して学習するのは負荷が高いのでする必要はないですが、いずれは理解すべきである点なので頭の片隅に置いておくといいと思います。

僕自身はこの本から新たに得られた知識は多くなかったと感じました。使ってたけど名前は知らなかった構文の正式名称とかクラスのインスタンス生成は括弧なしでできる(`new User` のように)とか、そういった細かいことくらいですね。独学で TypeScript を学ぶ中で、uhyo さんが執筆された数多の技術ブログを読み漁ってきました。そのため、既知の内容が多くあって[『HTML 解体新書』を読んだ時ほど](/articles/html-kaitai-shinsho-book-report)自身のスキルアップは感じていません。

ただ、それでもこの本を購入してよかったと強く思っています。それは著者である uhyo さんの**思想**が多く記述されていたからです。

思想というのは「こんな書き方ができるね、でもこういう理由でやるべきじゃないね」というものです。 enum や namespace を内容に含めない判断も思想の一つと言えるでしょう。昔から JavaScript/TypeScript に精通してきて、ECMAScript 仕様書を読み込んでいる人の考えは非常に学びがあります。

プログラミング言語の入門書に著者の思想を色濃く反映させることは賛否あるかもしれませんが、自分はそれに期待していたし読んでいて面白いと感じる要因でした。

## まとめ

『プロを目指す人のための TypeScript 入門』を読了したので感想文を書いてきました（ぇ

初学者向けではありますが既に TypeScript を使っている人でも楽しめる内容が含まれていて買って損はありません。ぜひ（ぇ

https://amzn.to/3LYxLNX