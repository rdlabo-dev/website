---
title: "Erste Schritte"
sourceRevision: "7614c0933935b836308b2d44fe98ca199e8736296d9f4ccf0d4eeb2dd21515b6"
---
<!-- rdlabo-docs-omit -->
<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">AdMob</h3>
<p align="center"><strong><code>@capacitor-community/admob</code></strong></p>
<p align="center">
  Capacitor-Community-Plugin für natives AdMob.
</p>

<p align="center">
  <strong><a href="https://docs.rdlabo.dev/projects/capacitor-admob">Read the full documentation</a></strong>
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2026?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/l/@capacitor-community/admob?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/dw/@capacitor-community/admob?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/admob"><img src="https://img.shields.io/npm/v/@capacitor-community/admob?style=flat-square" /></a>
</p>

## Maintainer

| Maintainer          | GitHub                                           | Soziale Netzwerke                                          | Website                                         |
| ------------------- | ------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------- |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo)              | [@rdlabo](https://twitter.com/rdlabo)           | [rdlabo.dev](https://rdlabo.dev/)               |
| Saninn Salas Diaz   | [Saninn Salas Diaz](https://github.com/distante) | [@SaninnSalas](https://twitter.com/SaninnSalas) | —                                               |

Wartungsstatus: Wird aktiv gepflegt

## Mitwirkende ✨

<a href="https://github.com/capacitor-community/admob/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/admob" />
</a>

Erstellt mit [contributors-img](https://contrib.rocks).

## Demo

[Den Demo-Quellcode finden Sie hier.](https://github.com/capacitor-community/admob/tree/v8.2.0/demo)

### Screenshots

|             |                Banner                |                Interstitial                |                Belohnung                |              App Open               |
| :---------- | :----------------------------------: | :----------------------------------------: | :----------------------------------: | :---------------------------------: |
| **iOS**     | ![](demo/screenshots/ios_banner.png) | ![](demo/screenshots/ios_interstitial.png) | ![](demo/screenshots/ios_reward.png) | ![](demo/screenshots/ios_open.png)  |
| **Android** | ![](demo/screenshots/md_banner.png)  | ![](demo/screenshots/md_interstitial.png)  | ![](demo/screenshots/md_reward.png)  | ![](demo/screenshots/md_open.png)   |

<!-- /rdlabo-docs-omit -->

## Überblick

Capacitor-Community-Plugin für natives AdMob. Dieses Plugin kapselt das Google Mobile Ads SDK für iOS und Android, sodass Sie Banner-, Interstitial-, belohnte, belohnte Interstitial- und App-Open-Anzeigen in Capacitor-Anwendungen darstellen können. Es deckt außerdem die Einwilligung über Google User Messaging Platform (UMP) und Hilfsfunktionen für App Tracking Transparency unter iOS ab.

## Installation

Dieses Plugin enthält das Google Mobile Ads SDK bereits. Installieren Sie das Paket und ergänzen Sie anschließend Ihre AdMob-**Anwendungs**-ID in AndroidManifest / Info.plist. Die Google-Einstiegsanleitungen für [Android](https://developers.google.com/admob/android/quick-start) und [iOS](https://developers.google.com/admob/ios/quick-start) erklären Anwendungs-IDs und SKAdNetwork-Bezeichner, also Apples Kennungen zur Anzeigenkonversion. Fügen Sie keine zweite Mobile-Ads-Abhängigkeit hinzu.

Dieses Plugin richtet sich an `@capacitor-community/admob` **v8.2.0** und Capacitor ab 8.5 innerhalb von v8. Es unterstützt iOS ab Version 15 und Android ab API 24.

```bash
npm install @capacitor-community/admob
npx cap sync
```

Wenn Sie weiterhin Capacitor 7 verwenden, installieren Sie `@capacitor-community/admob@7`.

### Versionen des Google Mobile Ads SDK

Diese Hauptversion legt Google Mobile Ads SDK **25.4.x** unter Android und **13.6.0** unter iOS fest, sowohl für Swift Package Manager als auch für CocoaPods. Behalten Sie diese Versionen bei, sofern kein konkreter Bedarf besteht. Googles [Next-Gen SDK für Android](https://developers.google.com/admob/android/next-gen) ist für die nächste Plugin-Hauptversion vorgesehen. Die Gründe für diese Versionsbindung beschreibt [Migration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/migration).

### Android-Konfiguration

Ergänzen Sie in `android/app/src/main/AndroidManifest.xml` unter `<application>` Folgendes:

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="@string/admob_app_id" />
```

In `android/app/src/main/res/values/strings.xml`:

```xml
<string name="admob_app_id">[APP_ID]</string>
```

Ersetzen Sie `[APP_ID]` durch Ihre AdMob-**Anwendungs**-ID, nicht durch eine Anzeigenblock-ID.

#### Variablen

Sie können diese Werte weglassen. Überschreiben Sie sie in der `variables.gradle` Ihrer Anwendung nur, wenn Sie eine bestimmte Artefaktversion benötigen:

| Variable                       | Artefakt                                         | Standard  |
| ------------------------------ | ------------------------------------------------ | -------- |
| `playServicesAdsVersion`       | `com.google.android.gms:play-services-ads`       | `25.4.+` |
| `userMessagingPlatformVersion` | `com.google.android.ump:user-messaging-platform` | `4.0.0`  |
| `androidxCoreKTXVersion`       | `androidx.core:core-ktx`                         | `1.15.0` |

### iOS-Konfiguration

Ergänzen Sie innerhalb des äußersten `<dict>` in `ios/App/App/Info.plist` Folgendes:

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

Ersetzen Sie `[APP_ID]` durch Ihre AdMob-Anwendungs-ID und beschreiben Sie die tatsächliche Tracking-Verwendung in `NSUserTrackingUsageDescription`.

Der Ausschnitt `SKAdNetworkItems` enthält Googles eigene Kennung. Ergänzen Sie die anderen IDs aus Googles [iOS-Einrichtungsanleitung](https://developers.google.com/admob/ios/quick-start#update_your_infoplist).

### Fehlerbehebung

Wenn CocoaPods `Google-Mobile-Ads-SDK` nicht auflösen kann:

```text
[error] Error running update: Analyzing dependencies
[!] CocoaPods could not find compatible versions for pod "Google-Mobile-Ads-SDK":
```

Führen Sie in `ios/` `pod repo update` aus und anschließend erneut `npx cap sync ios`.

## Das erste Testbanner

Holen Sie nach Installation und Plattformkonfiguration die Einwilligung ein, initialisieren Sie das SDK, sobald Anzeigen angefordert werden dürfen, und zeigen Sie ein Google-Demobanner an. Verwenden Sie die plattformspezifischen Banner-IDs aus [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing). Erstellen Sie für diese erste Prüfung keinen eigenen Anzeigenblock.

Rufen Sie `startAdMob` aus einer Nutzeraktion oder nach Bereitschaft der UI auf, beispielsweise über eine Schaltfläche oder einen Hook nach der Navigation, nicht ausschließlich bei der Modulauswertung.

```ts
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const bannerAdId =
  Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111';

async function startAdMob() {
  let consentInfo = await AdMob.requestConsentInfo();
  if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
    consentInfo = await AdMob.showConsentForm();
  }

  if (!consentInfo.canRequestAds) {
    // Einwilligung noch nicht bereit — es wird kein Banner angezeigt.
    return;
  }

  await AdMob.initialize();

  const options: BannerAdOptions = {
    adId: bannerAdId,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  };
  await AdMob.showBanner(options);
}
```

Erwartetes Ergebnis: Bei `canRequestAds` true erscheint ein Google-Testbanner am unteren Rand des nativen Bildschirms. Bei `canRequestAds` false kehrt die Funktion zurück und es wird kein Banner angezeigt. Das Banner liegt über der WebView und kann HTML verdecken. Informationen zum Einrücken Ihres Layouts finden Sie unter [Banner-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner). Einzelheiten: [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration), [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) und [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

## Nach dem Werbeziel wählen

| Ziel                                                              | Anzeigenformat                 | Anleitung                                      |
| ----------------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| Eine Anzeige neben Anwendungsinhalten sichtbar halten                          | Banner                    | [Banneranzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner)             |
| Eine Vollbildanzeige an einer natürlichen Unterbrechung ohne Belohnung zeigen | Interstitial              | [Interstitial-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial) |
| Eine gezielte Erfahrung mit Belohnung anbieten                             | Belohnte Anzeige                  | [Rewarded-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)         |
| Eine Belohnung an einem natürlichen Übergang anbieten                            | Belohntes Interstitial     | [Rewarded-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)         |
| Das Öffnen der Anwendung monetarisieren                                   | App Open                  | [App-Open-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open)         |

## Dokumentation

Beginnen Sie mit der obigen [Installation](/docs/readme#installation), dann mit [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Führen Sie das erste Testbanner aus und verwenden Sie anschließend [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) für Demo-Anzeigenblöcke und Geräte. Wählen Sie ein Anzeigenformat aus der obigen Tabelle. Dieselben Anleitungen finden Sie auch auf der [Dokumentationsseite](https://docs.rdlabo.dev/projects/capacitor-admob) auf Englisch und Japanisch. Wenn Sie dieses README auf npm geöffnet haben, verwenden Sie die Website für die Anleitungen; die Dateien unter `docs/` sind auch im Paket enthalten. Methodensignaturen stehen im folgenden API-Abschnitt.

- [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) — `AdMob.initialize` und SDK-Optionen.
- [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) — Datenschutzeinwilligung und iOS-Tracking-Berechtigung.
- [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) — Demo-Anzeigenblöcke, Testgeräte und Einwilligungstests.
- [Banner-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner) — Banner-Optionen, Lebenszyklus und Ereignisse.
- Vollbildanzeigen:
  - [Interstitial-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial) — Laden, Anzeigen und mehrere vorbereitete Anzeigen.
  - [Belohnte Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded) — belohnte Videos, belohnte Interstitials und serverseitige Verifizierung.
- [App-Open-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open) — Laden und Anzeigen beim Wechsel in den Vordergrund.
- [Anzeigenereignisse](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events) — gemeinsame Lebenszyklusereignisse, Fehler und Umsatzdaten.
- [Migrationsleitfaden](https://docs.rdlabo.dev/projects/capacitor-admob/docs/migration) — Aktualisierungsschritte und Verhaltensänderungen in v8.2.0 und früheren Versionen.

<!-- rdlabo-docs-omit -->
## Inhaltsverzeichnis

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
* [`addListener(RewardAdPluginEvents.adClicked, ...)`](/docs/readme#addlistenerrewardadplugineventsadclicked-)
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
* [Typaliase](/docs/readme#type-aliases)
* [Enums](/docs/readme#enums)

</docgen-index>

## API

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### initialize(...)

```typescript
initialize(options?: AdMobInitializationOptions | undefined) => Promise<void>
```

Initialisiert das Google Mobile Ads SDK.

| Parameter         | Typ                                                                              | Beschreibung                           |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| **`options`** | <code><a href="#admobinitializationoptions">AdMobInitializationOptions</a></code> | Optionale Einstellungen zur SDK-Initialisierung. |

**Seit:** 1.1.2

--------------------


### trackingAuthorizationStatus()

```typescript
trackingAuthorizationStatus() => Promise<TrackingAuthorizationStatusInterface>
```

Liefert unter iOS 14 und neuer den aktuellen App-Tracking-Transparency-Autorisierungsstatus.
Auf älteren iOS-Versionen, Android und im Web wird `authorized` zurückgegeben.

**Rückgabe:** <code>Promise&lt;<a href="#trackingauthorizationstatusinterface">TrackingAuthorizationStatusInterface</a>&gt;</code>

**Seit:** 3.1.0

--------------------


### requestTrackingAuthorization()

```typescript
requestTrackingAuthorization() => Promise<void>
```

Fordert unter iOS 14 und neuer die App-Tracking-Transparency-Autorisierung an.
Auf älteren iOS-Versionen, Android und im Web wird der Aufruf ohne Aktion aufgelöst.

**Seit:** 5.2.0

--------------------


### setApplicationMuted(...)

```typescript
setApplicationMuted(options: ApplicationMutedOptions) => Promise<void>
```

Teilt dem Google Mobile Ads SDK mit, ob der Anwendungston stummgeschaltet ist.

| Parameter         | Typ                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#applicationmutedoptions">ApplicationMutedOptions</a></code> |

**Seit:** 4.1.1

--------------------


### setApplicationVolume(...)

```typescript
setApplicationVolume(options: ApplicationVolumeOptions) => Promise<void>
```

Teilt dem Google Mobile Ads SDK die Audiolautstärke der Anwendung mit.

| Parameter         | Typ                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#applicationvolumeoptions">ApplicationVolumeOptions</a></code> |

**Seit:** 4.1.1

--------------------


### loadAppOpen(...)

```typescript
loadAppOpen(options: AppOpenAdOptions) => Promise<AdLoadInfo>
```

Lädt eine App-Open-Anzeige und gibt die Kennung des geladenen Anzeigenblocks zurück.

| Parameter         | Typ                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#appopenadoptions">AppOpenAdOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

--------------------


### showAppOpen(...)

```typescript
showAppOpen(options?: AdShowOptions | undefined) => Promise<void>
```

Zeigt eine geladene App-Open-Anzeige an.

| Parameter         | Typ                                                    | Beschreibung                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Optional. Übergeben Sie { adId }, um eine bestimmte vorbereitete Anzeige statt der neuesten anzuzeigen. |

--------------------


### isAppOpenLoaded(...)

```typescript
isAppOpenLoaded(options?: AdShowOptions | undefined) => Promise<{ value: boolean; }>
```

Prüft, ob eine App-Open-Anzeige geladen ist.

| Parameter         | Typ                                                    | Beschreibung                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Optional. Übergeben Sie eine adId, um eine bestimmte vorbereitete Anzeige statt der neuesten zu prüfen. |

**Rückgabe:** <code>Promise&lt;{ value: boolean; }&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Laden von App-Open-Anzeigen.

| Parameter              | Typ                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>           |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Ladefehler von App-Open-Anzeigen.

| Parameter              | Typ                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Opened, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Öffnen von App-Open-Anzeigen.

| Parameter              | Typ                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.Closed, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.Closed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Schließen von App-Open-Anzeigen.

| Parameter              | Typ                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.Closed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Anzeigefehler von App-Open-Anzeigen.

| Parameter              | Typ                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(AppOpenAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: AppOpenAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Erlösereignisse auf Impressionsebene bei App-Open-Anzeigen.

| Parameter              | Typ                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#appopenadpluginevents">AppOpenAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>     |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### showBanner(...)

```typescript
showBanner(options: BannerAdOptions) => Promise<void>
```

Zeigt eine Banneranzeige an.

| Parameter         | Typ                                                        | Beschreibung                        |
| ------------- | ----------------------------------------------------------- | ---------------------------------- |
| **`options`** | <code><a href="#banneradoptions">BannerAdOptions</a></code> | <a href="#adoptions">AdOptions</a> |

**Seit:** 1.1.2

--------------------


### hideBanner()

```typescript
hideBanner() => Promise<void>
```

Blendet das aktuelle Banner aus, ohne es zu zerstören.

**Seit:** 1.1.2

--------------------


### resumeBanner()

```typescript
resumeBanner() => Promise<void>
```

Zeigt ein zuvor ausgeblendetes Banner an.

**Seit:** 1.1.2

--------------------


### removeBanner()

```typescript
removeBanner() => Promise<void>
```

Zerstört das aktuelle Banner und entfernt es vom Bildschirm.

**Seit:** 1.1.2

--------------------


### addListener(BannerAdPluginEvents.SizeChanged, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.SizeChanged, listenerFunc: (info: AdMobBannerSize) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Änderungen der angezeigten Bannerabmessungen.

| Parameter              | Typ                                                                              | Beschreibung         |
| ------------------ | --------------------------------------------------------------------------------- | ------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.SizeChanged</a></code> | bannerAdSizeChanged |
| **`listenerFunc`** | <code>(info: <a href="#admobbannersize">AdMobBannerSize</a>) =&gt; void</code>    |                     |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Laden von Banneranzeigen.

| Parameter              | Typ                                                                         | Beschreibung    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Loaded</a></code> | bannerAdLoaded |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.FailedToLoad, listenerFunc: (info: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Ladefehler von Banneranzeigen.

| Parameter              | Typ                                                                               | Beschreibung          |
| ------------------ | ---------------------------------------------------------------------------------- | -------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.FailedToLoad</a></code> | bannerAdFailedToLoad |
| **`listenerFunc`** | <code>(info: <a href="#admoberror">AdMobError</a>) =&gt; void</code>               |                      |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Opened, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Öffnen eines Banner-Overlays.

| Parameter              | Typ                                                                         | Beschreibung    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Opened</a></code> | bannerAdOpened |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.Closed, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.Closed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Schließen eines Banner-Overlays.

| Parameter              | Typ                                                                         | Beschreibung    |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.Closed</a></code> | bannerAdClosed |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |                |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.AdImpression, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Banner-Impressionen.

| Parameter              | Typ                                                                               | Beschreibung  |
| ------------------ | ---------------------------------------------------------------------------------- | ------------ |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.AdImpression</a></code> | AdImpression |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                         |              |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 3.0.0

--------------------


### addListener(BannerAdPluginEvents.AdPaid, ...)

```typescript
addListener(eventName: BannerAdPluginEvents.AdPaid, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Erlösereignisse auf Impressionsebene bei Bannern.

| Parameter              | Typ                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#banneradpluginevents">BannerAdPluginEvents.AdPaid</a></code>     |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### requestConsentInfo(...)

```typescript
requestConsentInfo(options?: AdmobConsentRequestOptions | undefined) => Promise<AdmobConsentInfo>
```

Informationen zur Einwilligung des Nutzers anfordern

| Parameter         | Typ                                                                              | Beschreibung           |
| ------------- | --------------------------------------------------------------------------------- | --------------------- |
| **`options`** | <code><a href="#admobconsentrequestoptions">AdmobConsentRequestOptions</a></code> | ConsentRequestOptions |

**Rückgabe:** <code>Promise&lt;<a href="#admobconsentinfo">AdmobConsentInfo</a>&gt;</code>

**Seit:** 5.0.0

--------------------


### showPrivacyOptionsForm()

```typescript
showPrivacyOptionsForm() => Promise<void>
```

Zeigt ein Google-Formular für Datenschutzoptionen an, das aus Ihrer Konfiguration für DSGVO-Meldungen erstellt wird.

**Seit:** 7.0.3

--------------------


### showConsentForm()

```typescript
showConsentForm() => Promise<AdmobConsentInfo>
```

Zeigt ein Google-Einwilligungsformular an, das aus Ihrer Konfiguration für DSGVO-Meldungen erstellt wird.

**Rückgabe:** <code>Promise&lt;<a href="#admobconsentinfo">AdmobConsentInfo</a>&gt;</code>

**Seit:** 5.0.0

--------------------


### resetConsentInfo()

```typescript
resetConsentInfo() => Promise<void>
```

Setzt den Zustand des UMP SDK zurück. requestConsentInfo erneut aufrufen, damit der Nutzer seine Einwilligung ändern kann.

**Seit:** 5.0.0

--------------------


### prepareInterstitial(...)

```typescript
prepareInterstitial(options: AdOptions) => Promise<AdLoadInfo>
```

Lädt eine Interstitial-Anzeige und gibt die Kennung des geladenen Anzeigenblocks zurück.

SDK-Ladefehler führen zu einer Ablehnung mit der nativen Fehlermeldung und einem `code` als Zeichenkette.
Die Codes sind plattformspezifisch; FailedToLoad-Ereignisse liefern denselben Code als Zahl.

| Parameter         | Typ                                            | Beschreibung                        |
| ------------- | ----------------------------------------------- | ---------------------------------- |
| **`options`** | <code><a href="#adoptions">AdOptions</a></code> | <a href="#adoptions">AdOptions</a> |

**Rückgabe:** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Seit:** 1.1.2

--------------------


### showInterstitial(...)

```typescript
showInterstitial(options?: AdShowOptions | undefined) => Promise<void>
```

Zeigt eine geladene Interstitial-Anzeige an.

| Parameter         | Typ                                                    | Beschreibung                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Optional. Übergeben Sie { adId }, um eine bestimmte vorbereitete Anzeige statt der neuesten anzuzeigen. |

**Seit:** 1.1.2

--------------------


### addListener(InterstitialAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Ladefehler von Interstitial-Anzeigen.

| Parameter              | Typ                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                          |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Laden von Interstitial-Anzeigen.

| Parameter              | Typ                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>                     |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Schließen von Interstitial-Anzeigen.

| Parameter              | Typ                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                  |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Anzeigefehler von Interstitial-Anzeigen.

| Parameter              | Typ                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                          |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für die Anzeige von Interstitial-Anzeigen.

| Parameter              | Typ                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(InterstitialAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: InterstitialAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Erlösereignisse auf Impressionsebene bei Interstitial-Anzeigen.

| Parameter              | Typ                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#interstitialadpluginevents">InterstitialAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>               |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### prepareRewardVideoAd(...)

```typescript
prepareRewardVideoAd(options: RewardAdOptions) => Promise<AdLoadInfo>
```

Lädt eine Rewarded-Anzeige und gibt die Kennung des geladenen Anzeigenblocks zurück.

SDK-Ladefehler führen zu einer Ablehnung mit der nativen Fehlermeldung und einem `code` als Zeichenkette.
Die Codes sind plattformspezifisch; FailedToLoad-Ereignisse liefern denselben Code als Zahl.

| Parameter         | Typ                                                        | Beschreibung                                    |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| **`options`** | <code><a href="#rewardadoptions">RewardAdOptions</a></code> | <a href="#rewardadoptions">RewardAdOptions</a> |

**Rückgabe:** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Seit:** 1.1.2

--------------------


### showRewardVideoAd(...)

```typescript
showRewardVideoAd(options?: AdShowOptions | undefined) => Promise<AdMobRewardItem>
```

Zeigt eine geladene Rewarded-Anzeige an und wird aufgelöst, wenn der Nutzer die Belohnung erhält.

| Parameter         | Typ                                                    | Beschreibung                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Optional. Übergeben Sie { adId }, um eine bestimmte vorbereitete Anzeige statt der neuesten anzuzeigen. |

**Rückgabe:** <code>Promise&lt;<a href="#admobrewarditem">AdMobRewardItem</a>&gt;</code>

**Seit:** 1.1.2

--------------------


### addListener(RewardAdPluginEvents.adClicked, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.adClicked, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Lauscht auf vom SDK für belohnte Anzeigen erfasste Klicks, auch nach dem Erhalt einer Belohnung.
Ein Klick bedeutet nicht, dass der Nutzer eine Belohnung verdient hat.

| Parameter              | Typ                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.adClicked</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                      |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Ladefehler von Rewarded-Anzeigen.

| Parameter              | Typ                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>              |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Laden von Rewarded-Anzeigen.

| Parameter              | Typ                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>         |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Rewarded, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Rewarded, listenerFunc: (reward: AdMobRewardItem) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für erhaltene Belohnungen.

| Parameter              | Typ                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Rewarded</a></code>   |
| **`listenerFunc`** | <code>(reward: <a href="#admobrewarditem">AdMobRewardItem</a>) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Schließen von Rewarded-Anzeigen.

| Parameter              | Typ                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                      |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Anzeigefehler von Rewarded-Anzeigen.

| Parameter              | Typ                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>              |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für die Anzeige von Rewarded-Anzeigen.

| Parameter              | Typ                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: RewardAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Erlösereignisse auf Impressionsebene bei Rewarded-Anzeigen.

| Parameter              | Typ                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardadpluginevents">RewardAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>   |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### prepareRewardInterstitialAd(...)

```typescript
prepareRewardInterstitialAd(options: RewardInterstitialAdOptions) => Promise<AdLoadInfo>
```

Lädt eine Rewarded-Interstitial-Anzeige und gibt die Kennung des geladenen Anzeigenblocks zurück.

SDK-Ladefehler führen zu einer Ablehnung mit der nativen Fehlermeldung und einem `code` als Zeichenkette.
Die Codes sind plattformspezifisch; FailedToLoad-Ereignisse liefern denselben Code als Zahl.

| Parameter         | Typ                                                                                | Beschreibung                                                            |
| ------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **`options`** | <code><a href="#rewardinterstitialadoptions">RewardInterstitialAdOptions</a></code> | <a href="#rewardinterstitialadoptions">RewardInterstitialAdOptions</a> |

**Rückgabe:** <code>Promise&lt;<a href="#adloadinfo">AdLoadInfo</a>&gt;</code>

**Seit:** 1.1.2

--------------------


### showRewardInterstitialAd(...)

```typescript
showRewardInterstitialAd(options?: AdShowOptions | undefined) => Promise<AdMobRewardInterstitialItem>
```

Zeigt eine geladene Rewarded-Interstitial-Anzeige an und wird aufgelöst, wenn der Nutzer die Belohnung erhält.

| Parameter         | Typ                                                    | Beschreibung                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#adshowoptions">AdShowOptions</a></code> | Optional. Übergeben Sie { adId }, um eine bestimmte vorbereitete Anzeige statt der neuesten anzuzeigen. |

**Rückgabe:** <code>Promise&lt;<a href="#admobrewardinterstitialitem">AdMobRewardInterstitialItem</a>&gt;</code>

**Seit:** 1.1.2

--------------------


### addListener(RewardInterstitialAdPluginEvents.FailedToLoad, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.FailedToLoad, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Ladefehler von Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                                      |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Loaded, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Loaded, listenerFunc: (info: AdLoadInfo) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Laden von Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Loaded</a></code> |
| **`listenerFunc`** | <code>(info: <a href="#adloadinfo">AdLoadInfo</a>) =&gt; void</code>                                 |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Rewarded, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Rewarded, listenerFunc: (reward: AdMobRewardInterstitialItem) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für erhaltene Belohnungen.

| Parameter              | Typ                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Rewarded</a></code>   |
| **`listenerFunc`** | <code>(reward: <a href="#admobrewardinterstitialitem">AdMobRewardInterstitialItem</a>) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Dismissed, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Dismissed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für das Schließen von Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Dismissed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                              |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.FailedToShow, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.FailedToShow, listenerFunc: (error: AdMobError) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Anzeigefehler von Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.FailedToShow</a></code> |
| **`listenerFunc`** | <code>(error: <a href="#admoberror">AdMobError</a>) =&gt; void</code>                                      |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.Showed, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.Showed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für die Anzeige von Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.Showed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                           |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(RewardInterstitialAdPluginEvents.AdImpression, ...)

```typescript
addListener(eventName: RewardInterstitialAdPluginEvents.AdImpression, listenerFunc: (data: AdMobRevenueData) => void) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Erlösereignisse auf Impressionsebene bei Rewarded-Interstitial-Anzeigen.

| Parameter              | Typ                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#rewardinterstitialadpluginevents">RewardInterstitialAdPluginEvents.AdImpression</a></code> |
| **`listenerFunc`** | <code>(data: <a href="#admobrevenuedata">AdMobRevenueData</a>) =&gt; void</code>                           |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### AdMobInitializationOptions

| Eigenschaft                               | Typ                                                              | Beschreibung                                                                                                                                                                                                                                     | Standard            | Seit |
| ---------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`testingDevices`**               | <code>string[]</code>                                             | Geräte-IDs, die als Testgeräte registriert werden, wenn {@link <a href="#admobinitializationoptions">AdMobInitializationOptions.initializeForTesting</a>} `true` ist. Anfragen von registrierten Geräten erhalten Testanzeigen und erzeugen keinen ungültigen Traffic. |                    | 1.2.0 |
| **`initializeForTesting`**         | <code>boolean</code>                                              | Ob {@link <a href="#admobinitializationoptions">AdMobInitializationOptions.testingDevices</a>} als Testgeräte registriert werden sollen.                                                                                                                | <code>false</code> | 1.2.0 |
| **`tagForChildDirectedTreatment`** | <code>boolean</code>                                              | Für die Anforderungen des Children’s Online Privacy Protection Act (COPPA) gibt es die Einstellung tagForChildDirectedTreatment.                                                                                                                   |                    | 3.1.0 |
| **`tagForUnderAgeOfConsent`**      | <code>boolean</code>                                              | Bei Verwendung dieser Funktion wird allen zukünftigen Anzeigenanfragen ein TFUA-Parameter für Nutzer unterhalb des europäischen Einwilligungsalters hinzugefügt.                                                                                                        |                    | 3.1.0 |
| **`maxAdContentRating`**           | <code><a href="#maxadcontentrating">MaxAdContentRating</a></code> | Maximale Inhaltsbewertung für alle Anzeigenanfragen. Anzeigen mit einer höheren Bewertung werden ausgeschlossen.                                                                                                                                                |                    | 3.1.0 |


#### TrackingAuthorizationStatusInterface

Aktueller App-Tracking-Transparency-Autorisierungsstatus unter iOS.

| Eigenschaft         | Typ                                                                     | Beschreibung                                                     |
| ------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| **`status`** | <code>'authorized' \| 'denied' \| 'notDetermined' \| 'restricted'</code> | Von App Tracking Transparency gemeldeter Autorisierungsstatus. |


#### ApplicationMutedOptions

| Eigenschaft        | Typ                 | Beschreibung                                                                                                                                                                                                                                                                                           | Seit |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`muted`** | <code>boolean</code> | Teilt dem SDK mit, dass die App-Lautstärke stummgeschaltet wurde. Hinweis: Videoanzeigen, die nicht mit stummgeschaltetem Ton angezeigt werden dürfen, werden bei Anzeigenanfragen nicht zurückgegeben, wenn die App-Lautstärke als stumm oder als Wert 0 gemeldet wird. Dadurch kann ein Teil des verfügbaren Angebots an Videoanzeigen ausgeschlossen werden. | 4.1.1 |


#### ApplicationVolumeOptions

| Eigenschaft         | Typ                                                                               | Beschreibung                                                                                                                                                                                                                                               | Seit |
| ------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`volume`** | <code>0 \| 1 \| 0.1 \| 0.2 \| 0.3 \| 0.4 \| 0.5 \| 0.6 \| 0.7 \| 0.8 \| 0.9</code> | Wenn Ihre App eigene Lautstärkeregler hat, etwa für Musik oder Soundeffekte, können Videoanzeigen diese Einstellungen berücksichtigen, wenn die App-Lautstärke dem Google Mobile Ads SDK mitgeteilt wird. Einen unterstützten Wert zwischen 0.0 (stumm) und 1.0 (volle Lautstärke) verwenden. | 4.1.1 |


#### AdLoadInfo

Nach dem erfolgreichen Laden einer Anzeige zurückgegebene Informationen.

| Eigenschaft           | Typ                | Beschreibung                      |
| -------------- | ------------------- | -------------------------------- |
| **`adUnitId`** | <code>string</code> | Kennung des geladenen Anzeigenblocks. |


#### AppOpenAdOptions

Optionen zum Laden einer App-Open-Anzeige.

| Eigenschaft       | Typ                | Beschreibung                      |
| ---------- | ------------------- | -------------------------------- |
| **`adId`** | <code>string</code> | Kennung des zu ladenden App-Open-Anzeigenblocks. |


#### AdShowOptions

Optionen zum Auswählen einer bereits geladenen Anzeige für die Anzeige oder Prüfung.

| Eigenschaft       | Typ                | Beschreibung                                                                                                            | Seit |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----- |
| **`adId`** | <code>string</code> | Kennung des zuvor vorbereiteten Anzeigenblocks, auf den sich der Vorgang bezieht. Wenn sie fehlt, wird die zuletzt vorbereitete Anzeige verwendet. | 8.0.1 |


#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### AdMobError

Ein vom Google Mobile Ads SDK zurückgegebener Fehler.

| Eigenschaft          | Typ                | Beschreibung                            |
| ------------- | ------------------- | -------------------------------------- |
| **`code`**    | <code>number</code> | Liefert den Fehlercode.                 |
| **`message`** | <code>string</code> | Liefert die Meldung, die den Fehler beschreibt. |


#### AdMobRevenueData

Von einem bezahlten Anzeigenereignis gelieferte Erlösdaten auf Impressionsebene.

| Eigenschaft               | Typ                                                          | Beschreibung                                                                                       |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **`adUnitId`**     | <code>string</code>                                           | Dem bezahlten Anzeigenereignis zugeordnete Anzeigenblockkennung.                                                    |
| **`valueMicros`**  | <code>number</code>                                           | Anzeigenwert in Mikros; 1.000.000 Mikros entsprechen einer Währungseinheit.                          |
| **`currencyCode`** | <code>string</code>                                           | ISO-4217-Währungscode für `valueMicros`.                                                     |
| **`precision`**    | <code><a href="#advalueprecision">AdValuePrecision</a></code> | Genauigkeit des gemeldeten Anzeigenwerts.                                                           |
| **`networkName`**  | <code>string</code>                                           | Klassenname des Vermittlungsadapters, der die Impression ausgeliefert hat, oder eine leere Zeichenfolge, wenn er nicht verfügbar ist. |
| **`impressionId`** | <code>string</code>                                           | Der Impression zugeordnete Antwortkennung oder eine leere Zeichenfolge, wenn sie nicht verfügbar ist.      |


#### BannerAdOptions

Optionen zur Anzeige einer Banneranzeige.

Diese Schnittstelle erweitert <a href="#adoptions">AdOptions</a>.

| Eigenschaft                | Typ                                                          | Beschreibung                                                                                                                                                             | Standard                      | Seit |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----- |
| **`adSize`**        | <code><a href="#banneradsize">BannerAdSize</a></code>         | Größe des anzuzeigenden Banners.                                                                                                                                             | <code>ADAPTIVE_BANNER</code> | 3.0.0 |
| **`position`**      | <code><a href="#banneradposition">BannerAdPosition</a></code> | Position, an der das Banner angezeigt wird.                                                                                                                             | <code>TOP_CENTER</code>      | 1.1.2 |
| **`adId`**          | <code>string</code>                                           | Kennung des zu ladenden Anzeigenblocks.                                                                                                                                                 |                              | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                          | Ob eine Testanzeige angefordert werden soll.                                                                                                                                           | <code>false</code>           | 1.1.2 |
| **`margin`**        | <code>number</code>                                           | Bannerabstand in logischen Anzeigeeinheiten (dp unter Android und Punkte unter iOS). Bei `BOTTOM_CENTER` ist dies der untere Abstand, bei `TOP_CENTER` der obere. | <code>0</code>               | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                          | Ob nicht personalisierte Anzeigen angefordert werden sollen.                                                                                                                                | <code>false</code>           | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                          | Ob eine Vollbildanzeige unter Android im immersiven Modus angezeigt werden soll.                                                                                                       |                              | 7.0.3 |


#### AdMobBannerSize

Angezeigte Bannerabmessungen in logischen Anzeigeeinheiten (dp unter Android und Punkte unter iOS).
Ein ausgeblendetes, entferntes oder fehlgeschlagenes Banner kann für beide Abmessungen `0` melden.

| Eigenschaft         | Typ                | Beschreibung                  |
| ------------ | ------------------- | ---------------------------- |
| **`width`**  | <code>number</code> | Angezeigte Bannerbreite.  |
| **`height`** | <code>number</code> | Angezeigte Bannerhöhe. |


#### AdmobConsentInfo

| Eigenschaft                                  | Typ                                                                                        | Beschreibung                                           | Seit |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| **`status`**                          | <code><a href="#admobconsentstatus">AdmobConsentStatus</a></code>                           | Einwilligungsstatus des Nutzers.                       | 5.0.0 |
| **`isConsentFormAvailable`**          | <code>boolean</code>                                                                        | Bei `true` ist ein Einwilligungsformular verfügbar; andernfalls nicht. | 5.0.0 |
| **`canRequestAds`**                   | <code>boolean</code>                                                                        | Bei `true` kann eine Anzeige angezeigt werden.                         | 7.0.3 |
| **`privacyOptionsRequirementStatus`** | <code><a href="#privacyoptionsrequirementstatus">PrivacyOptionsRequirementStatus</a></code> | Status der erforderlichen Datenschutzoptionen des Nutzers.       | 7.0.3 |


#### AdmobConsentRequestOptions

| Eigenschaft                          | Typ                                                                              | Beschreibung                                                                                                  | Standard            | Seit |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ | ----- |
| **`debugGeography`**          | <code><a href="#admobconsentdebuggeography">AdmobConsentDebugGeography</a></code> | Legt die Debug-Geografie fest, um die Einwilligung lokal zu testen.                                                        |                    | 5.0.0 |
| **`testDeviceIdentifiers`**   | <code>string[]</code>                                                             | Ein Array zulässiger Testgeräte-IDs. Hinweis: Unter iOS kann die ID nach einer Deinstallation und Neuinstallation der App erneuert werden. |                    | 5.0.0 |
| **`tagForUnderAgeOfConsent`** | <code>boolean</code>                                                              | Auf `true` setzen, um dem Nutzer die Möglichkeit zu geben, der Anzeige personalisierter Werbung zuzustimmen.                     | <code>false</code> | 5.0.0 |


#### AdOptions

Gemeinsame Optionen zum Anfordern einer Anzeige.

| Eigenschaft                | Typ                 | Beschreibung                                                                                                                                                             | Standard            | Seit |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`adId`**          | <code>string</code>  | Kennung des zu ladenden Anzeigenblocks.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code> | Ob eine Testanzeige angefordert werden soll.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>  | Bannerabstand in logischen Anzeigeeinheiten (dp unter Android und Punkte unter iOS). Bei `BOTTOM_CENTER` ist dies der untere Abstand, bei `TOP_CENTER` der obere. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code> | Ob nicht personalisierte Anzeigen angefordert werden sollen.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code> | Ob eine Vollbildanzeige unter Android im immersiven Modus angezeigt werden soll.                                                                                                       |                    | 7.0.3 |


#### RewardAdOptions

Optionen zum Laden einer Rewarded-Anzeige.

| Eigenschaft                | Typ                                                                                                                                                                                                     | Beschreibung                                                                                                                                                             | Standard            | Seit |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`ssv`**           | <code><a href="#atleastone">AtLeastOne</a>&lt;{ /** * A user identifier passed to the SSV callback. */ userId: string; /** * Custom data passed to the SSV callback. */ customData: string; }&gt;</code> | Optionen für die serverseitige Verifizierung einer Rewarded-Anzeige. Mindestens einen der Werte `userId` oder `customData` angeben.                                                                 |                    |       |
| **`adId`**          | <code>string</code>                                                                                                                                                                                      | Kennung des zu ladenden Anzeigenblocks.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                                                                                                                                                                     | Ob eine Testanzeige angefordert werden soll.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>                                                                                                                                                                                      | Bannerabstand in logischen Anzeigeeinheiten (dp unter Android und Punkte unter iOS). Bei `BOTTOM_CENTER` ist dies der untere Abstand, bei `TOP_CENTER` der obere. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                                                                                                                                                                     | Ob nicht personalisierte Anzeigen angefordert werden sollen.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                                                                                                                                                                     | Ob eine Vollbildanzeige unter Android im immersiven Modus angezeigt werden soll.                                                                                                       |                    | 7.0.3 |


#### AdMobRewardItem

Belohnung, die der Nutzer nach dem Ansehen einer Rewarded-Anzeige erhalten hat.

| Eigenschaft         | Typ                | Beschreibung                                      |
| ------------ | ------------------- | ------------------------------------------------ |
| **`type`**   | <code>string</code> | Für den Anzeigenblock konfigurierter Typ des Belohnungsartikels. |
| **`amount`** | <code>number</code> | Vom Nutzer erhaltener Belohnungsbetrag.            |


#### RewardInterstitialAdOptions

Optionen zum Laden einer Rewarded-Interstitial-Anzeige.

| Eigenschaft                | Typ                                                                                                                                                                                                     | Beschreibung                                                                                                                                                             | Standard            | Seit |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`ssv`**           | <code><a href="#atleastone">AtLeastOne</a>&lt;{ /** * A user identifier passed to the SSV callback. */ userId: string; /** * Custom data passed to the SSV callback. */ customData: string; }&gt;</code> | Optionen für die serverseitige Verifizierung einer Rewarded-Interstitial-Anzeige. Mindestens einen der Werte `userId` oder `customData` angeben.                                                    |                    |       |
| **`adId`**          | <code>string</code>                                                                                                                                                                                      | Kennung des zu ladenden Anzeigenblocks.                                                                                                                                                 |                    | 1.1.2 |
| **`isTesting`**     | <code>boolean</code>                                                                                                                                                                                     | Ob eine Testanzeige angefordert werden soll.                                                                                                                                           | <code>false</code> | 1.1.2 |
| **`margin`**        | <code>number</code>                                                                                                                                                                                      | Bannerabstand in logischen Anzeigeeinheiten (dp unter Android und Punkte unter iOS). Bei `BOTTOM_CENTER` ist dies der untere Abstand, bei `TOP_CENTER` der obere. | <code>0</code>     | 1.1.2 |
| **`npa`**           | <code>boolean</code>                                                                                                                                                                                     | Ob nicht personalisierte Anzeigen angefordert werden sollen.                                                                                                                                | <code>false</code> | 1.2.0 |
| **`immersiveMode`** | <code>boolean</code>                                                                                                                                                                                     | Ob eine Vollbildanzeige unter Android im immersiven Modus angezeigt werden soll.                                                                                                       |                    | 7.0.3 |


#### AdMobRewardInterstitialItem

Belohnung, die der Nutzer nach dem Ansehen einer Rewarded-Interstitial-Anzeige erhalten hat.

| Eigenschaft         | Typ                | Beschreibung                                      |
| ------------ | ------------------- | ------------------------------------------------ |
| **`type`**   | <code>string</code> | Für den Anzeigenblock konfigurierter Typ des Belohnungsartikels. |
| **`amount`** | <code>number</code> | Vom Nutzer erhaltener Belohnungsbetrag.            |


### Typaliase


#### AtLeastOne

<code>{[K in keyof T]: <a href="#pick">Pick</a>&lt;T, K&gt;}[keyof T]</code>


#### Pick

Wählt aus T eine Menge von Properties, deren Schlüssel in der Union K enthalten sind

<code>{
 [P in K]: T[P];
 }</code>


### Enums


#### MaxAdContentRating

| Member                | Wert                           | Beschreibung                                                 |
| ---------------------- | ------------------------------- | ----------------------------------------------------------- |
| **`General`**          | <code>'General'</code>          | Inhalte für ein allgemeines Publikum, einschließlich Familien. |
| **`ParentalGuidance`** | <code>'ParentalGuidance'</code> | Inhalte für die meisten Zielgruppen mit elterlicher Begleitung. |
| **`Teen`**             | <code>'Teen'</code>             | Inhalte für Jugendliche und ältere Zielgruppen.              |
| **`MatureAudience`**   | <code>'MatureAudience'</code>   | Inhalte ausschließlich für Erwachsene.                 |


#### AppOpenAdPluginEvents

| Member            | Wert                                | Beschreibung                                                           |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------- |
| **`Loaded`**       | <code>'appOpenAdLoaded'</code>       | Wird ausgelöst, wenn eine App-Open-Anzeige geladen wurde.                                 |
| **`FailedToLoad`** | <code>'appOpenAdFailedToLoad'</code> | Wird ausgelöst, wenn eine App-Open-Anzeige nicht geladen werden kann.                              |
| **`Opened`**       | <code>'appOpenAdOpened'</code>       | Wird ausgelöst, wenn eine App-Open-Anzeige angezeigt wird.                                   |
| **`Closed`**       | <code>'appOpenAdClosed'</code>       | Wird ausgelöst, wenn eine App-Open-Anzeige geschlossen wird.                               |
| **`FailedToShow`** | <code>'appOpenAdFailedToShow'</code> | Wird ausgelöst, wenn eine geladene App-Open-Anzeige nicht angezeigt werden kann.                        |
| **`AdImpression`** | <code>'appOpenAdImpression'</code>   | Liefert Erlösdaten auf Impressionsebene, wenn ein bezahltes Anzeigenereignis erfasst wird. |


#### AdValuePrecision

| Member                 | Wert          | Beschreibung                                         |
| ----------------------- | -------------- | --------------------------------------------------- |
| **`Unknown`**           | <code>0</code> | Die Genauigkeit des Anzeigenwerts ist unbekannt.                  |
| **`Estimated`**         | <code>1</code> | Der Anzeigenwert wird aus aggregierten Daten geschätzt.     |
| **`PublisherProvided`** | <code>2</code> | Der Anzeigenwert wurde vom Publisher bereitgestellt.         |
| **`Precise`**           | <code>3</code> | Der Anzeigenwert entspricht dem genauen für diese Anzeige bezahlten Betrag. |


#### BannerAdSize

| Member                | Wert                           | Beschreibung                                                                                                              |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`BANNER`**           | <code>'BANNER'</code>           | Banner-Anzeigengröße der Mobile Marketing Association (MMA) (320x50 dichteunabhängige Pixel).                                   |
| **`FULL_BANNER`**      | <code>'FULL_BANNER'</code>      | Full-Banner-Anzeigengröße des Interactive Advertising Bureau (IAB) (468x60 dichteunabhängige Pixel).                            |
| **`LARGE_BANNER`**     | <code>'LARGE_BANNER'</code>     | Anzeigengröße für ein großes Banner (320x100 dichteunabhängige Pixel).                                                               |
| **`MEDIUM_RECTANGLE`** | <code>'MEDIUM_RECTANGLE'</code> | Medium-Rectangle-Anzeigengröße des Interactive Advertising Bureau (IAB) (300x250 dichteunabhängige Pixel).                      |
| **`LEADERBOARD`**      | <code>'LEADERBOARD'</code>      | Leaderboard-Anzeigengröße des Interactive Advertising Bureau (IAB) (728x90 dichteunabhängige Pixel).                            |
| **`ADAPTIVE_BANNER`**  | <code>'ADAPTIVE_BANNER'</code>  | Ein Banner mit dynamischer Größe, das die gesamte Breite nutzt und seine Höhe automatisch anpasst.                                                           |
| **`SMART_BANNER`**     | <code>'SMART_BANNER'</code>     | Ein älteres Smart Banner, dessen Größe sich an der Bildschirmbreite orientiert. Aus Kompatibilitätsgründen beibehalten; für neue Integrationen `ADAPTIVE_BANNER` verwenden. |


#### BannerAdPosition

| Member             | Wert                        | Beschreibung                                              |
| ------------------- | ---------------------------- | -------------------------------------------------------- |
| **`TOP_CENTER`**    | <code>'TOP_CENTER'</code>    | Positioniert das Banner oben mittig auf dem Bildschirm.    |
| **`CENTER`**        | <code>'CENTER'</code>        | Positioniert das Banner in der Bildschirmmitte.        |
| **`BOTTOM_CENTER`** | <code>'BOTTOM_CENTER'</code> | Positioniert das Banner unten mittig auf dem Bildschirm. |


#### BannerAdPluginEvents

| Member            | Wert                               | Beschreibung                                                           |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------- |
| **`SizeChanged`**  | <code>"bannerAdSizeChanged"</code>  | Wird ausgelöst, wenn sich die Größe des angezeigten Banners ändert.                         |
| **`Loaded`**       | <code>"bannerAdLoaded"</code>       | Wird ausgelöst, wenn eine Banneranzeige geladen wurde.                                    |
| **`FailedToLoad`** | <code>"bannerAdFailedToLoad"</code> | Wird ausgelöst, wenn eine Banneranzeige nicht geladen werden kann.                                 |
| **`Opened`**       | <code>"bannerAdOpened"</code>       | Wird ausgelöst, wenn ein Banner nach einer Berührung durch den Nutzer ein Overlay öffnet.          |
| **`Closed`**       | <code>"bannerAdClosed"</code>       | Wird ausgelöst, wenn das Banner-Overlay geschlossen wird.                              |
| **`AdImpression`** | <code>"bannerAdImpression"</code>   | Wird ausgelöst, wenn eine Impression der Banneranzeige erfasst wird.               |
| **`AdPaid`**       | <code>"bannerAdPaid"</code>         | Liefert Erlösdaten auf Impressionsebene, wenn ein bezahltes Anzeigenereignis erfasst wird. |


#### AdmobConsentStatus

| Member            | Wert                       | Beschreibung                                                                           |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| **`NOT_REQUIRED`** | <code>'NOT_REQUIRED'</code> | Die Einwilligung des Nutzers ist nicht erforderlich.                                                            |
| **`OBTAINED`**     | <code>'OBTAINED'</code>     | Die Einwilligung des Nutzers liegt bereits vor.                                                        |
| **`REQUIRED`**     | <code>'REQUIRED'</code>     | Die Einwilligung des Nutzers ist erforderlich, liegt aber noch nicht vor.                                           |
| **`UNKNOWN`**      | <code>'UNKNOWN'</code>      | Unbekannter Einwilligungsstatus. AdsConsent.requestInfoUpdate muss aufgerufen werden, um ihn zu aktualisieren. |


#### PrivacyOptionsRequirementStatus

| Member            | Wert                       | Beschreibung                                    |
| ------------------ | --------------------------- | ---------------------------------------------- |
| **`NOT_REQUIRED`** | <code>'NOT_REQUIRED'</code> | Ein Einstiegspunkt für Datenschutzoptionen ist nicht erforderlich.   |
| **`REQUIRED`**     | <code>'REQUIRED'</code>     | Ein Einstiegspunkt für Datenschutzoptionen ist erforderlich.       |
| **`UNKNOWN`**      | <code>'UNKNOWN'</code>      | Ob ein Einstiegspunkt für Datenschutzoptionen erforderlich ist, ist unbekannt. |


#### AdmobConsentDebugGeography

| Member        | Wert          | Beschreibung                                                   |
| -------------- | -------------- | ------------------------------------------------------------- |
| **`DISABLED`** | <code>0</code> | Debug-Geografie deaktiviert.                                     |
| **`EEA`**      | <code>1</code> | Die geografische Zuordnung wird für Debug-Geräte als innerhalb des EWR dargestellt.                |
| **`NOT_EEA`**  | <code>2</code> | Die geografische Zuordnung wird für Debug-Geräte als außerhalb des EWR dargestellt.            |
| **`US`**       | <code>3</code> | Die geografische Zuordnung wird für Debug-Geräte als regulierter US-Bundesstaat dargestellt. |
| **`OTHER`**    | <code>4</code> | Die geografische Zuordnung wird für Debug-Geräte als OTHER dargestellt.           |


#### InterstitialAdPluginEvents

| Member            | Wert                                     | Beschreibung                                                           |
| ------------------ | ----------------------------------------- | --------------------------------------------------------------------- |
| **`Loaded`**       | <code>'interstitialAdLoaded'</code>       | Wird ausgelöst, wenn eine Interstitial-Anzeige geladen und zur Anzeige bereit ist.        |
| **`FailedToLoad`** | <code>'interstitialAdFailedToLoad'</code> | Wird ausgelöst, wenn eine Interstitial-Anzeige nicht geladen werden kann.                          |
| **`Showed`**       | <code>'interstitialAdShowed'</code>       | Wird ausgelöst, wenn eine Interstitial-Anzeige angezeigt wird.                               |
| **`FailedToShow`** | <code>'interstitialAdFailedToShow'</code> | Wird ausgelöst, wenn eine geladene Interstitial-Anzeige nicht angezeigt werden kann.                    |
| **`Dismissed`**    | <code>'interstitialAdDismissed'</code>    | Wird ausgelöst, wenn eine Interstitial-Anzeige geschlossen wird.                           |
| **`AdImpression`** | <code>'interstitialAdImpression'</code>   | Liefert Erlösdaten auf Impressionsebene, wenn ein bezahltes Anzeigenereignis erfasst wird. |


#### RewardAdPluginEvents

| Member            | Wert                                        | Beschreibung                                                                                                                                                        |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`adClicked`**    | <code>'onRewardedVideoAdClicked'</code>      | Wird ausgelöst, wenn das SDK einen Klick auf eine belohnte Anzeige erfasst.                                                                                                               |
| **`Loaded`**       | <code>'onRewardedVideoAdLoaded'</code>       | Wird ausgelöst, wenn eine Rewarded-Anzeige geladen und zur Anzeige bereit ist.                                                                                                          |
| **`FailedToLoad`** | <code>'onRewardedVideoAdFailedToLoad'</code> | Wird ausgelöst, wenn eine Rewarded-Anzeige nicht geladen werden kann.                                                                                                                            |
| **`Showed`**       | <code>'onRewardedVideoAdShowed'</code>       | Wird ausgelöst, wenn eine Rewarded-Anzeige angezeigt wird.                                                                                                                                 |
| **`FailedToShow`** | <code>'onRewardedVideoAdFailedToShow'</code> | Wird ausgelöst, wenn eine geladene Rewarded-Anzeige nicht angezeigt werden kann.                                                                                                                     |
| **`Dismissed`**    | <code>'onRewardedVideoAdDismissed'</code>    | Wird ausgelöst, wenn eine Rewarded-Anzeige geschlossen wird.  Dieses Ereignis sagt nicht aus, ob der Nutzer eine Belohnung erhalten hat. Separat auf `Rewarded` reagieren, bevor die Belohnung gewährt wird. |
| **`Rewarded`**     | <code>'onRewardedVideoAdReward'</code>       | Wird ausgelöst, wenn der Nutzer die angekündigte Belohnung erhält.                                                                                                                   |
| **`AdImpression`** | <code>'onRewardedVideoAdImpression'</code>   | Liefert Erlösdaten auf Impressionsebene, wenn ein bezahltes Anzeigenereignis erfasst wird.                                                                                              |


#### RewardInterstitialAdPluginEvents

| Member            | Wert                                               | Beschreibung                                                                                                                                                                     |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Loaded`**       | <code>'onRewardedInterstitialAdLoaded'</code>       | Wird ausgelöst, wenn eine Rewarded-Interstitial-Anzeige geladen und zur Anzeige bereit ist.                                                                                                          |
| **`FailedToLoad`** | <code>'onRewardedInterstitialAdFailedToLoad'</code> | Wird ausgelöst, wenn eine Rewarded-Interstitial-Anzeige nicht geladen werden kann.                                                                                                                            |
| **`Showed`**       | <code>'onRewardedInterstitialAdShowed'</code>       | Wird ausgelöst, wenn eine Rewarded-Interstitial-Anzeige angezeigt wird.                                                                                                                                 |
| **`FailedToShow`** | <code>'onRewardedInterstitialAdFailedToShow'</code> | Wird ausgelöst, wenn eine geladene Rewarded-Interstitial-Anzeige nicht angezeigt werden kann.                                                                                                                     |
| **`Dismissed`**    | <code>'onRewardedInterstitialAdDismissed'</code>    | Wird ausgelöst, wenn eine Rewarded-Interstitial-Anzeige geschlossen wird.  Dieses Ereignis sagt nicht aus, ob der Nutzer eine Belohnung erhalten hat. Separat auf `Rewarded` reagieren, bevor die Belohnung gewährt wird. |
| **`Rewarded`**     | <code>'onRewardedInterstitialAdReward'</code>       | Wird ausgelöst, wenn der Nutzer die angekündigte Belohnung erhält.                                                                                                                                |
| **`AdImpression`** | <code>'onRewardedInterstitialAdImpression'</code>   | Liefert Erlösdaten auf Impressionsebene, wenn ein bezahltes Anzeigenereignis erfasst wird.                                                                                                           |

</docgen-api>

## Kanäle für Vorabversionen

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Validation` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt lautet:

```text
/beta
```

Die Anforderung autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung und Head-SHA unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit benötigt erneut erfolgreiche CI und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Änderungen in `main` angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt mit deaktivierten Lebenszyklusskripten. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt ein Release-Tag. Stabile Tags `vX.Y.Z` werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

## Lizenz

Capacitor AdMob steht unter der [MIT-Lizenz](./LICENSE).
<!-- /rdlabo-docs-omit -->
