---
title: 'テスト'
code: []
scrollActiveLine: []
---

開発中はテスト広告を使い、広告主への課金やアカウントの無効トラフィック判定を避けます。デモ広告ユニットとテストデバイスは Google のテスト広告ガイド（[Android](https://developers.google.com/admob/android/test-ads?hl=ja) / [iOS](https://developers.google.com/admob/ios/test-ads?hl=ja)）を見てください。

このプラグインでは、そのデモユニットを使うか、`initialize` でデバイスを登録できます。

## デモ広告ユニット

Google は常にテスト広告を返す [デモ広告ユニット](https://developers.google.com/admob/android/test-ads#demo_ad_units) を提供しています。開発中はこれを優先してください。このプラグインはネイティブの iOS と Android のみ対応するため、プラットフォームに合った ID を使います。

このプラグインとデモが使うバナー用デモユニット:

| プラットフォーム | バナー `adId` |
| --- | --- |
| Android | `ca-app-pub-3940256099942544/6300978111` |
| iOS | `ca-app-pub-3940256099942544/2934735716` |

他形式のデモ ID は上の Google テスト広告ガイドにあります。バナー、インタースティシャル、リワード、リワード付きインタースティシャルでは `isTesting: true` も使えます。アプリ起動時広告に `isTesting` はないので、`adId` にデモ広告ユニットを渡します。

## テストデバイス

実機で本番に近い広告を、無効トラフィックにせずリクエストするには、`AdMob.initialize()` でデバイスを登録します。

```ts
await AdMob.initialize({
  testingDevices: ['YOUR_TEST_DEVICE_ID'],
  initializeForTesting: true,
});
```

!::initialize::

!::AdMobInitializationOptions::

デバイス ID は、最初の広告リクエスト後のネイティブログに出ます。

- Android: Logcat の `Ads` タグ（`Use RequestConfiguration.Builder.setTestDeviceIds(...)`）。
- iOS: Xcode コンソール（`To get test ads on this device, set:`）。

Google の [テストデバイスの有効化](https://developers.google.com/admob/android/test-ads#enable_test_devices) も参照してください。

## 同意のデバッグ地域

実機では `debugGeography` を設定し、デバイス ID を `testDeviceIdentifiers` に含めます。`EEA` はデバイスが欧州経済領域にいるようにフォームを動かすので、GDPR メッセージをテストできます。登録済みテストデバイスでのみ使ってください。

```ts
import { AdMob, AdmobConsentDebugGeography } from '@capacitor-community/admob';

const consentInfo = await AdMob.requestConsentInfo({
  debugGeography: AdmobConsentDebugGeography.EEA,
  testDeviceIdentifiers: ['YOUR_TEST_DEVICE_ID'],
});
```

!::requestConsentInfo::

!::AdmobConsentRequestOptions::

!::AdmobConsentDebugGeography::

テスト用フォームで同意を拒否する（Manage → Confirm Choices）と、広告がロードされないことがあります。テスト環境では想定どおりで、本番でユーザーが同意したあとの挙動を示すものではありません。

`resetConsentInfo()` はテスト専用です。[同意管理](/docs/consent) を参照してください。

## サーバーサイド検証

サーバーサイド検証（SSV）のコールバックは本番広告でのみ送られます。テスト広告は SSV エンドポイントに届きません。モックリクエストの例は [リワード広告](/docs/rewarded) を参照してください。
