---
title: "Tests"
sourceRevision: "4495cc97707240f27621532df1f0125a4ac0c7320eaa3ca625be5ba1f2141892"
---
# Tests

Verwenden Sie während der Entwicklung Testanzeigen, damit Sie Anzeigen anklicken können, ohne Werbetreibende zu belasten oder das Konto wegen ungültiger Zugriffe markieren zu lassen. Googles Testanzeigen-Anleitungen für [Android](https://developers.google.com/admob/android/test-ads) und [iOS](https://developers.google.com/admob/ios/test-ads) erklären Demo-Anzeigenblöcke und Testgeräte.

Dieses Plugin kann diese Demo-Anzeigenblöcke anfordern oder ein Gerät über `initialize` registrieren.

## Demo-Anzeigenblöcke

Google stellt [Demo-Anzeigenblöcke](https://developers.google.com/admob/android/test-ads#demo_ad_units) bereit, die immer Testanzeigen zurückgeben. Bevorzugen Sie diese während der Entwicklung. Dieses Plugin unterstützt ausschließlich natives iOS und Android. Verwenden Sie die passende Plattform-ID.

Banner-Demo-Anzeigenblöcke dieses Plugins und seiner Demo:

| Plattform | Banner-`adId` |
| --- | --- |
| Android | `ca-app-pub-3940256099942544/6300978111` |
| iOS | `ca-app-pub-3940256099942544/2934735716` |

Demo-IDs anderer Formate stehen in den oben verlinkten Google-Testanzeigen-Anleitungen. Sie können außerdem `isTesting: true` für Banner-, Interstitial-, belohnte und belohnte Interstitial-Anfragen setzen. App-Open-Anzeigen besitzen keine Option `isTesting`; übergeben Sie einen Demo-Anzeigenblock als `adId`.

## Testgeräte

Registrieren Sie das Gerät mit `AdMob.initialize()`, um auf einem physischen Gerät produktionsnahe Anzeigen anzufordern, ohne ungültige Zugriffe zu erzeugen:

```ts
await AdMob.initialize({
  testingDevices: ['YOUR_TEST_DEVICE_ID'],
  initializeForTesting: true,
});
```

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Suchen Sie die Geräte-ID nach der ersten Anzeigenanfrage in den nativen Protokollen:

- Android: Logcat, üblicherweise unter dem Tag `Ads` (`Use RequestConfiguration.Builder.setTestDeviceIds(...)`).
- iOS: Xcode-Konsole (`To get test ads on this device, set:`).

Siehe Googles Anleitung zum [Aktivieren von Testgeräten](https://developers.google.com/admob/android/test-ads#enable_test_devices).

## Debug-Region für die Einwilligung

Setzen Sie auf einem realen Gerät `debugGeography` und nehmen Sie die Geräte-ID in `testDeviceIdentifiers` auf. `EEA` lässt das Formular so reagieren, als befände sich das Gerät im Europäischen Wirtschaftsraum, damit Sie DSGVO-Nachrichten testen können. Verwenden Sie dies ausschließlich auf registrierten Testgeräten.

```ts
import { AdMob, AdmobConsentDebugGeography } from '@capacitor-community/admob';

const consentInfo = await AdMob.requestConsentInfo({
  debugGeography: AdmobConsentDebugGeography.EEA,
  testDeviceIdentifiers: ['YOUR_TEST_DEVICE_ID'],
});
```

<!-- !::requestConsentInfo:: -->

<!-- !::AdmobConsentRequestOptions:: -->

<!-- !::AdmobConsentDebugGeography:: -->

Wenn Sie im Testformular die Einwilligung ablehnen (Manage → Confirm Choices), werden möglicherweise keine Anzeigen geladen. Dies ist in einer Testumgebung zu erwarten und sagt nichts über das Produktionsverhalten nach einer Nutzereinwilligung aus.

`resetConsentInfo()` ist ausschließlich für Tests bestimmt. Siehe [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).

## Serverseitige Verifizierung

Callbacks der serverseitigen Verifizierung (SSV) werden ausschließlich für Produktionsanzeigen ausgelöst. Testanzeigen rufen Ihren SSV-Endpunkt nicht auf. Ein Beispiel für eine simulierte Anfrage finden Sie unter [Belohnte Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded).
