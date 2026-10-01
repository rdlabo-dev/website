---
title: "Premiers pas"
sourceRevision: "7541f9b1da764596f8c0a84f59b28ea228a5adf43f0d9da208f8579298c09265"
---
<!-- rdlabo-docs-omit -->
<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">AdMob</h3>
<p align="center"><strong><code>@capacitor-community/admob</code></strong></p>
<p align="center">
  Plugin de la communauté Capacitor pour AdMob natif.
</p>

<p align="center">
  <strong><a href="https://docs.rdlabo.dev/projects/capacitor-admob">Consulter la documentation complète</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2026?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/l/@capacitor-community/admob?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/dw/@capacitor-community/admob?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/v/@capacitor-community/admob?style=flat-square" /></a>
</p>

## Mainteneurs

| Mainteneur          | GitHub                                           | Réseaux sociaux                                          | Site Web                                         |
| ------------------- | ------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------- |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo)              | [@rdlabo](https://twitter.com/rdlabo)           | [rdlabo.dev](https://rdlabo.dev/)               |
| Saninn Salas Diaz   | [Saninn Salas Diaz](https://github.com/distante) | [@SaninnSalas](https://twitter.com/SaninnSalas) | —                                               |

État de maintenance : maintenu activement

## Contributeurs ✨

<a href="https://github.com/capacitor-community/admob/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/admob" />
</a>

Créé avec [contributors-img](https://contrib.rocks).

## Démonstration

[Code de la démonstration.](https://github.com/capacitor-community/admob/tree/v8.1.0/demo)

### Captures d’écran

|             |                Bannière                |                Interstitielle                |                Récompense                |              À l’ouverture de l’application               |
| :---------- | :----------------------------------: | :----------------------------------------: | :----------------------------------: | :---------------------------------: |
| **iOS**     | ![](demo/screenshots/ios_banner.png) | ![](demo/screenshots/ios_interstitial.png) | ![](demo/screenshots/ios_reward.png) | ![](demo/screenshots/ios_open.png)  |
| **Android** | ![](demo/screenshots/md_banner.png)  | ![](demo/screenshots/md_interstitial.png)  | ![](demo/screenshots/md_reward.png)  | ![](demo/screenshots/md_open.png)   |

<!-- /rdlabo-docs-omit -->

## Vue d’ensemble

Plugin de la communauté Capacitor pour AdMob natif. Il encapsule le SDK Google Mobile Ads pour iOS et Android afin d’afficher des bannières, des annonces interstitielles, récompensées, interstitielles récompensées et à l’ouverture dans les applications Capacitor. Il prend également en charge le consentement Google User Messaging Platform (UMP) et les utilitaires App Tracking Transparency sur iOS.

## Installation

Ce plugin inclut déjà le SDK Google Mobile Ads. Installez le package, puis ajoutez votre identifiant d’**application** AdMob dans AndroidManifest / Info.plist. Les guides de démarrage Google pour [Android](https://developers.google.com/admob/android/quick-start) et [iOS](https://developers.google.com/admob/ios/quick-start) expliquent les identifiants d’application et les identifiants SKAdNetwork (identifiants de conversion publicitaire d’Apple) ; n’ajoutez pas une seconde dépendance Mobile Ads.

Ce plugin vise `@capacitor-community/admob` **v8** et Capacitor 8. Il prend en charge iOS 15 ou une version ultérieure et Android API 24 ou une version ultérieure.

```bash
npm install @capacitor-community/admob
npx cap sync
```

Si vous utilisez encore Capacitor 7, installez `@capacitor-community/admob@7`.

### Versions du SDK Google Mobile Ads

Cette version majeure fixe le SDK Google Mobile Ads à **25.4.x** sur Android et **13.6.0** sur iOS (Swift Package Manager et CocoaPods). Conservez ces versions sauf besoin particulier. Le [SDK Next-Gen pour Android](https://developers.google.com/admob/android/next-gen) de Google attendra la prochaine version majeure du plugin. Consultez [Migration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/migration) pour connaître la politique de fixation des versions.

### Configuration Android

Dans `android/app/src/main/AndroidManifest.xml`, ajoutez ceci sous `<application>` :

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="@string/admob_app_id" />
```

Dans `android/app/src/main/res/values/strings.xml` :

```xml
<string name="admob_app_id">[APP_ID]</string>
```

Remplacez `[APP_ID]` par votre identifiant d’**application** AdMob, pas par un identifiant de bloc d’annonces.

#### Variables

Vous pouvez laisser ces valeurs non définies. Redéfinissez-les dans le fichier `variables.gradle` de votre application uniquement si vous avez besoin d’une version particulière d’un artefact :

| Variable                       | Artefact                                         | Valeur par défaut  |
| ------------------------------ | ------------------------------------------------ | -------- |
| `playServicesAdsVersion`       | `com.google.android.gms:play-services-ads`       | `25.4.+` |
| `userMessagingPlatformVersion` | `com.google.android.ump:user-messaging-platform` | `4.0.0`  |
| `androidxCoreKTXVersion`       | `androidx.core:core-ktx`                         | `1.15.0` |

### Configuration iOS

Ajoutez ce qui suit dans le `<dict>` le plus externe de `ios/App/App/Info.plist` :

```xml
<key>GADIsAdManagerApp</key>
<true/>
<key>GADApplicationIdentifier</key>
<string>[APP_ID]</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
<key>NSUserTrackingUsageDescription</key>
<string>This identifier will be used to deliver personalized ads to you.</string>
```

Remplacez `[APP_ID]` par votre identifiant d’application AdMob et décrivez votre utilisation réelle du suivi dans `NSUserTrackingUsageDescription`.

L’extrait `SKAdNetworkItems` inclut l’identifiant de Google. Ajoutez les autres identifiants du [guide de configuration iOS](https://developers.google.com/admob/ios/quick-start#update_your_infoplist) de Google.

### Dépannage

Si CocoaPods ne parvient pas à résoudre `Google-Mobile-Ads-SDK` :

```text
[error] Error running update: Analyzing dependencies
[!] CocoaPods could not find compatible versions for pod "Google-Mobile-Ads-SDK":
```

Exécutez `pod repo update` dans `ios/`, puis de nouveau `npx cap sync ios`.

## Première bannière de test

Après l’installation et la configuration des plateformes, initialisez le SDK, demandez le consentement et affichez une bannière de démonstration Google. Utilisez les identifiants de bannière propres aux plateformes présentés dans [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) — ne créez pas votre propre bloc d’annonces pour cette première vérification.

Appelez `startAdMob` depuis une action utilisateur ou après que l’interface est prête (par exemple un bouton ou un hook après navigation), pas uniquement lors de l’évaluation du module.

```ts
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const bannerAdId =
  Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111';

async function startAdMob() {
  await AdMob.initialize();

  let consentInfo = await AdMob.requestConsentInfo();
  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
    consentInfo = await AdMob.showConsentForm();
  }

  if (!consentInfo.canRequestAds) {
    // Consentement non prêt — aucune bannière n’est affichée.
    return;
  }

  const options: BannerAdOptions = {
    adId: bannerAdId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  };
  await AdMob.showBanner(options);
}
```

Résultat attendu : lorsque `canRequestAds` vaut true, une bannière de test Google apparaît en bas de l’écran natif. Lorsque `canRequestAds` vaut false, la fonction se termine sans afficher de bannière. Celle-ci se place au-dessus de la WebView et peut masquer du HTML — consultez [Bannières](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner) pour réserver l’espace dans votre disposition. Détails : [Configuration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration), [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) et [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

## Choisir selon l’objectif publicitaire

| Objectif                                                              | Format d’annonce                 | Guide                                      |
| ----------------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| Garder une annonce visible à côté du contenu de l’application                          | Bannière                    | [Bannières](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner)             |
| Afficher une annonce plein écran à une interruption naturelle, sans attribuer de récompense | Interstitielle              | [Annonces interstitielles](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial) |
| Proposer une expérience spécifiquement récompensée                             | Récompensée                  | [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)         |
| Proposer une récompense lors d’une transition naturelle                            | Interstitielle récompensée     | [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)         |
| Monétiser l’ouverture de l’application                                   | À l’ouverture de l’application                  | [Annonces à l’ouverture](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open)         |

## Documentation

Commencez par [Installation](/docs/readme#installation) ci-dessus, puis [Configuration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) et [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Exécutez la première bannière de test, puis utilisez [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) pour les blocs de démonstration et les appareils. Choisissez un format d’annonce dans le tableau ci-dessus. Ces guides figurent aussi sur le [site de documentation](https://docs.rdlabo.dev/projects/capacitor-admob) (en anglais et en japonais). Si vous consultez ce README sur npm, utilisez ce site pour les guides — les fichiers `docs/` se trouvent dans le dépôt GitHub. Les signatures des méthodes figurent dans la section API ci-dessous.

- [Configuration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) — `AdMob.initialize` et options du SDK.
- [Consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) — consentement relatif à la confidentialité et autorisation de suivi iOS.
- [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) — blocs d’annonces de démonstration, appareils de test et tests de consentement.
- [Bannières](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner) — options, cycle de vie et événements des bannières.
- Annonces plein écran :
  - [Annonces interstitielles](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial) — chargement, affichage et préparation de plusieurs annonces.
  - [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded) — vidéo récompensée, interstitielle récompensée et vérification côté serveur.
- [Annonces à l’ouverture](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open) — chargement et présentation lors du passage au premier plan.
- [Événements publicitaires](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events) — événements de cycle de vie communs, erreurs et données de revenus.
- [Guide de migration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/migration) — historique des changements lors d’une mise à niveau depuis une ancienne version du plugin.

<!-- rdlabo-docs-omit -->
## Sommaire

<docgen-index>

* [`initialize(...)`](/docs/readme#initialize)
* [`trackingAuthorizationStatus()`](/docs/readme#trackingauthorizationstatus)
* [`requestTrackingAuthorization()`](/docs/readme#requesttrackingauthorization)
* [`setApplicationMuted(...)`](/docs/readme#setapplicationmuted)
* [`setApplicationVolume(...)`](/docs/readme#setapplicationvolume)
* [`loadAppOpen(...)`](/docs/readme#loadappopen)
* [`showAppOpen(...)`](/docs/readme#showappopen)
* [`isAppOpenLoaded(...)`](/docs/readme#isappopenloaded)
* [`addListener(AppOpenAdPluginEvents.Loaded, ...)`](/docs/readme#addlistenerappopenadplugineventsloaded-)
* [`addListener(AppOpenAdPluginEvents.FailedToLoad, ...)`](/docs/readme#addlistenerappopenadplugineventsfailedtoload-)
* [`addListener(AppOpenAdPluginEvents.Opened, ...)`](/docs/readme#addlistenerappopenadplugineventsopened-)
* [`addListener(AppOpenAdPluginEvents.Closed, ...)`](/docs/readme#addlistenerappopenadplugineventsclosed-)
* [`addListener(AppOpenAdPluginEvents.FailedToShow, ...)`](/docs/readme#addlistenerappopenadplugineventsfailedtoshow-)
* [`addListener(AppOpenAdPluginEvents.AdImpression, ...)`](/docs/readme#addlistenerappopenadplugineventsadimpression-)
* [`showBanner(...)`](/docs/readme#showbanner)
* [`hideBanner()`](/docs/readme#hidebanner)
* [`resumeBanner()`](/docs/readme#resumebanner)
* [`removeBanner()`](/docs/readme#removebanner)
* [`addListener(BannerAdPluginEvents.SizeChanged, ...)`](/docs/readme#addlistenerbanneradplugineventssizechanged-)
* [`addListener(BannerAdPluginEvents.Loaded, ...)`](/docs/readme#addlistenerbanneradplugineventsloaded-)
* [`addListener(BannerAdPluginEvents.FailedToLoad, ...)`](/docs/readme#addlistenerbanneradplugineventsfailedtoload-)
* [`addListener(BannerAdPluginEvents.Opened, ...)`](/docs/readme#addlistenerbanneradplugineventsopened-)
* [`addListener(BannerAdPluginEvents.Closed, ...)`](/docs/readme#addlistenerbanneradplugineventsclosed-)
* [`addListener(BannerAdPluginEvents.AdImpression, ...)`](/docs/readme#addlistenerbanneradplugineventsadimpression-)
* [`addListener(BannerAdPluginEvents.AdPaid, ...)`](/docs/readme#addlistenerbanneradplugineventsadpaid-)
* [`requestConsentInfo(...)`](/docs/readme#requestconsentinfo)
* [`showPrivacyOptionsForm()`](/docs/readme#showprivacyoptionsform)
* [`showConsentForm()`](/docs/readme#showconsentform)
* [`resetConsentInfo()`](/docs/readme#resetconsentinfo)
* [`prepareInterstitial(...)`](/docs/readme#prepareinterstitial)
* [`showInterstitial(...)`](/docs/readme#showinterstitial)
* [`addListener(InterstitialAdPluginEvents.FailedToLoad, ...)`](/docs/readme#addlistenerinterstitialadplugineventsfailedtoload-)
* [`addListener(InterstitialAdPluginEvents.Loaded, ...)`](/docs/readme#addlistenerinterstitialadplugineventsloaded-)
* [`addListener(InterstitialAdPluginEvents.Dismissed, ...)`](/docs/readme#addlistenerinterstitialadplugineventsdismissed-)
* [`addListener(InterstitialAdPluginEvents.FailedToShow, ...)`](/docs/readme#addlistenerinterstitialadplugineventsfailedtoshow-)
* [`addListener(InterstitialAdPluginEvents.Showed, ...)`](/docs/readme#addlistenerinterstitialadplugineventsshowed-)
* [`addListener(InterstitialAdPluginEvents.AdImpression, ...)`](/docs/readme#addlistenerinterstitialadplugineventsadimpression-)
* [`prepareRewardVideoAd(...)`](/docs/readme#preparerewardvideoad)
* [`showRewardVideoAd(...)`](/docs/readme#showrewardvideoad)
* [`addListener(RewardAdPluginEvents.FailedToLoad, ...)`](/docs/readme#addlistenerrewardadplugineventsfailedtoload-)
* [`addListener(RewardAdPluginEvents.Loaded, ...)`](/docs/readme#addlistenerrewardadplugineventsloaded-)
* [`addListener(RewardAdPluginEvents.Rewarded, ...)`](/docs/readme#addlistenerrewardadplugineventsrewarded-)
* [`addListener(RewardAdPluginEvents.Dismissed, ...)`](/docs/readme#addlistenerrewardadplugineventsdismissed-)
* [`addListener(RewardAdPluginEvents.FailedToShow, ...)`](/docs/readme#addlistenerrewardadplugineventsfailedtoshow-)
* [`addListener(RewardAdPluginEvents.Showed, ...)`](/docs/readme#addlistenerrewardadplugineventsshowed-)
* [`addListener(RewardAdPluginEvents.AdImpression, ...)`](/docs/readme#addlistenerrewardadplugineventsadimpression-)
* [`prepareRewardInterstitialAd(...)`](/docs/readme#preparerewardinterstitialad)
* [`showRewardInterstitialAd(...)`](/docs/readme#showrewardinterstitialad)
* [`addListener(RewardInterstitialAdPluginEvents.FailedToLoad, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsfailedtoload-)
* [`addListener(RewardInterstitialAdPluginEvents.Loaded, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsloaded-)
* [`addListener(RewardInterstitialAdPluginEvents.Rewarded, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsrewarded-)
* [`addListener(RewardInterstitialAdPluginEvents.Dismissed, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsdismissed-)
* [`addListener(RewardInterstitialAdPluginEvents.FailedToShow, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsfailedtoshow-)
* [`addListener(RewardInterstitialAdPluginEvents.Showed, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsshowed-)
* [`addListener(RewardInterstitialAdPluginEvents.AdImpression, ...)`](/docs/readme#addlistenerrewardinterstitialadplugineventsadimpression-)
* [Interfaces](/docs/readme#interfaces)
* [Alias de types](/docs/readme#type-aliases)
* [Énumérations](/docs/readme#enums)

</docgen-index>

## API

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options?: AdMobInitializationOptions | undefined) => Promise<void>
```

Initialise le SDK Google Mobile Ads.

| Paramètre         | Type                                                                              | Description                           |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| **`options`** | <code><a href="#admobinitializationoptions">AdMobInitializationOptions</a></code> | Paramètres facultatifs d’initialisation du SDK. |

**Depuis :** 1.1.2

--------------------


### trackingAuthorizationStatus()

```typescript
trackingAuthorizationStatus() => Promise<TrackingAuthorizationStatusInterface>
```

Renvoie l’état actuel d’autorisation App Tracking Transparency sur iOS 14 et versions ultérieures.
Renvoie `authorized` sur les versions antérieures d’iOS, Android et le Web.

**Renvoie :** <code>Promise&lt;<a href="#trackingauthorizationstatusinterface">TrackingAuthorizationStatusInterface</a>&gt;</code>

**Depuis :** 3.1.0

--------------------


### requestTrackingAuthorization()

```typescript
requestTrackingAuthorization() => Promise<void>
```

Demande l’autorisation App Tracking Transparency sur iOS 14 et versions ultérieures.
Se résout sans action sur les versions antérieures d’iOS, Android et le Web.

**Depuis :** 5.2.0

--------------------


### setApplicationMuted(...)

```typescript
setApplicationMuted(options: ApplicationMutedOptions) => Promise<void>
```

Indique au SDK Google Mobile Ads si le son de l’application est coupé.

| Paramètre         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#applicationmutedoptions">ApplicationMutedOptions</a></code> |

**Depuis :** 4.1.1

--------------------


### setApplicationVolume(...)

```typescript
setApplicationVolume(options: ApplicationVolumeOptions) => Promise<void>
```

Transmet le volume audio de l’application au SDK Google Mobile Ads.

| Paramètre         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#applicationvolumeoptions">ApplicationVolumeOptions</a></code> |

**Depuis :** 4.1.1

--------------------


### loadAppOpen(...)

```typescript
loadAppOpen(options: AppOpenAdOptions) => Promise<AdLoadInfo>
```

Charge une annonce à l’ouverture de l’application et renvoie l’identifiant du bloc d’annonces chargé.

| Paramètre         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#appopenadoptions">AppOpenAdOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

--------------------


### showAppOpen(...)

```typescript
showAppOpen(options?: AdShowOptions | undefined) => Promise<void>
```

Affiche une annonce à l’ouverture de l’application déjà chargée.

| Paramètre         | Type                                                    | Description                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Facultatif. Passez { adId } pour afficher une annonce préparée précise plutôt que la plus récente. |

--------------------


### isAppOpenLoaded(...)

```typescript
isAppOpenLoaded(options?: AdShowOptions | undefined) => Promise<{ value: boolean; }>
```

Vérifie si une annonce à l’ouverture de l’application est chargée.

| Paramètre         | Type                                                    | Description                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Facultatif. Passez un adId pour vérifier une annonce préparée précise plutôt que la plus récente. |

**Renvoie :** <code>Promise&lt;{ value: boolean; }&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de chargement des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>           |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs de chargement des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Opened, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’ouverture des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Closed, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Closed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de fermeture des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Closed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs d’affichage des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de revenus par impression des annonces à l’ouverture de l’application.

| Paramètre              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>     |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### showBanner(...)

```typescript
showBanner(options: BannerAdOptions) => Promise<void>
```

Affiche une bannière publicitaire.

| Paramètre         | Type                                                        | Description                        |
| ------------- | ----------------------------------------------------------- | ---------------------------------- |
| **`options`** | <code><a href="#banneradoptions">BannerAdOptions</a></code> | <a href="#adoptions">AdOptions</a> |

**Depuis :** 1.1.2

--------------------


### hideBanner()

```typescript
hideBanner() => Promise<void>
```

Masque la bannière actuelle sans la détruire.

**Depuis :** 1.1.2

--------------------


### resumeBanner()

```typescript
resumeBanner() => Promise<void>
```

Affiche une bannière précédemment masquée.

**Depuis :** 1.1.2

--------------------


### removeBanner()

```typescript
removeBanner() => Promise<void>
```

Détruit la bannière actuelle et la retire de l’écran.

**Depuis :** 1.1.2

--------------------


### addListener(BannerAdPluginEvents.SizeChanged, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.SizeChanged, listenerFunc: (info: AdMobBannerSize) => void) => Promise<PluginListenerHandle>
```

Écoute les changements de dimensions de la bannière affichée.

| Paramètre              | Type                                                                              | Description         |
| ------------------ | --------------------------------------------------------------------------------- | ------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.SizeChanged</a></code> | bannerAdSizeChanged |
| **`listenerFunc`** | <code>(info: <a href="#admobbannersize">AdMobBannerSize</a>) =&gt; void</code>    |                     |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de chargement des bannières publicitaires.

| Paramètre              | Type                                                                         | Description    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Loaded</a></code> | bannerAdLoaded |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.FailedToLoad, listenerFunc: (info: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs de chargement des bannières publicitaires.

| Paramètre              | Type                                                                               | Description          |
| ------------------ | ---------------------------------------------------------------------------------- | -------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.FailedToLoad</a></code> | bannerAdFailedToLoad |
| **`listenerFunc`** | <code>(info: <a href="#admoberror">AdMobError</a>) =&gt; void</code>               |                      |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Opened, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’ouverture de l’overlay des bannières.

| Paramètre              | Type                                                                         | Description    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Opened</a></code> | bannerAdOpened |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Closed, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Closed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de fermeture de l’overlay des bannières.

| Paramètre              | Type                                                                         | Description    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Closed</a></code> | bannerAdClosed |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.AdImpression, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’impression des bannières.

| Paramètre              | Type                                                                               | Description  |
| ------------------ | ---------------------------------------------------------------------------------- | ------------ |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.AdImpression</a></code> | AdImpression |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                         |              |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.AdPaid, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.AdPaid, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de revenus par impression des bannières.

| Paramètre              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.AdPaid</a></code>     |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### requestConsentInfo(...)

```typescript
requestConsentInfo(options?: AdmobConsentRequestOptions | undefined) => Promise<AdmobConsentInfo>
```

Demande les informations de consentement de l’utilisateur

| Paramètre         | Type                                                                              | Description           |
| ------------- | --------------------------------------------------------------------------------- | --------------------- |
| **`options`** | <code><a href="#admobconsentrequestoptions">AdmobConsentRequestOptions</a></code> | ConsentRequestOptions |

**Renvoie :** <code>Promise&lt;<a href="#admobconsentinfo">AdmobConsentInfo</a>&gt;</code>

**Depuis :** 5.0.0

--------------------


### showPrivacyOptionsForm()

```typescript
showPrivacyOptionsForm() => Promise<void>
```

Affiche un formulaire Google d’options de confidentialité, généré à partir de la configuration de votre message RGPD.

**Depuis :** 7.0.3

--------------------


### showConsentForm()

```typescript
showConsentForm() => Promise<AdmobConsentInfo>
```

Affiche un formulaire Google de consentement utilisateur, généré à partir de la configuration de votre message RGPD.

**Renvoie :** <code>Promise&lt;<a href="#admobconsentinfo">AdmobConsentInfo</a>&gt;</code>

**Depuis :** 5.0.0

--------------------


### resetConsentInfo()

```typescript
resetConsentInfo() => Promise<void>
```

Réinitialise l’état du SDK UMP. Appelez à nouveau la fonction requestConsentInfo pour permettre à l’utilisateur de modifier son consentement.

**Depuis :** 5.0.0

--------------------


### prepareInterstitial(...)

```typescript
prepareInterstitial(options: AdOptions) => Promise<AdLoadInfo>
```

Charge une annonce interstitielle et renvoie l’identifiant du bloc d’annonces chargé.

| Paramètre         | Type                                            | Description                        |
| ------------- | ----------------------------------------------- | ---------------------------------- |
| **`options`** | <code><a href="#adoptions">AdOptions</a></code> | <a href="#adoptions">AdOptions</a> |

**Renvoie :** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Depuis :** 1.1.2

--------------------


### showInterstitial(...)

```typescript
showInterstitial(options?: AdShowOptions | undefined) => Promise<void>
```

Affiche une annonce interstitielle déjà chargée.

| Paramètre         | Type                                                    | Description                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Facultatif. Passez { adId } pour afficher une annonce préparée précise plutôt que la plus récente. |

**Depuis :** 1.1.2

--------------------


### addListener(InterstitialAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs de chargement des annonces interstitielles.

| Paramètre              | Type                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                          |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de chargement des annonces interstitielles.

| Paramètre              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>                     |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de fermeture des annonces interstitielles.

| Paramètre              | Type                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                  |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs d’affichage des annonces interstitielles.

| Paramètre              | Type                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                          |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’affichage des annonces interstitielles.

| Paramètre              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de revenus par impression des annonces interstitielles.

| Paramètre              | Type                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>               |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### prepareRewardVideoAd(...)

```typescript
prepareRewardVideoAd(options: RewardAdOptions) => Promise<AdLoadInfo>
```

Charge une annonce récompensée et renvoie l’identifiant du bloc d’annonces chargé.

| Paramètre         | Type                                                        | Description                                    |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| **`options`** | <code><a href="#rewardadoptions">RewardAdOptions</a></code> | <a href="#rewardadoptions">RewardAdOptions</a> |

**Renvoie :** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Depuis :** 1.1.2

--------------------


### showRewardVideoAd(...)

```typescript
showRewardVideoAd(options?: AdShowOptions | undefined) => Promise<AdMobRewardItem>
```

Affiche une annonce récompensée chargée et se résout lorsque l’utilisateur obtient la récompense.

| Paramètre         | Type                                                    | Description                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Facultatif. Passez { adId } pour afficher une annonce préparée précise plutôt que la plus récente. |

**Renvoie :** <code>Promise&lt;<a href="#admobrewarditem">AdMobRewardItem</a>&gt;</code>

**Depuis :** 1.1.2

--------------------


### addListener(RewardAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs de chargement des annonces récompensées.

| Paramètre              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>              |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de chargement des annonces récompensées.

| Paramètre              | Type                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>         |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Rewarded, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Rewarded, listenerFunc: (reward: AdMobRewardItem) => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’attribution d’une récompense.

| Paramètre              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Rewarded</a></code>   |
| **`listenerFunc`** | <code>(reward: <a href="#admobrewarditem">AdMobRewardItem</a>) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de fermeture des annonces récompensées.

| Paramètre              | Type                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                      |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs d’affichage des annonces récompensées.

| Paramètre              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>              |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’affichage des annonces récompensées.

| Paramètre              | Type                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de revenus par impression des annonces récompensées.

| Paramètre              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>   |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### prepareRewardInterstitialAd(...)

```typescript
prepareRewardInterstitialAd(options: RewardInterstitialAdOptions) => Promise<AdLoadInfo>
```

Charge une annonce interstitielle récompensée et renvoie l’identifiant du bloc d’annonces chargé.

| Paramètre         | Type                                                                                | Description                                                            |
| ------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **`options`** | <code><a href="#rewardinterstitialadoptions">RewardInterstitialAdOptions</a></code> | <a href="#rewardinterstitialadoptions">RewardInterstitialAdOptions</a> |

**Renvoie :** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Depuis :** 1.1.2

--------------------


### showRewardInterstitialAd(...)

```typescript
showRewardInterstitialAd(options?: AdShowOptions | undefined) => Promise<AdMobRewardInterstitialItem>
```

Affiche une annonce interstitielle récompensée chargée et se résout lorsque l’utilisateur obtient la récompense.

| Paramètre         | Type                                                    | Description                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Facultatif. Passez { adId } pour afficher une annonce préparée précise plutôt que la plus récente. |

**Renvoie :** <code>Promise&lt;<a href="#admobrewardinterstitialitem">AdMobRewardInterstitialItem</a>&gt;</code>

**Depuis :** 1.1.2

--------------------


### addListener(RewardInterstitialAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs de chargement des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                                      |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de chargement des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>                                 |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Rewarded, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Rewarded, listenerFunc: (reward: AdMobRewardInterstitialItem) => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’attribution d’une récompense.

| Paramètre              | Type                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Rewarded</a></code>   |
| **`listenerFunc`** | <code>(reward: <a href="#admobrewardinterstitialitem">AdMobRewardInterstitialItem</a>) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements de fermeture des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                              |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Écoute les échecs d’affichage des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                                      |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Écoute les événements d’affichage des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                           |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Écoute les événements de revenus par impression des annonces interstitielles récompensées.

| Paramètre              | Type                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>                           |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### AdMobInitializationOptions

| Propriété                               | Type                                                              | Description                                                                                                                                                                                                                                     | Valeur par défaut            | Depuis |
| ---------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`testingDevices`**               | <code>string[]</code>                                             | Identifiants des appareils à enregistrer comme appareils de test lorsque {@link <a href="#admobinitializationoptions">AdMobInitializationOptions.initializeForTesting</a>} vaut `true`. Les requêtes provenant des appareils enregistrés reçoivent des annonces de test et ne génèrent pas de trafic incorrect. |                    | 1.2.0 |
| **`initializeForTesting`**         | <code>boolean</code>                                              | Indique si {@link <a href="#admobinitializationoptions">AdMobInitializationOptions.testingDevices</a>} doit être enregistré comme appareils de test.                                                                                                                | <code>false</code> | 1.2.0 |
| **`tagForChildDirectedTreatment`** | <code>boolean</code>                                              | Pour l’application de la loi américaine Children’s Online Privacy Protection Act (COPPA), un paramètre nommé tagForChildDirectedTreatment est disponible.                                                                                                                   |                    | 3.1.0 |
| **`tagForUnderAgeOfConsent`**      | <code>boolean</code>                                              | Lorsque cette fonction est utilisée, un paramètre Tag For Users under the Age of Consent in Europe (TFUA), destiné aux utilisateurs n’ayant pas atteint l’âge du consentement en Europe, est inclus dans toutes les demandes d’annonces suivantes.                                                                                                        |                    | 3.1.0 |
| **`maxAdContentRating`**           | <code><a href="#maxadcontentrating">MaxAdContentRating</a></code> | Classification maximale du contenu publicitaire appliquée à toutes les demandes d’annonces. Les annonces de classification supérieure sont exclues.                                                                                                                                                |                    | 3.1.0 |


#### TrackingAuthorizationStatusInterface

État actuel de l’autorisation App Tracking Transparency sur iOS.

| Propriété         | Type                                                                     | Description                                                     |
| ------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **`status`** | <code>'authorized' \| 'denied' \| 'notDetermined' \| 'restricted'</code> | État d’autorisation signalé par App Tracking Transparency. |


#### ApplicationMutedOptions

| Propriété        | Type                 | Description                                                                                                                                                                                                                                                                                           | Depuis |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`muted`** | <code>boolean</code> | Informe le SDK que le son de l’application est coupé. Remarque : les annonces vidéo qui ne peuvent pas être affichées sans son ne sont pas renvoyées pour les demandes d’annonces lorsque le volume de l’application est signalé comme coupé ou réglé sur 0. Cela peut limiter la diffusion d’une partie du catalogue d’annonces vidéo. | 4.1.1 |


#### ApplicationVolumeOptions

| Propriété         | Type                                                                               | Description                                                                                                                                                                                                                                               | Depuis |
| ------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`volume`** | <code>0 \| 1 \| 0.1 \| 0.2 \| 0.3 \| 0.4 \| 0.5 \| 0.6 \| 0.7 \| 0.8 \| 0.9</code> | Si votre application possède ses propres réglages de volume, par exemple pour la musique ou les effets sonores, transmettre son volume au SDK Google Mobile Ads permet aux annonces vidéo de respecter ces réglages. Utilisez une valeur prise en charge comprise entre 0.0 (silencieux) et 1.0 (volume maximal). | 4.1.1 |


#### AdLoadInfo

Informations renvoyées après le chargement réussi d’une annonce.

| Propriété           | Type                | Description                      |
| -------------- | ------------------- | -------------------------------- |
| **`adUnitId`** | <code>string</code> | Identifiant du bloc de l’annonce chargée. |


#### AppOpenAdOptions

Options de chargement d’une annonce à l’ouverture de l’application.

| Propriété       | Type                | Description                      |
| ---------- | ------------------- | -------------------------------- |
| **`adId`** | <code>string</code> | Identifiant du bloc d’annonces à l’ouverture de l’application à charger. |


#### AdShowOptions

Options de sélection d’une annonce déjà chargée à afficher ou à examiner.

| Propriété       | Type                | Description                                                                                                            | Depuis |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----- |
| **`adId`** | <code>string</code> | Identifiant du bloc d’une annonce précédemment préparée à cibler. S’il est omis, l’opération cible l’annonce préparée le plus récemment. | 8.0.1 |


#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### AdMobError

Erreur renvoyée par le SDK Google Mobile Ads.

| Propriété          | Type                | Description                            |
| ------------- | ------------------- | -------------------------------------- |
| **`code`**    | <code>number</code> | Obtient le code de l’erreur.                 |
| **`message`** | <code>string</code> | Obtient le message décrivant l’erreur. |


#### AdMobRevenueData

Données de revenus publicitaires par impression émises par un événement de paiement.

| Propriété               | Type                                                          | Description                                                                                       |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **`adUnitId`**     | <code>string</code>                                           | Identifiant du bloc d’annonces associé à l’événement de paiement.                                                    |
| **`valueMicros`**  | <code>number</code>                                           | Valeur de l’annonce en micros ; 1 000 000 de micros équivaut à une unité de devise.                          |
| **`currencyCode`** | <code>string</code>                                           | Code de devise ISO 4217 pour `valueMicros`.                                                     |
| **`precision`**    | <code><a href="#advalueprecision">AdValuePrecision</a></code> | Précision de la valeur publicitaire signalée.                                                           |
| **`networkName`**  | <code>string</code>                                           | Nom de la classe de l’adaptateur de médiation qui a servi l’impression, ou chaîne vide s’il est indisponible. |
| **`impressionId`** | <code>string</code>                                           | Identifiant de réponse associé à l’impression, ou chaîne vide s’il est indisponible.      |


#### BannerAdOptions

Options d’affichage d’une bannière publicitaire.

Cette interface étend <a href="#adoptions">AdOptions</a>.

| Propriété                | Type                                                          | Description                                                                                                                                                             | Valeur par défaut                      | Depuis |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----- |
| **`adSize`**        | <code><a href="#banneradsize">BannerAdSize</a></code>         | Taille de la bannière à afficher.                                                                                                                                             | <code>ADAPTIVE_BANNER</code> | 3.0.0 |
| **`position`**      | <code><a href="#banneradposition">BannerAdPosition</a></code> | Position d’affichage de la bannière.                                                                                                                             | <code>TOP_CENTER</code>      | 1.1.2 |
| **`adId`**          | <code>string</code>                                           | Identifiant du bloc d’annonces à charger.                                                                                                                                                 |                              | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                          | Indique si une annonce de test doit être demandée.                                                                                                                                           | <code>false</code>           | 1.1.2 |
| **`margin`**        | <code>number</code>                                           | Marge de la bannière en unités logiques d’affichage : dp sur Android et points sur iOS. Pour `BOTTOM_CENTER`, il s’agit de la marge inférieure. Pour `TOP_CENTER`, il s’agit de la marge supérieure. | <code>0</code>               | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                          | Indique si des annonces non personnalisées doivent être demandées.                                                                                                                                | <code>false</code>           | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                          | Indique si une annonce plein écran doit être affichée en mode immersif sur Android.                                                                                                       |                              | 7.0.3 |


#### AdMobBannerSize

Dimensions de la bannière affichée en unités logiques d’affichage : dp sur Android et points sur iOS.
Une bannière masquée, supprimée ou en échec peut signaler `0` pour les deux dimensions.

| Propriété         | Type                | Description                  |
| ------------ | ------------------- | ---------------------------- |
| **`width`**  | <code>number</code> | Largeur de la bannière affichée.  |
| **`height`** | <code>number</code> | Hauteur de la bannière affichée. |


#### AdmobConsentInfo

| Propriété                                  | Type                                                                                        | Description                                           | Depuis |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| **`status`**                          | <code><a href="#admobconsentstatus">AdmobConsentStatus</a></code>                           | État du consentement de l’utilisateur.                       | 5.0.0 |
| **`isConsentFormAvailable`**          | <code>boolean</code>                                                                        | Si la valeur est `true`, un formulaire de consentement est disponible ; sinon, aucun formulaire n’est disponible. | 5.0.0 |
| **`canRequestAds`**                   | <code>boolean</code>                                                                        | Si la valeur est `true`, une annonce peut être affichée.                         | 7.0.3 |
| **`privacyOptionsRequirementStatus`** | <code><a href="#privacyoptionsrequirementstatus">PrivacyOptionsRequirementStatus</a></code> | État indiquant si les options de confidentialité sont requises pour l’utilisateur.       | 7.0.3 |


#### AdmobConsentRequestOptions

| Propriété                          | Type                                                                              | Description                                                                                                  | Valeur par défaut            | Depuis |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ | ----- |
| **`debugGeography`**          | <code><a href="#admobconsentdebuggeography">AdmobConsentDebugGeography</a></code> | Définit la simulation géographique de débogage pour tester le consentement en local.                                                        |                    | 5.0.0 |
| **`testDeviceIdentifiers`**   | <code>string[]</code>                                                             | Tableau des identifiants d’appareils de test à autoriser. Remarque : sur iOS, l’identifiant peut changer si vous désinstallez puis réinstallez l’application. |                    | 5.0.0 |
| **`tagForUnderAgeOfConsent`** | <code>boolean</code>                                                              | Définissez la valeur sur `true` pour offrir à l’utilisateur la possibilité d’accepter l’affichage d’annonces personnalisées.                     | <code>false</code> | 5.0.0 |


#### AdOptions

Options communes de demande d’annonce.

| Propriété                | Type                 | Description                                                                                                                                                             | Valeur par défaut            | Depuis |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`adId`**          | <code>string</code>  | Identifiant du bloc d’annonces à charger.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code> | Indique si une annonce de test doit être demandée.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>  | Marge de la bannière en unités logiques d’affichage : dp sur Android et points sur iOS. Pour `BOTTOM_CENTER`, il s’agit de la marge inférieure. Pour `TOP_CENTER`, il s’agit de la marge supérieure. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code> | Indique si des annonces non personnalisées doivent être demandées.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code> | Indique si une annonce plein écran doit être affichée en mode immersif sur Android.                                                                                                       |                    | 7.0.3 |


#### RewardAdOptions

Options de chargement d’une annonce récompensée.

| Propriété                | Type                                                                                                                                                                                                     | Description                                                                                                                                                             | Valeur par défaut            | Depuis |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`ssv`**           | <code><a href="#atleastone">AtLeastOne</a>&lt;{ /** * A user identifier passed to the SSV callback. */ userId: string; /** * Custom data passed to the SSV callback. */ customData: string; }&gt;</code> | Options de vérification côté serveur pour l’annonce récompensée. Fournissez au moins l’un des paramètres `userId` ou `customData`.                                                                 |                    |       |
| **`adId`**          | <code>string</code>                                                                                                                                                                                      | Identifiant du bloc d’annonces à charger.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                                                                                                                                                                     | Indique si une annonce de test doit être demandée.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>                                                                                                                                                                                      | Marge de la bannière en unités logiques d’affichage : dp sur Android et points sur iOS. Pour `BOTTOM_CENTER`, il s’agit de la marge inférieure. Pour `TOP_CENTER`, il s’agit de la marge supérieure. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                                                                                                                                                                     | Indique si des annonces non personnalisées doivent être demandées.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                                                                                                                                                                     | Indique si une annonce plein écran doit être affichée en mode immersif sur Android.                                                                                                       |                    | 7.0.3 |


#### AdMobRewardItem

Récompense obtenue par l’utilisateur après avoir regardé une annonce récompensée.

| Propriété         | Type                | Description                                      |
| ------------ | ------------------- | ------------------------------------------------ |
| **`type`**   | <code>string</code> | Type de récompense configuré pour le bloc d’annonces. |
| **`amount`** | <code>number</code> | Montant de la récompense obtenue par l’utilisateur.            |


#### RewardInterstitialAdOptions

Options de chargement d’une annonce interstitielle récompensée.

| Propriété                | Type                                                                                                                                                                                                     | Description                                                                                                                                                             | Valeur par défaut            | Depuis |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`ssv`**           | <code><a href="#atleastone">AtLeastOne</a>&lt;{ /** * A user identifier passed to the SSV callback. */ userId: string; /** * Custom data passed to the SSV callback. */ customData: string; }&gt;</code> | Options de vérification côté serveur pour l’annonce interstitielle récompensée. Fournissez au moins l’un des paramètres `userId` ou `customData`.                                                    |                    |       |
| **`adId`**          | <code>string</code>                                                                                                                                                                                      | Identifiant du bloc d’annonces à charger.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                                                                                                                                                                     | Indique si une annonce de test doit être demandée.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>                                                                                                                                                                                      | Marge de la bannière en unités logiques d’affichage : dp sur Android et points sur iOS. Pour `BOTTOM_CENTER`, il s’agit de la marge inférieure. Pour `TOP_CENTER`, il s’agit de la marge supérieure. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                                                                                                                                                                     | Indique si des annonces non personnalisées doivent être demandées.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                                                                                                                                                                     | Indique si une annonce plein écran doit être affichée en mode immersif sur Android.                                                                                                       |                    | 7.0.3 |


#### AdMobRewardInterstitialItem

Récompense obtenue par l’utilisateur après avoir regardé une annonce interstitielle récompensée.

| Propriété         | Type                | Description                                      |
| ------------ | ------------------- | ------------------------------------------------ |
| **`type`**   | <code>string</code> | Type de récompense configuré pour le bloc d’annonces. |
| **`amount`** | <code>number</code> | Montant de la récompense obtenue par l’utilisateur.            |


### Alias de types


#### AtLeastOne

<code>{[K in keyof T]: <a href="#pick">Pick</a>&lt;T, K&gt;}[keyof T]</code>


#### Pick

À partir de T, sélectionne un ensemble de propriétés dont les clés figurent dans l’union K

<code>{
 [P in K]: T[P];
 }</code>


### Énumérations


#### MaxAdContentRating

| Membres                | Valeur                           | Description                                                 |
| ---------------------- | ------------------------------- | ----------------------------------------------------------- |
| **`General`**          | <code>'General'</code>          | Contenu adapté à tous les publics, y compris les familles. |
| **`ParentalGuidance`** | <code>'ParentalGuidance'</code> | Contenu adapté à la plupart des publics sous la supervision des parents. |
| **`Teen`**             | <code>'Teen'</code>             | Contenu adapté aux adolescents et aux adultes.              |
| **`MatureAudience`**   | <code>'MatureAudience'</code>   | Contenu réservé aux adultes.                 |


#### AppOpenAdPluginEvents

| Membres            | Valeur                                | Description                                                           |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------- |
| **`Loaded`**       | <code>'appOpenAdLoaded'</code>       | Émis lorsqu’une annonce à l’ouverture de l’application est chargée.                                 |
| **`FailedToLoad`** | <code>'appOpenAdFailedToLoad'</code> | Émis lorsque le chargement d’une annonce à l’ouverture de l’application échoue.                              |
| **`Opened`**       | <code>'appOpenAdOpened'</code>       | Émis lorsqu’une annonce à l’ouverture de l’application est affichée.                                   |
| **`Closed`**       | <code>'appOpenAdClosed'</code>       | Émis lorsqu’une annonce à l’ouverture de l’application est fermée.                               |
| **`FailedToShow`** | <code>'appOpenAdFailedToShow'</code> | Émis lorsque l’affichage d’une annonce à l’ouverture de l’application déjà chargée échoue.                        |
| **`AdImpression`** | <code>'appOpenAdImpression'</code>   | Émet les données de revenus publicitaires par impression lorsqu’un événement de paiement est enregistré. |


#### AdValuePrecision

| Membres                 | Valeur          | Description                                         |
| ----------------------- | -------------- | --------------------------------------------------- |
| **`Unknown`**           | <code>0</code> | La précision de la valeur de l’annonce est inconnue.                  |
| **`Estimated`**         | <code>1</code> | La valeur de l’annonce est estimée à partir de données agrégées.     |
| **`PublisherProvided`** | <code>2</code> | La valeur de l’annonce a été fournie par l’éditeur.         |
| **`Precise`**           | <code>3</code> | La valeur de l’annonce est le montant exact payé pour cette annonce. |


#### BannerAdSize

| Membres                | Valeur                           | Description                                                                                                              |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`BANNER`**           | <code>'BANNER'</code>           | Format de bannière de la Mobile Marketing Association (MMA) : 320x50 pixels indépendants de la densité.                                   |
| **`FULL_BANNER`**      | <code>'FULL_BANNER'</code>      | Format de bannière complète de l’Interactive Advertising Bureau (IAB) : 468x60 pixels indépendants de la densité.                            |
| **`LARGE_BANNER`**     | <code>'LARGE_BANNER'</code>     | Format de grande bannière : 320x100 pixels indépendants de la densité.                                                               |
| **`MEDIUM_RECTANGLE`** | <code>'MEDIUM_RECTANGLE'</code> | Format de rectangle moyen de l’Interactive Advertising Bureau (IAB) : 300x250 pixels indépendants de la densité.                      |
| **`LEADERBOARD`**      | <code>'LEADERBOARD'</code>      | Format de grande bannière leaderboard de l’Interactive Advertising Bureau (IAB) : 728x90 pixels indépendants de la densité.                            |
| **`ADAPTIVE_BANNER`**  | <code>'ADAPTIVE_BANNER'</code>  | Bannière à taille dynamique, sur toute la largeur et à hauteur automatique.                                                           |
| **`SMART_BANNER`**     | <code>'SMART_BANNER'</code>     | Ancienne bannière intelligente adaptée à la largeur de l’écran. Conservée pour compatibilité ; utilisez `ADAPTIVE_BANNER` pour les nouvelles intégrations. |


#### BannerAdPosition

| Membres             | Valeur                        | Description                                              |
| ------------------- | ---------------------------- | -------------------------------------------------------- |
| **`TOP_CENTER`**    | <code>'TOP_CENTER'</code>    | Positionne la bannière en haut, au centre de l’écran.    |
| **`CENTER`**        | <code>'CENTER'</code>        | Positionne la bannière au centre de l’écran.        |
| **`BOTTOM_CENTER`** | <code>'BOTTOM_CENTER'</code> | Positionne la bannière en bas, au centre de l’écran. |


#### BannerAdPluginEvents

| Membres            | Valeur                               | Description                                                           |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------- |
| **`SizeChanged`**  | <code>"bannerAdSizeChanged"</code>  | Émis lorsque la taille de la bannière affichée change.                         |
| **`Loaded`**       | <code>"bannerAdLoaded"</code>       | Émis lorsqu’une bannière publicitaire est chargée.                                    |
| **`FailedToLoad`** | <code>"bannerAdFailedToLoad"</code> | Émis lorsque le chargement d’une bannière publicitaire échoue.                                 |
| **`Opened`**       | <code>"bannerAdOpened"</code>       | Émis lorsqu’une bannière ouvre un overlay après un appui de l’utilisateur.          |
| **`Closed`**       | <code>"bannerAdClosed"</code>       | Émis lorsque l’overlay de la bannière est fermé.                              |
| **`AdImpression`** | <code>"bannerAdImpression"</code>   | Émis lorsqu’une impression est enregistrée pour la bannière publicitaire.               |
| **`AdPaid`**       | <code>"bannerAdPaid"</code>         | Émet les données de revenus publicitaires par impression lorsqu’un événement de paiement est enregistré. |


#### AdmobConsentStatus

| Membres            | Valeur                       | Description                                                                           |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| **`NOT_REQUIRED`** | <code>'NOT_REQUIRED'</code> | Consentement utilisateur non requis.                                                            |
| **`OBTAINED`**     | <code>'OBTAINED'</code>     | Consentement utilisateur déjà obtenu.                                                        |
| **`REQUIRED`**     | <code>'REQUIRED'</code>     | Consentement utilisateur requis, mais pas encore obtenu.                                           |
| **`UNKNOWN`**      | <code>'UNKNOWN'</code>      | État du consentement inconnu ; AdsConsent.requestInfoUpdate doit être appelé pour l’actualiser. |


#### PrivacyOptionsRequirementStatus

| Membres            | Valeur                       | Description                                    |
| ------------------ | --------------------------- | ---------------------------------------------- |
| **`NOT_REQUIRED`** | <code>'NOT_REQUIRED'</code> | Un point d’accès aux options de confidentialité n’est pas requis.   |
| **`REQUIRED`**     | <code>'REQUIRED'</code>     | Un point d’accès aux options de confidentialité est requis.       |
| **`UNKNOWN`**      | <code>'UNKNOWN'</code>      | La nécessité d’un point d’accès aux options de confidentialité est inconnue. |


#### AdmobConsentDebugGeography

| Membres        | Valeur          | Description                                                   |
| -------------- | -------------- | ------------------------------------------------------------- |
| **`DISABLED`** | <code>0</code> | Simulation géographique de débogage désactivée.                                     |
| **`EEA`**      | <code>1</code> | Simule une localisation dans l’EEE pour les appareils de débogage.                |
| **`NOT_EEA`**  | <code>2</code> | Simule une localisation hors de l’EEE pour les appareils de débogage.            |
| **`US`**       | <code>3</code> | Simule une localisation dans un État américain réglementé pour les appareils de débogage. |
| **`OTHER`**    | <code>4</code> | Simule la zone géographique OTHER pour les appareils de débogage.           |


#### InterstitialAdPluginEvents

| Membres            | Valeur                                     | Description                                                           |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------- |
| **`Loaded`**       | <code>'interstitialAdLoaded'</code>       | Émis lorsqu’une annonce interstitielle est chargée et prête à être affichée.        |
| **`FailedToLoad`** | <code>'interstitialAdFailedToLoad'</code> | Émis lorsque le chargement d’une annonce interstitielle échoue.                          |
| **`Showed`**       | <code>'interstitialAdShowed'</code>       | Émis lorsqu’une annonce interstitielle est affichée.                               |
| **`FailedToShow`** | <code>'interstitialAdFailedToShow'</code> | Émis lorsque l’affichage d’une annonce interstitielle déjà chargée échoue.                    |
| **`Dismissed`**    | <code>'interstitialAdDismissed'</code>    | Émis lorsqu’une annonce interstitielle est fermée.                           |
| **`AdImpression`** | <code>'interstitialAdImpression'</code>   | Émet les données de revenus publicitaires par impression lorsqu’un événement de paiement est enregistré. |


#### RewardAdPluginEvents

| Membres            | Valeur                                        | Description                                                                                                                                                        |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`Loaded`**       | <code>'onRewardedVideoAdLoaded'</code>       | Émis lorsqu’une annonce récompensée est chargée et prête à être affichée.                                                                                                          |
| **`FailedToLoad`** | <code>'onRewardedVideoAdFailedToLoad'</code> | Émis lorsque le chargement d’une annonce récompensée échoue.                                                                                                                            |
| **`Showed`**       | <code>'onRewardedVideoAdShowed'</code>       | Émis lorsqu’une annonce récompensée est affichée.                                                                                                                                 |
| **`FailedToShow`** | <code>'onRewardedVideoAdFailedToShow'</code> | Émis lorsque l’affichage d’une annonce récompensée déjà chargée échoue.                                                                                                                     |
| **`Dismissed`**    | <code>'onRewardedVideoAdDismissed'</code>    | Émis lorsqu’une annonce récompensée est fermée. Cet événement n’indique pas si l’utilisateur a obtenu une récompense. Écoutez séparément `Rewarded` avant d’attribuer la récompense. |
| **`Rewarded`**     | <code>'onRewardedVideoAdReward'</code>       | Émis lorsque l’utilisateur obtient la récompense annoncée.                                                                                                                   |
| **`AdImpression`** | <code>'onRewardedVideoAdImpression'</code>   | Émet les données de revenus publicitaires par impression lorsqu’un événement de paiement est enregistré.                                                                                              |


#### RewardInterstitialAdPluginEvents

| Membres            | Valeur                                               | Description                                                                                                                                                                     |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Loaded`**       | <code>'onRewardedInterstitialAdLoaded'</code>       | Émis lorsqu’une annonce interstitielle récompensée est chargée et prête à être affichée.                                                                                                          |
| **`FailedToLoad`** | <code>'onRewardedInterstitialAdFailedToLoad'</code> | Émis lorsque le chargement d’une annonce interstitielle récompensée échoue.                                                                                                                            |
| **`Showed`**       | <code>'onRewardedInterstitialAdShowed'</code>       | Émis lorsqu’une annonce interstitielle récompensée est affichée.                                                                                                                                 |
| **`FailedToShow`** | <code>'onRewardedInterstitialAdFailedToShow'</code> | Émis lorsque l’affichage d’une annonce interstitielle récompensée déjà chargée échoue.                                                                                                                     |
| **`Dismissed`**    | <code>'onRewardedInterstitialAdDismissed'</code>    | Émis lorsqu’une annonce interstitielle récompensée est fermée. Cet événement n’indique pas si l’utilisateur a obtenu une récompense. Écoutez séparément `Rewarded` avant d’attribuer la récompense. |
| **`Rewarded`**     | <code>'onRewardedInterstitialAdReward'</code>       | Émis lorsque l’utilisateur obtient la récompense annoncée.                                                                                                                                |
| **`AdImpression`** | <code>'onRewardedInterstitialAdImpression'</code>   | Émet les données de revenus publicitaires par impression lorsqu’un événement de paiement est enregistré.                                                                                                           |

</docgen-api>

## Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Validation` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

La demande autorise uniquement le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Chaque nouveau commit exige une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

## Licence

Capacitor AdMob est [distribué sous licence MIT](./LICENSE).
<!-- /rdlabo-docs-omit -->
