---
title: '同意管理'
code: []
scrollActiveLine: []
---

Google の User Messaging Platform（UMP）SDK は、広告リクエストの前に同意を集めるプライバシー／メッセージングツールです。流れは Google の UMP ガイド（[Android](https://developers.google.com/admob/android/privacy?hl=ja) / [iOS](https://developers.google.com/admob/ios/privacy?hl=ja)）を見てください。

このプラグインは UMP と iOS の App Tracking Transparency を共通 API で提供します。UMP を使う前に、AdMob で [GDPR（一般データ保護規則）メッセージ](https://support.google.com/admob/answer/10113207?hl=ja) を作成します。[広告主識別子（IDFA）メッセージ](https://support.google.com/admob/answer/10115027?hl=ja) も設定できます。IDFA メッセージを公開している場合、UMP が IDFA の説明メッセージと App Tracking Transparency の許可ダイアログを表示します。そのときは `requestTrackingAuthorization()` を呼ばないでください。

## 推奨する順序

1. アプリを起動するたびに `AdMob.requestConsentInfo()` を呼びます。
2. 必要な場合は `AdMob.showConsentForm()` を呼びます。
3. `consentInfo.canRequestAds` が `true` のとき、`AdMob.initialize()` を一度呼んでから広告をロードします。[initialize](/docs/configuration) を参照してください。

8.2.0 以降は、Android と同様に iOS でも SDK の初期化前に同意フォームを表示できます。

```ts
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

let consentInfo = await AdMob.requestConsentInfo();
if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
  consentInfo = await AdMob.showConsentForm();
}

if (consentInfo.canRequestAds) {
  await AdMob.initialize();
  // 広告をリクエストできます。
}
```

!::requestConsentInfo::

!::AdmobConsentRequestOptions::

!::AdmobConsentInfo::

!::AdmobConsentStatus::

!::showConsentForm::

広告リクエスト可否の判定には `canRequestAds` を使います。設定したメッセージとユーザーによっては、同意フォームが不要または利用できないことがあります。

## iOS のトラッキング許可

UMP の IDFA メッセージを**使わない**場合だけ、状態が `notDetermined` のときに App Tracking Transparency を自分でリクエストします。AdMob で IDFA メッセージを設定している場合はこの節をスキップしてください。UMP がそのダイアログを出します。

```ts
const tracking = await AdMob.trackingAuthorizationStatus();
if (tracking.status === 'notDetermined') {
  /**
   * iOSの許可ダイアログの前にトラッキングについて説明する場合は、
   * ここで独自のUIを表示してから処理を続けます。
   */
  await AdMob.requestTrackingAuthorization();
}
```

`requestTrackingAuthorization()` は Android、Web、iOS 14 未満では何もしません。

!::trackingAuthorizationStatus::

!::TrackingAuthorizationStatusInterface::

!::requestTrackingAuthorization::

## プライバシーオプション

プライバシーメッセージがアプリ内の入口を必要とする場合は、設定画面などから次を呼び出せるようにします。

```ts
await AdMob.showPrivacyOptionsForm();
```

!::showPrivacyOptionsForm::

## 同意のリセット

`resetConsentInfo()` はテスト用です。本番ユーザーの同意選択の消去に使わないでください。

!::resetConsentInfo::

デバッグ用の地域設定とテストデバイス ID は [テスト](/docs/testing) を参照してください。
