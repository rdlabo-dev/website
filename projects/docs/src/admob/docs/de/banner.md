---
title: "Banneranzeigen"
sourceRevision: "cd53888af01df2cfae5e71c46f86297c27dcf22cbf70fe9c709e181b41d69ade"
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
