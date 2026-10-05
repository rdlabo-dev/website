---
title: 'Identity Verification Sheet'
code: ['identity-verification-sheet/example.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['example.ts']: [1, 1] } },
    { id: '結果を受け取る', activeLine: { ['example.ts']: [5, 18] } },
    { id: 'セッション認証情報を取得する', activeLine: { ['example.ts']: [31, 34] } },
    { id: 'webプラットフォームを初期化する', activeLine: { ['example.ts']: [27, 31] } },
    { id: 'シートを作成して表示する', activeLine: { ['example.ts']: [34, 42] } },
    { id: 'failedtoloadを処理する', activeLine: { ['example.ts']: [18, 27] } },
    { id: 'verificationresultを処理する', activeLine: { ['example.ts']: [5, 18] } },
    { id: 'エラーとキャンセル', activeLine: { ['example.ts']: [5, 18] } },
  ]
---

Stripe Identity は、Capacitor のアプリケーションコードを保ったまま、iOS と Android ではネイティブシート、Web では Stripe.js を使って本人確認書類を検証します。

ネイティブでは `verificationId` と `ephemeralKeySecret` で Stripe Identity Verification Sheet を表示します。Web では `initialize` 後、`clientSecret` を指定して `verifyIdentity` を呼びます。

## 結果を受け取る

結果リスナーはアプリケーション起動時に一度だけ、`present()` より前に登録します。Android ではネイティブシート表示中に Activity と JavaScript ランタイムが再生成されることがあるため、早期登録によって結果の取りこぼしを防ぎます。

リスナーは `main.ts`、アプリケーション初期化処理、シングルトンサービスなど、アプリケーションレベルの所有者が存続する間は保持してください。`present()` の直後に削除してはいけません。Android の `present()` はシート表示時に解決し、結果は後から `VerificationResult` で届きます。

`Completed`、`Canceled`、`Failed` は `IdentityVerificationResult.result` の値です。個別の `addListener` イベントではないため、`IdentityVerificationSheetEventsEnum.VerificationResult` を登録して `result` を確認します。

!::IdentityVerificationSheetEventsEnum::

ネイティブ結果の引き継ぎはメモリ上だけです。OS によるプロセス終了後の復旧は保証されません。

## セッション認証情報を取得する

バックエンドで Stripe のシークレットキーを使って VerificationSession と、そのセッション用の一時キーを作成し、クライアントへ安全に渡せるフィールドだけを返します。

公式デモサーバー（`POST /identify`）は `document` の VerificationSession を作成し、`{ verification_session: session.id }` と Stripe API バージョン `2022-11-15` で一時キーを作成して、次のフィールドを返します。

| レスポンス | 取得元 | `create` オプション |
| --- | --- | --- |
| `verificationId` | `VerificationSession.id` | `verificationId` |
| `ephemeralKeySecret` | `EphemeralKey.secret` | `ephemeralKeySecret` |
| `clientSecret` | `VerificationSession.client_secret` | `clientSecret` |

```ts
const session = await stripe.identity.verificationSessions.create({
  type: 'document',
});
const ephemeralKey = await stripe.ephemeralKeys.create(
  { verification_session: session.id },
  { apiVersion: '2022-11-15' },
);

return {
  verificationId: session.id,
  ephemeralKeySecret: ephemeralKey.secret,
  clientSecret: session.client_secret,
};
```

Stripe のシークレットキーはサーバーに保持します。Capacitor アプリへ渡すのは、Web の `initialize` 用の公開可能キーと `verificationId`、`ephemeralKeySecret`、`clientSecret` だけです。`STRIPE_SECRET_KEY` をクライアント、ネイティブバイナリ、フロントエンドのバンドルに含めないでください。

端末の `Completed` は書類アップロード完了を意味し、その後 VerificationSession は処理中になります。最終結果はサーバーで `identity.verification_session.verified`、`identity.verification_session.requires_input`、`identity.verification_session.processing`、`identity.verification_session.canceled`、`identity.verification_session.redacted` などの Identity Webhook を使って確認してください。[検証結果の処理](https://docs.stripe.com/identity/handle-verification-outcomes)を参照してください。

## Webプラットフォームを初期化する

`initialize` は Web でのみ必須で、公開可能キーを使って Stripe.js を読み込みます。ネイティブではキーを使用せずに解決します。

!::initialize::

## シートを作成して表示する

バックエンドのフィールドを `create` へ渡し、`present()` を呼びます。

- iOS と Android では `verificationId` と `ephemeralKeySecret` が必須です。どちらかが欠けると `create` が拒否され、`FailedToLoad` が通知されます。
- Web は `clientSecret` だけを使用し、ネイティブはこれを無視します。ネイティブビルドでは省略でき、同じコードを Web で使う場合は含めてください。
- `CreateIdentityVerificationSheetOption` と `InitializeIdentityVerificationSheetOption` を `@capacitor-community/stripe-identity` から import しないでください。これらのオプション型はパッケージの index から再エクスポートされていません。

!::create::
!::CreateIdentityVerificationSheetOption::
!::present::

`present()` は `Promise<void>` を返します。結果は `VerificationResult` リスナーから読み取ります。

## FailedToLoadを処理する

`create` がシートを構築できない場合に発生し、Promise も同じ文言で拒否されます。ネイティブでは `verificationId` または `ephemeralKeySecret` が不足すると発生します。Android のメッセージは `Invalid Params. This method require verificationId or ephemeralKeySecret.` で、iOS は同じ文の `this` が小文字です。iOS では `Info.plist` にプライマリアプリアイコンのキーがない場合にも発生します。

リスナーの型は `StripeIdentityError` です。iOS は `{ message }` を渡し、Android は現在 `error` に文字列を設定します。リスナーと、拒否された `create` の Promise の両方を処理してください。

Web の `create` は `clientSecret` を検証せず、常に `Loaded` を通知します。Web の `present` は `FailedToLoad` を通知する代わりに、`Stripe is not initialized.` または `clientSecret is not set.` の例外を投げます。

!::StripeIdentityError::

## VerificationResultを処理する

`IdentityVerificationResult.result` は `IdentityVerificationSheetResultInterface` 型で、`Completed`、`Canceled`、`Failed` のいずれかです。

| `result` | 意味 |
| --- | --- |
| `Completed` | 書類送信完了。審査中なのでWebhookを待つ |
| `Canceled` | 利用者がシートを閉じた。再試行できるようにする。Web では Stripe.js の `session_cancelled` に対応する |
| `Failed` | フロー失敗。`error.message` を表示する。ネイティブはローカライズ済みのエラー文言を送り、Web は Stripe.js のエラーをそのまま渡す |

`Failed` には `error` が含まれます。これらの結果値を `addListener` のイベント名として登録しないでください。

!::IdentityVerificationResult::
!::IdentityVerificationSheetResultInterface::

## エラーとキャンセル

キャンセルはクラッシュではなく利用者の操作として扱い、リスナーを登録したまま、再度 `create` / `present` を実行できるようにします。`present()` の動作はプラットフォームごとに異なります。

- Android はシートを表示した時点で解決します。後から届く `VerificationResult` が `Completed`、`Canceled`、`Failed` を報告し、受け取られるまではメモリ上に保持されます。表示処理で例外が発生すると Promise は拒否されます。
- iOS はシートが閉じるまで待ち、`VerificationResult` を通知してから `present()` を解決します。
- Web は `verifyIdentity` を待ちます。キャンセルと失敗のどちらでも `VerificationResult` を通知して Promise を解決します。`initialize` 未実行または `clientSecret` 不足の場合は拒否されます。

`present()` が解決しただけで成功と判断せず、必ず `verification.result` で分岐してください。
