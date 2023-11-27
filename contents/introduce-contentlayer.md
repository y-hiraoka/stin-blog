---
title: "個人ブログ開発でとても便利な Contentlayer を導入してみた"
createdAt: "2023-11-27T14:10:08.506Z"
tags: ["nextjs", "contentlayer"]
---

またまた自分のブログサイトを改修した報告です。自分のブログサイトを改修してはそれをネタに記事を書くのを繰り返していて、なんか面白いですね。

このブログはソースコードと同じリポジトリに Markdown 記事を保存しています。サイト自体は Next.js で、Markdown はただの `.md` ファイルです。

これまで気になっていたけど放置していた難点が1つありました。記事ファイルを変更しても、ブラウザで閲覧している開発サーバーの記事ページが自動で再読み込みされなかったのです。Next.js なのでソースコードの変更は Hot Module Replacement(HMR) が効きますが、記事には効きませんでした。

それが何故かと言うと、記事は `fs` モジュールで生のテキストデータとして読み込んでいたたけだからです。HMR を効かせるためには記事ファイルを import export で読み込み Next.js(の中の Webpack)の依存グラフに組み込まれる必要があります(多分)(ビルドシステム詳しくないので適当に喋っている)。しかしNext.js とは関係ない方法で読み込んだファイルの変更は当然検知されません。

これまではそれなりに書き上げてからブラウザリロードを連打していました。今回は Contentlayer を導入して記事の変更も HMR されるようにしたお話です。

## HMR するまでの紆余曲折

何度か HMR できるようにしたいと思い、色々調べていました。

### 純粋に Webpack で import してみる

まず、純粋に `.md` ファイルを import export するだけでいいだろうと思い、`next.config.js` の `webpack` で `.md` に対して `asset/source` を設定しました。そして `app/articles/[slug]/page.tsx` で

```tsx
const { default: rawArticle } = await import(`../../../contents/${slug}.md`);
```

と書いてみたりしました。`rawArticle` にはちゃんとテキストデータが代入されて、記事ファイルを変更するとターミナルには recompiled のメッセージがチラチラと表示されていました。が、実際のブラウザには変更が届いていませんでした。うぇぶぱっく難しい…(？)

関係ないんですが、`raw-loader` が非推奨になっていましたね。Next.js や Vite ばかり使うようになってまったく気づいていなかった。テキストデータとして読み込む分にはネイティブサポートされるということでしょうかね。

### Nextra のソースコードを読んでみる

思い付きでやってみた上記がダメだったので、Nextra がどうやって Markdown に対する HMR を実装しているのかソースコードを読んでみました。Webpack Plugin とか loader を実装していて、参考にしたら自分でも自作が……もちろん出来ませんでした。

### next/mdx を検討してみる

Next.js公式ツールの next/mdx を使うことも検討しました。しかし、これはあくまで `page.tsx` の替わりに `page.md(x)` が使えるようになるよっていうツールです。このブログサイトのように、`src` とは別に `contents` ディレクトリを切ってると相性が悪いです。`contents` ディレクトリにあるファイルを全部リネームして `src/app/articles/` 配下に置くことも考えましたが、frontmatter に書いているメタデータを読み出して Next.js の `metadata` に渡す処理をいい具合に書かなきゃいけなかったり、記事一覧ページは結局 `fs` モジュールで作らなきゃいけなかったりとつらみポイントが多かったので最終手段だと思い保留しました。ソースコードと記事コンテンツの境目がなくなるのもなんか気持ち悪かったですしね。

## Contentlayer とは

Markdownファイルを JavaScript プロジェクトで扱い易い JSON ファイルに変換してくれるツールです。jsonファイルにしてしまえば Next.js プロジェクトで import できるし、変更検知もされて HMR も効きます。Content と Code を繋ぐ糊のような存在ということらしいです。

https://contentlayer.dev/docs/concepts/how-contentlayer-works-da5b2220

> Contentlayer is the glue between your content and your code.

単に JSON を生成するだけでなく、いい感じに扱うための js コードと `.d.ts` ファイルも生成されます。

https://contentlayer.dev/docs/concepts/type-safety-e764dcd5

このページを読む感じだと、開発者の方はかなりの TypeScript 信者だと想像できます。それのおかげか TypeScript サポートが手厚く、生成される型も堅牢の印象があります。

Markdownを JSON に変換するツールなのでフレームワーク非依存ではありますが、目的が HMR の実現なのでフレームワークのビルド時に介入するプラグインが用意されています。といってもまだ公式提供できているのは Next.js だけっぽいです。Remix とか Astro はステータスが considering となっていました。Next.js に関しては App Router も Pages Router も問題ありません。

## 使い方

https://contentlayer.dev/docs/getting-started-cddd76b7

公式ドキュメントの Getting Started が全てではありますが、自分のサイトで実際にやったことを並べます。

### 依存の追加

```bash
npm install contentlayer next-contentlayer
```

`contentlayer` は本体で、 `next-contentlayer` は `next.config.js` に設定することで Next.js のビルドタイムに介入するライブラリですね。

### `next.config.js` の修正

自分は bundle-analyzer も入れているので、`withBundleAnalyzer` と `whitContentlayer` が入れ子になっています。

```tsx
const nextBundleAnalyzer = require("@next/bundle-analyzer");
const { withContentlayer } = require("next-contentlayer");

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(
  withContentlayer({
    /* ここに色々 Next.js の設定 */
  }),
);
```

### `tsconfig.json` の修正

```json
{
  "compilerOptions": {
    // ... other properties
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "contentlayer/generated": ["./.contentlayer/generated"] // here
    }
  },
  "exclude": ["node_modules", ".next"],
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".contentlayer/generated" // here
  ]
}
```

- `compilerOptions.paths` に `contentlayer/generated` を追加

  Contentlayer が生成するコードは `.contentlayer/generated` ディレクトリに格納されていきます。それらを import するときに `import {} from "contentlayer/generated"` という風に、あたかも `contentlayer` から import するかのように書くことができます。ドキュメント通りに `contentlayer/generated` にしていますが、好きな名前で import 設定することも可能です。事前に paths alias の設定(`"@/*": ["src/*"]` の部分)をしていない場合は `baseUrl: "."` の追加も必要です。

- `include` に `".contentlayer/generated"` を追加

  `.contentlayer/generated` ディレクトリをコンパイル対象にしています。

### `.gitignore` の修正

ビルド時に自動生成される `.contentlayer/generated` ディレクトリを git 対象外にします。

### `contentlayer.config.ts` の作成

Markdownファイルの置き場所や、Markdown の frontmatter が持つべきプロパティなどを定義する config を用意します。

```tsx
// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { remark } from "remark";
import strip from "strip-markdown";

export const Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: `*.md`,
  fields: {
    title: { type: "string", required: true },
    createdAt: { type: "string", required: true },
    updatedAt: { type: "string", required: false },
    tags: { type: "list", of: { type: "string" }, required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (article) => article._raw.sourceFileName.replace(/\.md$/, ""),
    },
    excerpt: {
      type: "string",
      resolve: async (article) => {
        const stripped = (await remark().use(strip).process(article.body.raw)).toString();
        const excerpt = stripped.trim().replaceAll(/\s+/g, " ").slice(0, 160);
        if (stripped.length > 160) {
          return excerpt + "...";
        }

        return excerpt;
      },
    },
  },
}));

export default makeSource({ contentDirPath: "contents", documentTypes: [Article] });
```

`name: "Article"` は生成されるコードの変数名にも使用されます。

`fields` には Markdown ファイルの frontmatter が持つべき値をスキーマとして定義します。このスキーマは自動生成される TypeScript の型定義にも反映され、コード上で存在しないプロパティアクセスを型エラーとして検出できるようになります。また、スキーマに違反している記事は生成される JSON に含まれないので、記事編集時にも不正な Markdown を入稿してしまう恐れがありません。

`computedFields` は記事オブジェクトから計算で設定する Field です。frontmatter で指定はしないが、コード上で使いたいプロパティを予め計算させておくことができます。僕の場合はファイル名の拡張子を取り除いた文字列を `slug` としているのと、記事の Markdown 文法を削ぎ落とした上で 160 文字切り抜いた文字列を `excerpt` として定義しています。

`makeSource` で Markdown を検索するディレクトリを指定します。今回はドキュメントを 1 種類しか定義していませんが、複数定義することも可能です。

### コードの修正

`contentlayer.config.ts` まで用意したら `npm run dev` すればコードが `.contentlayer/generated` ディレクトリに生成されます。`tsconfig.json` で paths alias を設定したモジュールから import して使えます。

```tsx
import { type Article, allArticles } from "contentlayer/generated";
```

上記コード例のように `allArticles` に全ての記事オブジェクト配列が含まれています。この変数名は `contentlayer.config.ts` で指定した `name` から作られています。

また、`allArticles` の各アイテムはただしく型が付いており、次のように安全にプロパティアクセスが可能です。

```tsx
const slugs = allArticles.map((article) => article.slug);
```

`computedFields` から生成された型定義によって `article.slug` が存在することが保証されています。めちゃくちゃ便利。

## 注意点

### Next.js バージョンについて

この記事を執筆している時点で、Next.js14 が `next-contentlayer` の peerDependencies 対象外になっているようで、`npm install` がエラーを吐きます。`npm install --force` をするか Next.js のバージョンを下げる必要があります。Next.js 14 は新機能追加がないので、僕は一旦バージョンを下げることにしました。

### Next.js config ファイルについて

Next.js の config ファイルをES Modules(`next.config.mjs`) にしていると警告を大量に吐きます。contentlayer ではなく Next.js or Webpack が原因のようです。

[https://github.com/contentlayerdev/contentlayer/issues/313#issuecomment-1305424923](https://github.com/contentlayerdev/contentlayer/issues/313#issuecomment-1305424923)

もともと next/mdx と remark plugin を組み合わせるつもりで `.mjs` にしていましたが(remark が ESM Only)、next/mdx を使うのをやめたので `next.config.js` にすることで解消しました。

### HMR の速度について

けっこう時間がかかりますね、1.5 秒くらい…。生成ファイルを確認してみたら、どうやら1つの記事変更時に監視している全記事を再生成しているっぽいです。手動でブラウザリロードするよりかは圧倒的に楽なので良いのですが、記事数が増えてくるともっとリロード時間が伸びてしまいそうです。

## まとめ

MarkdownファイルをJSONデータに変換してHMRを有効にしてくれる Contentlayer を使い始めたのでご紹介しました。自分的には、やりたかったことをピンポイントで実現できるツールで非常に助かりました。

生成されるコードはプロジェクト固有の型定義を正しく付けてくれるし、Next.js プロジェクトならすぐに簡単に導入できて非常に便利です。

現在はローカルディレクトリにあるMarkdownファイルを変換するツールですが、リモートデータを導入する機能も実験中のようです。外部CMSとの自然な統合もできるようになると嬉しいですね。直近は Contentful や Notion の接続を目指しているようです。

これから記事をサクサク書けるのが楽しみですね(？)

それでは良いブログライフを！
