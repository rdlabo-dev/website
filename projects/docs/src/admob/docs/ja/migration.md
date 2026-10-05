---
title: '移行'
code: []
scrollActiveLine: []
---
## 8.2.0 の変更点

### Capacitor 8.5 以降が必要

`@capacitor/core`、`@capacitor/cli`、使用するネイティブプラットフォームのパッケージ（`@capacitor/android` / `@capacitor/ios`）を v8 内の 8.5 以降に更新し、`npx cap sync` を実行してください。

古い Capacitor では、Android のウィンドウインセットがバナーへ届く前に消費されることがあります。現在のセーフエリア処理を利用するため、Capacitor を更新してください。ネイティブプロジェクトの移行手順は [Capacitor 8.5 更新ガイド](https://capacitorjs.com/docs/updating/8-5) に従ってください。

### Android の初期化が拒否される場合がある

`AdMob.initialize()` はネイティブバナーの親ビューを待つようになりました。5秒以内に現れない場合は初期化が拒否されます。Activity／コンテンツビューが利用できない場合は、即座に失敗することもあります。フルスクリーン広告だけを使うアプリも対象です。以前は子ビューがなくても初期化が正常に完了し、その後のバナーリクエストがクラッシュする場合がありました。

アプリの起動を妨げずに初期化エラーを処理し、ネイティブビューが利用可能になってから再試行してください。例は [initialize](/docs/configuration) を参照してください。

### iOS の収益値をマイクロ単位に修正

バナー、インタースティシャル、リワード、リワード付きインタースティシャル、アプリ起動時広告の `valueMicros` フィールドが、通貨単位の100万分の1を正しく返すようになりました。たとえば通貨単位で `0.0012` の値は、以前は `0` でしたが、現在は `1200` になります。Android の値とイベント名は変わりません。

どちらのプラットフォームでも、`valueMicros` を `1_000_000` で割ると通貨単位になります。分析パイプラインに iOS 専用の補正処理がある場合は見直してください。過去の iOS の値は変換前に切り捨てられていたため、保存済みの値を掛け算しても失われた小数部分の収益は復元できません。

### SDK 初期化前の同意取得

iOS でも Android と同様に、`AdMob.initialize()` より前に `showConsentForm()` と `showPrivacyOptionsForm()` を呼び出せるようになりました。同意情報を取得し、必要であればフォームを表示して、`canRequestAds` が true のときだけ Mobile Ads SDK を初期化して広告をロードしてください。全体の手順は [同意管理](/docs/consent) を参照してください。従来の初期化を先に行う実装も呼び出せますが、この順序へ移行してください。

### 広告ロードエラーでネイティブのコードを保持

`prepareInterstitial()`、`prepareRewardVideoAd()`、`prepareRewardInterstitialAd()` は、SDK のロード失敗時に文字列の `code` とネイティブのエラーメッセージを付けて拒否するようになりました。コードはプラットフォーム固有で、Android と iOS の間で正規化されません。`FailedToLoad` イベントのコードは引き続き数値ですが、iOS では固定値の `0` ではなく実際の SDK コードが入ります。

iOS のメッセージ `Loading failed` との一致判定や、イベントコードが `0` という前提を使うエラーハンドラーを更新してください。no-fill などの失敗を処理するときは、各プラットフォームの SDK のエラー定義を使ってください。

### リワード広告のクリックイベント

`RewardAdPluginEvents.adClicked` は、Android と iOS のリワード広告に追加された任意のリスナーです。イベント文字列は `onRewardedVideoAdClicked` です。クリックと報酬の獲得は別です。報酬は引き続き `Rewarded` イベントまたは表示結果に基づいて、一度だけ付与してください。[リワード広告](/docs/rewarded) を参照してください。

### AGP 9 のビルド互換性

Android ライブラリは `proguard-android-optimize.txt` を参照するようになり、古い既定ファイルを AGP 9 が拒否する問題を回避します。この変更でライブラリの縮小処理が有効になったり、プロジェクトの AGP が更新されたりすることはありません。ホストアプリには引き続き AGP 9 のその他の移行手順が必要です。

「以前の版からの破壊的変更」にある版ごとの手順は、v8 より前のリリースが対象です。

## Google Mobile Ads SDK の版

このメジャーでは、非推奨だがまだサポートされている Google Mobile Ads SDK API を維持しています。置き換えるとバナーサイズや年齢制限の扱いが変わることがあるため、次のメジャーまで待ちます。

Google の [Android 向け Next-Gen SDK](https://developers.google.com/admob/android/next-gen) も次のメジャーまで待ちます。SDK 初期化、広告リクエスト、メディエーションが変わります。

固定版: Android 25.4.x、iOS 13.6.0（Swift Package Manager と CocoaPods）。CocoaPods 対応は次のメジャーで外す予定です。

## 以前の版からの破壊的変更

### 1.1.0

- iOS 14 以降への準備
- `ios/App/App/AppDelegate.swift` から次を削除します。

```diff
- import GoogleMobileAds

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
-     // アプリ起動後のカスタマイズ用に処理を上書きする箇所。
-     GADMobileAds.sharedInstance().start(completionHandler: nil)
```

### 0.2.13

- isTest: 'LIVE' | 'TESTING' => boolean

### 0.2.12

**app.component.ts**

```ts
import { Plugins } from '@capacitor/core';

const { AdMob } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    // アプリ向けにAdMobを初期化します。
    +AdMob.initialize('[APP_ID]');
    -AdMob.initialize();
  }
}
```

**admob.component.ts**

```ts
    import { Plugins } from '@capacitor/core';
    import { AdOptions, AdSize, AdPosition } from '@rdlabo/capacitor-admob';

    const { AdMob } = Plugins;

    @Component({
      selector: 'admob',
      templateUrl: 'admob.component.html',
      styleUrls: ['admob.component.scss']
    })
    export class AdMobComponent {

        const options: AdOptions = {
            adId: 'YOUR ADID',
            adSize: AdSize.BANNER,
            position: AdPosition.BOTTOM_CENTER,
-           margin: '0',
+           margin: 0,
        }

        constructor(){
            // バナー広告を表示します。
            AdMob.showBanner(this.options)
            .then(
                (value) => {
                    console.log(value);  // true
                },
                (error) => {
                    console.error(error); // エラーを表示します。
                }
            );

            // バナーのイベントリスナーを登録します。
            AdMob.addListener('onAdLoaded', (info: boolean) => {
                 console.log("Banner Ad Loaded");
            });

+           // バナーのサイズを取得します。
+           AdMob.addListener('onAdSize', (info: boolean) => {
+                console.log(info);
+           });
        }
    }
```
