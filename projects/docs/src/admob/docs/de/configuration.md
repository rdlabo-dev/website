---
title: "Initialisierung"
sourceRevision: "4791411830593b34ff8a0f3232e9477edaf27dd58ef558f068421c4f292f19da"
---
# Konfiguration

Rufen Sie vor dem Anfordern von Anzeigen einmal `initialize` des Plugins auf. Sie starten das native SDK nicht selbst.

Native Anwendungs-IDs gehören in AndroidManifest / Info.plist. Siehe [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

```ts
import { AdMob } from '@capacitor-community/admob';

await AdMob.initialize();
```

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Bevorzugen Sie in der Entwicklung Googles [Demo-Anzeigenblöcke](https://developers.google.com/admob/android/test-ads#demo_ad_units). Registrieren Sie zum Testen produktionsnaher Anzeigen auf einem physischen Gerät dieses Gerät wie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) beschrieben. Verwenden Sie `initializeForTesting: true` nicht in Produktion.

Anzeigenspezifische Optionen wie `isTesting`, `npa` für nicht personalisierte Anzeigen und `immersiveMode` zum Ausblenden der Android-Systemleisten bei einer Vollbildanzeige werden für jede Anzeigenanfrage gesetzt, nicht an `initialize`. Siehe die Anleitungen der jeweiligen Formate.

Fragen Sie nach der Initialisierung die Datenschutzeinwilligung ab, bevor Sie Anzeigen laden. Siehe [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).
