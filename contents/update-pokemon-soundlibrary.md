---
title: "ポケモンBGMループ再生サイトをアップデートした"
createdAt: "2023-11-13T16:39:44.062Z"
tags: ["nextjs", "tailwindcss"]
---

https://pokemon-soundlibrary.stin.ink

ポケモン公式が公開している「ポケットモンスター ダイヤモンド・パール」の BGM をループ再生できるようにしたサイトを以前作りました。その後公式から「ポケットモンスター 赤・緑」の BGM も配布されたので、追加分も再生できるようにアップデートしました。というかほぼリプレイスです。

ドメインも変更してリダイレクトするようにしたので、ローカルストレージに保存するようになっていたお気に入り登録は無効になりました。もし活用してくれていた人がいれば、大変申し訳無いです。もう一度お気に入り登録してください。

## Next.js のアップデート

まずは Next.js を 14 までバージョンアップして、Pages Router から App Router に変更しました。App Router の Layout 機能が本当に良いですね。Pages Router は共通 Layout は `_app.tsx` 1 つだけでしたが、App Router は `layout.tsx` をいくつも配置できて、Server Components にもできて非同期処理と自然に統合されます。

Pages Router も `getLayout` パターンを駆使すればレイアウトをいくつも設置できると捉えられますが、非同期処理で得るデータがレイアウトに含まれると結局つらいし、ネストも出来ないし、そもそもそんなに好きなパターンじゃないのでほぼ使ったことがありません。

といってもこのサイトはレンダリングのためのデータ取得はないんですがね。

## スタイリングメソッドの変更

もともと Chakra UI で色付けしていましたが、Next.js App Router 移行は絶対にしたかったので Tailwind CSS で書き直しました。とても小さい規模の Web サイトなのでまったく躊躇いはありませんでしたね。

Tailwind CSS は使い始めて半年ほどになりまして、かなり手に馴染んできました。VS Code 上でファイルタブの切り替えをすることなくサクサクスタイリングを行えて、VS Code Extension による入力補完や eslint, prettier による静的検査とフォーマットが非常に開発体験を向上してくれます。 [tailwindcss.com](http://tailwindcss.com) にデカデカと掲げられている

> **Rapidly build modern websites without ever leaving your HTML.**

をとても実感しています。

個人的なルールとして Arbitrary values は特段の事情がない限り使わないようにしています。色には必ず `tailwind.config.ts` で名前を付けてから使いますし、デフォルトのカラーセットも無効になるようにしています。サイズは `p-4` や `text-sm` など、トークンとして用意されているものしか使いません。これによって CSS がとっ散らかる危険性を低減出来ていると思います。唯一使うのは `grid-template-*` ですね。Grid の組み方は可能性無限大なので `tailwind.config.ts` にいちいち書いていられません。むしろ適当なユーティリティクラス名を用意されるより `grid-cols-[auto_1fr]` みたいに書いてあるほうがどんなスタイルになるか想像できて良いと考えます。

## デザインの刷新

刷新前は「ダイヤモンド・パール」専用だったので、デザインもダイヤとパールのような印象のデザインにしていました。しかし「赤・緑」が追加されたのと今後もシリーズが増えていきそうだと思ったので、再生している曲のシリーズによって色が変わるようにしました。再生していないときはほぼ真っ暗になっていて、例えば「赤・緑」の曲を再生し始めると赤色と緑色のグラデーションがゆっくりと交互に点滅するようにしました。ぜひ「赤・緑」と「ダイヤモンド・パール」の曲を切り替えて色の変化を楽しんでみてください。

それと、ナビゲーションメニューは古いポケモンのゲーム UI を真似してみました。これはちょっと中途半端ですね。再考の余地ありです。

## 楽曲の追加

楽曲の追加をしました。公式サイトから「赤・緑」の楽曲を一括ダウンロードしてサイトに組み込んでいます。

サイトのソースコードは GitHub で公開しているのですが、楽曲ファイルまで一緒に git 管理してしまうと再配布に該当するので gitignore しています。もしソースコードをクローンして手元で実行したいと思ったら、公式サイトのほうから楽曲をダウンロードしてください。しかし残念ながら「ダイヤモンド・パール」の楽曲は配布していないようです…。

お気に入りにはどのシリーズの BGM も区別されずに登録されます。有効活用してください。

## 今後の展望

### デプロイ先

Vercel にデプロイしているのですが、GitHub に楽曲データをプッシュできない関係で手元の PC から Vercel CLI で直接デプロイしています。また、楽曲ファイルの数が非常に多いため、かなりデプロイに時間がかかるのと容量も大きいのでちょっと Vercel さんに申し訳なく感じているところ。

なので、そのうち AWS S3 とかにデプロイしたいなと思っています。そもそもデプロイ後のコンピューティングが一切ないので、Vercel である必要もないですしね。

### ステート管理

再生状態とかカテゴリーフィルタリングとかお気に入り管理に Recoil を使っています。お気に入りは永続化するためにローカルストレージに保存しているのですが、 `useEffect` を経由して保存しているので開発中にバグります(悲しい)。 `useEffect` は開発中(というか `React.StrictMode` 配下で)2 回実行されます。Recoil ステートからローカルストレージに反映する effect は 1 回目は実行しないように抑制していますが、開発中は 2 回目が連続で走るのでローカルストレージに空のステートが反映されます。悲しい。プロダクションビルドでは問題ありません。安心。

Recoil には外部ストアにステートを反映するプラグインライブラリが用意されています。recoil-sync です。

https://recoiljs.org/docs/recoil-sync/introduction/

まだ使ったことはないですが、実装は `useEffect` ではなく Recoil の Atom Effects が使われているので、2 回実行されるようなことはないと思われます。多分。recoil-sync でうまくローカルストレージ保存を実装し直せたらまた記事にすると思います。多分。

## まとめ

ポケモンの BGM をループ再生できるサイトをアップデートしたお話をしました。今後の展望は気が向いたら対応します。

作業 BGM として便利なのでぜひ使ってみてください。

https://pokemon-soundlibrary.stin.ink

それではよいポケモンライフを！
