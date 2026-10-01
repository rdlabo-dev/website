---
title: "Migration"
sourceRevision: "927523735104b3d935a575b947b0907905b4ec4ae086eae2218fb1009a730434"
---
# Guide de migration

Si vous avez installé `@capacitor-community/admob` v8, vous n’avez pas besoin des étapes par version ci-dessous. Elles consignent les changements de l’API publique des anciennes versions.

## Versions du SDK Google Mobile Ads

Cette version majeure conserve des API du SDK Google Mobile Ads obsolètes mais encore prises en charge. Leur remplacement peut modifier les dimensions des bannières et le traitement des restrictions d’âge ; ce travail attend donc la prochaine version majeure.

Le [SDK Next-Gen pour Android](https://developers.google.com/admob/android/next-gen) de Google attend également la prochaine version majeure : il modifie l’initialisation du SDK, les demandes d’annonces et la médiation.

Versions fixées : Android 25.4.x, iOS 13.6.0 (Swift Package Manager et CocoaPods). La prise en charge de CocoaPods devrait être supprimée dans la prochaine version majeure.

## Changements incompatibles des versions précédentes

### 1.1.0

- Préparer iOS 14+
- Dans le fichier `ios/App/App/AppDelegate.swift`, supprimez ceci :

```diff
- import GoogleMobileAds

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
-     // Point de personnalisation après le lancement de l’application.
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
    // Initialiser AdMob pour votre application
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
            // Afficher la bannière publicitaire
            AdMob.showBanner(this.options)
            .then(
                (value) => {
                    console.log(value);  // true
                },
                (error) => {
                    console.error(error); // afficher l’erreur
                }
            );

            // S’abonner aux événements de la bannière
            AdMob.addListener('onAdLoaded', (info: boolean) => {
                 console.log("Banner Ad Loaded");
            });

+           // Obtenir les dimensions de la bannière
+           AdMob.addListener('onAdSize', (info: boolean) => {
+                console.log(info);
+           });
        }
    }
```
