---
title: "Anzeigenereignisse"
sourceRevision: "c82642b160a974c1f99282a8699e9469e84db5f18a0d7e7b21513ab9f6383556"
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
| `adClicked` | Das SDK hat einen Klick auf eine belohnte Anzeige erfasst (seit 8.2.0). |
| `Rewarded`                | Der Nutzer die angekündigte Belohnung verdient hat.                 |
| `SizeChanged`             | Die Banner-Abmessungen sich geändert haben.                             |
| `AdImpression` / `AdPaid` | Eine Impression aufgezeichnet wurde. Siehe die folgenden Umsatzereignisse.  |

## Fehler

Listener für `FailedToLoad` und `FailedToShow` erhalten eine `AdMobError`-Nutzlast. Die Codes sind native, plattformspezifische Zahlen. Seit 8.2.0 führen SDK-Ladefehler in den Vorbereitungsmethoden für Interstitial-, belohnte und belohnte Interstitial-Anzeigen außerdem zu einer Ablehnung mit demselben Code als Zeichenkette. Unter iOS melden Ladefehlerereignisse nun den tatsächlichen Code statt `0`.

<!-- !::AdMobError:: -->

## Umsatz je Impression

Vollbildformate liefern `AdMobRevenueData` über ihr Ereignis `AdImpression`. Banner liefern dieselben Nutzdaten über `AdPaid`. Banner-`AdImpression` enthält keine Nutzdaten; es meldet nur eine aufgezeichnete Impression.

`valueMicros` ist eine Ganzzahl in Millionsteln der durch `currencyCode` angegebenen Währung. Teilen Sie sie durch `1_000_000`, um Währungseinheiten zu erhalten. Die iOS-Umrechnung wurde in 8.2.0 korrigiert. Siehe [Migration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/migration), falls Ihre Analysen die bisherigen Werte korrigieren.

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
