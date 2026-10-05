---
title: "API"
sourceRevision: "7e90a95b7a919d884d2ef93af779840d36b410b18fe36a4fdbbca74a47f5eb54"
---
* [`initialize(...)`](#initialize)
* [`trackingAuthorizationStatus()`](#trackingauthorizationstatus)
* [`requestTrackingAuthorization()`](#requesttrackingauthorization)
* [`setApplicationMuted(...)`](#setapplicationmuted)
* [`setApplicationVolume(...)`](#setapplicationvolume)
* [`loadAppOpen(...)`](#loadappopen)
* [`showAppOpen(...)`](#showappopen)
* [`isAppOpenLoaded(...)`](#isappopenloaded)
* [`addListener(AppOpenAdPluginEvents.Loaded, ...)`](#addlistenerappopenadplugineventsloaded-)
* [`addListener(AppOpenAdPluginEvents.FailedToLoad, ...)`](#addlistenerappopenadplugineventsfailedtoload-)
* [`addListener(AppOpenAdPluginEvents.Opened, ...)`](#addlistenerappopenadplugineventsopened-)
* [`addListener(AppOpenAdPluginEvents.Closed, ...)`](#addlistenerappopenadplugineventsclosed-)
* [`addListener(AppOpenAdPluginEvents.FailedToShow, ...)`](#addlistenerappopenadplugineventsfailedtoshow-)
* [`addListener(AppOpenAdPluginEvents.AdImpression, ...)`](#addlistenerappopenadplugineventsadimpression-)
* [`showBanner(...)`](#showbanner)
* [`hideBanner()`](#hidebanner)
* [`resumeBanner()`](#resumebanner)
* [`removeBanner()`](#removebanner)
* [`addListener(BannerAdPluginEvents.SizeChanged, ...)`](#addlistenerbanneradplugineventssizechanged-)
* [`addListener(BannerAdPluginEvents.Loaded, ...)`](#addlistenerbanneradplugineventsloaded-)
* [`addListener(BannerAdPluginEvents.FailedToLoad, ...)`](#addlistenerbanneradplugineventsfailedtoload-)
* [`addListener(BannerAdPluginEvents.Opened, ...)`](#addlistenerbanneradplugineventsopened-)
* [`addListener(BannerAdPluginEvents.Closed, ...)`](#addlistenerbanneradplugineventsclosed-)
* [`addListener(BannerAdPluginEvents.AdImpression, ...)`](#addlistenerbanneradplugineventsadimpression-)
* [`addListener(BannerAdPluginEvents.AdPaid, ...)`](#addlistenerbanneradplugineventsadpaid-)
* [`requestConsentInfo(...)`](#requestconsentinfo)
* [`showPrivacyOptionsForm()`](#showprivacyoptionsform)
* [`showConsentForm()`](#showconsentform)
* [`resetConsentInfo()`](#resetconsentinfo)
* [`prepareInterstitial(...)`](#prepareinterstitial)
* [`showInterstitial(...)`](#showinterstitial)
* [`addListener(InterstitialAdPluginEvents.FailedToLoad, ...)`](#addlistenerinterstitialadplugineventsfailedtoload-)
* [`addListener(InterstitialAdPluginEvents.Loaded, ...)`](#addlistenerinterstitialadplugineventsloaded-)
* [`addListener(InterstitialAdPluginEvents.Dismissed, ...)`](#addlistenerinterstitialadplugineventsdismissed-)
* [`addListener(InterstitialAdPluginEvents.FailedToShow, ...)`](#addlistenerinterstitialadplugineventsfailedtoshow-)
* [`addListener(InterstitialAdPluginEvents.Showed, ...)`](#addlistenerinterstitialadplugineventsshowed-)
* [`addListener(InterstitialAdPluginEvents.AdImpression, ...)`](#addlistenerinterstitialadplugineventsadimpression-)
* [`prepareRewardVideoAd(...)`](#preparerewardvideoad)
* [`showRewardVideoAd(...)`](#showrewardvideoad)
* [`addListener(RewardAdPluginEvents.adClicked, ...)`](#addlistenerrewardadplugineventsadclicked-)
* [`addListener(RewardAdPluginEvents.FailedToLoad, ...)`](#addlistenerrewardadplugineventsfailedtoload-)
* [`addListener(RewardAdPluginEvents.Loaded, ...)`](#addlistenerrewardadplugineventsloaded-)
* [`addListener(RewardAdPluginEvents.Rewarded, ...)`](#addlistenerrewardadplugineventsrewarded-)
* [`addListener(RewardAdPluginEvents.Dismissed, ...)`](#addlistenerrewardadplugineventsdismissed-)
* [`addListener(RewardAdPluginEvents.FailedToShow, ...)`](#addlistenerrewardadplugineventsfailedtoshow-)
* [`addListener(RewardAdPluginEvents.Showed, ...)`](#addlistenerrewardadplugineventsshowed-)
* [`addListener(RewardAdPluginEvents.AdImpression, ...)`](#addlistenerrewardadplugineventsadimpression-)
* [`prepareRewardInterstitialAd(...)`](#preparerewardinterstitialad)
* [`showRewardInterstitialAd(...)`](#showrewardinterstitialad)
* [`addListener(RewardInterstitialAdPluginEvents.FailedToLoad, ...)`](#addlistenerrewardinterstitialadplugineventsfailedtoload-)
* [`addListener(RewardInterstitialAdPluginEvents.Loaded, ...)`](#addlistenerrewardinterstitialadplugineventsloaded-)
* [`addListener(RewardInterstitialAdPluginEvents.Rewarded, ...)`](#addlistenerrewardinterstitialadplugineventsrewarded-)
* [`addListener(RewardInterstitialAdPluginEvents.Dismissed, ...)`](#addlistenerrewardinterstitialadplugineventsdismissed-)
* [`addListener(RewardInterstitialAdPluginEvents.FailedToShow, ...)`](#addlistenerrewardinterstitialadplugineventsfailedtoshow-)
* [`addListener(RewardInterstitialAdPluginEvents.Showed, ...)`](#addlistenerrewardinterstitialadplugineventsshowed-)
* [`addListener(RewardInterstitialAdPluginEvents.AdImpression, ...)`](#addlistenerrewardinterstitialadplugineventsadimpression-)
* [Interfaces](#interfaces)
* [Typaliase](#type-aliases)
* [Enums](#enums)

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
