---
title: "サーバー連携"
code: []
scrollActiveLine: []
---

`@capacitor-community/stripe` が受け取るのは、クライアントへ安全に渡せる値だけです。バックエンドでは Stripe のシークレットキーを使って PaymentIntent、SetupIntent、Customer、一時キーを作成します。プラグインがシークレット API を直接呼ぶことはありません。

## シークレットキーをサーバーに限定する

`sk_live_...` と `sk_test_...` はサーバーだけで管理します。アプリへ渡すのは、`Stripe.initialize` または Android Google Pay のメタデータで使用する公開可能キーだけです。Capacitor の設定、ソース管理、クライアントログへシークレットキーを含めないでください。

## クライアントシークレット

すぐに課金する場合は [PaymentIntent](https://stripe.com/docs/payments/payment-intents)、支払い方法を後で使うために保存する場合は [SetupIntent](https://stripe.com/docs/payments/save-and-reuse) を作成します。アプリへ返すのは Intent の**クライアントシークレット**です。シークレットキーや未加工の Charge を返してはいけません。

Customer の一時キーは任意です。PaymentSheet または PaymentFlow に保存済みの支払い方法を表示する場合、Customer ID と組み合わせて使用します。`customerId` を渡す場合は `customerEphemeralKeySecret` も必要です。Customer を持たない PaymentIntent も有効です。

サーバーのフィールドを次のプラグインオプションへ対応させます。

| サーバーのフィールド | プラグインオプション |
| --- | --- |
| `paymentIntent` | `paymentIntentClientSecret` |
| `setupIntent` | `setupIntentClientSecret` |
| `ephemeralKey` | `customerEphemeralKeySecret` |
| `customer` | `customerId` |

## レスポンス形式

Customer を持つ PaymentIntent:

```json
{
  "paymentIntent": "pi_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

Customer を持つ SetupIntent:

```json
{
  "setupIntent": "seti_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

Customer を持たない PaymentIntent:

```json
{
  "paymentIntent": "pi_..._secret_..."
}
```

Apple Pay は PaymentIntent のクライアントシークレットを使用します。Web の Google Pay も PaymentIntent を使用します。Android では、歴史的に `paymentIntentClientSecret` と命名されたオプションへ SetupIntent のクライアントシークレットを渡すこともできます。ネイティブの PaymentSheet と PaymentFlow は Customer の有無にかかわらず、どちらの Intent も受け付けます。現在の Web PaymentSheet は PaymentIntent のみ、Web PaymentFlow は両方の Intent に対応します。

## Webhook を正とする

端末上の `Completed` は UI の結果であり、Stripe で売上が確定した証拠ではありません。商品の発送やサービスの提供は `payment_intent.succeeded` や `setup_intent.succeeded` など、検証済みの [Stripe Webhook](https://docs.stripe.com/webhooks) に基づいて行ってください。

`Canceled` は利用者がシートを閉じた状態です。`Failed` と `FailedToLoad` はエラーとして扱います。以前の Intent を確認できなくなった場合は、新しい Intent を作成してから再試行してください。

上記のレスポンスを返す公式デモサーバーは [capacitor-community/stripe/demo/server](https://github.com/capacitor-community/stripe/tree/main/demo/server) にあります。
