---
title: "Initialisation"
sourceRevision: "4791411830593b34ff8a0f3232e9477edaf27dd58ef558f068421c4f292f19da"
---
# Configuration

Appelez `initialize` du plugin une seule fois avant de demander des annonces. Vous n’avez pas à démarrer vous-même le SDK natif.

Les identifiants d’application natifs doivent figurer dans AndroidManifest / Info.plist ; consultez [Installation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/readme#installation).

```ts
import { AdMob } from '@capacitor-community/admob';

await AdMob.initialize();
```

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Pendant le développement, privilégiez les [blocs d’annonces de démonstration](https://developers.google.com/admob/android/test-ads#demo_ad_units) de Google. Pour tester des annonces similaires à celles de production sur un appareil physique, enregistrez celui-ci comme décrit dans [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing). Ne livrez pas `initializeForTesting: true` en production.

Les options propres à une annonce, comme `isTesting`, `npa` (annonces non personnalisées) et `immersiveMode` (masquer les barres système Android pour une annonce plein écran), se définissent sur chaque demande d’annonce, pas sur `initialize`. Consultez les guides de chaque format.

Après l’initialisation, demandez le consentement relatif à la confidentialité avant de charger des annonces. Consultez [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).
