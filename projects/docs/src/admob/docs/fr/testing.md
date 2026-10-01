---
title: "Tests"
sourceRevision: "4495cc97707240f27621532df1f0125a4ac0c7320eaa3ca625be5ba1f2141892"
---
# Tests

Utilisez des annonces de test pendant le développement pour pouvoir cliquer sur les annonces sans facturer les annonceurs ni risquer de signaler du trafic incorrect sur le compte. Les guides Google sur les annonces de test pour [Android](https://developers.google.com/admob/android/test-ads) et [iOS](https://developers.google.com/admob/ios/test-ads) expliquent les blocs de démonstration et les appareils de test.

Ce plugin peut demander ces blocs de démonstration ou enregistrer un appareil via `initialize`.

## Blocs d’annonces de démonstration

Google fournit des [blocs d’annonces de démonstration](https://developers.google.com/admob/android/test-ads#demo_ad_units) qui renvoient toujours des annonces de test. Privilégiez-les pendant le développement. Ce plugin prend en charge uniquement iOS et Android natifs — utilisez l’identifiant correspondant à la plateforme.

Blocs de démonstration de bannières utilisés par ce plugin et sa démonstration :

| Plateforme | `adId` de la bannière |
| --- | --- |
| Android | `ca-app-pub-3940256099942544/6300978111` |
| iOS | `ca-app-pub-3940256099942544/2934735716` |

Les identifiants de démonstration des autres formats figurent dans les guides Google sur les annonces de test cités ci-dessus. Vous pouvez aussi définir `isTesting: true` sur les demandes de bannières, d’interstitielles, d’annonces récompensées et d’interstitielles récompensées. Les annonces à l’ouverture n’ont pas d’option `isTesting` ; passez un bloc de démonstration dans `adId`.

## Appareils de test

Pour demander des annonces similaires à celles de production sur un appareil physique sans générer de trafic incorrect, enregistrez l’appareil avec `AdMob.initialize()` :

```ts
await AdMob.initialize({
  testingDevices: ['YOUR_TEST_DEVICE_ID'],
  initializeForTesting: true,
});
```

<!-- !::initialize:: -->

<!-- !::AdMobInitializationOptions:: -->

Trouvez l’identifiant de l’appareil dans les journaux natifs après la première demande d’annonce :

- Android : Logcat, généralement avec le tag `Ads` (`Use RequestConfiguration.Builder.setTestDeviceIds(...)`).
- iOS : console Xcode (`To get test ads on this device, set:`).

Consultez le guide Google [Activer les appareils de test](https://developers.google.com/admob/android/test-ads#enable_test_devices).

## Géographie de débogage du consentement

Sur un appareil réel, définissez `debugGeography` et ajoutez son identifiant dans `testDeviceIdentifiers`. `EEA` fait fonctionner le formulaire comme si l’appareil se trouvait dans l’Espace économique européen, afin de tester les messages RGPD. Utilisez cette option uniquement sur les appareils de test enregistrés.

```ts
import { AdMob, AdmobConsentDebugGeography } from '@capacitor-community/admob';

const consentInfo = await AdMob.requestConsentInfo({
  debugGeography: AdmobConsentDebugGeography.EEA,
  testDeviceIdentifiers: ['YOUR_TEST_DEVICE_ID'],
});
```

<!-- !::requestConsentInfo:: -->

<!-- !::AdmobConsentRequestOptions:: -->

<!-- !::AdmobConsentDebugGeography:: -->

Si vous refusez le consentement dans le formulaire de test (Manage → Confirm Choices), les annonces peuvent ne pas se charger. Ce comportement est attendu en environnement de test et ne préjuge pas du comportement en production après le consentement d’un utilisateur.

`resetConsentInfo()` est réservé aux tests. Consultez [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent).

## Vérification côté serveur

Les callbacks de vérification côté serveur (SSV) sont déclenchés uniquement pour les annonces de production. Les annonces de test n’appellent pas votre endpoint SSV. Pour un exemple de demande simulée, consultez [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded).
