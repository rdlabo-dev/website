---
title: 'はじめに'
code: []
scrollActiveLine: []
---

## 概要

Android、iOS、Web向けのFacebook LoginとFacebook App Eventsを提供するCapacitor Communityプラグインです。AndroidとiOSではネイティブのMeta SDK、WebではFacebook JavaScript SDKを使用します。

## インストール

このプラグインはCapacitor 8、iOS 15以降、Android API 24以降を対象としています。CocoaPodsとSwift Package Managerの両方で、ネイティブFacebook SDKへの依存関係を宣言します。

```bash
npm install @capacitor-community/facebook-login
npx cap sync
```

Capacitorのメジャーバージョンと一致するプラグインのメジャーバージョンをインストールしてください。

| Capacitor | Plugin |
| --------- | ------ |
| 8         | 8.x    |
| 7         | 7.x    |
| 6         | 6.x    |

プラグインを呼び出す前に、[設定](/docs/configuration)に記載されたネイティブとWebの必須設定を完了してください。

## 最初の email ログイン

[インストール](#インストール)と[設定](/docs/configuration)のあと、ボタンクリックなどのユーザー操作からログインを呼び出します。初回確認では `email` だけをリクエストします。

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

async function onLoginClick() {
  const result = await FacebookLogin.login({ permissions: ['email'] });

  if (result.accessToken) {
    console.log('Facebook login succeeded.');
  } else {
    console.log('Facebook login canceled or returned no token.');
  }
}
```

期待結果: 成功時は `accessToken` オブジェクトが返ります（生の token 文字列はログに出さないでください）。Android と iOS でキャンセルすると token なしで resolve します。Web では失敗時に reject します。

iOS Limited Login は Graph API access token ではなく OIDC authentication token（JWT）を返します。Graph によるプロフィール取得には別の token 条件が必要です。[認証](/docs/authentication)を参照してください。

## ドキュメント

まず[設定](/docs/configuration)を行い、実装する機能に応じたガイドを参照してください。メソッドのシグネチャと生成された型情報は[API](/docs/api)にあります。

- [設定](/docs/configuration) — Metaアプリの設定とAndroid・iOS・Web SDKのセットアップ
- [認証](/docs/authentication) — ログイン、ログアウト、現在のトークン、プロフィール項目、再認証、プラットフォーム差異
- [App Events](/docs/app-events) — カスタムイベント、パラメータ、自動イベント記録、広告主向け設定
