---
title: API
---

`@rdlabo/workers-hono-kit` v0.13.0 と独立MySQL・タイムゾーンパッケージのエントリポイントです。

#### `module` @rdlabo/workers-hono-kit

MySQLの実行時依存を持たないHono・インフラhelper

ルートのソーシャル認証exportには `verifyGoogleIdentityToken`、`verifyAppleIdentityToken`、`hasFirebaseProviderIdentity`、`createAppleClientSecret`、および `AppleClientSecretConfig`、`APPLE_IDENTITY_ISSUER`、`GOOGLE_IDENTITY_ISSUERS` があります。Identity tokenの検証は署名・issuer・audience・有効期限を確認してprovider subjectを返します。`hasFirebaseProviderIdentity` は検証済みFirebase payloadを調べるだけで、Firebase JWT自体は検証しません。アプリが決定するログイン・リンクのポリシーは[ソーシャル認証](/docs/getting-started)を参照してください。

`FirebaseVerifier` は `getUser`、`getUsers`、`getUserByEmail` によるアカウント検索を提供し、`IdentityToolkit` はそれぞれに対応する `lookup`、`lookupMany`、`lookupByEmail` を提供します。`FirebaseUserRecord` は `uid` と任意の `email` / `disabled` を持ちます。無効化されたアカウントも返され、判断はアプリが行います。存在しないユーザーは `null` を返すかbatch結果から除外し、プロバイダーの失敗は例外になります。[HTTP・認証](/docs/http-auth)を参照してください。

#### `module` @rdlabo/workers-mysql

MySQL・Hyperdriveランタイム

#### `module` @rdlabo/workers-mysql/drizzle

Drizzle設定・JSTカラム

#### `module` @rdlabo/workers-mysql/migrations

Node.js migration・brownfield baseline

#### `module` @rdlabo/workers-mysql/testing

MySQL・DrizzleテストDB・fake

#### `module` @rdlabo/workers-timezone

IANAカレンダー・日時変換

#### `module` @rdlabo/workers-hono-kit/mysql

MySQL用Honoコンテナーアダプター

#### `module` @rdlabo/workers-hono-kit/db

MySQLへの非推奨の互換export

#### `module` @rdlabo/workers-hono-kit/business-time

workers-timezoneを必要とする非推奨の互換export

#### `module` @rdlabo/workers-hono-kit/offline

テーブル非依存の変換・Replica wire helper

#### `module` @rdlabo/workers-hono-kit/realtime

Durable Object WebSocket・retry helper

#### `module` @rdlabo/workers-hono-kit/testing

Test DB・fake・fixture・binding double

詳細は[データ層](/docs/data-layer)、[Realtime・Offline](/docs/realtime-offline)、[テスト・運用](/docs/testing-operations)を参照してください。
