---
title: "Initialisation"
sourceRevision: "bedb1cae3506931afd9854faa8837721aa430ce0058d061cb74f981cac6c98cf"
---
# Configuration

Après avoir recueilli le consentement et vérifié `canRequestAds`, appelez `initialize` du plugin une seule fois avant de demander des annonces. Vous n’avez pas à démarrer vous-même le SDK natif.

Les identifiants d’application natifs doivent figurer dans AndroidManifest / Info.plist ; consultez [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

## CocoaPods

Swift Package Manager résout automatiquement WebView Native UI Engine. Avec CocoaPods, enregistrez le pod local fourni par npm. Installez directement Engine 1.0.10 ou une version 1.x ultérieure compatible.

```sh
npm install '@webview-native-ui/engine@^1.0.10'
```

Dans `ios/App/Podfile`, ajoutez le pod à la cible de l’application, en dehors du bloc `def capacitor_pods` généré.

```ruby
target 'App' do
  capacitor_pods
  pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
end
```

Exécutez ensuite `npx cap sync ios`. Adaptez le chemin si votre projet natif ou votre répertoire node_modules se trouve ailleurs.

## Initialisation

```ts
import { AdMob } from '@capacitor-community/admob';

try {
  await AdMob.initialize();
} catch (error) {
  console.error('AdMob initialization failed', error);
  // Ne demandez pas d’annonces pour le moment. Réessayez lorsque la vue native de l’application est disponible.
}
```

Sur Android, l’initialisation attend aussi la vue parente de la bannière native, même si l’application utilise uniquement des annonces plein écran. Elle est rejetée si l’activité ou la vue de contenu est indisponible, ou si la vue parente n’apparaît pas dans les 5 secondes. Gérez ce rejet pour qu’un échec d’initialisation des annonces n’empêche pas le reste de l’application de démarrer. Vous pouvez réessayer dès que la vue native est disponible.

La résolution de `initialize()` ne signifie pas qu’une annonce est chargée. Utilisez la méthode de chargement et les événements de chaque format pour vérifier sa disponibilité.

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Pendant le développement, privilégiez les [blocs d’annonces de démonstration](https://developers.google.com/admob/android/test-ads#demo_ad_units) de Google. Pour tester des annonces similaires à celles de production sur un appareil physique, enregistrez celui-ci comme décrit dans [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing). Ne livrez pas `initializeForTesting: true` en production.

Les options propres à une annonce, comme `isTesting`, `npa` (annonces non personnalisées) et `immersiveMode` (masquer les barres système Android pour une annonce plein écran), se définissent sur chaque demande d’annonce, pas sur `initialize`. Consultez les guides de chaque format.

Recueillez le consentement relatif à la confidentialité avant l’initialisation et le chargement des annonces. Consultez [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).
