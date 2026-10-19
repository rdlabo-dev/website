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

認証元から確定的な `required` の結果が返された場合はサインアウト状態であり、オフラインアクセスを許可してはいけません。以前に検証したローカルセッションを有効化できるのは、通信結果が `unavailable` の場合だけです。

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

## 起動時のログインリクエストを共有する

`KitAuthLoginExchange<Identity, Result>` は処理中のバックエンドログインリクエストを共有します。事前取得した結果（失敗を含む）は、起点のナビゲーションが継続している間、完了後最大30秒まで認可で一度だけ消費できます。その後の認可呼び出しは新しいリクエストを実行します。権限のキャッシュではありません。

アプリの認証サービスでインスタンスを1つ保持してください。リクエストの構築時にFirebaseユーザーを捕捉し、ユーザーが切り替わった場合はレスポンスを拒否し、サインアウト時に `clear()` を呼びます。プロバイダーの利用可否、削除からの復旧、利用規約への同意、レスポンス処理はアプリが管理します。

認可前にローカルランタイムを初期化するアプリでは、Firebaseの準備と必要なアカウント復旧が終わった後、ランタイム初期化を待つ前に `kitPreloadAuthLoginForNavigation(router, isCurrent => auth.preloadTokenLogin(isCurrent))` を呼びます。初期化に失敗した場合は返されたクリーンアップを実行します。ナビゲーションの終了またはキャンセル時に、未消費の処理は破棄されます。重ねて実行する有用な起動処理がないアプリは `run(identity, request)` だけを使えます。

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
