---
title: "React クイックスタート"
code: []
scrollActiveLine: []
---

アプリケーションを `CapacitorStripeProvider` でラップします。この Provider は `Stripe.initialize` を呼び出し、Apple Pay と Google Pay の利用可否を確認し、Web では `stripe-pwa-elements` を登録します。

```tsx:App.tsx
import { CapacitorStripeProvider } from '@capacitor-community/stripe/react';

const App: React.FC = () => (
  <CapacitorStripeProvider
    publishableKey="Your Publishable Key"
    fallback={<p>Loading...</p>}
  >
    <IonApp>{/* ... */}</IonApp>
  </CapacitorStripeProvider>
);

export default App;
```

`CapacitorStripeProvider` は [Stripe Connect](https://stripe.com/docs/connect/authentication) 用の任意の `stripeAccount` も受け取れます。

## Stripe クライアントを使う

初期化済みのクライアントは `useCapacitorStripe` で取得します。返される `stripe` オブジェクトは、`@capacitor-community/stripe` の `Stripe` と同じプラグインインスタンスです。

```ts
import { useCapacitorStripe } from '@capacitor-community/stripe/react';

export const PaymentSheet: React.FC = () => {
  const { stripe, isApplePayAvailable, isGooglePayAvailable } = useCapacitorStripe();
  // ...
};
```

```tsx
export const PaymentSheet: React.FC = () => {
  const { stripe } = useCapacitorStripe();
  return (
    <button
      onClick={async () => {
        await stripe.createPaymentSheet({
          paymentIntentClientSecret,
          merchantDisplayName: 'App Name',
        });
        await stripe.presentPaymentSheet();
      }}
    >
      Pay
    </button>
  );
};
```

結果リスナーは支払いボタンのハンドラー内ではなく、アプリケーション起動時に一度だけ登録します。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

次はサーバーでテスト用 Intent を作成し（[サーバー連携](/docs/server-integration)）、[PaymentSheet](/docs/payment-sheet) を表示します。

公式 React デモは [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/main/demo/react) にあります。
