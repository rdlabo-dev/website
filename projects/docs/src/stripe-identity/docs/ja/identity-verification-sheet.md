---
title: '本人確認シート'
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

## 最初の本人確認経路

最初の送信完了までは次の順で進めます。

1. バックエンドで VerificationSession を作成し、下のクライアント向けフィールドを返す。
2. アプリケーション起動時に一度だけ、`present()` より前に `VerificationResult` リスナーを登録する。
3. Web では公開可能キーで `initialize` を呼ぶ。
4. `create` のあと `present()` を呼ぶ。

端末での最初の成功は、シートが開き、テストフローで書類アップロード完了後に `Completed` を受け取ることです。`Completed` は送信完了であり審査完了ではありません。正式結果はサーバーの Identity Webhook で確認してください。コードパネルも同じ経路です。

## 結果を受け取る

結果リスナーはアプリケーション起動時に一度だけ、`present()` より前に登録します。Android ではネイティブシート表示中に Activity と JavaScript ランタイムが再生成されることがあるため、早期登録によって結果の取りこぼしを防ぎます。

リスナーは `main.ts`、アプリケーション初期化処理、シングルトンサービスなど、アプリケーションレベルの所有者が存続する間は保持してください。`present()` の直後に削除してはいけません。Android の `present()` はシート表示時に解決し、結果は後から `VerificationResult` で届きます。

`Completed`、`Canceled`、`Failed` は `IdentityVerificationResult.result` の値です。個別の `addListener` イベントではないため、`VerificationResult` を登録して `result` を確認します。

!::IdentityVerificationSheetEventsEnum::

ネイティブ結果の引き継ぎはメモリ上だけです。OS によるプロセス終了後の復旧は保証されません。

## セッション認証情報を取得する

バックエンドで Stripe のシークレットキーを使って VerificationSession と、そのセッション用の一時キーを作成し、クライアントへ安全に渡せるフィールドだけを返します。

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

シークレットキーはサーバーに保持します。Capacitor アプリへ渡すのは公開可能キーと上記3フィールドだけです。端末の `Completed` は書類アップロード完了を意味し、審査完了ではありません。最終結果は `identity.verification_session.verified` などの [Identity Webhook](https://docs.stripe.com/identity/handle-verification-outcomes) で確認してください。

## Webプラットフォームを初期化する

`initialize` は Web でのみ必須で、公開可能キーを使って Stripe.js を読み込みます。ネイティブではキーを使用せずに解決します。

!::initialize::

## シートを作成して表示する

バックエンドのフィールドを `create` へ渡し、`present()` を呼びます。

- iOS と Android では `verificationId` と `ephemeralKeySecret` が必須です。
- Web は `clientSecret` だけを使用し、ネイティブはこれを無視します。
- オプション型はパッケージの index から再エクスポートされないため、直接 import しないでください。

!::create::
!::CreateIdentityVerificationSheetOption::
!::present::

`present()` は `Promise<void>` を返します。結果は `VerificationResult` リスナーから読み取ります。

## FailedToLoadを処理する

`create` がシートを構築できない場合に発生し、Promise も同じ文言で拒否されます。ネイティブでは必須パラメータ不足時、iOS ではプライマリアプリアイコンのキー不足時にも発生します。

iOS は `{ message }`、Android は現在 `error` に文字列を設定します。リスナーと拒否された Promise の両方を処理してください。Web の `create` は常に `Loaded` を発生させ、`present` が未初期化または `clientSecret` 不足を例外として返します。

!::StripeIdentityError::

## VerificationResultを処理する

| `result` | 意味 |
| --- | --- |
| `Completed` | 書類送信完了。審査中なのでWebhookを待つ |
| `Canceled` | 利用者がシートを閉じた。再試行を許可する |
| `Failed` | フロー失敗。`error.message` を表示する |

`Failed` には `error` が含まれます。これらの結果値を `addListener` のイベント名として登録しないでください。

!::IdentityVerificationResult::
!::IdentityVerificationSheetResultInterface::

## エラーとキャンセル

キャンセルはクラッシュではなく利用者の操作として扱い、再度 `create` / `present` できるようにします。Android は表示時、iOS はシートを閉じた後、Web は `verifyIdentity` 完了後に `present()` が解決します。解決だけで成功と判断せず、必ず `verification.result` で分岐してください。
