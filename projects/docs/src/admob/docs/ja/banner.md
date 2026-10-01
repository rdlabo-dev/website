---
title: 'バナー広告'
code: []
scrollActiveLine: []
---

バナー広告はアプリ画面の一部を占める長方形の広告です。ユーザーがアプリを操作しているあいだも画面に残せます。通常は上下に固定します。形式の説明は Google のバナー広告ガイド（[Android](https://developers.google.com/admob/android/banner?hl=ja) / [iOS](https://developers.google.com/admob/ios/banner?hl=ja)）を見てください。

[initialize](/docs/configuration) と [同意](/docs/consent) のあとで呼び出します。このプラグインでは WebView の上にあるネイティブ画面に描画します。最初のロードとサイズ変更を取りこぼさないよう、`showBanner` より前にリスナーを登録します。

```ts
import {
  AdMob,
  AdMobBannerSize,
  AdMobRevenueData,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';

const handles = await Promise.all([
  AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
    console.log('Banner loaded');
  }),
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
    console.log('Banner size', size.width, size.height);
    // size.height分の余白をレイアウトに設けます。次の節を参照してください。
  }),
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
    console.error(error);
  }),
  AdMob.addListener(BannerAdPluginEvents.AdPaid, (data: AdMobRevenueData) => {
    // インプレッション単位の広告収益を分析サービスへ送信します。
    console.log(data);
  }),
]);

const options: BannerAdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
  adSize: BannerAdSize.ADAPTIVE_BANNER,
  position: BannerAdPosition.BOTTOM_CENTER,
  margin: 0,
  // isTesting: true,
  // npa: true,
};
await AdMob.showBanner(options);
```

!::showBanner::

!::BannerAdOptions::

!::BannerAdSize::

!::BannerAdPosition::

## バナーとコンテンツを重ねない

バナーは WebView の上のネイティブ画面に描画されます。HTML 側のレイアウトは自動では動きません。自分のルート要素を `size.height`（論理ピクセル）だけ空けます。`BOTTOM_CENTER` なら下、`TOP_CENTER` なら上に padding または margin を付けます。

```html
<main id="content">Your app</main>
```

```ts
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

const content = document.getElementById('content');

await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
  if (!content) {
    return;
  }
  content.style.paddingBottom = size.height > 0 ? `${size.height}px` : '';
});
```

非表示・削除・ロード失敗では高さが `0` になることがあるので、そのときは inset を消します。フレームワークでは、WebView を埋めている要素に同じ考え方を適用します。

`isTesting` は [テスト](/docs/testing) を参照してください。

## ライフサイクル

- `hideBanner()` は現在のバナーを一時的に隠します。
- `resumeBanner()` は隠したバナーを再表示します。
- `removeBanner()` はバナーを破棄します。作り直すときは `showBanner()` を呼びます。

!::hideBanner::

!::resumeBanner::

!::removeBanner::

画面を破棄するときはリスナーとバナーを解放します。

```ts
for (const handle of handles) {
  await handle.remove();
}
await AdMob.removeBanner();
```

バナーのインプレッション単位の売上は `BannerAdPluginEvents.AdPaid` で通知されます。フルスクリーン形式は同じ `AdMobRevenueData` を `AdImpression` で出します。[広告イベント](/docs/events) を参照してください。
