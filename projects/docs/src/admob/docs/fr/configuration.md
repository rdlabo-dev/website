---
title: "Initialisation"
sourceRevision: "9c72bafeff538bac37cb3c866cceb076853ab461250b028fde68b3f9762b29ab"
---
# Configuration

Après avoir recueilli le consentement et vérifié `canRequestAds`, appelez `initialize` du plugin une seule fois avant de demander des annonces. Vous n’avez pas à démarrer vous-même le SDK natif.

Les identifiants d’application natifs doivent figurer dans AndroidManifest / Info.plist ; consultez [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

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
