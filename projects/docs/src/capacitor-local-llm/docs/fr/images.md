---
title: "Images"
sourceRevision: "5d7d548716c09c9a6cae9e5346d3f8c29762b522303fd28486d50bf1e0d7babb"
---
# Images

Analyse d’images (entrée visuelle) et génération d’images. Guides associés : [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat).

Vérifiez [`getImageAnalysisAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getimageanalysisavailability) séparément de [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) pour le modèle textuel avant de fournir des images, car la disponibilité du texte et de la vision peut différer.

## Analyse d’images

L’entrée `images` et `getImageAnalysisAvailability()` appartiennent à l’API `2.1.0`. Faites correspondre
la version du package installé à la [référence API](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api) ; le guide source ne
garantit pas la disponibilité de ces méthodes dans une ancienne version npm.

### iOS

L’analyse d’images utilise `Attachment` natif de Foundation Models sur iOS 27+ lorsque le plugin est compilé avec Xcode 27 / Swift 6.4. Chaque élément `images[]` accepte soit une `uri` locale lisible (`content://` est réservé à Android), soit du Base64 brut ou une URL de données Base64. Jusqu’à 4 images sont acceptées, chacune limitée à 32 MiB après décodage. Les entrées Base64 sont converties en fichiers natifs temporaires de taille limitée et supprimées après la génération. Dans les builds iOS 27, `getImageAnalysisAvailability()` renvoie le `status` du modèle textuel, avec `backend: 'foundation-models'` et `maxImages: 4` ; les builds réalisés avec une ancienne version de Xcode signalent `unavailable` et ne peuvent pas inclure la vision iOS 27. Vérifiez cette disponibilité séparément avant de joindre des images. Après une génération réussie, les pièces jointes d’image sont supprimées de l’historique conservé, tandis que le prompt textuel et la réponse restent.

### Android

L’analyse d’images sélectionne explicitement un backend natif. `getImageAnalysisAvailability()` signale `ml-kit-prompt` lorsque l’état de fonctionnalité commun de ML Kit Prompt est `available`, car cet état du SDK n’expose pas d’indicateur distinct de capacité visuelle. Il signale `litert-lm` lorsqu’un repli visuel configuré est prêt.

Les formats d’entrée d’image Android, les budgets de pixels ML Kit, le parcours expérimental multi-image, la compatibilité `imagePaths` et la configuration du repli visuel LiteRT-LM sont documentés dans [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback).

## Génération d’images (iOS uniquement)

La génération d’images est disponible sur iOS 18.4+ via `generateImage()`.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { pngBase64Images } = await LocalLLM.generateImage({
  prompt: 'A serene mountain lake at sunrise, photorealistic',
  count: 2,
});

const src = `data:image/png;base64,${pngBase64Images[0]}`;
```
