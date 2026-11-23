---
title: "Initialisierung"
sourceRevision: "bedb1cae3506931afd9854faa8837721aa430ce0058d061cb74f981cac6c98cf"
---
# Konfiguration

Holen Sie zuerst die Einwilligung ein und prüfen Sie `canRequestAds`. Rufen Sie dann vor dem Anfordern von Anzeigen einmal `initialize` des Plugins auf. Sie starten das native SDK nicht selbst.

Native Anwendungs-IDs gehören in AndroidManifest / Info.plist. Siehe [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

## CocoaPods

Swift Package Manager bindet die WebView Native UI Engine automatisch ein. Registrieren Sie bei CocoaPods den lokalen Pod aus dem npm-Paket. Installieren Sie Engine 1.0.10 oder eine kompatible neuere 1.x-Version als direkte Abhängigkeit.

```sh
npm install '@webview-native-ui/engine@^1.0.10'
```

Fügen Sie den Pod in `ios/App/Podfile` im App-Target außerhalb des generierten Blocks `def capacitor_pods` hinzu.

```ruby
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

Führen Sie anschließend `npx cap sync ios` aus. Passen Sie den Pfad an, wenn Ihr natives Projekt oder node_modules an einer anderen Stelle liegt.

## Initialisierung

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
