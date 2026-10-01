---
title: "Annonces à l’ouverture de l’application"
sourceRevision: "f77685b462e8df80fb5471195fd6f72c237c64c8f5992fa95e6ccfec337d5060"
---
# Annonces à l’ouverture de l’application

Les annonces à l’ouverture monétisent les écrans de chargement de l’application et sont conçues pour s’afficher lorsque l’utilisateur ramène celle-ci au premier plan. Il peut les fermer à tout moment. Les guides Google sur les annonces à l’ouverture pour [Android](https://developers.google.com/admob/android/app-open) et [iOS](https://developers.google.com/admob/ios/app-open) expliquent ce format.

Appelez cette méthode après [l’initialisation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) et [le consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Chargez l’annonce à l’avance et confirmez sa disponibilité avant de la présenter. Ne bloquez pas indéfiniment le démarrage de l’application en attendant le chargement d’une annonce.

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

<!-- !::loadAppOpen:: -->

<!-- !::isAppOpenLoaded:: -->

<!-- !::showAppOpen:: -->

<!-- !::AppOpenAdOptions:: -->

Il n’existe pas d’indicateur `isTesting` ; pendant le développement, définissez `adId` sur le [bloc de démonstration d’annonce à l’ouverture](https://developers.google.com/admob/android/test-ads#demo_ad_units) de Google.

Utilisez l’événement `Closed` pour reprendre le parcours de votre application et commencer à charger l’annonce suivante.

Sans `adId` passé à `showAppOpen()` ou `isAppOpenLoaded()`, l’opération vise l’annonce chargée le plus récemment. Consultez [Événements publicitaires](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events) pour la liste des événements.
