---
title: "React クイックスタート"
code: []
scrollActiveLine: []
---

アプリケーションを `CapacitorStripeProvider` でラップします。この Provider は `Stripe.initialize` を呼び出し、Apple Pay と Google Pay の利用可否を確認し、Web では `stripe-pwa-elements` を登録します。

```tsx:App.tsx
import { IonApp } from '@ionic/react';
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

この Provider が初期化するのは Payment だけです。アプリで Identity、Terminal、Billing を使う場合は、それぞれ個別に初期化してください。Web 向けには次の互換バージョンをインストールします。

```sh
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

## Stripe クライアントを使う

初期化済みのクライアントは `useCapacitorStripe` で取得します。返される `stripe` オブジェクトは、`@capacitor-community/stripe` の `Stripe` と同じプラグインインスタンスです。

```tsx
import { useCapacitorStripe } from '@capacitor-community/stripe/react';

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

`paymentIntentClientSecret` は、認証を行うバックエンドから取得します。[サーバー連携](/docs/server-integration)を参照してください。UI でキャンセルと失敗を処理し、商品の発送やサービスの提供はサーバーで署名を検証した Webhook に基づいて行います。

結果リスナーは支払いボタンのハンドラー内ではなく、アプリケーション起動時に一度だけ登録します。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

公式 React デモは [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/v8.4.0/demo/react) にあります。
