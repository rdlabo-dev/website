---
title: 'リワード広告'
code: []
scrollActiveLine: []
---

リワード広告は、動画・プレイアブル・アンケートへの操作と引き換えにアプリ内アイテムを渡す形式です。形式の説明は Google のリワード広告ガイド（[Android](https://developers.google.com/admob/android/rewarded?hl=ja) / [iOS](https://developers.google.com/admob/ios/rewarded?hl=ja)）を見てください。

リワード広告は報酬フローとして扱い、報酬なしのインタースティシャルの代わりにはしません。[initialize](/docs/configuration) と [同意](/docs/consent) のあとで呼び出します。報酬は戻り値または `Rewarded` イベントからのみ付与し、`Dismissed` では付与しません。

## リワード動画

専用の報酬フローではリワード広告を使います。

```ts
import {
  AdLoadInfo,
  AdMob,
  AdMobRevenueData,
  AdMobRewardItem,
  RewardAdOptions,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';

await AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
  console.log('Rewarded ad loaded', info.adUnitId);
});
await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, console.error);
await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
  console.log('Reward earned', reward.amount, reward.type);
});
await AdMob.addListener(RewardAdPluginEvents.AdImpression, (data: AdMobRevenueData) => {
  console.log(data);
});

const options: RewardAdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
  // isTesting: true,
  // npa: true,
  // immersiveMode: true,
  // ssv: {
  //   userId: 'USER_ID',
  //   customData: JSON.stringify({ placement: 'bonus' }),
  // },
};
await AdMob.prepareRewardVideoAd(options);
const rewardItem = await AdMob.showRewardVideoAd();
// この結果またはRewardedイベントのどちらか一方を使い、報酬を一度だけ付与します。
console.log(rewardItem);
```

!::prepareRewardVideoAd::

!::showRewardVideoAd::

!::RewardAdOptions::

!::AdMobRewardItem::

`showRewardVideoAd()` に `adId` を渡さないと、最後に準備した広告を表示します。

### 複数の広告を準備する

```ts
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-2' });

const reward = await AdMob.showRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
```

## リワード付きインタースティシャル

リワード付きインタースティシャルは、自然な遷移で自動表示される報酬付きフルスクリーン広告です。通常のリワードと違い、視聴のオプトインは不要です。形式の説明は Google のリワード付きインタースティシャルガイド（[Android](https://developers.google.com/admob/android/rewarded-interstitial?hl=ja) / [iOS](https://developers.google.com/admob/ios/rewarded-interstitial?hl=ja)）を見てください。

報酬体験がアプリの自然な遷移に乗る場合は、リワード付きインタースティシャルを使います。

```ts
import {
  AdMob,
  AdMobRewardInterstitialItem,
  RewardInterstitialAdOptions,
  RewardInterstitialAdPluginEvents,
} from '@capacitor-community/admob';

await AdMob.addListener(RewardInterstitialAdPluginEvents.FailedToLoad, console.error);

const options: RewardInterstitialAdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
};
const { adUnitId } = await AdMob.prepareRewardInterstitialAd(options);
const rewardItem: AdMobRewardInterstitialItem = await AdMob.showRewardInterstitialAd({
  adId: adUnitId,
});
console.log(rewardItem);
```

!::prepareRewardInterstitialAd::

!::showRewardInterstitialAd::

!::RewardInterstitialAdOptions::

!::AdMobRewardInterstitialItem::

`isTesting` は [テスト](/docs/testing) を参照してください。

## サーバーサイド検証

サーバーサイド検証（SSV）は、報酬が得られたことをバックエンドで確認するための仕組みです。Google の [SSV の説明](https://support.google.com/admob/answer/9603226?hl=ja) を見てください。コールバックは本番広告でのみ送られ、テスト広告では SSV エンドポイントは呼ばれません。

`ssv` のペイロードをローカルで確認するには、`RewardAdPluginEvents.Rewarded` のあとにモックリクエストを送れます。`ENVIRONMENT_IS_DEVELOPMENT` は自分の開発用フラグに置き換えてください。

```ts
const userId = 'USER_ID';
const customData = JSON.stringify({ placement: 'bonus' });

await AdMob.addListener(RewardAdPluginEvents.Rewarded, async () => {
  if (!ENVIRONMENT_IS_DEVELOPMENT) {
    return;
  }
  try {
    const params = new URLSearchParams({
      ad_network: 'TEST',
      ad_unit: 'TEST',
      custom_data: customData,
      reward_amount: 'TEST',
      reward_item: 'TEST',
      timestamp: 'TEST',
      transaction_id: 'TEST',
      user_id: userId,
      signature: 'TEST',
      key_id: 'TEST',
    });
    await fetch(`https://your-staging-ssv-endpoint?${params.toString()}`);
  } catch (err) {
    console.error(err);
  }
});
```
