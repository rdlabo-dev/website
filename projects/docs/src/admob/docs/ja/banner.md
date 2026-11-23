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

Android で表示中のバナーを移動するには、同じ広告ユニットとリクエストオプションで `showBanner()` を再度呼び出し、`position` または `margin` を変更します。`adSize` を省略してもサイズは維持されます。レイアウトだけが変わる場合は、新しい広告をリクエストせず、表示中の広告を移動して処理を完了します。移動時には `npa` などのリクエストオプションを維持してください。レイアウトを変えずに `showBanner()` を呼び出した場合やリクエストオプションを変えた場合は、従来どおり再ロードします。バナーが2つ表示されることはありません。別のサイズや広告ユニットに切り替える際に、対応するバナーを `prepareBanner()` で準備していない場合は、先に `removeBanner()` を呼び出します。

## アダプティブバナーの配置領域を事前に確保する

バナーの作成や広告リクエストを行わずに、想定サイズを計算できます。

```ts
const { height } = await AdMob.getAdaptiveBannerSize();
content.style.paddingBottom = `${height}px`;
await AdMob.showBanner(options);
```

既定では、セーフエリアを考慮した現在の利用可能幅を使い、アダプティブバナーの `showBanner()` と同じ SDK の計算方法でサイズを求めます。単位は論理ピクセル（Android は dp、iOS はポイント）です。画面回転や利用可能幅の変更後は再計算し、実際の表示サイズは引き続き `SizeChanged` で取得します。

任意の `{ width: 300 }` を渡すと、指定した論理ピクセル幅で計算します。`showBanner()` が使う幅は変わりません。不正な幅を渡すと拒否されます。この計算は Android と iOS で利用できます。Web では未対応のため拒否されます。

## 表示中のバナーサイズを取得する

`getBannerSize()` は、最初のサイズ変更イベントを取り逃した場合でも、表示中の幅と高さを論理ピクセルで返します。広告のリクエストや表示は行いません。ロード前、非表示時、削除後、失敗時はいずれの寸法もゼロです。

```ts
const { width, height } = await AdMob.getBannerSize();
```

以降のサイズ変更は `BannerAdPluginEvents.SizeChanged` を引き続き監視してください。

## 表示せずに事前ロードする

```ts
await AdMob.prepareBanner(options);
// 画面の準備ができたら表示します。
await AdMob.showBanner(options);
```

`prepareBanner()` は、表示中のバナーを維持したまま次のバナーのロードが完了すると解決します。再ロードせずに表示するには、`showBanner()` に同じ広告ユニット、サイズ、リクエストオプションを渡します。位置と余白は変えられます。再利用できるバナーがない場合、`showBanner()` は通常どおり動作します。

再び準備を開始すると、前回の準備は置き換えられます。`removeBanner()` は表示中と準備済みの両方のバナーを削除します。進行中の準備が置き換えられたり削除されたりすると、その Promise は拒否されます。

準備完了時には `Loaded` が発生し、`SizeChanged` は発生しません。準備済みバナーの表示時には、表示寸法が変わった場合にだけ `SizeChanged` が発生し、`Loaded` は再発生しません。
