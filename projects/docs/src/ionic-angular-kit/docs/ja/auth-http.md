---
title: 認証・HTTP
---

## アクセス権限

`provideKitAuth()` は `user`、`confirm`、`required`、`anonymous`、`unavailable` の認証状態に対応するfunctional Route Guardを設定します。Redirect routeとアプリ固有の副作用は利用側に残します。以下の例の `AuthService` はアプリ所有です。`authState` Observableと任意のlifecycle callbackはアプリ側で用意します。

`KitAuthAccessService` は現在のsessionが実行できる操作を公開します。

| Mode     | Local Replica・Outbox | 認証HTTP・Realtime・Sync |
| -------- | --------------------- | ------------------------ |
| `none`   | 不可                  | 不可                     |
| `local`  | 可                    | 不可                     |
| `remote` | 可                    | 可                       |

Authoritativeな `required` はsign-outであり、Offline Accessへ変換してはいけません。以前検証したLocal Sessionを有効化できるのはtransport結果が `unavailable` の場合だけです。

```ts
import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import {
  kitRequireAuthorizedGuard,
  kitRequireConfirmingGuard,
  kitRequiredUnauthorizedGuard,
  provideKitAuth,
} from '@rdlabo/ionic-angular-kit';
import { AuthService } from './auth.service';

provideKitAuth(() => {
  const auth = inject(AuthService);
  return {
    authState: () => auth.state$,
    redirects: {
      whenAuthorized: '/home',
      whenConfirming: '/auth/confirm',
      whenNotConfirming: '/auth/signin',
      whenUnauthorized: '/auth',
    },
  };
});

export const routes: Routes = [
  { path: 'auth/signin', canActivate: [kitRequiredUnauthorizedGuard], loadComponent: () => import('./signin.page').then((m) => m.SigninPage) },
  { path: 'auth/confirm', canActivate: [kitRequireConfirmingGuard], loadComponent: () => import('./confirm.page').then((m) => m.ConfirmPage) },
  { path: 'home', canActivate: [kitRequireAuthorizedGuard], loadComponent: () => import('./home.page').then((m) => m.HomePage) },
];
```

Route定義では `kitRequiredUnauthorizedGuard`、`kitRequireConfirmingGuard`、`kitRequireAuthorizedGuard` を使います。保護対象の非同期判定開始時には、現在のauthorization leaseが成功するまで以前のremote権限を一時停止します。

## HTTPポリシー

`provideKitHttp()` はcredential付与、bypass規則、一時障害処理、アプリのerror hookを備えた `kitAuthInterceptor` を設定します。Interceptor自体は `provideHttpClient` で別途登録します。必須なのは `getAuthHeaders` だけで、他のhookはすべて任意でアプリ所有です。

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { kitAuthInterceptor, provideKitAuth, provideKitHttp } from '@rdlabo/ionic-angular-kit';
import { AuthService } from './auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([kitAuthInterceptor])),
    provideKitAuth(() => {
      const auth = inject(AuthService);
      return {
        authState: () => auth.state$,
        redirects: {
          whenAuthorized: '/home',
          whenConfirming: '/auth/confirm',
          whenNotConfirming: '/auth/signin',
          whenUnauthorized: '/auth',
        },
      };
    }),
    provideKitHttp(() => {
      const auth = inject(AuthService);
      return {
        getAuthHeaders: async () => ({ Authorization: `Bearer ${await auth.token()}` }),
        onUnauthorized: () => auth.signOut(),
      };
    }),
  ],
};
```

自動retryは `GET`、`HEAD`、`OPTIONS` または `Idempotency-Key` を持つrequestだけです。通常のwriteは自動retryしません。一時status `0`、`408`、`429`、`502`、`503`、`504` を対象にし、`Retry-After` を尊重します。

Offline対応時は `offlineInterceptor` を `kitAuthInterceptor` より前に登録します。Local modeではcredential生成とnetwork transportを止めながら、一致するread policyがスコープ付きReplicaを返せます。
