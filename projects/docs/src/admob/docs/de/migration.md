---
title: "Migration"
sourceRevision: "0b4de25ac8e740c51af9d08ff9da0198defaaefcb9aa8f0530ce68be52520247"
---
# Migrationsleitfaden

## Änderungen in 8.2.0

### Capacitor ab Version 8.5 ist erforderlich

Aktualisieren Sie `@capacitor/core`, `@capacitor/cli` und die verwendeten nativen Plattformpakete (`@capacitor/android` / `@capacitor/ios`) auf mindestens 8.5 innerhalb von v8 und führen Sie anschließend `npx cap sync` aus.

Ältere Capacitor-Versionen können die Android-Fensterabstände (Window Insets) bereits verarbeiten, ohne sie an das Banner weiterzureichen. Aktualisieren Sie Capacitor, um die aktuelle Behandlung der sicheren Bereiche zu verwenden. Folgen Sie für die Migration der nativen Projekte dem [Leitfaden zum Update auf Capacitor 8.5](https://capacitorjs.com/docs/updating/8-5).

### Die Android-Initialisierung kann abgelehnt werden

`AdMob.initialize()` wartet nun auf die übergeordnete Ansicht des nativen Banners. Erscheint sie nicht innerhalb von 5 Sekunden, wird die Initialisierung abgelehnt. Eine nicht verfügbare Activity oder Inhaltsansicht kann sofort zum Fehlschlag führen. Das gilt auch für Apps, die nur Vollbildanzeigen verwenden. Zuvor konnte eine fehlende untergeordnete Ansicht die Initialisierung erfolgreich abschließen lassen und spätere Banneranfragen zum Absturz bringen.

Behandeln Sie Initialisierungsfehler, ohne den App-Start zu blockieren. Versuchen Sie es erneut, sobald die native Ansicht verfügbar ist. Ein Beispiel finden Sie unter [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration).

### iOS-Einnahmen werden nun in Mikroeinheiten angegeben

Das Feld `valueMicros` meldet nun für Banner, Interstitial-, belohnte, belohnte Interstitial- und App-Open-Anzeigen korrekt Millionstel einer Währungseinheit. Beispielsweise ergab ein Wert von `0.0012` Währungseinheiten zuvor `0`, jetzt ergibt er `1200`. Android-Werte und Ereignisnamen bleiben unverändert.

Teilen Sie `valueMicros` auf beiden Plattformen durch `1_000_000`, um Währungseinheiten zu erhalten. Überprüfen Sie iOS-spezifische Korrekturen in Ihrer Analysepipeline. Frühere iOS-Werte wurden vor der Umrechnung abgeschnitten. Durch Multiplikation dieser gespeicherten Werte lassen sich die verlorenen Nachkommabeträge daher nicht wiederherstellen.

### Einwilligung vor der SDK-Initialisierung

Unter iOS können `showConsentForm()` und `showPrivacyOptionsForm()` nun wie unter Android vor `AdMob.initialize()` aufgerufen werden. Fordern Sie Einwilligungsinformationen an und zeigen Sie bei Bedarf ein Formular an. Initialisieren Sie anschließend das Mobile Ads SDK und laden Sie Anzeigen nur dann, wenn `canRequestAds` true ist. Die vollständige Reihenfolge finden Sie unter [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Bestehende Integrationen mit vorheriger Initialisierung bleiben aufrufbar, sollten aber diese Reihenfolge übernehmen.

### Anzeigenladefehler behalten native Codes bei

`prepareInterstitial()`, `prepareRewardVideoAd()` und `prepareRewardInterstitialAd()` lehnen SDK-Ladefehler nun mit einem `code` als Zeichenkette und der nativen Fehlermeldung ab. Die Codes sind plattformspezifisch und werden zwischen Android und iOS nicht vereinheitlicht. Die Codes von `FailedToLoad`-Ereignissen bleiben Zahlen; unter iOS enthalten sie nun den tatsächlichen SDK-Code statt des festen Werts `0`.

Aktualisieren Sie Fehlerbehandlungen, die nach der iOS-Meldung `Loading failed` suchen oder einen Ereigniscode von `0` voraussetzen. Verwenden Sie die SDK-Fehlerdefinitionen der jeweiligen Plattform, wenn Sie fehlende Anzeigenverfügbarkeit und andere Fehler behandeln.

### Klickereignis für belohnte Anzeigen

`RewardAdPluginEvents.adClicked` ist ein neuer optionaler Listener für belohnte Anzeigen unter Android und iOS. Seine Ereigniszeichenkette lautet `onRewardedVideoAdClicked`. Klicks sind von verdienten Belohnungen getrennt. Gewähren Sie Belohnungen weiterhin nur einmal, anhand des `Rewarded`-Ereignisses oder des Anzeigeergebnisses. Siehe [Belohnte Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded).

### Build-Kompatibilität mit AGP 9

Die Android-Bibliothek verweist nun auf `proguard-android-optimize.txt` und vermeidet damit die Ablehnung der älteren Standarddatei durch AGP 9. Dadurch wird weder die Minifizierung der Bibliothek aktiviert noch die AGP-Version Ihres Projekts aktualisiert. Die übrigen Migrationsschritte für AGP 9 gelten weiterhin für die Host-App.

Die versionsweisen Schritte unter „Inkompatible Änderungen früherer Versionen“ gelten für Releases vor v8.

## Versionen des Google Mobile Ads SDK

Diese Hauptversion behält veraltete, aber weiterhin unterstützte APIs des Google Mobile Ads SDK bei. Ihr Ersatz kann Bannergrößen und die Behandlung von Altersbeschränkungen verändern. Diese Arbeit ist deshalb für die nächste Hauptversion vorgesehen.

Googles [Next-Gen SDK für Android](https://developers.google.com/admob/android/next-gen) ist ebenfalls für die nächste Hauptversion vorgesehen: Es verändert SDK-Initialisierung, Anzeigenanfragen und Mediation.

Festgelegte Versionen: Android 25.4.x, iOS 13.11.0 für Swift Package Manager und CocoaPods. Die Entfernung der CocoaPods-Unterstützung ist für die nächste Hauptversion geplant.

Android bleibt bei 25.4.x, da [SDK 25.5.0 das erforderliche Android-API-Mindestlevel erhöht](https://developers.google.com/admob/android/rel-notes). Das iOS-Update von 13.6.0 auf 13.11.0 behält die bisherigen Plattform- und Toolchain-Anforderungen des Plugins bei; Änderungen an der öffentlichen Plugin-API sind nicht erforderlich.

## Inkompatible Änderungen früherer Versionen

### 1.1.0

- Auf iOS ab 14 vorbereiten
- Entfernen Sie in der Datei `ios/App/App/AppDelegate.swift` Folgendes:

```diff
- import GoogleMobileAds

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
-     // Überschreibungspunkt für Anpassungen nach dem Start der Anwendung.
-     GADMobileAds.sharedInstance().start(completionHandler: nil)
```

### 0.2.13

- isTest: 'LIVE' | 'TESTING' => boolean

### 0.2.12

**app.component.ts**

```ts
import { Plugins } from '@capacitor/core';

const { AdMob } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    // AdMob für Ihre Anwendung initialisieren
    +AdMob.initialize('[APP_ID]');
    -AdMob.initialize();
  }
}
```

**admob.component.ts**

```ts
    import { Plugins } from '@capacitor/core';
    import { AdOptions, AdSize, AdPosition } from '@rdlabo/capacitor-admob';

    const { AdMob } = Plugins;

    @Component({
      selector: 'admob',
      templateUrl: 'admob.component.html',
      styleUrls: ['admob.component.scss']
    })
    export class AdMobComponent {

        const options: AdOptions = {
            adId: 'YOUR ADID',
            adSize: AdSize.BANNER,
            position: AdPosition.BOTTOM_CENTER,
-           margin: '0',
+           margin: 0,
        }

        constructor(){
            // Banneranzeige anzeigen
            AdMob.showBanner(this.options)
            .then(
                (value) => {
                    console.log(value);  // true
                },
                (error) => {
                    console.error(error); // Fehler anzeigen
                }
            );

            // Listener für Bannerereignisse registrieren
            AdMob.addListener('onAdLoaded', (info: boolean) => {
                 console.log("Banner Ad Loaded");
            });

+           // Bannergröße abrufen
+           AdMob.addListener('onAdSize', (info: boolean) => {
+                console.log(info);
+           });
        }
    }
```
