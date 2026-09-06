---
title: "Angular クイックスタート"
code: []
scrollActiveLine: []
---

アプリケーション起動時にプラグインを一度だけ初期化します。Angular 22 では、Stripe の UI を表示する前に初期化が完了するよう `provideAppInitializer` を使用します。

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() =>
      Stripe.initialize({
        publishableKey: 'Your Publishable Key',
      }),
    ),
  ],
};
```

結果リスナーも同じ起動処理で登録します。[イベントリスナー](/docs/learn/event-listeners)を参照してください。

## Web

`stripe-pwa-elements` をインストールし、Angular の起動後に一度だけ `defineCustomElements()` を呼び出します。

```bash
npm install stripe-pwa-elements
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

Angular の `HttpClient` で PaymentIntent または SetupIntent のシークレットを取得するときは `firstValueFrom` を使用します。削除済みの `toPromise()` は使用しないでください。

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);
```

次はサーバーでシークレットを作成し（[サーバー連携](/docs/server-integration)）、[PaymentSheet](/docs/payment-sheet) を表示します。
