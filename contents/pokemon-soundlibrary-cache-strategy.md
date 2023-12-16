---
title: "ポケモンBGMループ再生サイトの音声ファイルをキャッシュするために色々調べた"
createdAt: "2023-12-16T07:39:39.658Z"
tags: ["cloudflare", "web"]
---

## Intro

以前の記事でポケモンBGMループ再生サイトを Cloudflare Pages に載せ替えた話をつらつらと書きました。

https://blog.stin.ink/articles/pokemon-soundlibrary-on-cloudflare

この記事が多くの方にご覧頂けて非常に嬉しい限りです。

その中で、キャッシュ周りについてsyumaiさんにアドバイスをいただいてしまいました。めちゃくちゃ嬉しい。

https://twitter.com/__syumai/status/1733987553253245131

実際キャッシュについては一瞬頭によぎったものの、特に何も対策していませんでした。Vercel に Next.js をデプロイするばかりのホスティング人生を送ってきましたので、キャッシュも Next.js と Vercel が勝手に決めてくれていました。移行先の Cloudflare も静的サイトホスティングの Cloudflare Pages とストレージの Cloudflare R2 を使っているので、「よしなに」キャッシュを調整してくれると信じていたからです(Pages Functions からのレスポンスであっても)。

ということで、今回は音声ファイルの最適なキャッシュ方法を探るため、Cloudflare や Web 標準でのキャッシュを調べてみたというお話です。

## 用語の定義または説明

この記事で表現する用語を事前に定義しておきます。

- **オリジン**

  ブラウザから見て CDN の裏側にあるものをひっくるめてオリジンと呼びます。その実態がコンピューティングを行うサーバーなのか、オブジェクトストレージなのかなどは問わず、HTTP レスポンスできるものを総称します。

- **共有キャッシュ**

  オリジンからの HTTP レスポンスを CDN がキャッシュしていることを指します。

- **プライベートキャッシュ**

  HTTP レスポンスをブラウザがキャッシュしていることを指します。ブラウザキャッシュやディスクキャッシュとも呼びます。

- **検証リクエスト**

  ブラウザがキャッシュを使い回すかどうかを確認するために `If-None-Match` や `If-Modified-Since` などのヘッダーを付与して送信するリクエストです。`304 Not Modified` かどうかを検証します。

## キャッシュに関するヘッダーの種類

まず HTTP のキャッシュに関するヘッダーの教科書的理解をしておきました。この記事に関係するヘッダーだけを列挙するため、ここに書いたことがキャッシュの全てではないです。

### `Cache-Control` ヘッダー

オリジンからのレスポンスヘッダーに含まれる `Cache-Control` がキャッシュを指示する値です。

`Cache-Control: public, max-age=14400` という値のとき、CDN もブラウザもキャッシュをすることが期待できます。`public` は共有キャッシュに保存できるという意味で、CDN がレスポンスをキャッシュしてオリジンの代わりに多数のユーザーに配信することを許可しています。`max-age=14400` はキャッシュの有効期限を秒単位で指定しています。この場合は 4 時間ですね。

`Cache-Control: pivate, max-age=14400` という値のとき、CDN はキャッシュをしないが、ブラウザはキャッシュをすることが期待できます。`private` は、同じ URL でもユーザーごとに異なるレスポンスをするようなリクエストで使います。`max-age=14400` は同じくキャッシュの有効期限です。

`Cache-Control: no-cache` はブラウザキャッシュは許可するが、キャッシュを使用する前に検証リクエストを送信してリソースが更新されていないか確認するようにブラウザに指示します。[Cloudflare CDN は `no-cache` をキャッシュしない](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)そうです(他の CDN の挙動はわからない)。

> - Cloudflare does not cache the resource when:
>   - The Cache-Control header is set to private, no-store, no-cache, or max-age=0.

### `ETag`, `If-None-Match` ヘッダー

`ETag` はレスポンスヘッダーの一種です。これを受け取ったブラウザは同じURLに対する次回リクエスト時に `ETag` の値をリクエストヘッダーの `If-None-Match` に載せて送信します。オリジンは受け取った `If-None-Match` の値と現在のリソースの `ETag` の値を比較して、変更がなければボディを含まない `304 Not Modified` レスポンスを返します。`304 Not Modified` を受け取ったブラウザは自身のブラウザキャッシュを使い回します。

`ETag` はリソースの内容をハッシュ化した値を使用することが多く、本当にリソースが変化したかどうかをブラウザに伝えられるようですね。

https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/ETag

### `Last-Modified`, `If-Modified-Since` ヘッダー

`Last-Modified` はレスポンスヘッダーの一種です。その名の通り、リソースの最終更新日が含まれています。これを受け取ったブラウザは同じURLに対する次回リクエスト時(GET と HEAD のみ)に `Last-Modified` の値をリクエストヘッダーの `If-Modified-Since` に載せて送信します。オリジンは受け取った `If-Modified-Since` の値と現在のリソースの `Last-Modified` の値を比較して、変更がなければボディを含まない `304 Not Modified` レスポンスを返します。`304 Not Modified` を受け取ったブラウザは自身のブラウザキャッシュを使い回します。

`ETag` とは異なり所詮日付でしかないため、リソースの内容を厳密に比較しているわけではないです。そのため、`ETag` よりも精度は低いようです。

個人的には、`Last-Modified`/`If-Modified-Since` 形式の 304 レスポンスを返す方法を知らなかったので、今回の調査で学びになりました。

https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Last-Modified

## Cloudflare CDN のキャッシュステータスの確認手段

Vercel からのレスポンスには `x-vercel-cache` というレスポンスヘッダーが付与されています。これを確認すれば Vercel CDN がレスポンスしたのか、リクエストがオリジンに到達したのか、など判断ができます。

https://vercel.com/docs/edge-network/headers#x-vercel-cache

Cloudflare CDN にも同様の独自ステータスヘッダーがあるだろうと予想して、Cloudflare Pages にデプロイしたサイトのレスポンスヘッダーを Chrome 開発者ツールで覗いてみました。`CF-Cache-Status` というピンポイントな命名のヘッダーを見つけました。ドキュメントでも検索して取りうる値の説明を眺めてみます。

https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#cloudflare-cache-responses

`HIT` になっていれば、CDN が共有キャッシュからレスポンスしたとわかるようです。逆に `MISS` ならオリジンからのレスポンスとも書かれています。`DYNAMIC` もオリジンからのレスポンスですが、こちらは `MISS` とは異なり、Cache Rules で明示的に設定しないと以降もキャッシュされないという意味のようです。

また、次のリンクにある節を見ると、デフォルトでキャッシュしてくれるファイルの種類もあるとのこと。

https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#default-cached-file-extensions

Cloudflare CDN では HTML はデフォルトでキャッシュされず、CSS や JS はキャッシュされるようですね。HTML はコンテンツ提供者として頻繁に変更される可能性が高いですが、CSS や JS はサイトの仕様変更がない限り変更されないので、理に適っているのかなと思います。最近の CSS や JS はバンドラーが生成する際にハッシュ値を付けたりもしますしね。

## 音声ファイルのキャッシュステータスを見てみる

ここで修正前のポケモンBGMループ再生サイトで、実際に音声ファイルのリクエストのレスポンスヘッダーを見てみます。

![pokemon-soundlibrary で実際に音声ファイルを取得したときのレスポンスを表示している Chrome 開発者ツール。Cf-Cache-Status: DYNAMIC が確認できる。](/images/contents/pokemon-soundlibrary-cache-strategy/soundlibrary-sound-cache-before.png)

`CF-Cache-Status: DYNAMIC` なので Cloudflare CDN にはキャッシュされていないことがわかります。また、`Cache-Control` や `ETag` などのキャッシュに関するヘッダーもありません。

それもそのはずで、音声ファイルは Cloudflare Pages Functions で R2 から転送しているのですが、その実際のコードはこちらです。

```ts
export const onRequest: PagesFunction<Env, "version" | "fileName"> = async (context) => {
  // 省略

  const file = await context.env.SOUNDLIBRARY_BUCKET.get(
    `sounds/${context.params.version}/${context.params.fileName}`,
  );

  // 省略

  return new Response(file.body);
};
```

`Response` にボディのみ指定しており、ヘッダーを一切渡していません。ブラウザや CDN がキャッシュを制御するにはレスポンスヘッダーに `Cache-Control` 必要ですが、それを一切渡さないということは当然誰もキャッシュの可否を判定できないということです。これでもキャッシュしてくれるんじゃね…と淡い期待をしていた自分が愚かです。

## R2 を Public Bucket にするとどうなるか

ところで、[syumai さんがツイートのツリーで貼ってくださった Zenn のスクラップ](https://zenn.dev/syumai/scraps/d3468205fee0f0)では、R2 を Public Bucket にすることでキャッシュが効くようになると記載があります。どんな感じでキャッシュが効くのか気になったので調べてみました。

といってもすぐ[ドキュメントが見つかり](https://developers.cloudflare.com/r2/buckets/public-buckets/#caching)、デフォルトのキャッシュ設定によってファイルの拡張子ベースでキャッシュ制御が行われることがわかりました。

> By default, only certain file types are cached. To cache all files in your bucket, you must set a Cache Everything page rule. For more information on default Cache behavior and how to customize it, refer to Default Cache Behavior

ドキュメントを読むだけでは不満だったので(？)、実際の挙動を確認してみるために、R2 の Public Bucket に適当にファイルを置いてレスポンスを覗いてみることにしました。

### HTML(デフォルトでキャッシュされない)

初回のリクエスト時のレスポンスヘッダーは次の通り。

![HTML 取得のレスポンスヘッダー。200 OK。CF-Cache-Status は DYNAMIC。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-html-1.png)

確かにデフォルトのキャッシュルール通り `cf-cache-status: DYNAMIC` でキャッシュされていないようです。`Last-Modified` ヘッダーがあることは確認できますね。

同じ URL でリロードしてもう一度取得してみます。

![HTML 取得のレスポンスヘッダー。304 Not Modified。CF-Cache-Status は DYNAMIC。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-html-2.png)

`304 Not Modified` になりました。スクショ外ですが、リクエスト側のヘッダーを確認したら `If-Modified-Since` というヘッダーを送っていました。それを利用して Public Bucket が `304 Not Modified` を返してくれるようですね。

ところで、ブラウザリロードを繰り返してキャッシュ有無の調査をするのは間違っていました。ディスクキャッシュが効いているかどうかを期待するためには、リロードではなくナビゲーション(リンク遷移)を行う必要があるようです。

https://blog.jxck.io/entries/2023-11-05/reload-and-cache.html

しかし結果として、R2 Public Bucket が配信する HTML は共有キャッシュは効かないが `304 Not Modified` にはなるということがわかりました。304 になるということは、レスポンスボディの転送コストは発生しないということですね。(ナビゲーションとリロードでリクエストの挙動が変わることを考慮して、HTML にリンクを置いてちゃんと確認はしましたが省略…。)

### PNG(デフォルトでキャッシュされる)

続いて、PNG についても同様に確認してみます。まず初めてのリクエスト時。

![PNG 取得のレスポンスヘッダー。200 OK。CF-Cache-Status は MISS。Cache-Control は max-age=14400。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-png-1.png)

`CF-Cache-Status: MISS` でオリジンからのレスポンスであることがわかります。HTML とは異なり、`Cache-Control` が設定されています。これによって CDN がキャッシュできると判断したようです。さらに HTML にはなかった `ETag` も付与されています。正確に `304 Not Modified` を返す準備も整っているようです。

同じ URL でリロードしてもう一度 PNG を取得してみます。

![PNG 取得のレスポンスヘッダー。304 Not Modified。CF-Cache-Status は HIT。Cache-Control は max-age=14400。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-png-2.png)

予想通り `CF-Cache-Status: HIT` になり、Cloudflare CDN の共有キャッシュからレスポンスされています。`304 Not Modified` になるということは、レスポンスボディの転送コストは発生しないということですね。

ちなみに、ここでもリロードして確認するのは間違っています。ナビゲーションによるリクエストであれば `200 OK(from disk cache)` と表示されます。実際にナビゲーションによるリクエストも確認してディスクキャッシュされていることが確認できました。

### WAV(デフォルトでキャッシュされない)

HTML と同じくデフォルトではキャッシュ対象外なので HTML と同じ挙動だと予想されますが、音声ファイルも別途確認してみました。

![WAV 取得のレスポンスヘッダー。200 OK。CF-Cache-Status は DYNAMIC。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-wav-1.png)

１回目のアクセス時は `cf-cache-status: DYNAMIC` で HTML と同じですが、`ETag` が付与されていることが HTML とは異なる点ですね。`304 Not Modified` になることが予想されます。

同じ URL でリロードしてもう一度 WAV を取得してみます。

![WAV 取得のレスポンスヘッダー。304 Not Modified。CF-Cache-Status は DYNAMIC。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/public-bucket-example-wav-2.png)

はい、予想通り `304 Not Modified` になりました。スクショ外ですが、`If-None-Match` が付与されているのも確認できました。

ちなみに、やはりこれもリロードなので検証リクエストが送信されていますがキャッシュの確認としては間違った行動です。ナビゲーションで確認すると `200 OK(from disk cache)` と表示されました。あれ、`Cache-Control` がないのに disk cache…？

自分は `Cache-Control` がない場合は少なくとも検証リクエストは送信すると思っていたのですが、そうではなかったようです。なぜ disk cache となるのか気になったので調べてみると、**ヒューリスティックキャッシュ**という概念があることを知りました。

https://developer.mozilla.org/ja/docs/Web/HTTP/Caching#%E3%83%92%E3%83%A5%E3%83%BC%E3%83%AA%E3%82%B9%E3%83%86%E3%82%A3%E3%83%83%E3%82%AF%E3%82%AD%E3%83%A3%E3%83%83%E3%82%B7%E3%83%A5

前提として、HTTP は可能ならばキャッシュをしようとする設計らしいですね。長期間更新されていないコンテンツはその後も更新される可能性が低いと経験的に判断できるため、`Last-Modified` さえわかれば適度なキャッシュ期間を設けてブラウザキャッシュしてくれるようです。

## 音声ファイルのキャッシュ戦略を考える

さて、ここから音声ファイルのキャッシュ方法を考えます。ポケモンBGMループ再生サイトの音声ファイルは次のような性質があります。

- 滅多に更新されない
- ファイルサイズはかなり大きい(最大34.7MB)
- 無限ループ再生機能の提供なのでリクエスト数は多くない
- お気に入り登録機能もあるので1人から同じリクエストが何度も届きやすい

これらの性質から次のようなキャッシュ戦略を考えました。

- ブラウザに長期間キャッシュしてほしい
- CDN キャッシュはどちらでもよい
- 大した数にはならないので検証リクエストは毎回飛んできても構わない

ということで、次のようなレスポンスヘッダーを返すと良さそうです。

```http
HTTP/1.1 200 OK
Cache-Control: no-cache
ETag: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

`Cache-Control: no-cache` によってブラウザにキャッシュを指示しますが、キャッシュを使う前に都度検証リクエストを送ってくれます。その検証リクエスト時には、`ETag` の値を `If-None-Match` に載せて送信してくれるので、それを見て `304 Not Modified` を返すことができます。

## 実装方法

ポケモンBGMループ再生サイトの音声ファイルは、Pages Functions で R2 からファイルを取得してレスポンスに乗せています。R2 のオブジェクトにプログラムで扱うことができる `etag` が含まれているので、それを使って `304 Not Modified` を返すかどうか判断するロジックを作ることも出来ます。

しかし、先の調査で R2 を Public Bucket にすると WAV のレスポンスに `ETag` がすでに付与され、適切に 304 レスポンスがされていることを思い出しました。なので、音声ファイルを保存している R2 にカスタムドメインを割り当てて Public Bucket にし、Pages Functions はそのカスタムドメインにヘッダーを維持したままリクエストを流す形式にしたほうが、自前で `ETag` 判定を組む必要がなくて楽だと考えました。

ということで、音声ファイルを保存している R2 を Public Bucket にした上で、Pages Functions の実装を次のように書き換えました。

```ts
interface Env {
  SOUNDLIBRARY_PUBLIC_BUCKET_DOMAIN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const bucketURL = new URL(context.request.url);

  bucketURL.hostname = context.env.SOUNDLIBRARY_PUBLIC_BUCKET_DOMAIN;

  const request = new Request(bucketURL, context.request);

  const originResponse = await fetch(request);

  const edgeResponse = new Response(originResponse.body, originResponse);

  edgeResponse.headers.set("Cache-Control", "no-cache");

  return edgeResponse;
};
```

ブラウザからのリクエストの URL を Public Bucket に書き換えた `Request` オブジェクトを生成し、それを使って `fetch` します。その `Response` を元に新しい `Response` を生成して、`Cache-Control` を付与した上で返します。

最初、`fetch` が生成した `Response` の `headers` に直接 `Cache-Control` を追加しようとしたのですが、読み取り専用らしくランタイムエラーになりました。なので一旦コピーを作ってからヘッダーを追加するようにしました。[公式ドキュメントの Examples](https://developers.cloudflare.com/workers/examples/alter-headers/) も同じような実装を紹介していました(リンクは Cloudflare Workers のドキュメントだが、Pages Functions のランタイムも Workers なので実質同じはず)。

R2 Public Bucket の実験で WAV ファイルを確認したとき、`ETag` は付与されていましたが `Cache-Control` は付与されていませんでしたね。それを踏まえて Pages Functions 内で `Cache-Control` を付与することにしています。

リクエスト/レスポンスボディに触ることなく `Request` や `Response` を取り扱っている感じが、なんかエッジコンピューティング感ありませんか(？)

余談なのですが、次のような書き方で試したときはうまくいきませんでした。

```ts
const originResponse = await fetch(request);

const edgeResponse = new Response(response.body, {
  status: response.status,
  headers: {
    ...response.headers,
    "Cache-Control": "no-cache",
  },
});

return edgeResponse;
```

具体的には、`Cache-Control` はブラウザまで到達していたのですが、`ETag` が消えてしまっていました。`...response.headers` でオリジナルのヘッダーをすべてコピーしているのでいけると思ったのですが、原因は不明です…。

### 動作確認

デプロイしたら実際にサイトを操作して、音声ファイルのレスポンスを覗いてみます。

![音声ファイルのレスポンスヘッダー。200 OK。CF-Cache-Status は DYNAMIC。Cache-Control は no-cache。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/soundlibrary-sound-cache-after-1.png)

`Cache-Control: no-cache` になっていますね。`CF-Cache-Status: DYNAMIC` なので CDN にはキャッシュされないことがわかります。しかし `ETag` が付与されているので、次回以降のレスポンスは `304 Not Modified` になることが予想されます。

同じ音声ファイルでもう一度再生してみます。

![音声ファイルのレスポンスヘッダー。304 Not Modified。CF-Cache-Status は DYNAMIC。Cache-Control: no-cache。ETag あり。Last-Modified あり。](/images/contents/pokemon-soundlibrary-cache-strategy/soundlibrary-sound-cache-after-2.png)

期待通り `304 Not Modified` になってくれました。スクショ外ですがリクエストヘッダーには `If-None-Match` が付与されていました。音声ファイルの転送は発生していないため、レスポンス速度は改善されています。

ここで動作確認中にあることに気づきました。音声ファイルの取得は JavaScript の `fetch` で行っているのですが、リクエスト時に `headers` を一切付与していないのです([実際のコードはこちら](https://github.com/y-hiraoka/dp-soundlibrary/blob/c40dea50e05c7f84d7eb807893c57c93fe7eb820/src/state/playerState.ts#L61))。

しかしこれでもキャッシュが有効になっていることを疑問に感じて、`fetch` 関数(が生成する `Request`)の `cache` について調べ直しました。

https://developer.mozilla.org/ja/docs/Web/API/Request/cache

`headers` なしの `fetch` でも、ディスクキャッシュが「新しい」とみなすことができればそれを使い、「古い」なら検証リクエストを送って 304 になるかどうかを伺ってくれるようです。もちろん、そもそもディスクキャッシュがヒットしなければ普通の 200 レスポンスを期待して送信してくれます。このデフォルトの挙動によって、`header` なし `fetch` で取得する音声ファイルもキャッシュが効いている事がわかりました。

ということで、無事音声ファイルをブラウザにキャッシュできるようになり、転送コストが削減できました。

## 余談

`fetch` で取得した音声ファイルは全部ダウンロードが完了するまで再生が開始されません。もしストリーミングで再生ができれば、ファイルサイズが多少大きくてもファイルの一部がダウンロードされた段階で再生を開始できるはずなんですよね…。

でも音声データの区間を指定して正確に無限ループ再生をするには、一旦音声データをすべてメモリに載せないとダメらしいのです。それで仕方なく `fetch` でダウンロードの完了を待ってから再生しています。

だからこそ、音声ファイルリクエストに対してキャッシュが効くようになることはユーザー体験の大きな改善ですね。

今回は音声ファイルをブラウザにキャッシュしてもらいつつ、都度検証リクエストを送信してもらう形式にしました。`Cache-Control: no-cache` なので CDN にはキャッシュされていないのですが、やり方次第では検証リクエストを CDN で捌くことができるのでしょうかね。それができれば地球の裏側にいるユーザーからの検証リクエストも高速にレスポンスできるのかなと思いました（君のサイトはブラジルの誰も見てないよと言うのはやめてください(？)）。

それと `Cache-Control: no-cache` にしたのは他にも理由があって、キャッシュ期間の目安を知らないんですよね。`Cache-Control` について調べ回っているときにいろんな `max-age` の値を見ましたが、こういう静的ファイルはどの程度のキャッシュ期間を設けるのが一般的なのか結局分からずでした。もちろんサービスやリソースの性質次第だよというのは分かるのですが…。1年間キャッシュして仮にリソースの更新したとき、ユーザーは知らずに1年間古いリソースを使い続けてしまうのかなとか考えていると、都度検証リクエストすればいいのではと思ってしまいました。

## まとめ

ポケモンBGMループ再生サイトの音声ファイルをキャッシュするため、キャッシュについて改めてちゃんと調べたことを書きました。

無事音声ファイルはキャッシュされるようになり、体験が改善されました。

Cloudflare を使っていく上でキャッシュ周りの理解は必須なので、今後も精進したいと思います。

それでは良い Cloudflare ライフを！
