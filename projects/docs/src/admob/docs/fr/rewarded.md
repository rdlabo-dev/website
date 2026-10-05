---
title: "Annonces récompensées"
sourceRevision: "0c51c35e63037c85b947672eebb189fea8d4a2684f282cdf4f5c392eed834d3f"
---
# Annonces récompensées

Les annonces récompensées permettent d’attribuer des éléments dans l’application en échange d’interactions avec des vidéos publicitaires, des annonces jouables ou des sondages. Les guides Google sur les annonces récompensées pour [Android](https://developers.google.com/admob/android/rewarded) et [iOS](https://developers.google.com/admob/ios/rewarded) expliquent ce format.

Traitez les annonces récompensées comme un parcours de récompense, pas comme une autre interstitielle sans récompense. Appelez cette méthode après [l’initialisation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) et [le consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Attribuez la récompense uniquement à partir du résultat renvoyé ou de l’événement `Rewarded`, pas de `Dismissed`.

## Vidéo récompensée

Utilisez une annonce récompensée pour un parcours dédié à la récompense.

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
// Attribuez la récompense une seule fois, avec ce résultat ou l’événement Rewarded — pas les deux.
console.log(rewardItem);
```

<!-- !::prepareRewardVideoAd:: -->

<!-- !::showRewardVideoAd:: -->

<!-- !::RewardAdOptions:: -->

<!-- !::AdMobRewardItem:: -->

Sans `adId` passé à `showRewardVideoAd()`, l’annonce préparée le plus récemment est affichée.

### Événements de clic (depuis 8.2.0)

Enregistrez `adClicked` avant d’afficher une annonce récompensée. Cet événement transmet les clics enregistrés par le SDK, y compris après l’obtention d’une récompense tant que l’annonce reste affichée. Il ne signifie pas qu’une récompense a été obtenue et ne s’applique pas aux annonces interstitielles récompensées.

```ts
const clickListener = await AdMob.addListener(RewardAdPluginEvents.adClicked, () => {
  console.log('Rewarded ad clicked');
});

// Lors de la destruction de l’écran propriétaire :
await clickListener.remove();
```

### Préparer plusieurs annonces

```ts
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-2' });

const reward = await AdMob.showRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
```

## Interstitielle récompensée

Les annonces interstitielles récompensées sont des annonces plein écran incitatives qui apparaissent lors de transitions naturelles dans l’application. Contrairement à la vidéo récompensée, l’utilisateur ne choisit pas d’y participer au préalable. Les guides Google sur les interstitielles récompensées pour [Android](https://developers.google.com/admob/android/rewarded-interstitial) et [iOS](https://developers.google.com/admob/ios/rewarded-interstitial) expliquent ce format.

Utilisez une interstitielle récompensée lorsque l’expérience récompensée doit intervenir à une transition naturelle dans l’application.

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

<!-- !::prepareRewardInterstitialAd:: -->

<!-- !::showRewardInterstitialAd:: -->

<!-- !::RewardInterstitialAdOptions:: -->

<!-- !::AdMobRewardInterstitialItem:: -->

Consultez [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) pour `isTesting`.

## Vérification côté serveur

La vérification côté serveur (SSV) permet à votre backend de confirmer qu’une récompense a été obtenue. Consultez la [documentation SSV](https://support.google.com/admob/answer/9603226) de Google. Les callbacks sont déclenchés uniquement pour les annonces de production ; les annonces de test n’appellent pas votre endpoint SSV.

Pour valider localement la charge utile `ssv`, vous pouvez envoyer une demande simulée après `RewardAdPluginEvents.Rewarded`. Remplacez `ENVIRONMENT_IS_DEVELOPMENT` par votre propre indicateur de développement :

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
