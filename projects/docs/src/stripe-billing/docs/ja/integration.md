---
title: Stripe Billing で iOS のサブスクリプションを実装する
---

# Stripe Billing で iOS のサブスクリプションを実装する

このパッケージは [Stripe の実験的な BillingSDK](https://docs.stripe.com/billing/subscriptions/manage-ios) を利用します。プレビューが有効なアカウントを使用してください。購入手続きを有効にする前に、アプリと配信先のストアフロントで購入が認められる条件と、適用される App Store の要件を確認します。

## バックエンドの役割

アプリの利用者を認証し、サーバー側で対応する Stripe Customer を特定します。`customerSessionRequested` イベントを受けるたびに、**新しい Customer Session** を作成してください。信頼できないクライアントが指定した Customer ID をそのまま使わないでください。Stripe のシークレット API キーをアプリに埋め込むこと、返されたシークレットをログに記録すること、複数のリクエストで Customer Session のシークレットを使い回すことも避けてください。

Customer Session で `buy_button`、`active_entitlements`、`customer_portal` を有効にし、次の形式で応答します。

```json
{
  "customer": "cus_...",
  "clientSecret": "cuss_...",
  "expiresAt": 1800000000
}
```

`expiresAt` には Unix 時刻を**秒単位**で指定します。認証できないリクエストには HTTP 401 を返します。サインイン中のアプリで認証が拒否されたり、ログインの有効期限が切れたりした場合はエラーとして扱い、再認証を求めてください。匿名購入に自動的に切り替えてはいけません。

バージョンを固定したネイティブ SDK は、Stripe API バージョン `2025-07-30.basil` を指定してプライベートプレビューのエンドポイントにリクエストを送ります。Stripe のオンラインガイドでバックエンドに使われているバージョンは `2026-08-26.dahlia` 以降です。参加しているプレビューで、固定した SDK とバックエンドの API バージョンの両方が利用できることを確認してください。サーバー側の API バージョンを上げるだけではプレビューへのアクセス権は得られません。

既存の認証済みリクエストハンドラーでサーバー用の Stripe SDK を使う例です。

```ts
// user はサーバーの認証ミドルウェアで検証した利用者です。
// stripe は利用可能なプレビューに合わせて設定したサーバー側の Stripe クライアントです。
const session = await stripe.customerSessions.create({
  customer: user.stripeCustomerId,
  components: {
    buy_button: { enabled: true },
    active_entitlements: { enabled: true },
    customer_portal: { enabled: true },
  },
});
return Response.json({
  customer: session.customer,
  clientSecret: session.client_secret,
  expiresAt: session.expires_at,
});
```

安定版 SDK がこれらのコンポーネントに未対応の場合は、プレビュー向けに提供されるサーバー用の Stripe SDK と型定義を使用します。Stripe で購入ボタン、サブスクリプション料金、商品ごとの利用権限、Customer Portal を設定してください。Webhook をバックエンドで検証し、機能へのアクセスをサーバー側で制御します。クライアントが取得した利用権限は、UI の表示を切り替えるために使用してください。

## アプリ側の実装例

セッション要求のリスナーを **`initialize` より前に**登録し、`reset` の完了まで保持します。各リクエストには30秒以内に一度だけ応答します。期限切れのリクエストや応答済みのリクエストへの応答は拒否されます。応答の内容が無効でも、同じリクエストがまだ保留中なら、修正して応答し直せます。

```ts
import { Capacitor } from '@capacitor/core';
import { StripeBilling, type CustomerSession } from '@capacitor-community/stripe-billing';

if (Capacitor.getPlatform() !== 'ios') {
  throw new Error('This subscription integration requires iOS');
}

const sessionListener = await StripeBilling.addListener('customerSessionRequested', async ({ requestId }) => {
  let session: CustomerSession | null = null;
  let failed = false;
  try {
    const response = await fetch('https://your-backend.example.com/customer-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await getAuthToken()}` },
    });
    if (!response.ok) throw new Error('Customer Session request failed');
    session = (await response.json()) as CustomerSession;
  } catch {
    failed = true;
  }
  try {
    await StripeBilling.setCustomerSession({ requestId, session, failed });
  } catch {
    // reset や要求のタイムアウトにより、この応答が無効になっている場合があります。
    // サインイン中なら認証エラーを表示します。シークレットはログに記録しません。
  }
});

const entitlementListener = await StripeBilling.addListener('entitlementsChanged', ({ entitlements }) => {
  updatePremiumUI(entitlements.some((item) => item.lookupKey === 'premium'));
});
const errorListener = await StripeBilling.addListener('billingError', ({ message }) => {
  showError(message);
});

await StripeBilling.initialize({
  publishableKey: 'pk_test_...',
  maximumStaleEntitlementsDuration: 300,
});

// 初期化の完了後にサブスクリプションの操作を有効にします。
```

`getAuthToken`、`updatePremiumUI`、`showError` はアプリ側で実装する関数です。この例では利用者がサインインしていることを前提としています。アプリで匿名購入を提供する場合は、利用者が匿名であることをアプリが確認できた場合に限り、`session: null, failed: false` を返します。ネットワークエラーや HTTP 401 の応答は失敗として扱ってください。

### UI の操作を個別に実装する

次の各関数を、アプリ内の個別の操作に割り当てます。ひとつの購入フローとして順番に呼び出すことは想定していません。SDK の操作は一度にひとつずつ実行してください。キャッシュへのアクセスが競合するのを防ぐため、並行した操作は拒否されます。セッション要求への応答と `reset` は、別の操作の処理中でも実行できます。

```ts
async function purchaseSubscription(): Promise<void> {
  await StripeBilling.presentBuyButton({ id: 'buy_btn_...' });
}

async function manageSubscription(): Promise<void> {
  await StripeBilling.presentCustomerPortal();
  // 既定のブラウザーでポータルを開くには { external: true } を指定します。
}

async function refreshAccess(): Promise<void> {
  const { active } = await StripeBilling.hasEntitlement({ lookupKey: 'premium', forceRefresh: true });
  updatePremiumUI(active);
}

async function signOutBilling(): Promise<void> {
  // 最初に、アプリの UI でサブスクリプションの操作を無効にします。
  await StripeBilling.reset();
  await sessionListener.remove();
  await entitlementListener.remove();
  await errorListener.remove();
  // 次のログイン時には、リスナーを登録し直してから再度初期化します。
}
```

アプリが外部の購入画面やポータルから戻ったら、`refreshAccess` を呼びます。初期化中、ほかの SDK 操作の実行中、アカウントの切り替え中は、サブスクリプションの操作を無効にしておきます。

`getBuyButton({ id })` は購入ボタンのメタデータを取得します。`presentBuyButton` は SDK のネイティブ購入ボタンを読み込み、閉じることのできるシートに表示します。ボタンをタップすると、既定のブラウザーで Stripe の購入画面が開きます。Promise が解決するのは**ボタンが表示された時点**です。決済の完了は別途確認します。`null` のセッションは、意図して匿名購入を有効にするときに使います。バックエンドの失敗時には `failed: true` を指定し、誤って匿名購入として処理されるのを防ぎます。

`getActiveEntitlements({ forceRefresh: true })` は `{ entitlements }` を、`hasEntitlement` は `{ active }` を返します。ネットワーク経由で最新の利用権限を取得できない場合、SDK はキャッシュを使うことがあります。`forceRefresh` を指定しても決済の証明にはなりません。`entitlementsChanged` は SDK による利用権限の更新を知らせるイベントで、Webhook のリアルタイム購読は行いません。アプリ内のポータルを閉じると利用権限は更新されます。外部の購入画面やポータルから戻った場合は、アプリで明示的に更新してください。

利用者を切り替える前に必ず `reset` の完了を待ってください。処理中のセッション要求と操作が取り消され、プラグインの UI が閉じ、SDK のキャッシュが消去されます。空の利用権限リストが通知され、再利用するには初期化が必要です。固定したバージョンの SDK は利用権限を顧客別に保存しないため、初期化時にも上流 SDK のキャッシュを消去します。イベントリスナーを解除するだけではサインアウトできません。

## リポジトリのデモを試す

[Angular Billing デモ](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/angular/README.md#billing-demo-on-ios)は、一時的なテスト用の顧客と認証情報を自動で作成します。[デモ用バックエンド](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/server/README.md#billing-demo-private-preview-test-mode-only)は匿名で使えるテスト専用の環境です。本番では先に説明したように、認証した利用者と Customer の対応をサーバーで管理してください。公開デモの認証情報は本番のログインには使用できません。
