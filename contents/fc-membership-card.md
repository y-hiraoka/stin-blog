---
title: "ハロー！プロジェクトファンクラブのデジタル会員証があまりに杜撰なので、正しい実装を考える"
createdAt: "2025-01-01T13:51:55.484Z"
tags: ["nextjs"]
---

ハロー！プロジェクトのファンクラブ(以下FC)サイトが2024年11月にリニューアルされました。

https://www.upfc.jp/helloproject/news_detail.php?@uid=s32dbjT7VpPSK55H

リニューアル内容のひとつにデジタル会員証があります。

今までプラスチックカードの会員証が自宅に届いていたのですが、2025年4月以降は廃止になるようです。代わりにデジタル会員証を提示することになるそう。

リニューアルする前からデジタル会員証が実装されることが発表されていたので、ちょっとはテクノロジー活用できるようになってきたんか〜と期待していました。

## 実際に出てきたデジタル会員証

で、出てきたデジタル会員証が次のスクショです。

![ハロー！プロジェクトファンクラブサイトのデジタル会員証ページのスクリーンショット。物理カードを画像化した要素にテキストが重ねて表示されている。テキストは会員番号と氏名と有効期限の3つがある。カードと並んで現在時刻も表示されている。](/images/contents/fc-membership-card/memberscard-screenshot.jpg)

これだけです。

### 問題点

DOMインスペクターで画面の作りを見てみると、カード風の画像の上にテキストで会員番号や氏名を表示しているだけです。

Webサイトで表示すると、カードの上にある時計はJavaScriptによって秒刻みで動いています。この時計が動いているかどうかで、他人のスクリーンショットを提示していないかを確認したいのだろうと思います。

しかしWebページを会員証代わりにする以上、対策すべきはスクリーンショットによる偽装だけではありません。

固定の文言だけを表示するWebページは簡単にクローンを作れます。Webページをクローンして別のサイトで公開する方法は以前記事にしています。

https://blog.stin.ink/articles/clone-web-page

時計部分は動いているので固定文言ではありませんが、JavaScriptで動いているだけなのでクローンサイト上でも同じように秒刻みに動きます。

クローンしたHTMLをベースにして、任意の会員番号や氏名を表示可能なWebサイトを作成することもできます。物理カードの会員証を貸し借りすることに比べて何倍も、他人になりすましてFCイベントに参加することが容易になります。

会員証を提示するときにURLまで細かく確認する運用であればWebサイトクローンも防げるかもしれませんが、イベント会場のオープン時に何百人分ものWebブラウザのURLバーを目視確認するなんてあまりに非現実的な運用でしょう。そもそもブラウザに表示されているURLだって、スタッフが見間違えるようにドメインスプーフィングになっているかもしれません。

以上のことから、FCサイトのデジタル会員証は偽装(偽造)の余地が大きく、会員であることの証明には使えません。偽造難易度の高い物理カードのほうがまだマシです(その物理カードもICチップなどが埋め込まれているわけではありませんがね)。

## 偽造されない実装を考える

ということで、偽造されにくい実装方法を考えます。

### 会員証の要件

物理カード、デジタル問わず、会員証に求められる要件を整理します。

- FC公式が発行する
- 会員期限がわかる
- 氏名や会員番号によって所有者を識別できる
- 偽造できない

こんなところでしょうか。

### デジタル会員証の実装方法

発行者以外が偽造できないテキストデータの作り方がありますね。JWT(JSON Web Token)です[^1]。

[^1]: 厳密には偽造や改竄に耐性があるテキストデータの作り方のことはJWS(JSON Web Signature)と言いますが、JWTのほうが用語として有名なのでJWTと呼びます。

JWTでは発行者しか知らない鍵を使って、データの署名(ハッシュ値)を生成します。データと署名を結合して発行した文字列がJWTになります。鍵を知らない人がデータから同じ署名を生成することは現実的に不可能なので、JWTの署名を検証すれば発行者を判断できます。

JWTの署名には公開鍵暗号方式が使えます。秘密鍵で署名したJWTは対応する公開鍵で検証することができ、その秘密鍵で署名されたJWTかどうかを確認できます。秘密鍵をその名の通り発行者しか知らない鍵とすることで、JWTが偽造されないことを保証します。公開鍵は誰に知られても問題ないので、インターネット上で配布します。事前にFCスタッフのスマートフォンなどにダウンロードしておけば、インターネットに接続されていない端末でも会員証の確認ができます。

JWTに含めるデータはJSON形式でなんでも持たせられます。JWTのデータとして会員期限や氏名、会員番号を含めてやれば、JWTが会員証としての要件を満たせます。含めるデータからハッシュ値が計算されるため、含めるデータが違うとハッシュ値も変わります。そのため、別人になりすましたり会員期限切れなのに会員であるかのように装うことも不可能です。

JWTはただのテキストデータなので、QRコードに変換できます。QRコードにすれば、別のスマートフォンなどで読み取ることができます。QRコードを読み取ったら公開鍵を使ってJWTを検証し、本当に会員か、会員期限は切れていないか、誰の会員証なのかを確認できます。

JWT自体に有効期限を持たせることができます(会員の有効期限とは無関係の概念です)。JWTの有効期限を1分などにして1分に1度JWTを再発行すれば、スクリーンショットを提示されることも防げます。1分以内に他人とQRコードのスクリーンショットをやり取りすればそれも掻い潜ることができるかもしれませんが、やはりJavaScriptで動く時刻を併記することでその可能性すらもゼロにできます。

JWTを使ったデジタル会員証のフローを図にすると次のようなイメージになります。

![FCサーバーと入場者とスタッフの3ロールが登場する。FCサーバーが秘密鍵と公開鍵を持つ。FCサーバーが秘密鍵で署名したJWT会員証を入場者に発行。スタッフはFCサーバーから公開鍵を取得。入場者はQRコードにしたJWTをスタッフに提示。スタッフは入場者に提示されたJWTを検証して会員を特定し入場を許可。](/images/contents/fc-membership-card/flow.png)

この実装で、会員証の要件を満たしているか確認します。

- FC公式が発行する：満たす
  - 秘密鍵を持つFCサーバーだけが発行できます
  - 対応する公開鍵で誰でもFCサーバーが発行したことを確認できます
- 会員期限がわかる：満たす
  - JWTのデータとして持たせることで会員の有効期限がわかります
- 氏名や会員番号によって所有者を識別できる：満たす
  - JWTのデータとして持たせることで識別できます
- 偽造できない：満たす
  - 秘密鍵を持つFCサーバーだけがJWTを発行できます
  - 他人になりすましたり会員期限切れを誤魔化すこともできません

よって、デジタル会員証のWebページにはJWTをQRコードに変換した画像を含めるのが良いでしょう。

## デモを作ってみた

お試しで短命のJWTを発行してQRコードとして表示するだけのWebサイトを作ってみました。

https://fc-membership-card-demo.pages.dev/

僕はFCサイトを開発している人間じゃないので当然無関係のデモです。

「会員情報入力」リンクで開くフォームに適当な名前や会員番号を入力すると、お使いのブラウザのCookieに保存されます。ブラウザ以外には保存していないので安心して入力してください。

「会員情報入力」で入力確定するか「会員証を表示」のリンクを開くとQRコードが表示されます。ファンが会員証を提示する用の画面ということですね。それがCookieに保存されている会員情報を含むJWTを変換したものです。JWTの有効期限は1分にしてあるので、55秒に一度JWTの再発行をしています。55秒待つと勝手に表示されているQRコードが変わります。

「QRコードリーダー」リンクで開く画面でQRコードを読み取れます。会員証を確認するスタッフ用の画面になります。2台端末が必要ですが、片方でQRコードを表示してもう一方で読み取ることでQRコードが含む会員情報が表示されることが試せます。

## 実装解説

デモ実装のコードを掻い摘んでコピペしながら説明を入れていきます。コードは公開しているので、全体的に見たい方や実際に動かしたい方はリポジトリをご覧ください。

[https://github.com/stinbox/fc-membership-card-demo](https://github.com/stinbox/fc-membership-card-demo)

デモなので秘密鍵と公開鍵をリポジトリに含めた上でパブリックリポジトリにしていますが、実際のサービスで運用する秘密鍵を誰でも見れる場所に公開するのは絶対にしてはいけません。真似しないでください。

### セッション周り

簡易的にユーザーセッションを再現するために [iron-session](https://github.com/vvo/iron-session) を使いました。

```tsx
import "server-only";
import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData =
  | {
      id: string;
      name: string;
      membershipExpiry: string;
    }
  | {
      id: undefined;
      name: undefined;
      membershipExpiry: undefined;
    };

const COOKIE_NAME = "dummy-session";
const SESSION_PASSWORD = "dummy-password-12345678901234567890";

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();

  const session = await getIronSession<SessionData>(cookieStore, {
    cookieName: COOKIE_NAME,
    password: SESSION_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });

  return session;
}
```

`getSession` 関数で一枚ラップしています。`cookies()`依存なので、`”server-only”` のマークもしています。`id`, `name`, `membershipExpiry`をCookieに持つことを型に付けることが主な目的ですね。本当のWebアプリケーションならCookieにはsession IDだけが入っており、それをキーにして外部APIやデータベースなどからユーザー情報を引っ張ってくるでしょう。今回はデモだしデータストアを用意したくなかったのでCookieに全部ぶちこみます。

会員情報入力フォームでは次のServer Actionsを実行しています。

```tsx
"use server";

import * as v from "valibot";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const ValueSchema = v.object({
  name: v.string("氏名を入力してください"),
  id: v.string("会員番号を入力してください"),
  membershipExpiry: v.string("有効期限を入力してください"),
});

export async function registerUser(formData: FormData) {
  const name = formData.get("name");
  const id = formData.get("id");
  const membershipExpiry = formData.get("membershipExpiry");

  const inputValues = v.parse(ValueSchema, {
    name,
    id,
    membershipExpiry,
  });

  const session = await getSession();

  session.destroy();

  session.id = inputValues.id;
  session.name = inputValues.name;
  session.membershipExpiry = inputValues.membershipExpiry;

  await session.save();

  redirect("/membership-card");
}
```

`getSession` でiron-sessionのインスタンスを取り出して、入力された値をセッションに保存しているだけです。登録完了したら適当にQRコードのページ(`/membership-card`)にリダイレクトさせます。

### 鍵生成

JWT周りの処理のために [jose](https://www.npmjs.com/package/jose) というライブラリを使っているのですが、これが秘密鍵・公開鍵ペアの生成関数も提供しています。これを使って生成したファイルをそのままリポジトリに含めています。本当は秘密鍵の公開なんて絶対にやってはいけませんがデモなので御愛嬌ということで。

```tsx
import * as jose from "jose";
import fs from "fs/promises";

const { privateKey, publicKey } = await jose.generateKeyPair("RS256", {
  extractable: true,
});

const privateJWK = await jose.exportJWK(privateKey);
const publicJWK = await jose.exportJWK(publicKey);

await fs.writeFile("src/private-key.json", JSON.stringify(privateJWK, null, 2));
await fs.writeFile("src/public-key.json", JSON.stringify(publicJWK, null, 2));
```

アルゴリズムはRS256を選択しました。

### JWTの生成と検証

先に言及しましたがJWT周りの処理には jose を使います。まずはJWTの生成関数から。

```tsx
import * as jose from "jose";
import privateKey from "./private-key.json";
import { SessionData } from "./session";

export async function generateMembershipToken(payload: SessionData): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("1m")
    .sign(privateKey);
}
```

`new jose.SignJWT(payload)` から始めて、メソッドチェーン形式で色々追加します。使用する鍵はRS256で生成してあるので、ヘッダーにもRS256のアルゴリズムを指定しておきます。JWTの有効期限は1分にしました。最後に生成しておいた秘密鍵で署名したら `string` になります。

続いてJWTを検証する関数。

```tsx
import * as jose from "jose";
import publicKey from "./public-key.json";
import { SessionData } from "./session";

export type MembershipTokenResult =
  | {
      success: true;
      data: SessionData;
    }
  | {
      success: false;
    };

export async function verifyMembershipToken(
  token: string,
): Promise<MembershipTokenResult> {
  try {
    const result = await jose.jwtVerify<SessionData>(
      token,
      await jose.importJWK(publicKey, "RS256"),
    );

    return {
      success: true,
      data: result.payload,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}
```

`jose.jwtVerify()` に検証したいJWTと公開鍵を渡すことで、JWTが対応する秘密鍵で署名されているのか、有効期限が切れていないかを同時に確認できます。検証に成功すると、JWTに含まれているデータ(ここでは`id`, `name`, `membershipExpiry`)を取り出せます。失敗時の場合は雑にキャッチしてResult型ライクにしました。

### QRコードへ変換

テキストデータをQRコードに変換できるライブラリがありました。

https://www.npmjs.com/package/qrcode

これをクライアントサイドで使ってSVGに変換しています。img要素に渡すのでPNGでも良かったのですが、内部的にNode.jsのAPIを使っているようでEdgeランタイムで動きませんでした。今回はCloudflare PagesでデプロイしているのでSVGにすることで回避しました。

サーバーサイドでJWTを発行してもらうのですが、それは`getSession`と`generateMembershipToken` を組み合わせたものをServer Actionとして実装しています。

```tsx
"use server";

import { generateMembershipToken } from "@/lib/membership-token";
import { getSession } from "@/lib/session";

export async function fetchMembershipToken() {
  const session = await getSession();
  if (!session.id) {
    throw new Error("Session not found");
  }

  return await generateMembershipToken(session);
}
```

これをクライアントサイドから55秒インターバルで呼び出しています。

```tsx
"use client";

import * as QRCode from "qrcode";
import { Suspense, use, useCallback, useEffect, useState } from "react";
import { fetchMembershipToken } from "./fetch-membership-token";

function toQRCodeSvgString(token: string): Promise<string> {
  return QRCode.toString(token, {
    errorCorrectionLevel: "L",
    type: "svg",
  });
}

const QRCodeViewInner: React.FC<{ defaultSvgString: Promise<string> }> = ({
  defaultSvgString,
}) => {
  const [svgString, setSvgString] = useState(use(defaultSvgString));

  const resetSvgString = useCallback(async () => {
    const token = await fetchMembershipToken();
    const svgString = await toQRCodeSvgString(token);
    setSvgString(svgString);
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      resetSvgString();
    }, 1000 * 55);
    return () => clearInterval(timerId);
  }, [resetSvgString]);

  return (
    <img
      className="w-96"
      src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
      alt="QRコード"
    />
  );
};
```

`defaultSvgString`はServer Componentから届く初期値です。インターバル実行は `useEffect`を使った原始的なやりかたですね。`fetchMembershipToken` はまるでクライアントサイドで実行されているように見えますが、Server Actionsなので実際はPOSTリクエストであり処理の実行はサーバーサイドです。JWT生成のための秘密鍵はブラウザには届いていないので安心です。

### QRコードの読み取り

QRコードを読み取りJWTを取得するために [react-qr-reader](https://www.npmjs.com/package/react-qr-reader) というライブラリを使いました。`QrReader`を設置すると、ユーザーにカメラのアクセス権を要求します。ユーザーがカメラアクセスを許可してくれたら、カメラを起動してカメラに映る映像を video 要素に表示してくれます。そしてカメラがQRコードを見つけたら`onResult`を実行してくれます。

```tsx
"use client";

import { MembershipTokenResult, verifyMembershipToken } from "@/lib/membership-token";
import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";

export const QrReaderPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [verifiedResult, setVerifiedResult] = useState<MembershipTokenResult | null>(
    null,
  );

  useEffect(() => {
    if (token) {
      verifyMembershipToken(token).then((result) => setVerifiedResult(result));
    }
  }, [token]);

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={(result, error) => {
            if (result) {
              const text = result.getText();
              setToken(text);
            }
          }}
          videoId="qr-reader"
        />
        {verifiedResult && (
          <div>
            {verifiedResult.success ? (
              <>
                <p>会員番号: {verifiedResult.data.id}</p>
                <p>氏名: {verifiedResult.data.name}</p>
                <p>有効期限: {verifiedResult.data.membershipExpiry}</p>
              </>
            ) : (
              <p className="text-danger-500">無効なQRコードです!!!!!!!!!!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

`onResult`でQRコードが意味するテキストを取得します。そのテキストはJWTのはずなので`verifyMembershipToken`に渡します。`"use client"`がついているのでこれはブラウザ側で実行されますが、公開鍵は誰にダウンロードされても問題ないのでこれで良いです。

`verifyMembershipToken`に成功すれば氏名や会員番号が表示できるし、無効なJWTならエラー表示することでスタッフに通知できます。

余談ですが、`QrReader` コンポーネントの `videoId` propsは型的にオプショナルになっていますが、渡さないとなぜか video 要素に何も表示されませんでした。エラーになるわけではないしQRコードをカメラに向けると認識はしていました。謎です。react-qr-readerを使う機会があればお気をつけください。

実装は以上です。

## まとめ

偽造されないデジタル会員証の実装方法について考えました。

署名付きJWTをQRコードとして表示することで、会員証を偽造されないようにできます。JWTの有効期限を1分などの短命にしておけば、スクリーンショットを提示されることも防げます。スタッフはQRコードを読み取るだけで、会員番号や氏名、会員期限を確認できます。作り方次第ではスタッフの端末はオフラインでも動作させることができます。

FCサイトはデジタル会員証に限らず、割とガバガバな作りが見受けられます。一技術者としてはFCサイトの実装についてはあまり感心しないですね。そうは言っても使い続けるしかないのですが…。
