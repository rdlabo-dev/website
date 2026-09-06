---
title: 'はじめに'
code: []
scrollActiveLine: []
---

## 概要

Capacitor 向けのコミュニティ製ネイティブ AdMob プラグインです。iOS と Android の Google Mobile Ads SDK をラップし、バナー、インタースティシャル、リワード、リワード付きインタースティシャル、アプリ起動時広告を表示できます。Google User Messaging Platform（UMP）による同意と、iOS の App Tracking Transparency ヘルパーにも対応します。

## インストール

このプラグインには Google Mobile Ads SDK が同梱されています。パッケージを入れたあと、AdMob の **アプリ** ID を AndroidManifest / Info.plist に追加します。アプリ ID と SKAdNetwork（Apple の広告コンバージョン ID）は Google の Get started（[Android](https://developers.google.com/admob/android/quick-start?hl=ja) / [iOS](https://developers.google.com/admob/ios/quick-start?hl=ja)）を見てください。Mobile Ads の依存関係を二重に足さないでください。

このプラグインは `@capacitor-community/admob` **v8** と Capacitor 8 を対象にします。iOS 15 以降、Android API 24 以降に対応します。

```bash
npm install @capacitor-community/admob
npx cap sync
```

Capacitor 7 を使う場合は `@capacitor-community/admob@7` をインストールします。

### Google Mobile Ads SDK の版

このメジャーでは Android の Google Mobile Ads SDK を **25.4.x**、iOS を **13.6.0**（Swift Package Manager と CocoaPods）に固定しています。必要がない限り上書きしないでください。Android 向け [Next-Gen SDK](https://developers.google.com/admob/android/next-gen) は次のプラグインメジャーまで待ちます。固定の方針は [移行](/docs/migration) を見てください。

### Android の設定

`android/app/src/main/AndroidManifest.xml` の `<application>` 内に追加します。

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="@string/admob_app_id" />
```

`android/app/src/main/res/values/strings.xml` に次を追加します。

```xml
<string name="admob_app_id">[APP_ID]</string>
```

`[APP_ID]` は広告ユニット ID ではなく、AdMob の **アプリ** ID に置き換えます。

#### 変数

未設定のままで構いません。特定のアーティファクト版が必要なときだけ、アプリの `variables.gradle` で上書きします。

| 変数 | アーティファクト | デフォルト |
| --- | --- | --- |
| `playServicesAdsVersion` | `com.google.android.gms:play-services-ads` | `25.4.+` |
| `userMessagingPlatformVersion` | `com.google.android.ump:user-messaging-platform` | `4.0.0` |
| `androidxCoreKTXVersion` | `androidx.core:core-ktx` | `1.15.0` |

### iOS の設定

`ios/App/App/Info.plist` の最外層 `<dict>` 内に追加します。

```xml
<key>GADIsAdManagerApp</key>
<true/>
<key>GADApplicationIdentifier</key>
<string>[APP_ID]</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalized ads to you.</string>
```

`[APP_ID]` を AdMob アプリ ID に置き換え、`NSUserTrackingUsageDescription` に実際の利用目的を記載します。

`SKAdNetworkItems` の例は Google 自身の identifier だけです。残りの ID は Google の [iOS セットアップガイド](https://developers.google.com/admob/ios/quick-start#update_your_infoplist) から追加します。

### トラブルシューティング

CocoaPods が `Google-Mobile-Ads-SDK` を解決できない場合:

```text
[error] Error running update: Analyzing dependencies
[!] CocoaPods could not find compatible versions for pod "Google-Mobile-Ads-SDK":
```

`ios/` で `pod repo update` を実行してから、`npx cap sync ios` を再実行します。

## 最初のテストバナー

インストールとプラットフォーム設定のあと、SDK を初期化し、同意を取り、Google のデモバナーを表示します。広告ユニット ID は [テスト](/docs/testing) のプラットフォーム別バナー ID を使い、この初回確認では自分のユニットを作らないでください。

`startAdMob` はモジュール評価時だけではなく、ユーザー操作や UI 準備後（ボタンや遷移後など）から呼び出してください。

```ts
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const bannerAdId =
  Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111';

async function startAdMob() {
  await AdMob.initialize();

  let consentInfo = await AdMob.requestConsentInfo();
  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
    consentInfo = await AdMob.showConsentForm();
  }

  if (!consentInfo.canRequestAds) {
    // Consent not ready — no banner is shown.
    return;
  }

  const options: BannerAdOptions = {
    adId: bannerAdId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  };
  await AdMob.showBanner(options);
}
```

期待結果: `canRequestAds` が true のとき、画面下部に Google のテストバナーが表示されます。`canRequestAds` が false のときは何も表示せずに return します。バナーは WebView の上のネイティブ画面に載るため HTML を覆うことがあります。レイアウトを空ける方法は [バナー広告](/docs/banner) を見てください。詳細は [初期化](/docs/configuration)、[同意管理](/docs/consent)、[テスト](/docs/testing) です。

## 目的から選ぶ

| 目的 | 広告形式 | ガイド |
| --- | --- | --- |
| アプリのコンテンツと並べて広告を出し続ける | バナー | [バナー広告](/docs/banner) |
| 報酬なしで、自然な区切りにフルスクリーン広告を出す | インタースティシャル | [インタースティシャル広告](/docs/interstitial) |
| 専用のリワード体験を提供する | リワード | [リワード広告](/docs/rewarded) |
| 自然な遷移で報酬を提供する | リワード付きインタースティシャル | [リワード広告](/docs/rewarded) |
| アプリ起動の体験を収益化する | アプリ起動時 | [アプリ起動時広告](/docs/app-open) |

## ドキュメント

上の [インストール](#インストール) から始め、[初期化](/docs/configuration) と [同意管理](/docs/consent) を見たあと、最初のテストバナーを実行してください。デモユニットとデバイスは [テスト](/docs/testing) です。形式は上の表から選びます。同じガイドは [ドキュメントサイト](https://docs.rdlabo.dev/ja/projects/capacitor-admob)（英語と日本語）にもあります。npm でこの README を開いている場合は、ガイドはサイトを使ってください。`docs/` のファイルは GitHub リポジトリにあります。メソッドのシグネチャは API 節にあります。

- [初期化](/docs/configuration) — `AdMob.initialize` と SDK オプション。
- [同意管理](/docs/consent) — プライバシー同意と iOS のトラッキング許可。
- [テスト](/docs/testing) — デモ広告ユニット、テストデバイス、同意のテスト。
- [バナー広告](/docs/banner) — バナーのオプション、ライフサイクル、イベント。
- フルスクリーン広告:
  - [インタースティシャル広告](/docs/interstitial) — ロード、表示、複数準備。
  - [リワード広告](/docs/rewarded) — リワード動画、リワード付きインタースティシャル、サーバーサイド検証。
- [アプリ起動時広告](/docs/app-open) — フォアグラウンド遷移でのロードと表示。
- [広告イベント](/docs/events) — 共通のライフサイクル、エラー、売上データ。
- [移行ガイド](/docs/migration) — 古いプラグイン版からの変更点。
