---
title: "Native Ads (version préliminaire)"
sourceRevision: "ff974eb9b0368211c69399c59f5a8a634e9eb1750f98ced3d1cc8252543b5494"
---
# Native Ads (version préliminaire)

**Native Ads est une fonctionnalité en version préliminaire.** Vous pouvez l’utiliser pour les tests et en production. Tant qu’elle reste en version préliminaire, son API peut changer lors d’une version mineure.

Les annonces natives sont affichées à l’aide de vues du SDK Google Mobile Ads gérées par ce plugin. Votre application réserve un emplacement HTML et fournit une clé stable ; elle n’implémente pas de `NativeAdView` en Kotlin ou Swift et n’affiche pas les éléments de l’annonce en JavaScript.

Native Ads est disponible sur iOS et Android. Le défilement virtuel n’est pas encore pris en charge. Une annonce native est placée au-dessus de la WebView : un geste de déplacement commencé sur l’annonce peut donc ne pas parvenir au conteneur de défilement de la WebView. L’implémentation met à jour les coordonnées de la vue superposée pendant le défilement de la WebView, mais cela ne résout pas le problème initial d’acheminement du geste.

Les navigateurs et les PWA ne sont pas pris en charge. `NativeAdFeed.create()` rejette la Promise au lieu de laisser un emplacement publicitaire vide.

## Créer un flux

Créez un gestionnaire pour chaque écran de flux visible après avoir initialisé AdMob et obtenu le consentement.

```ts
import { NativeAdFeed, NativeAdPluginEvents, NativeAdTemplate } from '@capacitor-community/admob';

const nativeAds = await NativeAdFeed.create({
  feedId: 'home-feed',
  template: NativeAdTemplate.Medium,
  isTesting: true,
  style: {
    backgroundColor: '#ffffff',
    cornerRadius: 12,
    headlineColor: '#111827',
    callToActionBackgroundColor: '#2563eb',
  },
});

const paidHandle = await nativeAds.addListener(NativeAdPluginEvents.AdPaid, (event) => {
  console.log(event.slotKey, event.valueMicros, event.currencyCode);
});
```

Utilisez l’élément indépendant du framework dans un balisage classique ou virtualisé. `slot-key` doit identifier l’élément publicitaire logique, et non son indice dans le tableau ni le nœud DOM recyclé.

```html
<capacitor-admob-native feed-id="home-feed" slot-key="sponsored-after-article-42"></capacitor-admob-native>
```

L’élément réserve `320px` pour `Medium` et `120px` pour `Small` uniquement lorsque le CSS de l’application ne définit pas de hauteur. Les règles `display: none` et les hauteurs explicites de l’application sont respectées. Les emplacements `Small` doivent mesurer au moins `120×120px` ; les emplacements `Medium`, au moins `144×300px`. Aucun chargement n’a lieu pour les emplacements plus petits. Il s’agit de limites minimales, sans garantie que chaque création publicitaire et chaque taille de police y tiennent. Sur Android, `Medium` reste masqué si sa zone multimédia mesurée est inférieure à `120×120dp` ; augmentez la taille de l’emplacement pour tenir compte du texte, de la mise à l’échelle des polices de l’appareil et de l’arrondi des pixels. N’animez pas la hauteur de l’emplacement et ne la mesurez pas dynamiquement.

`Small` ne comporte pas de zone vidéo. Si le SDK renvoie une annonce vidéo pour ce modèle, le chargement échoue avec `NativeAdPluginEvents.FailedToLoad` (code `-1`) ; l’annonce n’est pas affichée et aucune nouvelle tentative automatique n’est effectuée. Utilisez `Medium` pour les blocs d’annonces qui diffusent des annonces vidéo.

Si un framework n’accepte pas les éléments personnalisés, attachez un élément ordinaire à la place :

```ts
nativeAds.attach('sponsored-after-article-42', element);

// Avant que l’élément soit détruit ou réutilisé pour un autre élément logique :
nativeAds.detach(element);
```

Détruisez le gestionnaire en même temps que son écran :

```ts
await paidHandle.remove();
await nativeAds.destroy();
```

## Expérimentations d’intégration du défilement virtuel

Le cycle de vie fondé sur une clé stable est conçu pour une validation ultérieure avec le défilement virtuel d’Angular CDK, React Virtuoso et Vue Virtual Scroller. Ces intégrations sont des exemples destinés à l’expérimentation, et non une garantie de prise en charge :

- Placez l’identifiant logique de l’annonce dans `slot-key` (liaison Angular, prop/ref React ou `:slot-key` Vue). N’utilisez jamais l’indice de rendu.
- Conservez une hauteur fixe pour la ligne publicitaire et incluez cette hauteur dans le calcul de la taille des éléments du composant de défilement virtuel.
- Lorsqu’une bibliothèque recycle une ligne, mettez à jour la clé ou appelez `detach` avant d’appeler `attach` avec la nouvelle clé. Le plugin masque l’ancienne génération avant de charger ou d’afficher la nouvelle.
- Utilisez une seule racine de défilement vertical. Les conteneurs de défilement imbriqués, les listes virtuelles horizontales, les ancêtres avec positionnement sticky ou transformation et les hauteurs de ligne animées ne font pas partie du périmètre initial de prise en charge.

Avec Angular, ajoutez `CUSTOM_ELEMENTS_SCHEMA` au composant standalone ou au NgModule qui contient le flux, puis liez les attributs (et non les propriétés) dans la ligne virtuelle :

```html
<capacitor-admob-native feed-id="home-feed" [attr.slot-key]="item.stableAdKey"></capacitor-admob-native>
```

Avec React, `createElement` préserve la sûreté des types des attributs personnalisés dont les mots sont séparés par des tirets, sans ajouter de dépendance au framework dans le plugin :

```tsx
import { createElement } from 'react';

const NativeAdRow = ({ slotKey }: { slotKey: string }) =>
  createElement('capacitor-admob-native', {
    'feed-id': 'home-feed',
    'slot-key': slotKey,
  });
```

Avec Vue, déclarez la balise comme élément personnalisé dans le compilateur Vue et liez la clé stable :

```ts
// vite.config.ts
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'capacitor-admob-native',
    },
  },
});
```

```html
<capacitor-admob-native feed-id="home-feed" :slot-key="item.stableAdKey" />
```

Utilisez un conteneur HTML classique avec `overflow: auto` ou `ion-content` d’Ionic ; Android ne nécessite aucune option propre au défilement. Les annonces suivent l’emplacement et ses limites de découpage, mais peuvent prendre du retard lors d’un défilement rapide. Les nouvelles annonces se chargent une fois le défilement stabilisé.

Un flux conserve au maximum trois annonces natives, y compris celles des emplacements attachés hors écran ; les emplacements visibles supplémentaires attendent qu’une place se libère. Au maximum deux gestionnaires de flux peuvent être actifs. Les annonces ne sont pas actualisées automatiquement et les chargements échoués ne sont pas relancés silencieusement. Appelez `reload(slotKey)` uniquement à un moment explicite de nouvelle tentative ou d’actualisation défini par votre produit.

## Cycle de vie de la mise en page et des vues superposées

Appelez `invalidateLayout()` après une modification de la mise en page déclenchée par l’application qui peut déplacer un emplacement sans défilement, par exemple l’ouverture d’un accordéon. Les changements de taille des emplacements et les événements de chargement d’image interceptés sont détectés automatiquement.

Les annonces natives se trouvent au-dessus du contenu de la WebView et ne peuvent pas détecter qu’une modale Ionic, un popover, un menu, un indicateur de chargement ou une transition de route recouvre l’emplacement. Masquez le flux avant de présenter une vue superposée et réactivez-le après sa fermeture :

```ts
await nativeAds.pause();
await modal.present();
await modal.onDidDismiss();
nativeAds.resume();
```

Appelez `destroy()` lorsque vous quittez un écran. Attendez la résolution de `pause()` avant de présenter une vue superposée ; la Promise est rejetée si la mise à jour native de masquage échoue. `resume()` attend que la zone d’affichage se stabilise avant de réafficher les emplacements admissibles. De même, `invalidateLayout()` ne se résout qu’une fois l’ancien placement masqué.

## API

| Membre                                         | Rôle                                                        |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `NativeAdFeed.create(options)`                 | Démarre une session de flux natif. Rejette la Promise hors d’iOS et Android. |
| `feedId`                                       | Identifiant de flux normalisé utilisé par l’élément personnalisé.         |
| `addListener(event, listener)`                 | Ajoute un écouteur filtré pour cette session de flux.                 |
| `attach(slotKey, element)` / `detach(element)` | Cycle de vie avancé pour un élément ordinaire.                    |
| `reload(slotKey)`                              | Supprime et recharge explicitement un emplacement enregistré.            |
| `pause(): Promise<void>` / `resume(): void`    | Masque les placements pendant l’affichage de vues Web superposées ou lorsque la page est inactive.  |
| `invalidateLayout(): Promise<void>`            | Masque et mesure à nouveau après un recalcul de la mise en page déclenché par l’application.       |
| `destroy()`                                    | Supprime les écouteurs et toutes les ressources natives de la session.    |

`NativeAdFeedOptions` contient `feedId`, `adId`, `template`, `style`, `isTesting`, `npa` et l’option iOS facultative `scrollElement`. Définissez `isTesting: true` pour utiliser le bloc d’annonces de test Google de la plateforme. Pour les annonces de production, définissez l’identifiant de votre bloc d’annonces natives propre à la plateforme dans `adId` et omettez `isTesting` ou définissez-le à `false`. `adId` est obligatoire sauf si `isTesting` vaut `true`. `feedId` et chaque `slotKey` doivent être non vides et stables ; réutilisez les mêmes identifiants de flux lors des rechargements de la WebView afin de remplacer les sessions natives obsolètes en toute sécurité.

## Périmètre du rendu et des règles publicitaires

Les modèles `Small` et `Medium`, l’identification publicitaire, AdChoices, les médias et l’enregistrement des éléments cliquables sont gérés par le plugin. L’API publique de style expose volontairement un ensemble limité de paramètres communs aux plateformes, plutôt que des mises en page natives arbitraires ou un rendu des éléments en HTML. Le traitement des impressions et des clics du SDK Google reste ainsi dans le SDK natif.

Les couleurs de style utilisent des valeurs au format CSS `#RRGGBB` ou `#RRGGBBAA` sur les deux plateformes. Les dimensions utilisent des pixels logiques ; les tailles de police utilisent des points sur iOS et des `sp` sur Android. Les couleurs invalides sont remplacées par les valeurs par défaut du modèle. Les dimensions négatives sont ramenées à zéro ; les tailles de police du titre, du corps et de l’appel à l’action sont limitées respectivement aux plages `12–24`, `10–18` et `12–18`.

Respectez les règles de Google relatives aux annonces natives et ses consignes d’implémentation pour [Android](https://developers.google.com/admob/android/native/advanced) et [iOS](https://developers.google.com/admob/ios/native/advanced).

## Conteneur de défilement iOS

Pour un conteneur de défilement Ionic unique, passez son élément de défilement réel lors de la création du flux :

```ts
const feed = await NativeAdFeed.create({
  feedId: 'articles',
  isTesting: true,
  scrollElement: await ionContent.getScrollElement(),
});
```

Sur iOS, la définition de `scrollElement` active le suivi natif expérimental du défilement pour ce conteneur. Les changements de mise en page nécessitent toujours une nouvelle mesure ; appelez `invalidateLayout()` après les changements déclenchés par l’application. Le découpage à l’intérieur du conteneur de défilement et à ses limites visibles est conservé. `pause()` et `destroy()` arrêtent le suivi. Les autres plateformes ignorent cette option et conservent les mises à jour des coordonnées en JavaScript.

Si le conteneur indiqué ne peut pas être identifié sans ambiguïté, la mise à jour échoue et ses annonces restent masquées. Utilisez un seul conteneur de défilement avec débordement, sans transformation ni zoom ; le défilement imbriqué, le défilement du document par cette option et les intégrations de défilement virtuel ne sont pas pris en charge. Cela ne modifie pas l’acheminement des gestes de balayage commencés sur une annonce.
