---
title: '広告イベント'
code: []
scrollActiveLine: []
---

Google は各形式のページでライフサイクルコールバックを説明しています。例は [バナーの広告イベント](https://developers.google.com/admob/android/banner?hl=ja#ad_events) です。このプラグインでは下表の名前を使い、ネイティブの `AdListener` メソッド名は使いません。有料ペイロードは [インプレッション単位の売上](https://developers.google.com/admob/android/impression-level-ad-revenue?hl=ja)（[iOS](https://developers.google.com/admob/ios/impression-level-ad-revenue?hl=ja)）を見てください。

最初のライフサイクルとインプレッションを取りこぼさないよう、広告のロードや表示より前にリスナーを登録します。

## リスナーの登録と解除

`AdMob.addListener` はハンドルを返します。登録を await し、画面を破棄するときに `remove()` します。

```ts
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

const handle = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
  console.log('Banner loaded');
});

await handle.remove();
```

!::PluginListenerHandle::

## 共通のライフサイクルイベント

| イベント                  | 発行されるとき                                           |
| ------------------------- | -------------------------------------------------------- |
| `Loaded`                  | 広告のロードが完了し、表示できる状態になった。           |
| `FailedToLoad`            | 広告をロードできなかった。`AdMobError` を確認する。      |
| `Showed` / `Opened`       | 広告がユーザーに見えた。                                 |
| `FailedToShow`            | ロード済みの広告を表示できなかった。                     |
| `Dismissed` / `Closed`    | ユーザーがフルスクリーン広告またはオーバーレイを閉じた。 |
| `Rewarded`                | ユーザーが案内どおりの報酬を得た。                       |
| `SizeChanged`             | バナーの寸法が変わった。                                 |
| `AdImpression` / `AdPaid` | インプレッションが記録された。売上イベントは下記。       |

## エラー

`FailedToLoad` と `FailedToShow` のリスナーは `AdMobError` ペイロードを受け取ります。

!::AdMobError::

## インプレッション単位の売上

フルスクリーン形式は `AdImpression` で `AdMobRevenueData` を出します。バナーは同じペイロードを `AdPaid` で出します。バナーの `AdImpression` にペイロードはなく、インプレッションが記録されたことだけを知らせます。

!::AdMobRevenueData::

## 形式ごとのガイド

- [アプリ起動時広告](/docs/app-open)
- [バナー広告](/docs/banner)
- [インタースティシャル広告](/docs/interstitial)
- [リワード広告](/docs/rewarded)

!::addListener.AppOpenAdPluginEvents::

!::AppOpenAdPluginEvents::

!::addListener.BannerAdPluginEvents::

!::BannerAdPluginEvents::

!::addListener.InterstitialAdPluginEvents::

!::InterstitialAdPluginEvents::

!::addListener.RewardAdPluginEvents::

!::RewardAdPluginEvents::

!::addListener.RewardInterstitialAdPluginEvents::

!::RewardInterstitialAdPluginEvents::
