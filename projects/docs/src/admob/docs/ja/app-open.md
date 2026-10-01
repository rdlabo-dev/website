---
title: 'アプリ起動時広告'
code: []
scrollActiveLine: []
---

アプリ起動時広告はロード画面を収益化するための形式で、アプリがフォアグラウンドに戻ったときに表示します。ユーザーはいつでも閉じられます。形式の説明は Google のアプリ起動時広告ガイド（[Android](https://developers.google.com/admob/android/app-open?hl=ja) / [iOS](https://developers.google.com/admob/ios/app-open?hl=ja)）を見てください。

[initialize](/docs/configuration) と [同意](/docs/consent) のあとで呼び出します。事前にロードし、利用可能なことを確認してから表示します。広告のロード待ちで起動を無期限にブロックしないでください。

```ts
import {
  AdLoadInfo,
  AdMob,
  AdMobRevenueData,
  AppOpenAdOptions,
  AppOpenAdPluginEvents,
} from '@capacitor-community/admob';

await AdMob.addListener(AppOpenAdPluginEvents.Loaded, (info: AdLoadInfo) => {
  console.log('App Open Ad loaded', info.adUnitId);
});
await AdMob.addListener(AppOpenAdPluginEvents.FailedToLoad, console.error);
await AdMob.addListener(AppOpenAdPluginEvents.Opened, () => {
  console.log('App Open Ad open');
});
await AdMob.addListener(AppOpenAdPluginEvents.Closed, () => {
  console.log('App Open Ad close');
});
await AdMob.addListener(AppOpenAdPluginEvents.FailedToShow, console.error);
await AdMob.addListener(AppOpenAdPluginEvents.AdImpression, (data: AdMobRevenueData) => {
  console.log(data);
});

const options: AppOpenAdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
};
const { adUnitId } = await AdMob.loadAppOpen(options);
const { value: isLoaded } = await AdMob.isAppOpenLoaded({ adId: adUnitId });
if (isLoaded) {
  await AdMob.showAppOpen({ adId: adUnitId });
}
```

!::loadAppOpen::

!::isAppOpenLoaded::

!::showAppOpen::

!::AppOpenAdOptions::

`isTesting` はありません。開発中は `adId` に Google の [アプリ起動時デモ広告ユニット](https://developers.google.com/admob/android/test-ads#demo_ad_units) を指定します。

`Closed` イベントでアプリのフローを再開し、次の広告をロードします。

`showAppOpen()` や `isAppOpenLoaded()` に `adId` を渡さないと、最後にロードした広告が対象になります。イベント一覧は [広告イベント](/docs/events) を見てください。
