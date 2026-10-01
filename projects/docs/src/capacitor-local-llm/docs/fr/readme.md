---
title: "Premiers pas"
sourceRevision: "d921281192149a6b472b0a26e7762cc6b1d142b1e8177893aaac41c0d08ce72a"
---
# @rdlabo/capacitor-local-llm

Générez de courtes réponses textuelles sur l’appareil dans une application Capacitor, sans clé API ; les prompts et les réponses restent sur l’appareil. iOS utilise Apple Intelligence (Foundation Models), Android utilise Gemini Nano et les versions compatibles de Chrome sur ordinateur utilisent la Prompt API intégrée. Sur Android, le téléchargement du modèle Gemini Nano via `downloadModel()` peut utiliser le réseau.

> **Remarque :** les LLM sur l’appareil nécessitent du matériel physique. Les émulateurs Android ne sont pas pris en charge. Les simulateurs iOS le sont si le Mac hôte prend en charge Apple Intelligence et que cette fonction est activée.

## Installer

```bash
npm install @rdlabo/capacitor-local-llm
npx cap sync
```

Nécessite Capacitor 8 ou une version ultérieure. La génération de texte fonctionne aussi dans les navigateurs Chrome compatibles sur ordinateur via la Prompt API intégrée. Consultez [Configuration Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web) pour les prérequis et les limites.

## Résumé des plateformes

| Plateforme | Version minimale du système              | Remarques                                                                                                                                                                  |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | **18.4**                | La génération d’images nécessite iOS 18.4+. Le LLM textuel nécessite iOS 26+. L’analyse d’images utilise `Attachment` de Foundation Models sur iOS 27+ lorsque le plugin est compilé avec Xcode 27 / Swift 6.4. |
| Android  | **API 29 (Android 10)** | Gemini Nano via ML Kit nécessite un appareil physique compatible (par exemple Pixel 9+).                                                                                          |

La configuration des projets natifs (cible de déploiement SPM, `minSdkVersion` et téléchargement du modèle) figure dans [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup).

## Démarrage rapide

Après [Installation](/docs/readme#install) et [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup) (ou [Configuration Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web) dans Chrome), vérifiez la disponibilité, créez une conversation et générez du texte. Si l’état n’est pas `available` (par exemple `downloadable`), suivez [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup) ou le parcours de téléchargement Chrome dans [Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web) avant de réessayer — une erreur levée à ce stade ne signifie pas que le démarrage rapide est terminé.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { status } = await LocalLLM.getAvailability();
if (status !== 'available') {
  throw new Error(`Model not ready: ${status}`);
}

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'You are a helpful assistant.',
});

try {
  const { text } = await LocalLLM.generateText({
    chatId,
    prompt: 'What is the capital of France?',
  });
  console.log(text);
} finally {
  await LocalLLM.deleteChat({ id: chatId });
}
```

La réussite se traduit par une réponse textuelle consignée dans les journaux et la fin de `deleteChat`. La formulation exacte dépend du modèle. Streaming, annulation et préchauffage : [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat). Entrée et génération d’images : [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

## Documentation

- [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup) — prérequis des plateformes, cible SPM iOS, `minSdkVersion` Android et téléchargement de Gemini Nano.
- [Modèle de repli Android](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback) — LiteRT-LM lorsque Gemini Nano est indisponible.
- [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability) — valeurs d’état et comportement des plateformes.
- [Conversations](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat) — cycle de vie, streaming, annulation et préchauffage.
- [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images) — analyse d’images (iOS / Android) et génération d’images (iOS).
- [Événements](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/events) — disponibilité, téléchargement, fragments de texte et cycle de vie des générations.
- [Migration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/migration) — API v1 obsolètes et migration depuis le projet amont.
- [Gestion des erreurs](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors) — valeurs stables de `LocalLLMErrorCode`.

Les signatures des méthodes figurent dans la section API ci-dessous. Pour les indications API `Since` lors d’une mise à niveau entre versions, consultez [Migration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/migration) et la section API.

## Origine

Ce projet est un fork maintenu indépendamment de [`@capacitor/local-llm`](https://github.com/ionic-team/capacitor-local-llm) d’Ionic, fondé sur la version amont 1.0.0 au commit [`5bceb55`](https://github.com/ionic-team/capacitor-local-llm/commit/5bceb559ed19382efc71df2f918d290ca419d282). Ce n’est pas un package officiel Ionic ou Capacitor ; il n’est ni affilié à Ionic ni pris en charge par Ionic.

<!-- rdlabo-docs-omit -->

## Support et maintenance

Signalez les bugs et questions propres au fork dans le [suivi des issues rdlabo-dev](https://github.com/rdlabo-dev/capacitor-local-llm/issues), pas à Ionic. Lorsqu’un problème est confirmé dans le projet amont, les mainteneurs du fork peuvent proposer le correctif à Ionic. Avant une mise en production, validez le streaming, l’annulation, la disponibilité et le téléchargement du modèle sur les appareils physiques pris en charge par votre application.

Mainteneurs : consultez [Publication](/docs/releasing) pour npm Trusted Publishing et les canaux de publication.

<!-- /rdlabo-docs-omit -->

## API

<docgen-index>

* [`getAvailability()`](/docs/readme#getavailability)
* [`getImageAnalysisAvailability()`](/docs/readme#getimageanalysisavailability)
* [`downloadModel()`](/docs/readme#downloadmodel)
* [`configureFallbackModel(...)`](/docs/readme#configurefallbackmodel)
* [`warmup(...)`](/docs/readme#warmup)
* [`createChat(...)`](/docs/readme#createchat)
* [`deleteChat(...)`](/docs/readme#deletechat)
* [`generateText(...)`](/docs/readme#generatetext)
* [`streamText(...)`](/docs/readme#streamtext)
* [`cancelGeneration(...)`](/docs/readme#cancelgeneration)
* [`addListener('availabilityChange', ...)`](/docs/readme#addlisteneravailabilitychange-)
* [`addListener('systemAvailabilityChange', ...)`](/docs/readme#addlistenersystemavailabilitychange-)
* [`addListener('downloadProgress', ...)`](/docs/readme#addlistenerdownloadprogress-)
* [`addListener('textChunk', ...)`](/docs/readme#addlistenertextchunk-)
* [`addListener('generationStateChange', ...)`](/docs/readme#addlistenergenerationstatechange-)
* [`removeAllListeners()`](/docs/readme#removealllisteners)
* [`generateImage(...)`](/docs/readme#generateimage)
* [`systemAvailability()`](/docs/readme#systemavailability)
* [`download()`](/docs/readme#download)
* [`prompt(...)`](/docs/readme#prompt)
* [`endSession(...)`](/docs/readme#endsession)
* [Interfaces](/docs/readme#interfaces)
* [Alias de types](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Contrat public du plugin LLM sur l’appareil.

### getAvailability()

```typescript
getAvailability() => Promise<GetAvailabilityResult>
```

Renvoie la disponibilité détaillée du modèle de texte. Le Web détecte la prise en charge de la Prompt API de Chrome ; les navigateurs incompatibles renvoient `unavailable`.

**Renvoie :** <code>Promise&lt;<a href="#getavailabilityresult">GetAvailabilityResult</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### getImageAnalysisAvailability()

```typescript
getImageAnalysisAvailability() => Promise<GetImageAnalysisAvailabilityResult>
```

Renvoie la disponibilité de l’analyse d’images et le backend natif qui traiterait les images d’entrée.
Sur les builds iOS 27 compilés avec Xcode 27 / Swift 6.4, renvoie le `status` du modèle de texte, ainsi que `backend: 'foundation-models'` et `maxImages: 4`. Les builds réalisés avec un ancien Xcode signalent `unavailable` et ne peuvent pas inclure la prise en charge de la vision iOS 27. Android signale les API de prompt Gemini Nano ou un repli LiteRT-LM configuré. Le Web signale actuellement `unavailable` pour l’analyse d’images.

**Renvoie :** <code>Promise&lt;<a href="#getimageanalysisavailabilityresult">GetImageAnalysisAvailabilityResult</a>&gt;</code>

**Depuis :** 2.1.0

--------------------


### downloadModel()

```typescript
downloadModel() => Promise<void>
```

Lance le téléchargement du modèle sur Android ou Chrome Web. Sur le Web, appelez cette méthode depuis un geste utilisateur ; Chrome gère le modèle.

**Depuis :** 2.0.0

--------------------


### configureFallbackModel(...)

```typescript
configureFallbackModel(options: ConfigureFallbackModelOptions) => Promise<void>
```

Initialise un modèle de repli LiteRT-LM explicite sur Android. Gemini Nano reste prioritaire lorsqu’il est disponible.
La configuration d’un modèle effectue des entrées/sorties sur des fichiers locaux et peut prendre un temps important. iOS et le Web rejettent cette API.

| Paramètre         | Type                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#configurefallbackmodeloptions">ConfigureFallbackModelOptions</a></code> |

**Depuis :** 2.0.0

--------------------


### warmup(...)

```typescript
warmup(options?: WarmupOptions | undefined) => Promise<void>
```

Préchauffe les ressources du modèle. Le Web crée puis détruit une session textuelle temporaire ; `promptPrefix` est réservé à iOS.

| Paramètre         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#warmupoptions">WarmupOptions</a></code> |

**Depuis :** 1.0.0

--------------------


### createChat(...)

```typescript
createChat(options?: CreateChatOptions | undefined) => Promise<CreateChatResult>
```

Crée un chat géré par le plugin jusqu’à sa suppression.

| Paramètre         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#createchatoptions">CreateChatOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#createchatresult">CreateChatResult</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### deleteChat(...)

```typescript
deleteChat(options: DeleteChatOptions) => Promise<void>
```

Supprime un chat et annule sa génération.

| Paramètre         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#deletechatoptions">DeleteChatOptions</a></code> |

**Depuis :** 2.0.0

--------------------


### generateText(...)

```typescript
generateText(options: GenerateTextOptions) => Promise<GenerateTextResult>
```

Génère un texte complet.

| Paramètre         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#generatetextoptions">GenerateTextOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#generatetextresult">GenerateTextResult</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### streamText(...)

```typescript
streamText(options: StreamTextOptions) => Promise<StreamTextResult>
```

Diffuse les fragments natifs en continu et renvoie le texte complet.

| Paramètre         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#generatetextoptions">GenerateTextOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#generatetextresult">GenerateTextResult</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### cancelGeneration(...)

```typescript
cancelGeneration(options: CancelGenerationOptions) => Promise<void>
```

Annule une génération en cours.

| Paramètre         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#cancelgenerationoptions">CancelGenerationOptions</a></code> |

**Depuis :** 2.0.0

--------------------


### addListener('availabilityChange', ...)

```typescript
addListener(eventName: 'availabilityChange', listenerFunc: AvailabilityChangeListener) => Promise<PluginListenerHandle>
```

Écoute les changements de disponibilité. Le Web émet les changements observés pendant les vérifications de disponibilité ainsi que la création et le téléchargement de sessions.

| Paramètre              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'availabilityChange'</code>                                                 |
| **`listenerFunc`** | <code><a href="#availabilitychangelistener">AvailabilityChangeListener</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### addListener('systemAvailabilityChange', ...)

```typescript
addListener(eventName: 'systemAvailabilityChange', listenerFunc: SystemAvailabilityChangeListener) => Promise<PluginListenerHandle>
```

| Paramètre              | Type                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'systemAvailabilityChange'</code>                                                       |
| **`listenerFunc`** | <code><a href="#systemavailabilitychangelistener">SystemAvailabilityChangeListener</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 1.0.0

--------------------


### addListener('downloadProgress', ...)

```typescript
addListener(eventName: 'downloadProgress', listenerFunc: DownloadProgressListener) => Promise<PluginListenerHandle>
```

Écoute la progression du téléchargement sur Android ou Chrome Web.

| Paramètre              | Type                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **`eventName`**    | <code>'downloadProgress'</code>                                               |
| **`listenerFunc`** | <code><a href="#downloadprogresslistener">DownloadProgressListener</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### addListener('textChunk', ...)

```typescript
addListener(eventName: 'textChunk', listenerFunc: TextChunkListener) => Promise<PluginListenerHandle>
```

Écoute les fragments de texte natifs.

| Paramètre              | Type                                                            |
| ------------------ | --------------------------------------------------------------- |
| **`eventName`**    | <code>'textChunk'</code>                                        |
| **`listenerFunc`** | <code><a href="#textchunklistener">TextChunkListener</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 2.0.0

--------------------


### addListener('generationStateChange', ...)

```typescript
addListener(eventName: 'generationStateChange', listenerFunc: GenerationStateChangeListener) => Promise<PluginListenerHandle>
```

Écoute le démarrage, la fin, l’annulation et l’échec de la génération.

| Paramètre              | Type                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'generationStateChange'</code>                                                    |
| **`listenerFunc`** | <code><a href="#generationstatechangelistener">GenerationStateChangeListener</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Depuis :** 2.1.0

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

Supprime tous les écouteurs du plugin.

**Depuis :** 1.0.0

--------------------


### generateImage(...)

```typescript
generateImage(options: GenerateImageOptions) => Promise<GenerateImageResponse>
```

Génère des images PNG sur iOS.

| Paramètre         | Type                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code><a href="#generateimageoptions">GenerateImageOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#generateimageresponse">GenerateImageResponse</a>&gt;</code>

**Depuis :** 1.0.0

--------------------


### systemAvailability()

```typescript
systemAvailability() => Promise<SystemAvailabilityResponse>
```

**Renvoie :** <code>Promise&lt;<a href="#systemavailabilityresponse">SystemAvailabilityResponse</a>&gt;</code>

**Depuis :** 1.0.0

--------------------


### download()

```typescript
download() => Promise<void>
```

**Depuis :** 1.0.0

--------------------


### prompt(...)

```typescript
prompt(options: PromptOptions) => Promise<PromptResponse>
```

| Paramètre         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#promptoptions">PromptOptions</a></code> |

**Renvoie :** <code>Promise&lt;<a href="#promptresponse">PromptResponse</a>&gt;</code>

**Depuis :** 1.0.0

--------------------


### endSession(...)

```typescript
endSession(options: EndSessionOptions) => Promise<void>
```

Termine une session de l’ancienne API. Les identifiants de sessions déjà terminées ou inconnues aboutissent sans effet.

| Paramètre         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#endsessionoptions">EndSessionOptions</a></code> |

**Depuis :** 1.0.0

--------------------


### Interfaces


#### GetAvailabilityResult

Résultat renvoyé par les vérifications de disponibilité.

| Propriété         | Type                                                  | Description                      | Depuis |
| ------------ | ----------------------------------------------------- | -------------------------------- | ----- |
| **`status`** | <code><a href="#availability">Availability</a></code> | Disponibilité actuelle du modèle de texte. | 2.0.0 |


#### GetImageAnalysisAvailabilityResult

Résultat renvoyé par les vérifications de disponibilité de l’analyse d’images.

| Propriété            | Type                                                                  | Description                                                       | Depuis |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| **`status`**    | <code><a href="#availability">Availability</a></code>                 | Disponibilité actuelle de l’analyse d’images.                              | 2.1.0 |
| **`backend`**   | <code><a href="#imageanalysisbackend">ImageAnalysisBackend</a></code> | Backend natif qui traiterait l’analyse d’images si elle était disponible.   | 2.1.0 |
| **`maxImages`** | <code>number</code>                                                   | Nombre maximal d’images accepté dans une génération par le backend actif. | 2.1.0 |


#### ConfigureFallbackModelOptions

Configure un repli facultatif vers LiteRT-LM sur Android lorsque Gemini Nano n’est pas disponible.
Le modèle doit déjà exister comme ressource de l’application ou comme fichier lisible géré par celle-ci. iOS et le Web rejettent cette API.

| Propriété                 | Type                 | Description                                                                                               | Depuis |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| **`path`**           | <code>string</code>  | Chemin du modèle `.litertlm`. Utilisez `/android_asset/...` pour les ressources intégrées ou un chemin absolu de fichier géré par l’application. | 2.0.0 |
| **`maxTokens`**      | <code>number</code>  | Capacité totale du contexte transmise à LiteRT-LM. Valeur par défaut : 4096.                                          | 2.0.0 |
| **`maxImages`**      | <code>number</code>  | Nombre maximal d’images accepté par génération pour un modèle doté de capacités de vision. Valeur par défaut : 1.                      | 2.0.0 |
| **`supportsImages`** | <code>boolean</code> | Initialise le pipeline de vision LiteRT-LM. Valeur par défaut : `true` ; utilisez `false` uniquement pour un modèle exclusivement textuel.   | 2.0.0 |


#### WarmupOptions

Options de préchauffage. Android effectue un préchauffage global du modèle ; iOS peut préchauffer un chat.
Le Web crée puis libère une session temporaire, éventuellement avec le contexte d’un chat.

| Propriété               | Type                | Description                                                                  | Depuis |
| ------------------ | ------------------- | ---------------------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Identifiant explicite du chat à préchauffer sur iOS ou à utiliser comme contexte du préchauffage Web. | 2.0.0 |
| **`sessionId`**    | <code>string</code> |                                                                              | 1.0.0 |
| **`promptPrefix`** | <code>string</code> | Préfixe de prompt facultatif utilisé par Foundation Models.                            | 1.0.0 |


#### CreateChatResult

Résultat contenant l’identifiant du chat géré par le plugin.

| Propriété     | Type                | Description                                           | Depuis |
| -------- | ------------------- | ----------------------------------------------------- | ----- |
| **`id`** | <code>string</code> | Identifiant requis pour les appels de génération et de suppression. | 2.0.0 |


#### CreateChatOptions

Options de création d’un chat géré par le plugin.

| Propriété               | Type                                                              | Description                                      | Depuis |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------ | ----- |
| **`instructions`** | <code>string</code>                                               | Instructions système persistantes pour ce chat.    | 2.0.0 |
| **`history`**      | <code><a href="#chathistoryoptions">ChatHistoryOptions</a></code> | Limites d’historique appliquées sur iOS, Android et le Web. | 2.0.0 |


#### ChatHistoryOptions

Limites de l’historique du chat. Toutes les implémentations conservent les instructions et suppriment les échanges complets les plus anciens.

| Propriété                | Type                | Description                                             | Depuis |
| ------------------- | ------------------- | ------------------------------------------------------- | ----- |
| **`maxMessages`**   | <code>number</code> | Nombre maximal de messages conservés. Valeur par défaut : 20.              | 2.0.0 |
| **`maxCharacters`** | <code>number</code> | Nombre maximal de caractères conservés dans les messages. Valeur par défaut : 12000. | 2.0.0 |


#### DeleteChatOptions

Options de suppression d’un chat.

| Propriété     | Type                | Description                                 | Depuis |
| -------- | ------------------- | ------------------------------------------- | ----- |
| **`id`** | <code>string</code> | Identifiant de chat renvoyé par `createChat()`. | 2.0.0 |


#### GenerateTextResult

Résultat d’une génération de texte.

| Propriété               | Type                | Description                                                  | Depuis |
| ------------------ | ------------------- | ------------------------------------------------------------ | ----- |
| **`text`**         | <code>string</code> | Texte généré complet.                                     | 2.0.0 |
| **`generationId`** | <code>string</code> | Identifiant permettant d’associer les diagnostics à une génération. | 2.0.0 |


#### GenerateTextOptions

Options d’une génération sans diffusion en continu.

| Propriété             | Type                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Depuis |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`chatId`**     | <code>string</code>                                             | Identifiant de chat renvoyé par `createChat()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2.0.0 |
| **`prompt`**     | <code>string</code>                                             | Prompt de l’utilisateur.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2.0.0 |
| **`images`**     | <code>ImageInput[]</code>                                       | Images fournies à un backend doté de capacités de vision. Sur iOS 27 et versions ultérieures (builds compilés avec Xcode 27 / Swift 6.4), Foundation Models `Attachment` accepte jusqu’à 4 images de 32 MiB maximum chacune, via des chemins absolus lisibles, des URL `file://`, du Base64 brut ou des URL de données Base64. Après une génération réussie, les pièces jointes sont supprimées de l’historique conservé, tandis que le prompt textuel et la réponse sont maintenus. Android utilise les API de prompt Gemini Nano ou un repli LiteRT-LM configuré avec des entrées absolues/`file://`/`content://`/Base64 et les limites de pixels cumulés de ML Kit. Le Web et les backends uniquement textuels rejettent les images d’entrée avec `LOCAL_LLM_UNSUPPORTED`. | 2.1.0 |
| **`imagePaths`** | <code>string[]</code>                                           | Chemins d’images locales fournis à un modèle de repli LiteRT-LM Android doté de capacités de vision. Les chemins absolus, les URL `file://` et les URI `content://` lisibles sont acceptés. Ce parcours de compatibilité conserve le routage LiteRT-LM de la version 2.0, même lorsque ML Kit est disponible.                                                                                                                                                                                                                                                                                                                                                                               | 2.0.0 |
| **`options`**    | <code><a href="#generationoptions">GenerationOptions</a></code> | Paramètres facultatifs de génération.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2.0.0 |


#### ImageUriInput

Image d’entrée sous forme d’URI locale.

| Propriété         | Type                | Description                                                                                                                                     | Depuis |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`uri`**    | <code>string</code> | URI de l’image. iOS accepte les chemins locaux absolus lisibles et les URL `file://`. Android accepte les chemins absolus, les URL `file://` et les URI `content://`. | 2.1.0 |
| **`base64`** |                     | Les entrées base64 et URI s’excluent mutuellement.                                                                                                   | 2.1.0 |


#### Base64ImageInput

Image d’entrée encodée en base64.

| Propriété         | Type                | Description                                                                                            | Depuis |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| **`base64`** | <code>string</code> | Octets d’image en Base64 brut ou URL `data:image/...;base64,...`. L’image décodée ne doit pas dépasser 32 MiB. | 2.1.0 |
| **`uri`**    |                     | Les entrées base64 et URI s’excluent mutuellement.                                                          | 2.1.0 |


#### GenerationOptions

Paramètres multiplateformes de génération de texte. Les valeurs non prises en charge sont rejetées, et non ramenées dans les limites autorisées. Sur Chrome Web, ces paramètres doivent être omis.

| Propriété                  | Type                | Description                            | Depuis |
| --------------------- | ------------------- | -------------------------------------- | ----- |
| **`temperature`**     | <code>number</code> | Température d’échantillonnage.                  | 2.0.0 |
| **`topK`**            | <code>number</code> | Échantillonne parmi les k tokens les plus probables. | 2.0.0 |
| **`maxOutputTokens`** | <code>number</code> | Nombre maximal de tokens générés.              | 2.0.0 |


#### CancelGenerationOptions

Options d’annulation d’une génération en cours.

| Propriété               | Type                | Description                                                         | Depuis |
| ------------------ | ------------------- | ------------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Chat auquel appartient la génération.                                      | 2.0.0 |
| **`generationId`** | <code>string</code> | Identifiant facultatif de génération ; une discordance est traitée comme un résultat introuvable. | 2.0.0 |


#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### SystemAvailabilityResponse

| Propriété         | Type                                                        | Description                                                                                  | Depuis |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- |
| **`status`** | <code><a href="#llmavailability">LLMAvailability</a></code> | Valeur de disponibilité de l’ancienne API. Les états détaillés sont ramenés au contrat d’origine à quatre valeurs. | 1.0.0 |


#### DownloadProgressEvent

Progression du téléchargement du modèle. Les événements intermédiaires Android omettent `progress`, car ML Kit ne fournit pas le nombre total d’octets.

| Propriété                  | Type                | Description                                                                 | Depuis |
| --------------------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **`progress`**        | <code>number</code> | Progression normalisée connue : 0 au début et 1 à la fin.                  | 2.0.0 |
| **`downloadedBytes`** | <code>number</code> | Nombre d’octets téléchargés jusqu’à présent, lorsqu’il est fourni par ML Kit.                            | 2.0.0 |
| **`totalBytes`**      | <code>number</code> | Nombre total d’octets, lorsqu’un SDK de plateforme le fournit. Actuellement omis sur Android. | 2.0.0 |


#### TextChunkEvent

Texte incrémental émis par `streamText()`.

| Propriété               | Type                | Description                                              | Depuis |
| ------------------ | ------------------- | -------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Chat auquel appartient la génération.                           | 2.0.0 |
| **`generationId`** | <code>string</code> | Identifiant de cette génération.                           | 2.0.0 |
| **`text`**         | <code>string</code> | Texte nouvellement généré uniquement, sans l’instantané cumulé. | 2.0.0 |


#### GenerationStateChangeEvent

Événement de cycle de vie émis pour `generateText()` et `streamText()`.

| Propriété               | Type                                                            | Description                                                       | Depuis |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code>                                             | Chat auquel appartient la génération.                                    | 2.1.0 |
| **`generationId`** | <code>string</code>                                             | Identifiant natif de génération, disponible dans l’événement `started`. | 2.1.0 |
| **`state`**        | <code><a href="#generationstate">GenerationState</a></code>     | État actuel du cycle de vie.                                          | 2.1.0 |
| **`errorCode`**    | <code><a href="#localllmerrorcode">LocalLLMErrorCode</a></code> | Code d’erreur stable pour les états `cancelled` et `failed`.            | 2.1.0 |


#### GenerateImageResponse

Résultat de la génération d’images.

| Propriété                  | Type                  | Description                                      | Depuis |
| --------------------- | --------------------- | ------------------------------------------------ | ----- |
| **`pngBase64Images`** | <code>string[]</code> | Images PNG en base64 brut, sans préfixe d’URI de données. | 1.0.0 |


#### GenerateImageOptions

Options de génération d’images. La génération d’images est disponible uniquement à partir d’iOS 18.4.

| Propriété               | Type                  | Description                          | Depuis |
| ------------------ | --------------------- | ------------------------------------ | ----- |
| **`prompt`**       | <code>string</code>   | Description de l’image.                   | 1.0.0 |
| **`promptImages`** | <code>string[]</code> | Images de référence facultatives en base64.    | 1.0.0 |
| **`count`**        | <code>number</code>   | Nombre de variantes. Valeur par défaut : 1. | 1.0.0 |


#### PromptResponse

Réponse au prompt de l’ancienne API.

| Propriété       | Type                | Description              | Depuis |
| ---------- | ------------------- | ------------------------ | ----- |
| **`text`** | <code>string</code> | Texte généré complet. | 1.0.0 |


#### PromptOptions

Options de prompt de l’ancienne API.

| Propriété               | Type                                              | Description                                                 | Depuis |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------- | ----- |
| **`sessionId`**    | <code>string</code>                               | Identifiant facultatif de session de l’ancienne API.                         | 1.0.0 |
| **`instructions`** | <code>string</code>                               | Instructions utilisées à la création initiale de la session de l’ancienne API. | 1.0.0 |
| **`options`**      | <code><a href="#llmoptions">LLMOptions</a></code> | Paramètres de génération de l’ancienne API.                                 | 1.0.0 |
| **`prompt`**       | <code>string</code>                               | Prompt de l’utilisateur.                                                | 1.0.0 |


#### LLMOptions

| Propriété                      | Type                | Description               | Depuis |
| ------------------------- | ------------------- | ------------------------- | ----- |
| **`temperature`**         | <code>number</code> | Température d’échantillonnage.     | 1.0.0 |
| **`maximumOutputTokens`** | <code>number</code> | Nombre maximal de tokens générés. | 1.0.0 |


#### EndSessionOptions

Options de suppression d’une session de l’ancienne API.

| Propriété            | Type                | Description                | Depuis |
| --------------- | ------------------- | -------------------------- | ----- |
| **`sessionId`** | <code>string</code> | Identifiant de session de l’ancienne API. | 1.0.0 |


### Alias de types


#### Availability

Disponibilité sémantique du modèle textuel sur l’appareil.

<code>'available' | 'device-not-eligible' | 'not-enabled' | 'downloadable' | 'downloading' | 'not-ready' | 'unavailable'</code>


#### ImageAnalysisBackend

Backend natif sélectionné pour l’analyse d’images sur l’appareil.

<code>'foundation-models' | 'ml-kit-prompt' | 'litert-lm'</code>


#### ImageInput

Référence d’image pour la génération de texte avec capacités de vision.

<code><a href="#imageuriinput">ImageUriInput</a> | <a href="#base64imageinput">Base64ImageInput</a></code>


#### StreamTextOptions

Options de génération native en streaming.

<code><a href="#generatetextoptions">GenerateTextOptions</a></code>


#### StreamTextResult

Résultat final d’une génération native en streaming.

<code><a href="#generatetextresult">GenerateTextResult</a></code>


#### AvailabilityChangeListener

Écouteur des changements de disponibilité.

<code>(event: <a href="#getavailabilityresult">GetAvailabilityResult</a>): void</code>


#### SystemAvailabilityChangeListener

<code>(event: <a href="#systemavailabilityresponse">SystemAvailabilityResponse</a>): void</code>


#### LLMAvailability

<code>'available' | 'unavailable' | 'notready' | 'downloadable'</code>


#### DownloadProgressListener

Écouteur de la progression du téléchargement du modèle.

<code>(event: <a href="#downloadprogressevent">DownloadProgressEvent</a>): void</code>


#### TextChunkListener

Écouteur des fragments de génération native.

<code>(event: <a href="#textchunkevent">TextChunkEvent</a>): void</code>


#### GenerationStateChangeListener

Écouteur des changements de cycle de vie de la génération native.

<code>(event: <a href="#generationstatechangeevent">GenerationStateChangeEvent</a>): void</code>


#### GenerationState

État du cycle de vie de la génération native.

<code>'started' | 'completed' | 'cancelled' | 'failed'</code>


#### LocalLLMErrorCode

Codes d’erreur stables de Local LLM.

<code>'LOCAL_LLM_NOT_AVAILABLE' | 'LOCAL_LLM_DEVICE_NOT_ELIGIBLE' | 'LOCAL_LLM_NOT_ENABLED' | 'LOCAL_LLM_MODEL_NOT_READY' | 'LOCAL_LLM_MODEL_DOWNLOAD_REQUIRED' | 'LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED' | 'LOCAL_LLM_CHAT_NOT_FOUND' | 'LOCAL_LLM_CHAT_BUSY' | 'LOCAL_LLM_GENERATION_NOT_FOUND' | 'LOCAL_LLM_GENERATION_CANCELLED' | 'LOCAL_LLM_INVALID_OPTIONS' | 'LOCAL_LLM_UNSUPPORTED' | 'LOCAL_LLM_IMAGE_NOT_READABLE' | 'LOCAL_LLM_IMAGE_TOO_LARGE' | 'LOCAL_LLM_GENERATION_FAILED' | 'LOCAL_LLM_IMAGE_GENERATION_FAILED' | 'LOCAL_LLM_UNKNOWN_ERROR'</code>

</docgen-api>
