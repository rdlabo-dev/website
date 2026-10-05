---
title: "Consentement"
sourceRevision: "91819009cf29ac96d7cc27cc186fc9046aa7fa91ea2a9a8a4a4c58e574f572b2"
---
# Consentement

Le SDK User Messaging Platform (UMP) de Google est l’outil de confidentialité et de messagerie permettant de recueillir le consentement avant de demander des annonces. Les guides UMP de Google pour [Android](https://developers.google.com/admob/android/privacy) et [iOS](https://developers.google.com/admob/ios/privacy) expliquent ce parcours.

Ce plugin expose UMP et App Tracking Transparency d’iOS via une même API. Avant d’utiliser UMP, [créez vos messages RGPD (règlement général sur la protection des données)](https://support.google.com/admob/answer/10113207) dans AdMob. Vous pouvez également [configurer les messages Identifier for Advertisers (IDFA)](https://support.google.com/admob/answer/10115027). Lorsque les messages IDFA sont publiés, UMP les présente avec la demande App Tracking Transparency ; n’appelez pas en plus `requestTrackingAuthorization()`.

## Ordre recommandé

1. Appelez `AdMob.requestConsentInfo()` à chaque lancement de l’application.
2. Si nécessaire, appelez `AdMob.showConsentForm()`.
3. Lorsque `consentInfo.canRequestAds` vaut `true`, appelez `AdMob.initialize()` une seule fois, puis chargez les annonces. Consultez [Configuration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration).

Depuis la version 8.2.0, les formulaires de consentement peuvent être présentés avant l’initialisation du SDK sur iOS, comme sur Android.

```ts
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

let consentInfo = await AdMob.requestConsentInfo();
if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
  consentInfo = await AdMob.showConsentForm();
}

if (consentInfo.canRequestAds) {
  await AdMob.initialize();
  // Les annonces peuvent maintenant être demandées.
}
```

<!-- !::requestConsentInfo:: -->

<!-- !::AdmobConsentRequestOptions:: -->

<!-- !::AdmobConsentInfo:: -->

<!-- !::AdmobConsentStatus:: -->

<!-- !::showConsentForm:: -->

Utilisez `canRequestAds` comme critère de décision. Un formulaire de consentement peut être indisponible ou inutile selon l’utilisateur et les messages configurés.

## Autorisation de suivi sur iOS

Si vous **n’utilisez pas** les messages IDFA d’UMP, demandez vous-même App Tracking Transparency lorsque l’état est `notDetermined`. Ignorez cette section lorsque les messages Identifier for Advertisers sont configurés dans AdMob ; UMP affiche cette demande.

```ts
const tracking = await AdMob.trackingAuthorizationStatus();
if (tracking.status === 'notDetermined') {
  /**
   * Pour expliquer le suivi avant la boîte de dialogue iOS,
   * présentez votre propre interface ici, puis poursuivez.
   */
  await AdMob.requestTrackingAuthorization();
}
```

`requestTrackingAuthorization()` ne fait rien sur Android, sur le Web et sur les versions d’iOS antérieures à 14.

<!-- !::trackingAuthorizationStatus:: -->

<!-- !::TrackingAuthorizationStatusInterface:: -->

<!-- !::requestTrackingAuthorization:: -->

## Options de confidentialité

Si votre message de confidentialité exige un point d’accès dans l’application, proposez une action dans les paramètres qui appelle :

```ts
await AdMob.showPrivacyOptionsForm();
```

<!-- !::showPrivacyOptionsForm:: -->

## Réinitialiser le consentement

`resetConsentInfo()` est destiné aux tests. Ne l’utilisez pas pour effacer le choix de consentement d’un utilisateur en production.

<!-- !::resetConsentInfo:: -->

Pour la géographie de débogage et les identifiants d’appareils de test, consultez [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).
