---
title: "Angular クイックスタート"
code: []
scrollActiveLine: []
---

アプリの起動時にプラグインを一度だけ初期化します。スタンドアロンの Angular アプリでは、`provideAppInitializer` を使うと Stripe の UI を表示する前に初期化できます。

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
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

`@stripe/stripe-js@^9.17.0` と `stripe-pwa-elements@^4.1.0` をインストールし、Angular の起動後に `defineCustomElements()` を一度だけ呼び出します。

```bash
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

上の `provideHttpClient()` で登録した `HttpClient` を、サービスまたはコンポーネントに `http` として注入します。Angular の `HttpClient` で PaymentIntent や SetupIntent のクライアントシークレットを取得するには、`firstValueFrom` を使います。インターセプターまたはリクエストオプションでアプリの認証情報を付与してください。以下の `environment.api` はデモのレスポンス形式を前提としています。本番では独自の認証済みバックエンドを使います。削除済みの `toPromise()` は使用できません。

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
