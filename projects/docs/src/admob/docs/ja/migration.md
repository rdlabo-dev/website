---
title: '移行'
code: []
scrollActiveLine: []
---

`@capacitor-community/admob` v8 を入れている場合、以下の版ごとの手順は不要です。古い公開 API の変更を記録したものです。

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
