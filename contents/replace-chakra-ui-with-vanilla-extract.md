---
title: "個人ブログから Chakra UI を剥がして vanilla-extract を入れた(剥がした理由編)"
createdAt: "2023-01-30T15:32:54.743Z"
tags: ["react", "chakraui", "vanilla-extract"]
---

すてぃんのブログから Chakra UI を剥がして vanilla-extract を導入しました。見た目はほとんど変わっていませんが、Chakra UI でスタイリングされていたものをすべて vanilla-extract で 1 から作り直しました。

ライブラリの変更理由は以下の通り。

- 最近 vanilla-extract を良さそうと思ったので使いたかった
- Chakra UI の内部で使用されている Emotion に恨みが溜まっていた
- CSS がそれなりに書けることを示したかった

## Emotion の嫌いポイント

昨今のランタイム CSS in JS への風当たりは実はそんなに気にしていなくて、それよりも Emotion 固有のヘイトを持っています。 `:first-child` が非推奨であることと、その原因です。

Emotion を使ったことがある人なら必ず一度は次の警告文を見たことがあるでしょう。

```txt
The pseudo class ":first-child" is potentially unsafe when doing server-side rendering. Try changing it to ":first-of-type".
```

Emotion で CSS を書く時は `:first-child` が非推奨になります。警告文にもある通り、Server Side Rendering のときに問題が起きます。 `:first-child` なんて CSS で割とよく使う擬似クラスなのですが、何が問題なんでしょうか。

例えば Emotion と Next.js で次のようなページコンポーネント(`pages/index.tsx`)を作成するとします。

```tsx
// src/pages/index.tsx
const fruits = ["りんご", "みかん", "なし", "ぶどう"];

const Home: NextPage = () => {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li
          key={fruit}
          css={css`
            color: red;
            &:first-child {
              color: green;
            }
          `}
        >
          {fruit}
        </li>
      ))}
    </ul>
  );
};
```

ul, li で果物の名前を列挙しています。文字色は先頭だけ `green` でほかは `red` を指定しました。このような書き方はあるあるだと思います。ではこれを `npm run build` でビルドして、HTML を生成させてみましょう。ビルドされたファイルは `.next/server/pages/index.html` に配置されています。

```tsx
<ul>
  <style data-emotion="css 1qqoimz">
    .css-1qqoimz {
      color: red;
    }
    .css-1qqoimz:first-child {
      color: green;
    }
  </style>
  <li class="css-1qqoimz">りんご</li>
  <style data-emotion="css 1qqoimz">
    .css-1qqoimz {
      color: red;
    }
    .css-1qqoimz:first-child {
      color: green;
    }
  </style>
  <li class="css-1qqoimz">みかん</li>
  <style data-emotion="css 1qqoimz">
    .css-1qqoimz {
      color: red;
    }
    .css-1qqoimz:first-child {
      color: green;
    }
  </style>
  <li class="css-1qqoimz">なし</li>
  <style data-emotion="css 1qqoimz">
    .css-1qqoimz {
      color: red;
    }
    .css-1qqoimz:first-child {
      color: green;
    }
  </style>
  <li class="css-1qqoimz">ぶどう</li>
</ul>
```

該当部分だけペーストしています。ごちゃごちゃしてわかりにくいかもしれませんが、ul 要素の子要素として style 要素が差し込まれていることが確認できます。 `:first-child` は style 要素になるので、特別なスタイルを当てたかった先頭の li 要素には当たらなくなります。これが SSR 時に `:first-child` が問題になる理由です。

これは `:first-of-type` に変更することで解消できます。ワークアラウンドがあるので別にいいだろという意見もごもっともです。しかし、そもそも style 要素が body に含まれるような HTML が生成されることが良くないのです。

style 要素は HTML のコンテンツカテゴリーでは **メタデータコンテンツ**に分類されます。

https://developer.mozilla.org/ja/docs/Web/HTML/Element/style#%E6%8A%80%E8%A1%93%E7%9A%84%E6%A6%82%E8%A6%81

メタデータコンテンツは head 要素にのみ入れることが出来ます。仕様上は body 要素に入れることができないルールになっているのです。(scoped 属性を付与すればフローコンテンツになれるとのことですが、scoped 属性自体が非推奨ですし、Emotion は style 要素に scoped 属性を付与していません)

Web ブラウザは HTML 仕様に違反する HTML 文書もよしなに描画してくれますが、汎用的で広く使用されるライブラリがそこに依存していることに疑問を抱きます。しかもその違反のせいで普通なら使える疑似クラスを使用不能にしています。

とはいえ、SSR は仮想 DOM を対応する HTML 文字列に変換するだけなので、head 要素の編集に介入できないという事情もあります。SSR しないという強い意志を持つことが出来れば、引き続き Emotion はスタイリングメソッドの選択肢に入るかもしれません(でもそのうちﾗﾝﾀｲﾑ CSS in JS ﾊﾊﾟﾌｫｰﾏﾝｽｶﾞｰと言い始める気もします)。

一応名誉のために紹介しておくと、Emotion にはその違反する style 要素の付け方を避けるための API も用意されています。

https://emotion.sh/docs/ssr#advanced-approach

`renderToString` された文字列から style 要素を抽出して head 要素に差し込む処理を実現できるようです。ただ Next.js でどこに書けばいいかは知りませんし、 ストリーミング API では使えないと書いてあるので、今後 Server Components が主流になるであろう React 環境での活用は難しそうです。

## Chakra UI はどうか

一方で Chakra UI はめちゃくちゃ好きな UI ライブラリでした。見た目はシンプルですが、 props 経由でサクッとスタイリングを追加できるのでかなり柔軟です。

また、UI ライブラリによくあるダークモード機能も当然 Chakra UI に搭載されていて、自力で頑張らなくても目に優しいサイトが作れます。僕はブログ系サイトは夜中寝る前にガーッと読んだりするので、ダークモード対応してあると嬉しいですね。Zenn さん本当にお願いします。

で、Chakra UI を剥がしてしまいましたがこのサイトのダークモード機能は健在です。 vanilla-extract はもっと低レイヤーなスタイリングメソッドなので、ダークモード機能も 1 から自作することになりました。どのように実装したのかはまた別の記事で…。

Chakra UI に罪は有りませんが Emotion 依存の減点と vanilla-extract への興味により剥がすことにしました。 Chakra UI 今からでも内部実装 vanilla-extract に変更してくれない？(Chakra uI の使い勝手はランタイム JS 由来だと思うので難しそうではある)

## まとめ

ブログサイトのスタイリングメソッドを Chakra UI から vanilla-extract に変更した理由を説明しました。

Emotion は CSS in JS として使いやすいライブラリではありますが、 `:first-child` くらい普通に書けたいなという気持ちが強かった…。

vanilla-extract の使い勝手や使い方についてはまた後日。

それではよい CSS ライフを！
