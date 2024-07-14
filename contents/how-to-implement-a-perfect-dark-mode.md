---
title: "真にチラつかないダークモードをついに実現したぞ。実現方法と気付きを書く"
createdAt: "2024-07-14T05:36:21.848Z"
tags: ["nextjs", "react"]
---

このサイトはダークモードに対応しています。なぜならダークモードは基本的人権だからです(要出典)。

しばらく、サイトに訪問した直後ライトモードとダークモードが切り替わってチラつく現象が発生していました。これを改善したので、実装方法と気付いたことを残しておきます。

## ダークモードの実装方法

一般に、ダークモードの実装方法は3タイプあります。

1. OSによるモード設定を反映する

   メディアクエリー`@media (prefers-color-scheme: dark)`を使うと、OS側でダークモードを指定している時だけ有効になるスタイルを書くことが出来ます。

   JavaScriptでも判定が必要な場合は`matchMedia("(prefers-color-scheme: dark)")`を活用します。

2. 独自の設定値を持つ

   OSの設定は一切反映せず、独自のダークモード設定値を持ちます。その値はローカルストレージなどブラウザ側に記憶させておくことが多いです。

   CSSに反映するには、html要素やbody要素などに`data-color-mode="dark"`/`data-color-mode="light"`といったdata属性で設定値を与えておきます。CSS側ではそのdata属性をセレクターとしてダークモード用のスタイルを指定します。[^1]

   [^1]: CSSのセレクターにできれば良いので、class属性などでもOKです。このサイトでは`data-color-mode`属性を使っているので、本記事の説明として利用します。

3. 上2つのハイブリッド

   OSの設定を反映するか、OSの設定を無視して強制的にダークモードまたはライトモードにするかの三択を提供する方法です。指定されたモードの設定値はローカルストレージなどのブラウザ側に記憶させておくことが多いです。

   OSの設定を反映する場合は`matchMedia("(prefers-color-scheme: dark)")`でOSがダークモードかどうかをチェックし、html要素に`data-color-mode="dark"` / `data-color-mode="light"`を付与します。OSの設定を無視したモード選択なら、その選択値をそのまま`data-color-mode`属性に渡します。

   CSSでは`data-color-mode`属性をセレクターとしてダークモード用のスタイルを指定します。

このサイトではハイブリッドなダークモード実装方法を採用しています。フッターに切り替えスイッチがあるので遊んでみてください。

## チラつき問題

実装方法の 2. と 3. について、設定した値がブラウザ側のローカルストレージに保存されているということは、ブラウザでReactが動いて初めて設定値を反映できるということです。しかし、Next.jsを使ってサーバーサイドレンダリング(SSR)を行っているため、サーバーサイド(またはビルド時)でHTMLが生成される段階では`data-color-mode`属性を決定できません。

普通にReactだけで実装していると、次のような流れになるでしょう:

1. ブラウザがHTMLとCSSを画面に反映する(このとき`data-color-mode`は`undefined`か適当な初期値)
2. JSが実行され、Reactアプリケーションとして構築される(hydration)
3. ローカルストレージから値を取り出してReact Stateに格納する
4. React Stateをhtml要素の`data-color-mode`に反映する
5. `data-color-mode`の変更によって適用されるCSSが変化する

この流れで、HTML/CSSの初期状態がライトモードだが、ローカルストレージからの値はダークモードになっている場合、画面が一瞬だけライトモードで表示されてすぐにダークモードに変化します。これがチラつきになって少し残念な印象を与えます。

ちなみに、実装方法 1. についてはチラつきが発生しません。初期描画の時点でOS設定を反映したスタイルを適用可能だからです。ただし、`matchMedia("(prefers-color-scheme: dark)")`で表示切替を部分的に行っている箇所では一瞬チラつきが発生する可能性があります。しかしメディアクエリーはCSSで判定可能なので、よほどの理由がないJavaScriptで判定する必要はないでしょう。それを訴える記事も書いたので参考までに。

https://zenn.dev/chot/articles/do-not-use-use-media-query

## チラつき解決策

### script要素の埋め込み

Reactアプリケーションとしての構築より先に画面の描画が完了してしまうため、待っていられません。それよりも先に小さいスクリプトを実行し、html要素の`data-color-mode`属性に反映する必要があります。

script要素は`defer`属性や`async`属性をつけない場合、HTMLを上から解釈しているブラウザに見つかった時点で実行され、その間HTMLの解釈を停止します。初期表示を遅らせたり存在しないDOMアクセスによるエラーの原因になるので普通は嬉しくない挙動ですが、これを逆に利用してhead要素に手書きのscript要素を仕込むことで、bodyが解釈される前にhtml要素の`data-color-mode`属性が存在することを保証できます。

このブログサイトでは、ローカルストレージの`stin-blog-color-mode`というキーにカラーモードの設定値を保存しているので、TypeScriptでhtml要素の`data-color-mode`属性に値を反映するインラインスクリプトを書くと次のようになります。

```ts
(function () {
  const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const fromStorage = localStorage.getItem("stin-blog-color-mode");
  const colorMode: "light" | "dark" =
    fromStorage === "system" || fromStorage == null
      ? prefers
      : fromStorage === "light"
        ? "light"
        : "dark";
  window.document.documentElement.dataset.colorMode = colorMode;
})();
```

TypeScriptをscript要素に渡してもブラウザは実行できないので、[TypeScript Playground](https://www.typescriptlang.org/play/?target=2#code/BQMwrgdgxgLglgewgAmASmQbwFDOVJAZxmQAcAnAUxEvMOQF5kB3OCAEwWYDoBbAQxhQAFgFlK7OP2AAiYBWq1CAWgIAbBOWWERlXpQBcydv3IBrNDLR9BuwrjzIA-MhknzMh3iMy1cAObCMDIA3A4EEMTIIOQIvADKMJr8-pSMyBpQ-GqJyancqTAAkjB6ssRsygBGGv6qCBpavAjslFZheBFR6pqiLYaufoHByAA+ru5mMoxeqDFxueQpaQyrroQAnsR606Pj8wlJS6mMTBBgamoYLgo0dMhGB4vLp0y+AUHTLu-D0z6ToQcrA4XG4nCgYH0EBgYIQEKhMAAomo9JRoWDBPxCJQYT1yH1Wuk8QTKGEAL5odAhIA)でJavaScriptにトランスパイルしたものをコピーおきます。TypeScript PlaygroundはコードをURLだけで復元できるので便利です。

そのJavaScriptはなるべく小さくしておきたいので、TypeScript Playgroundの出力を[Terser REPL](https://try.terser.org/)でminifyしておきます。TerserはJavaScriptの意味を変えずに変数名などを変更して文字数を減らしてくれるminifierツールです。

Terser REPLのminify結果を、`app/layout.tsx`でscript要素の`dangerouslySetInnerHTML`に渡します。script要素はhead要素に差し込んでおくことで、body要素の描画より先に実行されます。

```tsx
const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html suppressHydrationWarning lang="ja">
      <head>
        {/*
          TypeScript Playground: https://www.typescriptlang.org/play/?target=2#code/BQMwrgdgxgLglgewgAmASmQbwFDOVJAZxmQAcAnAUxEvMOQF5kB3OCAEwWYDoBbAQxhQAFgFlK7OP2AAiYBWq1CAWgIAbBOWWERlXpQBcydv3IBrNDLR9BuwrjzIA-MhknzMh3iMy1cAObCMDIA3A4EEMTIIOQIvADKMJr8-pSMyBpQ-GqJyancqTAAkjB6ssRsygBGGv6qCBpavAjslFZheBFR6pqiLYaufoHByAA+ru5mMoxeqDFxueQpaQyrroQAnsR606Pj8wlJS6mMTBBgamoYLgo0dMhGB4vLp0y+AUHTLu-D0z6ToQcrA4XG4nCgYH0EBgYIQEKhMAAomo9JRoWDBPxCJQYT1yH1Wuk8QTKGEAL5odAhIA
          Terser REPL: https://try.terser.org/
       */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){const e=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",o=localStorage.getItem("stin-blog-color-mode"),t="system"===o||null==o?e:"light"===o?"light":"dark";window.document.documentElement.dataset.colorMode=t}();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
};
```

上のコードで注目すべきはhtml要素の`suppressHydrationWarning`です。

React管理外のスクリプトでHTMLを操作するので、サーバーサイドで生成されたHTMLとhydration実行時のHTMLで`data-color-mode`属性の分だけ差異が生まれることになります。普通はhydration時のHTML構造不一致は異常事態とみなすべきですが、既知であり避けようもないため警告を抑制します。

`suppressHydrationWarning`はhtml要素それだけに対してのみ有効になり、headやbodyを初めとした子孫要素たちは引き続き差異チェックしてくれるため安心です。当然ですが乱用はやめましょう。[Reactのドキュメント](https://ja.react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)でも避難ハッチとしての使用を意図していると説明されています。

### stateの持ち方、反映の仕方

```tsx
type ColorModeContextValue = {
  colorMode: ColorMode | undefined;
  setColorMode: (color: ColorMode) => void;
  actualColorMode: "light" | "dark" | undefined;
};
const ColorModeContext = createContext<ColorModeContextValue>({
  colorMode: "system",
  setColorMode: () => null,
  actualColorMode: "light",
});

export const ColorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [colorMode, _setColorMode] = useState<ColorMode>();
  const preferColorSchemeIsDark = useMatchMedia("(prefers-color-scheme: dark)", true);

  useEffect(() => {
    const storageValue = window.localStorage.getItem("stin-blog-color-mode");
    if (storageValue === "light" || storageValue === "dark") {
      _setColorMode(storageValue);
    } else {
      _setColorMode("system");
    }
  }, []);

  const setColorMode = useCallback((color: ColorMode) => {
    _setColorMode(color);
    window.localStorage.setItem("stin-blog-color-mode", color);
  }, []);

  const actualColorMode =
    colorMode === "system" ? (preferColorSchemeIsDark ? "dark" : "light") : colorMode;

  const value: ColorModeContextValue = useMemo(
    () => ({
      colorMode,
      setColorMode,
      actualColorMode,
    }),
    [actualColorMode, colorMode, setColorMode],
  );

  useEffect(() => {
    if (actualColorMode) {
      document.documentElement.dataset.colorMode = actualColorMode;
    }
  }, [actualColorMode]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
};

export function useColorMode() {
  return useContext(ColorModeContext);
}
```

React Stateの持ち方はシンプルで、

- `colorMode`という変数名で`useState`を宣言する
- 初回だけ実行される`useEffect`でローカルストレージから取り出した値を`setColorMode`する
- `setColorMode`すると同時にローカルストレージにも反映するようにラッパー関数を用意する
- `useMatchMedia`でOSの設定を確認しつつ`actualColorMode`を計算する
- `useEffect`で`actualColorMode`をhtml要素に反映する
- `colorMode`, `setColorMode`, `actualColorMode`をReact Contextで配信する

といったことを行っています。`ColorModeProvder`は`app/layout.tsx`に設置しています。

注意点としては、`useState`の初期値を`undefined`にしておく必要があります。適当に`"light"`とか`"system"`と入れてしまうと、ローカルストレージから初期値を取り出す前に`data-color-mode`に反映する処理が動いてしまい、せっかくインラインスクリプトでセットした値が上書きされてしまいます。初回だけ動かない`useEffect`を用意しようとしてはいけません。

あとは子コンポーネントで`useColorMode`を使えば、現在の値を取り出したりカラーモードを指定できます。

## next/scriptの挙動

Next.jsでスクリプト要素の埋め込みには一般的にnext/scriptを用います。しかし今回は使いませんでした。というか使ってもチラつきの解消にはなりませんでした。

next/scriptにはスクリプトの読み込み戦略として`beforeInteractive`, `afterInteractive`, `lazyOnload`の3種類があります(workerはDOMに触れられないので無視)。HTMLの解釈が開始されてから最も早く実行されるのは`beforeInteractive`です。

しかし`beforeInteractive`であっても、hydrationより早く実行されることは保証されていますがブラウザによるHTML/CSSの描画完了より前に実行されません。

`begoreInteractive`で埋め込まれるスクリプトは実際は次のようになっています:

```html
<script>
  (self.__next_s = self.__next_s || []).push([
    0,
    {
      children:
        '!function(){const e=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",o=localStorage.getItem("stin-blog-color-mode"),t="system"===o||null==o?e:"light"===o?"light":"dark";window.document.documentElement.dataset.colorMode=t}();',
    },
  ]);
</script>
```

`self.__next_s`が何者かまではわかりませんが、next/scriptを抱えておく用の配列なのでしょう。ということはNext.jsの何かしらのJavaScriptが実行された後でないと、`beforeInteractive`スクリプトも実行されないということになります。

挙動ベースでしか調べられていませんが、実際に自分のサイトのプリレンダリングされたHTMLを確認してみたところ、「Next.jsの何かしら」と思しきscript要素にはすべて`async`属性が付与されていました。これだとHTML/CSSの画面描画より前に実行されるとは限らず、チラつきの根本解決にはなりません(実際`beforeInteractive`なnext/scriptではチラつきが残ります)。

## 余談

Next.jsのドキュメントサイトが同じようにローカルストレージに保存しているのに、チラつかずに上手く作ってあったので実装方法をリバースエンジニアリングした結果、script要素を仕込んでいることに気付きました。

他にも [react.dev](http://react.dev) 、 [tailwindcss.com](http://tailwindcss.com) なども同じように実装されており、チラつきません。有名な実装方法でしたね。

また、ローカルストレージから取り出すscriptを自作しなくても、それ含めてカラーモードの面倒を見てくれるnext-themesというライブラリの存在も執筆中に知りました。そりゃあるわよね…。

## まとめ

ダークモード対応したNext.js製サイトののチラツキを抑えるには

- head要素に素のscript要素を埋め込む
- script要素でローカルストレージの値をhtml要素に反映する
- カラーモードを抱える`useState`の初期値は`undefined`にする
- `beforeInteractive`なnext/scriptでは間に合わない

みんなもチラつかない完璧なダークモードを作ろう。

それでは良いNext.jsライフを！
