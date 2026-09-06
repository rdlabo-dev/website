---
title: '設定'
code: []
scrollActiveLine: []
---

Stripe Identity をインストールし、Capacitor のネイティブプロジェクトを同期します。

```bash
npm install @capacitor-community/stripe-identity
npx cap sync
```

`@capacitor-community/stripe-identity` v8.2.1 は、iOS、Android、Web で Stripe Identity Verification Sheet を表示します。

| 要件 | 最小バージョン |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android `minSdkVersion` | 24 |

## Web の設定

ネイティブプロジェクトへの追加作業は不要です。Web では `create` と `present` の前に、公開可能キーを指定して `initialize` を呼びます。ネイティブ環境では、そのキーを使わずに `initialize` が完了します。

## iOS の設定

アプリがカメラを必要とする理由を記した `NSCameraUsageDescription` を `Info.plist` に追加します。[Stripe の iOS カメラ認可ガイド](https://stripe.com/docs/identity/verify-identity-documents?platform=ios&type=new-integration#set-up-camera-authorization)を参照してください。

iOS 実装は `Info.plist` のプライマリアプリアイコン（`CFBundleIcons` → `CFBundlePrimaryIcon` → `CFBundleIconFiles`）を読み取り、最初のファイル名を Stripe Identity の `brandLogo` として渡します。これらのキーがない場合、`create` は拒否され、`FailedToLoad` が発生します。

Xcode が `CFBundleIconFiles` を書き込めるよう、iOS のアセットカタログにプライマリ App Icon を保持してください。アイコンカタログがないアプリではシートを作成できません。

## Android の設定

`android/app/src/main/res/values/styles.xml` で Material Components テーマを使用します。

```diff xml:android/app/src/main/res/values/styles.xml
- <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
+ <style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
```

Material Components の任意の親テーマを利用できます。[Material Components のテーマ設定](https://m2.material.io/develop/android/theming/dark/)と [Stripe の Android Material テーマガイド](https://stripe.com/docs/identity/verify-identity-documents?platform=android&type=new-integration#set-up-material-theme)を参照してください。

Android 実装はアプリケーションの `ic_launcher` mipmap を本人確認シートのアイコンとして使用します。標準のランチャーアイコン以外の設定は不要です。

## 次のステップ

続けて [本人確認シート](/docs/identity-verification-sheet) でセッションを取得し、シートを表示して、最初の送信完了結果を確認します。
