---
title: "Migration"
sourceRevision: "0b4de25ac8e740c51af9d08ff9da0198defaaefcb9aa8f0530ce68be52520247"
---
# Guide de migration

## Changements dans la version 8.2.0

### Capacitor 8.5 ou ultérieur est requis

Mettez à jour `@capacitor/core`, `@capacitor/cli` et les packages des plateformes natives utilisés (`@capacitor/android` / `@capacitor/ios`) vers la version 8.5 ou ultérieure dans la version majeure v8, puis exécutez `npx cap sync`.

Les anciennes versions de Capacitor peuvent consommer les marges de fenêtre Android avant qu’elles n’atteignent une bannière. Mettez à jour Capacitor pour bénéficier de sa gestion actuelle des zones de sécurité. Suivez le [guide de mise à jour vers Capacitor 8.5](https://capacitorjs.com/docs/updating/8-5) pour migrer les projets natifs.

### L’initialisation Android peut être rejetée

`AdMob.initialize()` attend désormais la vue parente de la bannière native. Si elle n’apparaît pas dans les 5 secondes, l’initialisation est rejetée ; une activité ou une vue de contenu indisponible peut provoquer un échec immédiat. Cela concerne aussi les applications utilisant uniquement des annonces plein écran. Auparavant, l’absence d’une vue enfant pouvait laisser l’initialisation aboutir et provoquer un plantage lors de demandes de bannières ultérieures.

Gérez les erreurs d’initialisation sans bloquer le démarrage de l’application. Réessayez lorsque la vue native est disponible. Consultez [Configuration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) pour un exemple.

### Les revenus iOS sont désormais exprimés en micros

Le champ `valueMicros` indique désormais correctement des millionièmes d’unité monétaire pour les bannières, annonces interstitielles, récompensées, interstitielles récompensées et à l’ouverture. Par exemple, une valeur de `0.0012` unité monétaire produisait auparavant `0` ; elle produit désormais `1200`. Les valeurs Android et les noms des événements restent inchangés.

Divisez `valueMicros` par `1_000_000` pour obtenir des unités monétaires sur les deux plateformes. Réexaminez les éventuels correctifs propres à iOS dans votre pipeline d’analyse. Les anciennes valeurs iOS étaient tronquées avant la conversion : multiplier ces valeurs enregistrées ne permet donc pas de récupérer les fractions de revenus perdues.

### Consentement avant l’initialisation du SDK

Sur iOS, `showConsentForm()` et `showPrivacyOptionsForm()` peuvent désormais être appelés avant `AdMob.initialize()`, comme sur Android. Demandez les informations de consentement, présentez un formulaire si nécessaire, puis initialisez le SDK Mobile Ads et chargez les annonces uniquement lorsque `canRequestAds` vaut true. Consultez [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) pour la séquence complète. Les intégrations existantes qui initialisent d’abord le SDK restent utilisables, mais devraient adopter cet ordre.

### Les erreurs de chargement conservent les codes natifs

`prepareInterstitial()`, `prepareRewardVideoAd()` et `prepareRewardInterstitialAd()` rejettent désormais les échecs de chargement du SDK avec un `code` sous forme de chaîne et le message d’erreur natif. Les codes sont propres à chaque plateforme et ne sont pas normalisés entre Android et iOS. Les codes des événements `FailedToLoad` restent numériques ; sur iOS, ils contiennent désormais le véritable code du SDK au lieu de la valeur fixe `0`.

Mettez à jour les gestionnaires d’erreurs qui recherchent le message iOS `Loading failed` ou supposent un code d’événement égal à `0`. Utilisez les définitions d’erreurs du SDK de la plateforme pour gérer l’absence d’annonce disponible et les autres échecs.

### Événement de clic sur les annonces récompensées

`RewardAdPluginEvents.adClicked` est un nouvel écouteur facultatif pour les annonces récompensées sur Android et iOS. Sa chaîne d’événement est `onRewardedVideoAdClicked`. Les clics sont distincts des récompenses obtenues : continuez à attribuer les récompenses uniquement à partir de l’événement `Rewarded` ou du résultat de l’affichage, une seule fois. Consultez [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded).

### Compatibilité de compilation avec AGP 9

La bibliothèque Android référence désormais `proguard-android-optimize.txt`, ce qui évite le rejet de l’ancien fichier par défaut par AGP 9. Ce changement n’active pas la minification de la bibliothèque et ne met pas à jour l’AGP de votre projet. Les autres étapes de migration vers AGP 9 restent nécessaires pour l’application hôte.

Les étapes par version de la section « Changements incompatibles des versions précédentes » s’appliquent aux versions antérieures à v8.

## Versions du SDK Google Mobile Ads

Cette version majeure conserve des API du SDK Google Mobile Ads obsolètes mais encore prises en charge. Leur remplacement peut modifier les dimensions des bannières et le traitement des restrictions d’âge ; ce travail attend donc la prochaine version majeure.

Le [SDK Next-Gen pour Android](https://developers.google.com/admob/android/next-gen) de Google attend également la prochaine version majeure : il modifie l’initialisation du SDK, les demandes d’annonces et la médiation.

Versions fixées : Android 25.4.x, iOS 13.11.0 (Swift Package Manager et CocoaPods). La prise en charge de CocoaPods devrait être supprimée dans la prochaine version majeure.

Android reste sur la version 25.4.x, car le [SDK 25.5.0 augmente le niveau d’API Android minimal](https://developers.google.com/admob/android/rel-notes). La mise à jour iOS de la version 13.6.0 à la version 13.11.0 conserve les exigences actuelles du plugin en matière de plateforme et de chaîne d’outils ; aucune modification de l’API publique du plugin n’est nécessaire.

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
