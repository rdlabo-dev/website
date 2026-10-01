---
title: "Bannières publicitaires"
sourceRevision: "cd53888af01df2cfae5e71c46f86297c27dcf22cbf70fe9c709e181b41d69ade"
---
# Bannières publicitaires

Les bannières sont des annonces rectangulaires qui occupent une partie de la disposition de l’application. Elles peuvent rester à l’écran pendant que l’utilisateur interagit avec l’application, généralement ancrées en haut ou en bas. Les guides Google sur les bannières pour [Android](https://developers.google.com/admob/android/banner) et [iOS](https://developers.google.com/admob/ios/banner) expliquent ce format.

Appelez cette méthode après [l’initialisation](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration) et [le consentement](https://docs.rdlabo.dev/projects/capacitor-admob/docs/consent). Ce plugin dessine la bannière sur l’écran natif (au-dessus de la WebView). Enregistrez les écouteurs avant d’appeler `showBanner` pour ne pas manquer les premiers événements de chargement et de taille.

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
    // Réservez un espace de size.height dans la disposition ; voir la section suivante.
  }),
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
    console.error(error);
  }),
  AdMob.addListener(BannerAdPluginEvents.AdPaid, (data: AdMobRevenueData) => {
    // Transmettez les revenus par impression à votre fournisseur d’analytics.
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

## Éviter de masquer le contenu sous la bannière

La bannière est dessinée sur l’écran natif au-dessus de la WebView. La disposition HTML ne s’ajuste pas automatiquement. Réservez dans votre élément racine un espace de `size.height` (pixels logiques). Utilisez un padding ou une marge en bas pour `BOTTOM_CENTER`, et en haut pour `TOP_CENTER`.

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

Lorsque la hauteur vaut `0` (bannière masquée, supprimée ou en échec), supprimez cet espace. Appliquez le même principe à l’élément qui remplit la WebView dans votre framework.

Consultez [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing) pour `isTesting`.

## Cycle de vie

- `hideBanner()` masque temporairement la bannière actuelle.
- `resumeBanner()` affiche à nouveau une bannière masquée.
- `removeBanner()` la détruit. Appelez `showBanner()` pour en créer une autre.

<!-- !::hideBanner:: -->

<!-- !::resumeBanner:: -->

<!-- !::removeBanner:: -->

Libérez les handles des écouteurs lorsque l’écran qui les possède est détruit :

```ts
for (const handle of handles) {
  await handle.remove();
}
await AdMob.removeBanner();
```

Les revenus par impression d’une bannière sont émis via `BannerAdPluginEvents.AdPaid`. Les formats plein écran émettent les mêmes données `AdMobRevenueData` via leur événement `AdImpression`. Consultez [Événements publicitaires](https://docs.rdlabo.dev/projects/capacitor-admob/docs/events).
