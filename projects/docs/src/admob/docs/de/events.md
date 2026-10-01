---
title: "Anzeigenereignisse"
sourceRevision: "cedfb7741215f77c0e64973a79c00fceb2843105c495504800b90bec12e8d0b2"
---
# Anzeigenereignisse

Google dokumentiert diese Lebenszykluscallbacks auf der jeweiligen Formatseite, beispielsweise unter [Banner-Anzeigenereignisse](https://developers.google.com/admob/android/banner#ad_events). Dieses Plugin stellt dieselben Zeitpunkte unter den Namen in der folgenden Tabelle bereit, nicht unter den nativen Methodennamen von `AdListener`. Umsatznutzdaten beschreibt [Anzeigenumsatz je Impression](https://developers.google.com/admob/android/impression-level-ad-revenue) beziehungsweise die [iOS-Version](https://developers.google.com/admob/ios/impression-level-ad-revenue).

Registrieren Sie Listener vor dem Laden oder Anzeigen einer Anzeige, damit die ersten Lebenszyklus- und Impressionsereignisse nicht verpasst werden.

## Listener hinzufügen und entfernen

`AdMob.addListener` gibt ein Handle zurück. Warten Sie auf die Registrierung und rufen Sie anschließend `remove()` auf, wenn der zugehörige Bildschirm zerstört wird:

```ts
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

const handle = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
  console.log('Banner loaded');
});

await handle.remove();
```

<!-- !::PluginListenerHandle:: -->

## Gemeinsame Lebenszyklusereignisse

| Ereignis                     | Wird ausgelöst, wenn                                           |
| ------------------------- | ------------------------------------------------------ |
| `Loaded`                  | Die Anzeige fertig geladen und zur Anzeige bereit ist.          |
| `FailedToLoad`            | Die Anzeige nicht geladen werden konnte. Einzelheiten stehen in `AdMobError`. |
| `Showed` / `Opened`       | Die Anzeige für den Nutzer sichtbar wird.                     |
| `FailedToShow`            | Eine geladene Anzeige nicht angezeigt werden konnte.                         |
| `Dismissed` / `Closed`    | Der Nutzer die Vollbildanzeige oder das Overlay geschlossen hat.         |
| `Rewarded`                | Der Nutzer die angekündigte Belohnung verdient hat.                 |
| `SizeChanged`             | Die Banner-Abmessungen sich geändert haben.                             |
| `AdImpression` / `AdPaid` | Eine Impression aufgezeichnet wurde. Siehe die folgenden Umsatzereignisse.  |

## Fehler

Listener für `FailedToLoad` und `FailedToShow` erhalten Nutzdaten vom Typ `AdMobError`.

<!-- !::AdMobError:: -->

## Umsatz je Impression

Vollbildformate liefern `AdMobRevenueData` über ihr Ereignis `AdImpression`. Banner liefern dieselben Nutzdaten über `AdPaid`. Banner-`AdImpression` enthält keine Nutzdaten; es meldet nur eine aufgezeichnete Impression.

<!-- !::AdMobRevenueData:: -->

## Anleitungen nach Format

- [App-Open-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open)
- [Banneranzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner)
- [Interstitial-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial)
- [Rewarded-Anzeigen](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)

<!-- !::addListener.AppOpenAdPluginEvents:: -->

<!-- !::AppOpenAdPluginEvents:: -->

<!-- !::addListener.BannerAdPluginEvents:: -->

<!-- !::BannerAdPluginEvents:: -->

<!-- !::addListener.InterstitialAdPluginEvents:: -->

<!-- !::InterstitialAdPluginEvents:: -->

<!-- !::addListener.RewardAdPluginEvents:: -->

<!-- !::RewardAdPluginEvents:: -->

<!-- !::addListener.RewardInterstitialAdPluginEvents:: -->

<!-- !::RewardInterstitialAdPluginEvents:: -->
