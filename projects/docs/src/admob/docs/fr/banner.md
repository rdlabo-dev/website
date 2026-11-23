---
title: "Bannières publicitaires"
sourceRevision: "dbd546c88aa906f24dde2fae4f4173227d5019e2f095f6b50a3df5dad0e13b3c"
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

Pour déplacer la bannière Android existante, rappelez `showBanner()` avec le même bloc d’annonces, les mêmes options de requête et une nouvelle valeur pour `position` ou `margin`. La bannière conserve sa taille même si vous omettez `adSize`. Si seule la disposition change, la promesse se résout en conservant l’annonce affichée, sans nouvelle requête. Gardez les mêmes options de requête, par exemple `npa`, lors du déplacement. Un appel à `showBanner()` sans changement de disposition ou avec de nouvelles options de requête recharge la bannière comme auparavant, sans en créer une seconde. Pour changer de taille ou de bloc d’annonces, appelez d’abord `removeBanner()` si aucune bannière correspondante n’a été préchargée avec `prepareBanner()`.

## Réserver de l’espace avant de charger une bannière adaptative

Calculez les dimensions prévues sans créer de bannière ni demander d’annonce.

```ts
const { height } = await AdMob.getAdaptiveBannerSize();
content.style.paddingBottom = `${height}px`;
await AdMob.showBanner(options);
```

Par défaut, le SDK utilise la largeur disponible en tenant compte des zones sûres, avec le même calcul que `showBanner()` pour les bannières adaptatives. Les dimensions sont en pixels logiques (dp sur Android, points sur iOS). Refaites le calcul après une rotation ou un changement de largeur et continuez à suivre `SizeChanged` pour connaître la taille affichée.

Avec l’option `{ width: 300 }`, le calcul utilise la largeur indiquée en pixels logiques, sans modifier celle de `showBanner()`. Une largeur invalide entraîne un rejet. Le calcul est disponible sur Android et iOS. Sur le Web, l’appel est rejeté car cette fonction est indisponible.

## Lire les dimensions de la bannière affichée

`getBannerSize()` renvoie la largeur et la hauteur affichées en pixels logiques, même si vous avez manqué le premier événement de taille. Cet appel ne demande ni n’affiche d’annonce. Les deux dimensions sont nulles avant le chargement et si la bannière est masquée, supprimée ou en échec.

```ts
const { width, height } = await AdMob.getBannerSize();
```

Continuez d’écouter `BannerAdPluginEvents.SizeChanged` pour les changements ultérieurs.

## Précharger une bannière sans l’afficher

```ts
await AdMob.prepareBanner(options);
// Afficher la bannière une fois l’écran prêt.
await AdMob.showBanner(options);
```

`prepareBanner()` se résout lorsque la bannière suivante est chargée et laisse la bannière actuelle à l’écran. Pour l’afficher sans la recharger, passez le même bloc d’annonces, la même taille et les mêmes options de requête à `showBanner()`. La position et la marge peuvent changer. Sans bannière préparée réutilisable, `showBanner()` fonctionne comme d’habitude.

Une nouvelle préparation remplace la précédente. `removeBanner()` supprime à la fois la bannière affichée et la bannière préparée. La promesse d’une préparation en cours est rejetée si celle-ci est remplacée ou supprimée.

La préparation émet `Loaded` sans émettre `SizeChanged`. L’affichage d’une bannière préparée émet `SizeChanged` uniquement si les dimensions affichées changent, sans émettre de nouveau `Loaded`.
