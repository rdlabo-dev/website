---
title: "Migration"
sourceRevision: "927523735104b3d935a575b947b0907905b4ec4ae086eae2218fb1009a730434"
---
# Migrationsanleitung

Wenn Sie `@capacitor-community/admob` v8 installiert haben, benötigen Sie die folgenden Schritte für einzelne Versionen nicht. Sie dokumentieren öffentliche API-Änderungen älterer Veröffentlichungen.

## Versionen des Google Mobile Ads SDK

Diese Hauptversion behält veraltete, aber weiterhin unterstützte APIs des Google Mobile Ads SDK bei. Ihr Ersatz kann Bannergrößen und die Behandlung von Altersbeschränkungen verändern. Diese Arbeit ist deshalb für die nächste Hauptversion vorgesehen.

Googles [Next-Gen SDK für Android](https://developers.google.com/admob/android/next-gen) ist ebenfalls für die nächste Hauptversion vorgesehen: Es verändert SDK-Initialisierung, Anzeigenanfragen und Mediation.

Festgelegte Versionen: Android 25.4.x, iOS 13.6.0 für Swift Package Manager und CocoaPods. Die Entfernung der CocoaPods-Unterstützung ist für die nächste Hauptversion geplant.

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
