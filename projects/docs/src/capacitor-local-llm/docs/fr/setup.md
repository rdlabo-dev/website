---
title: "Configuration"
sourceRevision: "fe423815dc126915a0ef7a7673e4b6997a2926dd0f77704bb29ca5f7e48e1a26"
---
# Configuration

Prérequis des plateformes et configuration des projets natifs pour iOS et Android. Guides associés : [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

## Prérequis des plateformes

| Plateforme | Version minimale du système              | Remarques                                                                                                                                                                  |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | **18.4**                | La génération d’images nécessite iOS 18.4+. Le LLM textuel nécessite iOS 26+. L’analyse d’images utilise `Attachment` de Foundation Models sur iOS 27+ lorsque le plugin est compilé avec Xcode 27 / Swift 6.4. |
| Android  | **API 29 (Android 10)** | Gemini Nano via ML Kit nécessite un appareil physique compatible (par exemple Pixel 9+).                                                                                          |

## Configuration iOS

Les utilisateurs de CocoaPods n’ont besoin d’aucune configuration supplémentaire. Foundation Models et Image Playground sont des frameworks système disponibles automatiquement sur les appareils compatibles où Apple Intelligence est activé.

Pour les projets Capacitor utilisant Swift Package Manager, la CLI Capacitor actuelle génère `CapApp-SPM/Package.swift` avec une cible de déploiement iOS 18.0 et ne conserve pas la version mineure requise. Après chaque `npx cap sync ios`, modifiez la déclaration de plateforme en `platforms: [.iOS("18.4")]`. L’application d’exemple fournie automatise cette opération avec `npm run cap:sync` ; consultez [`example-app/scripts/sync-capacitor.mjs`](https://github.com/rdlabo-dev/capacitor-local-llm/blob/v2.2.0/example-app/scripts/sync-capacitor.mjs) pour ce petit script qui échoue immédiatement en cas d’anomalie.

Appelez [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) à l’exécution pour vérifier que le modèle textuel est prêt avant de créer des conversations ou de générer du texte. Vérifiez séparément [`getImageAnalysisAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getimageanalysisavailability) avant de fournir des images, car la disponibilité du texte et de la vision peut différer. Consultez [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images) pour les détails de l’analyse d’images.

Sur les versions d’iOS antérieures à 26, seul `getAvailability()` signale `'device-not-eligible'` pour le LLM textuel. Les API textuelles et de conversation telles que `createChat()`, `deleteChat()`, `generateText()` et `streamText()` sont rejetées avec `LOCAL_LLM_UNSUPPORTED`. La génération d’images via `generateImage()` est disponible sur iOS 18.4+.

[`downloadModel()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#downloadmodel) n’est pas disponible sur iOS — le système gère le modèle. Utilisez `getAvailability()` ou l’événement `availabilityChange` pour observer sa disponibilité.

## Configuration Android

Le SDK Android minimal du plugin est **29**, supérieur à la valeur par défaut actuelle de Capacitor (24). Mettez à jour `android/variables.gradle` dans votre application :

```gradle
ext {
    minSdkVersion = 29
}
```

Gemini Nano est distribué via Google Play Services et doit être téléchargé sur l’appareil avant utilisation. Le modèle n’est pas inclus dans votre application.

Lorsque Gemini Nano est indisponible, les applications peuvent configurer explicitement un repli LiteRT-LM. Consultez [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback).

### Vérifier la disponibilité et télécharger

Appelez [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) pour examiner l’état actuel. Si l’état est `downloadable`, lancez le téléchargement avec [`downloadModel()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#downloadmodel) et écoutez `downloadProgress` et/ou `availabilityChange` jusqu’à ce que l’état devienne `available`.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const availabilityListener = await LocalLLM.addListener('availabilityChange', ({ status }) => {
  console.log('availability:', status);
});

const progressListener = await LocalLLM.addListener('downloadProgress', (event) => {
  if (event.progress != null) {
    console.log('download progress:', event.progress);
  } else if (event.downloadedBytes != null) {
    console.log('downloaded bytes:', event.downloadedBytes);
  }
});

const { status } = await LocalLLM.getAvailability();

if (status === 'downloadable') {
  await LocalLLM.downloadModel();
}

await availabilityListener.remove();
await progressListener.remove();
```

## Configuration Web

Les navigateurs Chrome compatibles sur ordinateur génèrent du texte via la Prompt API intégrée. Consultez [Configuration et limites du Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web). Exécutez `npm run dev` dans `example-app` pour tester sur localhost.
