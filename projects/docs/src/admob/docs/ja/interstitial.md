---
title: 'インタースティシャル広告'
code: []
scrollActiveLine: []
---

インタースティシャルはホストアプリの画面を覆うフルスクリーン広告です。画面遷移やゲームのレベル間など、自然な区切りで表示します。ユーザーは広告先へ進むか、閉じてアプリに戻れます。形式の説明は Google のインタースティシャル広告ガイド（[Android](https://developers.google.com/admob/android/interstitial?hl=ja) / [iOS](https://developers.google.com/admob/ios/interstitial?hl=ja)）を見てください。

アプリ内報酬を渡さない場合に使います。[初期化](/docs/configuration) と [同意](/docs/consent) のあとで呼び出します。事前に準備し、先にリスナーを登録し、準備ができてから表示します。

```ts
import { AdLoadInfo, AdMob, AdMobRevenueData, AdOptions, InterstitialAdPluginEvents } from '@capacitor-community/admob';

await AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
  console.log('Interstitial loaded', info.adUnitId);
});
await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, console.error);
await AdMob.addListener(InterstitialAdPluginEvents.AdImpression, (data: AdMobRevenueData) => {
  console.log(data);
});

const options: AdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
  // isTesting: true,
  // npa: true,
  // immersiveMode: true,
};
const { adUnitId } = await AdMob.prepareInterstitial(options);
await AdMob.showInterstitial({ adId: adUnitId });
```

!::prepareInterstitial::

!::showInterstitial::

!::AdOptions::

`showInterstitial()` に `adId` を渡さないと、最後に準備した広告を表示します。

## 複数の広告を準備する

```ts
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-2' });

await AdMob.showInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
```

`isTesting` は [テスト](/docs/testing) を参照してください。

ロード、表示、閉じる操作、失敗のイベントは [広告イベント](/docs/events) にあります。
