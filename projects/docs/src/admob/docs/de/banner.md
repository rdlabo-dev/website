---
title: "Banneranzeigen"
sourceRevision: "dbd546c88aa906f24dde2fae4f4173227d5019e2f095f6b50a3df5dad0e13b3c"
---
# Banneranzeigen

Banner-Anzeigen sind rechteckige Anzeigen, die einen Teil des Anwendungslayouts belegen. Sie können während der Interaktion mit der Anwendung sichtbar bleiben, üblicherweise am oberen oder unteren Rand verankert. Googles Banner-Anleitungen für [Android](https://developers.google.com/admob/android/banner) und [iOS](https://developers.google.com/admob/ios/banner) erklären das Format.

Führen Sie dies nach [Initialisierung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) und [Einwilligung](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent) aus. Dieses Plugin zeichnet das Banner auf dem nativen Bildschirm oberhalb der WebView. Registrieren Sie Listener vor `showBanner`, damit die ersten Lade- und Größenereignisse nicht verpasst werden.

```ts
import {
  AdMob,
  AdMobBannerSize,
  AdMobRevenueData,
  BannerAdOptions,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';

const handles = await Promise.all([
  AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
    console.log('Banner loaded');
  }),
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
    console.log('Banner size', size.width, size.height);
    // Das Layout um size.height einrücken; siehe den nächsten Abschnitt.
  }),
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
    console.error(error);
  }),
  AdMob.addListener(BannerAdPluginEvents.AdPaid, (data: AdMobRevenueData) => {
    // Umsätze pro Impression an Ihren Analyseanbieter weiterleiten.
    console.log(data);
  }),
]);

const options: BannerAdOptions = {
  adId: 'YOUR_AD_UNIT_ID',
  adSize: BannerAdSize.ADAPTIVE_BANNER,
  position: BannerAdPosition.BOTTOM_CENTER,
  margin: 0,
  // isTesting: true,
  // npa: true,
};
await AdMob.showBanner(options);
```

<!-- !::showBanner:: -->

<!-- !::BannerAdOptions:: -->

<!-- !::BannerAdSize:: -->

<!-- !::BannerAdPosition:: -->

## Inhalt unter dem Banner vermeiden

Das Banner wird auf dem nativen Bildschirm über der WebView gezeichnet. Das HTML-Layout verschiebt sich nicht von selbst. Rücken Sie Ihr eigenes Wurzelelement um `size.height` in logischen Pixeln ein. Verwenden Sie für `BOTTOM_CENTER` Padding oder Margin unten und für `TOP_CENTER` oben.

```html
<main id="content">Your app</main>
```

```ts
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

const content = document.getElementById('content');

await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
  if (!content) {
    return;
  }
  content.style.paddingBottom = size.height > 0 ? `${size.height}px` : '';
});
```

Entfernen Sie den Innenabstand bei einer Höhe von `0`, etwa nach Ausblenden, Entfernen oder Fehlschlag. Übertragen Sie dieselbe Idee auf das Element, das in Ihrem Framework die WebView ausfüllt.

Informationen zu `isTesting` finden Sie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

## Lebenszyklus

- `hideBanner()` blendet das aktuelle Banner vorübergehend aus.
- `resumeBanner()` zeigt ein ausgeblendetes Banner wieder an.
- `removeBanner()` zerstört es. Rufen Sie `showBanner()` auf, um ein neues zu erstellen.

<!-- !::hideBanner:: -->

<!-- !::resumeBanner:: -->

<!-- !::removeBanner:: -->

Geben Sie Listener-Handles frei, wenn der zugehörige Bildschirm zerstört wird:

```ts
for (const handle of handles) {
  await handle.remove();
}
await AdMob.removeBanner();
```

Umsatzdaten je Banner-Impression werden über `BannerAdPluginEvents.AdPaid` ausgegeben. Vollbildformate liefern dieselben `AdMobRevenueData` über ihr Ereignis `AdImpression`. Siehe [Anzeigenereignisse](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events).

Um ein vorhandenes Android-Banner zu verschieben, rufen Sie `showBanner()` mit demselben Anzeigenblock, denselben Anfrageoptionen und einem neuen Wert für `position` oder `margin` auf. Auch ohne Angabe von `adSize` bleibt die Größe erhalten. Ändert sich nur das Layout, bleibt die Anzeige sichtbar und der Aufruf wird ohne neue Anzeigenanfrage abgeschlossen. Behalten Sie beim Verschieben Anfrageoptionen wie `npa` bei. Ein Aufruf von `showBanner()` bei unverändertem Layout oder mit geänderten Anfrageoptionen lädt die Anzeige wie bisher neu, ohne ein zweites Banner anzulegen. Wenn kein passendes Banner mit `prepareBanner()` vorgeladen wurde, rufen Sie vor einem Wechsel der Größe oder des Anzeigenblocks `removeBanner()` auf.

## Vor dem Laden Platz für ein adaptives Banner reservieren

Berechnen Sie die erwartete Größe, ohne ein Banner zu erstellen oder eine Anzeige anzufordern.

```ts
const { height } = await AdMob.getAdaptiveBannerSize();
content.style.paddingBottom = `${height}px`;
await AdMob.showBanner(options);
```

Standardmäßig verwendet das SDK die verfügbare Breite unter Berücksichtigung der sicheren Bereiche. Die Berechnung entspricht der von `showBanner()` für adaptive Banner. Die Maße sind logische Pixel (dp unter Android, Punkte unter iOS). Berechnen Sie die Größe nach einer Drehung oder Änderung der verfügbaren Breite neu. Verwenden Sie weiterhin `SizeChanged` für die tatsächlich angezeigte Größe.

Mit der optionalen Angabe `{ width: 300 }` berechnen Sie die Größe für eine bestimmte Breite in logischen Pixeln. Die von `showBanner()` verwendete Breite bleibt dabei unverändert. Eine ungültige Breite führt zur Ablehnung. Die Berechnung ist unter Android und iOS verfügbar. Im Web wird der Aufruf als nicht verfügbar abgelehnt.

## Die aktuelle Bannergröße abfragen

`getBannerSize()` liefert Breite und Höhe des angezeigten Banners in logischen Pixeln, auch wenn das erste Größenereignis verpasst wurde. Der Aufruf fordert keine Anzeige an und zeigt keine an. Vor dem Laden, bei ausgeblendetem oder entferntem Banner sowie nach einem Fehler sind beide Maße null.

```ts
const { width, height } = await AdMob.getBannerSize();
```

Erfassen Sie spätere Änderungen weiterhin über `BannerAdPluginEvents.SizeChanged`.

## Ein Banner vorladen, ohne es anzuzeigen

```ts
await AdMob.prepareBanner(options);
// Das Banner anzeigen, sobald der Bildschirm bereit ist.
await AdMob.showBanner(options);
```

`prepareBanner()` wird abgeschlossen, sobald das nächste Banner geladen ist. Das aktuelle Banner bleibt sichtbar. Verwenden Sie in `showBanner()` denselben Anzeigenblock, dieselbe Größe und dieselben Anfrageoptionen, um es ohne erneutes Laden anzuzeigen. Position und Rand dürfen abweichen. Ist kein passendes vorbereitetes Banner vorhanden, funktioniert `showBanner()` wie gewohnt.

Eine neue Vorbereitung ersetzt die vorherige. `removeBanner()` entfernt sowohl das angezeigte als auch das vorbereitete Banner. Wird eine laufende Vorbereitung ersetzt oder entfernt, wird ihr Promise abgelehnt.

Beim Vorbereiten wird `Loaded` ausgelöst, ohne `SizeChanged` auszulösen. Beim Anzeigen des vorbereiteten Banners wird `SizeChanged` nur bei geänderten Abmessungen ausgelöst. `Loaded` wird dabei nicht erneut ausgelöst.
