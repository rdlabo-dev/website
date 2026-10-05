---
title: "Initialisierung"
sourceRevision: "9c72bafeff538bac37cb3c866cceb076853ab461250b028fde68b3f9762b29ab"
---
# Konfiguration

Holen Sie zuerst die Einwilligung ein und prüfen Sie `canRequestAds`. Rufen Sie dann vor dem Anfordern von Anzeigen einmal `initialize` des Plugins auf. Sie starten das native SDK nicht selbst.

Native Anwendungs-IDs gehören in AndroidManifest / Info.plist. Siehe [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

```ts
import { AdMob } from '@capacitor-community/admob';

try {
  await AdMob.initialize();
} catch (error) {
  console.error('AdMob initialization failed', error);
  // Fordern Sie vorerst keine Anzeigen an. Versuchen Sie es erneut, sobald die native Ansicht der App verfügbar ist.
}
```

Unter Android wartet die Initialisierung auch auf die übergeordnete Ansicht des nativen Banners, selbst wenn Ihre App nur Vollbildanzeigen verwendet. Sie wird abgelehnt, wenn die Activity oder Inhaltsansicht nicht verfügbar ist oder die übergeordnete Ansicht nicht innerhalb von 5 Sekunden erscheint. Behandeln Sie diese Ablehnung, damit eine fehlgeschlagene Anzeigeninitialisierung den Start der übrigen App nicht verhindert. Sobald die native Ansicht verfügbar ist, können Sie es erneut versuchen.

Ein erfolgreich abgeschlossenes `initialize()` bedeutet nicht, dass eine Anzeige geladen wurde. Prüfen Sie die Bereitschaft über die Lademethode und Ereignisse des jeweiligen Formats.

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Bevorzugen Sie in der Entwicklung Googles [Demo-Anzeigenblöcke](https://developers.google.com/admob/android/test-ads#demo_ad_units). Registrieren Sie zum Testen produktionsnaher Anzeigen auf einem physischen Gerät dieses Gerät wie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) beschrieben. Verwenden Sie `initializeForTesting: true` nicht in Produktion.

Anzeigenspezifische Optionen wie `isTesting`, `npa` für nicht personalisierte Anzeigen und `immersiveMode` zum Ausblenden der Android-Systemleisten bei einer Vollbildanzeige werden für jede Anzeigenanfrage gesetzt, nicht an `initialize`. Siehe die Anleitungen der jeweiligen Formate.

Holen Sie die Datenschutzeinwilligung vor der Initialisierung und dem Laden von Anzeigen ein. Siehe [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).
