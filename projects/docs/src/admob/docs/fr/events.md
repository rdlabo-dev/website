---
title: "Événements publicitaires"
sourceRevision: "cedfb7741215f77c0e64973a79c00fceb2843105c495504800b90bec12e8d0b2"
---
# Événements publicitaires

Google documente ces callbacks de cycle de vie sur la page de chaque format, par exemple [événements des bannières](https://developers.google.com/admob/android/banner#ad_events). Ce plugin expose les mêmes étapes sous les noms du tableau ci-dessous, et non sous les noms des méthodes natives d’`AdListener`. Pour la charge utile des revenus, consultez [Revenus publicitaires par impression](https://developers.google.com/admob/android/impression-level-ad-revenue) ([iOS](https://developers.google.com/admob/ios/impression-level-ad-revenue)).

Enregistrez les écouteurs avant de charger ou d’afficher une annonce pour ne pas manquer les premiers événements de cycle de vie et d’impression.

## Ajouter et supprimer des écouteurs

`AdMob.addListener` renvoie un handle. Attendez l’enregistrement, puis appelez `remove()` lorsque l’écran qui le possède est détruit :

```ts
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';

const handle = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
  console.log('Banner loaded');
});

await handle.remove();
```

<!-- !::PluginListenerHandle:: -->

## Événements de cycle de vie communs

| Événement                     | Émis lorsque                                           |
| ------------------------- | ------------------------------------------------------ |
| `Loaded`                  | L’annonce a fini de se charger et est prête à être affichée.          |
| `FailedToLoad`            | L’annonce n’a pas pu se charger. Consultez `AdMobError` pour les détails. |
| `Showed` / `Opened`       | L’annonce est devenue visible pour l’utilisateur.                     |
| `FailedToShow`            | Une annonce chargée n’a pas pu s’afficher.                         |
| `Dismissed` / `Closed`    | L’utilisateur a fermé l’annonce plein écran ou la superposition.         |
| `Rewarded`                | L’utilisateur a obtenu la récompense annoncée.                 |
| `SizeChanged`             | Les dimensions de la bannière ont changé.                             |
| `AdImpression` / `AdPaid` | Une impression a été enregistrée. Consultez les événements de revenus ci-dessous.  |

## Erreurs

Les écouteurs `FailedToLoad` et `FailedToShow` reçoivent une charge utile `AdMobError`.

<!-- !::AdMobError:: -->

## Revenus par impression

Les formats plein écran émettent `AdMobRevenueData` via leur événement `AdImpression`. Les bannières émettent la même charge utile via `AdPaid`. L’événement `AdImpression` des bannières ne contient pas de charge utile ; il signale seulement l’enregistrement d’une impression.

<!-- !::AdMobRevenueData:: -->

## Guides par format

- [Annonces à l’ouverture](https://docs.rdlabo.dev/projects/capacitor-admob/docs/app-open)
- [Bannières](https://docs.rdlabo.dev/projects/capacitor-admob/docs/banner)
- [Annonces interstitielles](https://docs.rdlabo.dev/projects/capacitor-admob/docs/interstitial)
- [Annonces récompensées](https://docs.rdlabo.dev/projects/capacitor-admob/docs/rewarded)

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
