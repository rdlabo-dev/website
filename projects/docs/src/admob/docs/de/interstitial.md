---
title: "Interstitial-Anzeigen"
sourceRevision: "344f442aae5c577ca74368af17ff8b2bf4960848bcbe95108e1761efcac35261"
---
# Interstitial-Anzeigen

Interstitial-Anzeigen sind Vollbildanzeigen, die die Host-Anwendung überdecken. Zeigen Sie sie an einem natürlichen Übergang, beispielsweise zwischen Aktivitäten oder Spielleveln. Der Nutzer kann die Anzeige anklicken oder schließen und zur Anwendung zurückkehren. Googles Interstitial-Anleitungen für [Android](https://developers.google.com/admob/android/interstitial) und [iOS](https://developers.google.com/admob/ios/interstitial) erklären das Format.

Verwenden Sie ein Interstitial, wenn der Nutzer keine Belohnung innerhalb der Anwendung erhalten soll. Führen Sie dies nach [Initialisierung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) aus. Bereiten Sie die Anzeige rechtzeitig vor, registrieren Sie Listener zuerst und zeigen Sie sie erst bei Bereitschaft an.

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

<!-- !::prepareInterstitial:: -->

<!-- !::showInterstitial:: -->

<!-- !::AdOptions:: -->

Ohne `adId` an `showInterstitial()` wird die zuletzt vorbereitete Anzeige gezeigt.

## Mehrere Anzeigen vorbereiten

```ts
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-2' });

await AdMob.showInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
```

Informationen zu `isTesting` finden Sie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

Ereignisse für Laden, Anzeigen, Schließen und Fehlschlag stehen unter [Anzeigenereignisse](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events).
