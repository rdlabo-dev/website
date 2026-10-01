---
title: "Annonces interstitielles"
sourceRevision: "344f442aae5c577ca74368af17ff8b2bf4960848bcbe95108e1761efcac35261"
---
# Annonces interstitielles

Les annonces interstitielles occupent tout l’écran et recouvrent l’application hôte. Affichez-les lors d’une transition naturelle, par exemple entre activités ou niveaux de jeu. L’utilisateur peut suivre l’annonce ou la fermer pour revenir à l’application. Les guides Google sur les interstitielles pour [Android](https://developers.google.com/admob/android/interstitial) et [iOS](https://developers.google.com/admob/ios/interstitial) expliquent ce format.

Utilisez une interstitielle lorsque l’utilisateur ne doit pas recevoir de récompense dans l’application. Appelez cette méthode après [l’initialisation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) et [le consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Préparez l’annonce à l’avance, enregistrez d’abord les écouteurs et affichez-la uniquement lorsqu’elle est prête.

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

Sans `adId` passé à `showInterstitial()`, l’annonce préparée le plus récemment est affichée.

## Préparer plusieurs annonces

```ts
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
await AdMob.prepareInterstitial({ adId: 'ca-app-pub-xxx/interstitial-2' });

await AdMob.showInterstitial({ adId: 'ca-app-pub-xxx/interstitial-1' });
```

Consultez [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) pour `isTesting`.

Les événements de chargement, d’affichage, de fermeture et d’échec figurent dans [Événements publicitaires](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events).
