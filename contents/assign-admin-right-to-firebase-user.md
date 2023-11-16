---
title: "Firebase Auth, Firestore, Functions for Firebase でサクッと管理者権限を割り振る"
createdAt: "2022-10-10T14:46:35.818Z"
tags: ["firebase"]
---

Firebase のユーザーに個別に権限を割り振りたい要件は多そう。すでに似たような記事はたくさんありますが、自分も実装方法を調べたので文章にしておきます。

## 実装イメージ

Firebase Auth の[カスタムクレーム](https://firebase.google.com/docs/auth/admin/custom-claims?hl=ja)を使用します。Firebase ユーザーオブジェクトに独自のプロパティを生やすことができる機能です。

Firestore にユーザー別にどんな権限(=カスタムクレーム)を持っているかを格納しておく `user-claims` というコレクションを用意します(コレクション名は任意)。

Functions for Firebase で Firestore の `user-claims` コレクションへの変更イベントをリッスンして、その内容を Firebase Auth のカスタムクレームに同期させます。 `user-claims` コレクションへの書き込みは Firebase コンソールから直接でも Admin サーバー経由でもいけます。

## 実装後の使い道

クライアント環境でユーザーに付与されたカスタムクレームを参照して、画面の出し分けに使えたりします。

```tsx
const isAdminUser = getAuth()
  .currentUser?.getIdTokenResult(true)
  .then((idToken) => idToken.claims.isAdminUser); // `isAdminUser` の部分は好きなキー名にできる。ただし型はつかない

console.log(isAdminUser); // user-claims コレクションで付与した値
```

また、Callable Functions のリクエスト検証で認証チェックの 1 つとして利用できます。

```tsx
export const myFunction = functions.https.onCall(async (data, context) => {
  if (context.auth?.token.isAdminUser !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "The function must be called by admin user.",
    );
  }

  // do something
});
```

他にも使い道の可能性は無限大です。知らんけど。

## 実装方法

Firestore の `user-claims` コレクションに登録されたデータを Firebase Auth のカスタムクレームにセットする処理を Functions が担当しますので、Functions のコードを書いていきます。

`user-claims` コレクション内のドキュメントデータとカスタムクレームを完全に同期するには、

- `user-claims` コレクションにドキュメントが作成されたらカスタムクレームに書き込む
- `user-claims` コレクションのドキュメントが更新されたらカスタムクレームに書き込む
- `user-claims` コレクションのドキュメントが削除されたらカスタムクレームも削除する
- ユーザーが削除されたら `user-claims` コレクションのドキュメントも削除する

の 4 つの処理が必要になります。 `user-claims` コレクションのドキュメント ID はユーザー ID とします。

```tsx
export const addUserClaims = functions.firestore
  .document("user-claims/{docId}")
  .onCreate((userClaims) =>
    getAuth().setCustomUserClaims(userClaims.id, userClaims.data()),
  );

export const updateUserClaims = functions.firestore
  .document("user-claims/{docId}")
  .onUpdate((userClaims) =>
    getAuth().setCustomUserClaims(userClaims.after.id, userClaims.after.data()),
  );

export const removeUserClaims = functions.firestore
  .document("user-claims/{docId}")
  .onDelete((userClaims) => getAuth().setCustomUserClaims(userClaims.id, null));

export const removeUserClaimDoc = functions.auth.user().onDelete((user) => {
  getFirestore().collection("user-claims").doc(user.uid).delete({ exists: false });
});
```

尚、本記事ではユーザーが存在するが対応する `user-claims` のドキュメントは存在しない状態を許容するものとします。

はい、これで Firestore の `user-claims` にドキュメントを追加すれば同じ ID のユーザーに対して自由に権限が割り振れるようになりました。

あとは Firebase コンソールなり Admin 環境から `user-claims` にユーザー ID をドキュメント ID としたドキュメントを追加していけばいいでしょう。

ちなみに、わざわざ Functions や Firestore を使わなくても Admin 環境で `setCustomUserClaims` を呼び出せばいいのですが、Firestore と同期されていれば Firebase コンソールからでも登録削除ができるので便利になりますし、カスタムクレームの内容を Firestore のコレクションで一元管理できるのでわかりやすいです。

## まとめ

Firebase Auth, Firestore, Functions for Firebase を組み合わせて、ユーザーに権限を割り振る方法を紹介しました。

実装方法を簡単にまとめると

- Functions で Firestore の変更イベントを検知して、Firebase Auth のカスタムクレームに書き込む
- 書き込まれたカスタムクレームをクライアントや Callable Functions で使う

です。

それではよい Firebase ライフを！
