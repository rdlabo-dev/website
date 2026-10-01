---
title: "Premiers pas"
sourceRevision: "c98c9fd401157a5fa13c40f78a7ebaf6ab2fa6e014a977d824cf9403154e4b38"
---
# @rdlabo/capacitor-screenshot-event

<!-- rdlabo-docs-omit -->
[![version npm](https://badge.fury.io/js/@rdlabo%2Fcapacitor-screenshot-event.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-screenshot-event)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Informez votre application Capacitor après une capture d’écran de l’utilisateur.

Utilisez l’événement pour donner des indications après la capture ou mettre l’interface à jour, par exemple avec un toast ou une entrée de journal analytique. La notification arrive après la capture d’écran ; elle ne protège ni ne floute le contenu avant celle-ci.

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/capacitor-screenshot-event](https://docs.rdlabo.dev/projects/capacitor-screenshot-event)
<!-- /rdlabo-docs-omit -->

## Installer

```bash
npm install @rdlabo/capacitor-screenshot-event
npx cap sync
```

## Utilisation

Consultez [ScreenshotEvent](https://docs.rdlabo.dev/projects/capacitor-screenshot-event/docs/screenshot-event) pour enregistrer un écouteur, activer la surveillance, vérifier une véritable capture sur un appareil, puis arrêter la surveillance et supprimer le handle.

<!-- rdlabo-docs-omit -->
Enregistrez un écouteur, activez la surveillance, faites une capture d’écran sur un appareil physique, puis arrêtez la surveillance et supprimez le handle lorsque l’écran est quitté ou détruit :

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';
import type { PluginListenerHandle } from '@capacitor/core';

let handle: PluginListenerHandle | undefined;

const start = async () => {
  if (handle) return;
  handle = await ScreenshotEvent.addListener('userDidTakeScreenshot', () => {
    console.log('Screenshot was taken');
  });

  await ScreenshotEvent.startWatchEvent();
};

const stop = async () => {
  await ScreenshotEvent.removeWatchEvent();
  await handle?.remove();
  handle = undefined;
};
```

<!-- /rdlabo-docs-omit -->

## Remarques sur les plateformes

- **iOS** : utilise la notification `UIApplication.userDidTakeScreenshotNotification`.
- **Android** (8.0.0) : surveille `FileObserver.CREATE` dans le chemin fixe `Pictures/Screenshots/` du stockage externe. La détection dépend de l’enregistrement des captures dans ce répertoire ; ce n’est pas un observateur de changements MediaStore, et elle n’est pas garantie sur tous les appareils Android ni pour tous les chemins de galerie des fabricants.
- **Web** : non pris en charge, car les navigateurs n’exposent pas d’événements de capture d’écran.

## API

<docgen-index>

* [`startWatchEvent()`](/docs/readme#startwatchevent)
* [`removeWatchEvent()`](/docs/readme#removewatchevent)
* [`addListener('userDidTakeScreenshot', ...)`](/docs/readme#addlisteneruserdidtakescreenshot-)
* [Interfaces](/docs/readme#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### startWatchEvent()

```typescript
startWatchEvent() => Promise<void>
```

--------------------


### removeWatchEvent()

```typescript
removeWatchEvent() => Promise<void>
```

--------------------


### addListener('userDidTakeScreenshot', ...)

```typescript
addListener(eventName: 'userDidTakeScreenshot', listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Paramètre              | Type                                 |
| ------------------ | ------------------------------------ |
| **`eventName`**    | <code>'userDidTakeScreenshot'</code> |
| **`listenerFunc`** | <code>() =&gt; void</code>           |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>

<!-- rdlabo-docs-omit -->
## Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Validation` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

La demande autorise uniquement le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Chaque nouveau commit exige une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Licence

Ce projet est distribué sous [licence MIT](./LICENSE).
<!-- /rdlabo-docs-omit -->
