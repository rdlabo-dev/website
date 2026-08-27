---
title: "イベントリスナー"
code: []
scrollActiveLine: []
---

結果を受け取る標準経路としてイベントを使用します。JavaScript アプリケーションの起動ごとに、アプリケーションレベルの結果リスナーを一度だけ登録してください。`main.ts`、アプリケーション初期化処理、起動時に生成されるシングルトンサービスなどで、Stripe の UI を表示する前のできるだけ早い段階に登録します。

```ts
import {
  ApplePayEventsEnum,
  GooglePayEventsEnum,
  PaymentFlowEventsEnum,
  PaymentSheetEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';

await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => handleCompleted()),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => handleCanceled()),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => handleFailed(error)),
]);
```

!::PluginListenerHandle::

## Android Activity の再生成

Android では Stripe の UI が開いている間に Activity と JavaScript ランタイムが再生成されることがあるため、特に重要です。新しい JavaScript ランタイムは起動処理中にリスナーを登録し直す必要があります。

元の JavaScript Promise と Capacitor の `PluginCall` は復元できません。再生成後に Stripe がネイティブ結果を返した場合、プラグインはリスナーが利用可能になるまで対応する結果イベントを保持します。対象は PaymentSheet、PaymentFlow、Google Pay の `Completed`、`Canceled`、`Failed` と、PaymentFlow の `Created` です。

元の呼び出しが残っている場合は従来どおり、Promise が解決され、イベントも保持されずに配信されます。このフォールバックはネイティブ結果をメモリ上で受け渡すものであり、永続ストレージではありません。OS によるプロセス終了後の復旧は保証しません。

アプリケーションレベルの結果リスナーは JavaScript ランタイムの存続中ずっと登録しておいてください。Android の再生成後も支払い結果が必要なら、ボタンハンドラーで追加し、ページ破棄時に削除する設計にはしないでください。

## PaymentSheet のイベント

!::addListener.PaymentSheetEventsEnum::

!::PaymentSheetEventsEnum::

標準的な流れは次のとおりです。

1. 起動時に結果リスナーを登録する。
2. `createPaymentSheet()` を呼ぶ。
3. `Loaded` を待つか、`FailedToLoad` を処理する。
4. `presentPaymentSheet()` を呼ぶ。
5. `Completed`、`Canceled`、`Failed` のいずれかを受け取る。

`Canceled` は利用者がシートを閉じたことを表し、例外ではありません。`Failed` と `FailedToLoad` にはエラー文字列が含まれます。クライアントイベントだけで注文を確定せず、[Webhook](/docs/server-integration) で PaymentIntent または SetupIntent を確認してください。

## PaymentFlow のイベント

!::addListener.PaymentFlowEventsEnum::

!::PaymentFlowEventsEnum::

1. 起動時に結果リスナーを登録する。
2. `createPaymentFlow()` を呼ぶ。
3. `Loaded` を待つか、`FailedToLoad` を処理する。
4. `presentPaymentFlow()` を呼ぶ。
5. `Opened`、続いて `{ cardNumber }` を持つ `Created`、または `Canceled` を受け取る。
6. `confirmPaymentFlow()` を呼ぶ。
7. `Completed`、`Canceled`、`Failed` のいずれかを受け取る。

## Apple Pay のイベント

!::addListener.ApplePayEventsEnum::

!::ApplePayEventsEnum::

`DidSelectShippingContact` には `contact` と `updateId` が含まれます。iOS では、その `updateId` と更新後の `paymentSummaryItems` を指定して `updateApplePaySheet` を呼びます。JavaScript が応答しない場合、ネイティブシートは25秒後に元の項目へ戻ります。`updateApplePaySheet` は Android と Web では未実装です。

`DidCreatePaymentMethod` には配送先 `contact` が含まれます。Apple は支払いが成功するまで住所全体を返しません。

## Google Pay のイベント

!::addListener.GooglePayEventsEnum::

!::GooglePayEventsEnum::

Google Pay は Android と Web で利用できます。iOS では実装されていません。
