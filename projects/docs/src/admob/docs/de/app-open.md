---
title: "App-Open-Anzeigen"
sourceRevision: "f77685b462e8df80fb5471195fd6f72c237c64c8f5992fa95e6ccfec337d5060"
---
# App-Open-Anzeigen

App-Open-Anzeigen monetarisieren Ladebildschirme der Anwendung und sollen beim Wechsel der Anwendung in den Vordergrund erscheinen. Der Nutzer kann sie jederzeit schließen. Googles App-Open-Anleitungen für [Android](https://developers.google.com/admob/android/app-open) und [iOS](https://developers.google.com/admob/ios/app-open) erklären das Format.

Führen Sie dies nach [Initialisierung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) aus. Laden Sie die Anzeige vorab und prüfen Sie vor dem Anzeigen ihre Verfügbarkeit. Blockieren Sie den Anwendungsstart beim Warten auf eine Anzeige nicht unbegrenzt.

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

Es gibt kein Flag `isTesting`. Setzen Sie in der Entwicklung `adId` auf Googles [App-Open-Demo-Anzeigenblock](https://developers.google.com/admob/android/test-ads#demo_ad_units).

Verwenden Sie das Ereignis `Closed`, um den Anwendungsablauf fortzusetzen und mit dem Laden der nächsten Anzeige zu beginnen.

Ohne `adId` an `showAppOpen()` oder `isAppOpenLoaded()` wird die zuletzt geladene Anzeige verwendet. Die Ereignisliste finden Sie unter [Anzeigenereignisse](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events).
