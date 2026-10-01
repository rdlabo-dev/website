---
title: "Rewarded-Anzeigen"
sourceRevision: "2fbd73e4314022a6ca92242b8eb17d540daee64848938bd3e29e5bfe60ee571b"
---
# Rewarded-Anzeigen

Belohnte Anzeigen ermöglichen die Vergabe von Gegenständen innerhalb der Anwendung für die Interaktion mit Videoanzeigen, spielbaren Anzeigen oder Umfragen. Googles Anleitungen für belohnte Anzeigen unter [Android](https://developers.google.com/admob/android/rewarded) und [iOS](https://developers.google.com/admob/ios/rewarded) erklären das Format.

Behandeln Sie belohnte Anzeigen als Belohnungsablauf, nicht als weiteres unbelohntes Interstitial. Führen Sie dies nach [Initialisierung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) aus. Gewähren Sie die Belohnung ausschließlich anhand des zurückgegebenen Ergebnisses oder des Ereignisses `Rewarded`, nicht anhand von `Dismissed`.

## Belohntes Video

Verwenden Sie eine belohnte Anzeige für einen gezielten Belohnungsablauf.

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
// Die Belohnung einmal vergeben: anhand dieses Ergebnisses oder des Rewarded-Ereignisses, nicht beider.
console.log(rewardItem);
```

<!-- !::prepareRewardVideoAd:: -->

<!-- !::showRewardVideoAd:: -->

<!-- !::RewardAdOptions:: -->

<!-- !::AdMobRewardItem:: -->

Ohne `adId` an `showRewardVideoAd()` wird die zuletzt vorbereitete Anzeige gezeigt.

### Mehrere Anzeigen vorbereiten

```ts
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-2' });

const reward = await AdMob.showRewardVideoAd({ adId: 'ca-app-pub-xxx/reward-1' });
```

## Belohntes Interstitial

Belohnte Interstitial-Anzeigen sind Vollbildanzeigen mit Anreiz, die an natürlichen Anwendungsübergängen erscheinen. Anders als bei belohnten Videos stimmt der Nutzer nicht vorher ausdrücklich zu. Googles Anleitungen für belohnte Interstitials unter [Android](https://developers.google.com/admob/android/rewarded-interstitial) und [iOS](https://developers.google.com/admob/ios/rewarded-interstitial) erklären das Format.

Verwenden Sie ein belohntes Interstitial, wenn die Belohnungserfahrung an einen natürlichen Übergang der Anwendung gehört.

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

Informationen zu `isTesting` finden Sie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

## Serverseitige Verifizierung

Serverseitige Verifizierung (SSV) ermöglicht Ihrem Backend die Bestätigung einer verdienten Belohnung. Siehe Googles [SSV-Dokumentation](https://support.google.com/admob/answer/9603226). Callbacks werden ausschließlich für Produktionsanzeigen ausgelöst. Testanzeigen rufen Ihren SSV-Endpunkt nicht auf.

Für die lokale Validierung der Nutzdaten `ssv` können Sie nach `RewardAdPluginEvents.Rewarded` eine simulierte Anfrage senden. Ersetzen Sie `ENVIRONMENT_IS_DEVELOPMENT` durch Ihr eigenes Entwicklungsflag:

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
