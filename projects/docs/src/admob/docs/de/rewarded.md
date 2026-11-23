---
title: "Rewarded-Anzeigen"
sourceRevision: "75b07af03f55314dc39c157e67ce1d9da91a5a6d455a0f80796e0e15bf6f81d1"
---
# Rewarded-Anzeigen

Belohnte Anzeigen ermöglichen die Vergabe von Gegenständen innerhalb der Anwendung für die Interaktion mit Videoanzeigen, spielbaren Anzeigen oder Umfragen. Googles Anleitungen für belohnte Anzeigen unter [Android](https://developers.google.com/admob/android/rewarded) und [iOS](https://developers.google.com/admob/ios/rewarded) erklären das Format.

Behandeln Sie belohnte Anzeigen als Belohnungsablauf, nicht als weiteres unbelohntes Interstitial. Führen Sie dies nach [Initialisierung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) aus. Gewähren Sie die Belohnung ausschließlich anhand des zurückgegebenen Ergebnisses oder des Ereignisses `Rewarded`, nicht anhand von `Dismissed`.

Sobald die Belohnung verdient wurde, liefern sowohl `showRewardVideoAd()` als auch `showRewardInterstitialAd()` die Belohnung zurück. Wird die Anzeige vorher geschlossen, wird das Promise mit `REWARDED_AD_CANCELLED` abgelehnt. Schlägt die Präsentation fehl, wird das Promise ebenfalls abgelehnt. Die Fehlercodes der nativen SDKs sind plattformspezifisch. Behandeln Sie die Ablehnung, damit die App nach einem Abbruch ihre Schaltflächen und ihren Ladezustand zurücksetzen kann. Die Ereignisse `Rewarded`, `Dismissed` und `FailedToShow` werden weiterhin ausgelöst. Bereiten Sie nach dem Schließen oder einem Fehler die nächste Anzeige vor, bevor Sie sie anzeigen.

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

### Klickereignisse (seit 8.2.0)

Registrieren Sie `adClicked`, bevor Sie eine belohnte Anzeige zeigen. Damit werden vom SDK erfasste Klicks weitergeleitet, auch nach dem Erhalt einer Belohnung, solange die Anzeige sichtbar bleibt. Das Ereignis bedeutet nicht, dass eine Belohnung verdient wurde, und gilt nicht für belohnte Interstitial-Anzeigen.

```ts
const clickListener = await AdMob.addListener(RewardAdPluginEvents.adClicked, () => {
  console.log('Rewarded ad clicked');
});

// Wenn der zugehörige Bildschirm zerstört wird:
await clickListener.remove();
```

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

Übergeben Sie unter Android beim Vorbereiten der Anzeige `immersiveMode: true` an `prepareRewardVideoAd()`, um während der Anzeige die Systemleisten auszublenden. Die Option gehört zum Aufruf für die Vorbereitung. Das Ausblenden in der Host-App allein wirkt sich nicht auf die Anzeigen-Activity des SDK aus.
