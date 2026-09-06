---
title: '認証'
code: []
scrollActiveLine: []
---

認証メソッドを使用する前に[設定](/docs/configuration)を完了してください。

## プラットフォームごとの動作

| Method                  | Android | iOS                     | Web   |
| ----------------------- | ------- | ----------------------- | ----- |
| `login`                 | 対応    | 既定でLimited Login     | 対応  |
| `logout`                | 対応    | 対応                    | 対応  |
| `reauthorize`           | 対応    | 対応                    | 未実装 |
| `getCurrentAccessToken` | 対応    | Limited Login token     | 対応  |
| `getProfile`            | 対応    | Graph tokenが必要       | 対応  |

`tracking` login optionはiOS専用で、既定値は`limited`です。Limited Loginでは、iOSはGraph API access tokenではなくOIDC authentication token（JWT）を返します。現在のプラグインは`tracking: 'enabled'`で取得したGraph access tokenを返しません。

`nonce` optionはAndroidとiOSで使用され、Webでは無視されます。raw nonceを渡してください。ネイティブ実装がFacebook SDKへ渡す前にhash化します。

## ログイン

アプリが使用する権限だけをリクエストします。`login` はボタンクリックなどのユーザー操作から呼び出してください。

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

const result = await FacebookLogin.login({
  permissions: ['email'],
});

if (result.accessToken) {
  console.log('Facebook login succeeded.');
} else {
  // Cancelled or no token returned by the native platform.
  console.log('Facebook login canceled or returned no token.');
}
```

`accessToken.token` をログに出さないでください。WebではFacebookが使用可能なtokenを返さない場合にrejectします。AndroidとiOSではログインをキャンセルするとtokenなしでresolveします。

### iOSのtracking modeとnonce

```ts
const result = await FacebookLogin.login({
  permissions: ['email'],
  tracking: 'limited',
  nonce: crypto.randomUUID(),
});
```

Limited Login tokenはbackendでOIDC tokenとして検証してください。Graph API access tokenとして扱わないでください。

## 現在のtoken

```ts
const result = await FacebookLogin.getCurrentAccessToken();

if (result.accessToken) {
  console.log('Current Facebook token is available.', {
    isExpired: result.accessToken.isExpired,
    permissions: result.accessToken.permissions,
  });
}
```

ログアウト中、ネイティブプラットフォームはtokenなしでresolveします。WebはFacebook sessionが接続されていない場合にrejectします。

## プロフィール項目

```ts
const profile = await FacebookLogin.getProfile<{
  id: string;
  email?: string;
}>({ fields: ['id', 'email'] });
```

項目はMetaアプリで許可され、ユーザーから権限を付与されている必要があります。返されるobjectにはGraph APIが返した項目だけが含まれます。iOSではGraph access tokenが必要であり、既定のLimited Login tokenでは動作しません。

## データアクセスの再認証

再認証はAndroidとiOSでのみ利用できます。

```ts
const result = await FacebookLogin.reauthorize();

if (result.accessToken) {
  console.log('Data access was renewed.');
}
```

## ログアウト

```ts
await FacebookLogin.logout();
```

ログアウトすると、プラットフォームSDKが管理するFacebook sessionが消去されます。
