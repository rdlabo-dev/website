---
title: "Premiers pas"
sourceRevision: "5a9028935db26cb0542936414eb0826a116eef78a9dea9e3fd92bac0bd99adc9"
---
# @rdlabo/capacitor-codescanner

<!-- rdlabo-docs-omit -->
[![version npm](https://badge.fury.io/js/@rdlabo%2Fcapacitor-codescanner.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-codescanner)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Lisez des codes QR et des codes-barres dans une fenêtre modale native Capacitor.

L’appareil photo fonctionne dans la fenêtre modale ; vous n’avez donc pas à gérer de vue caméra dans vos ressources Web. Utilisez une lecture unique ou plusieurs lectures en continu ; chaque détection fournit `event.code`.

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/capacitor-codescanner](https://docs.rdlabo.dev/projects/capacitor-codescanner)
<!-- /rdlabo-docs-omit -->

**Documentation :** [Lire la documentation complète](https://docs.rdlabo.dev/projects/capacitor-codescanner)

## Installer

```bash
npm install @rdlabo/capacitor-codescanner
npx cap sync
```

### Autorisation d’accès à l’appareil photo, requise avant la première lecture

Le plugin utilise l’appareil photo de l’appareil. Sur iOS, ajoutez une description d’utilisation à l’`Info.plist` de votre application, par exemple `ios/App/App/Info.plist` :

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes and barcodes.</string>
```

Android déclare `android.permission.CAMERA` dans le manifeste du plugin ; le système peut toutefois demander une autorisation à l’exécution lorsque vous présentez le lecteur. Après avoir modifié la configuration native, synchronisez et reconstruisez l’application native avec `npx cap sync`, puis ouvrez Xcode / Android Studio ou utilisez votre build natif Capacitor habituel.

## Utilisation

Consultez [CodeScanner](https://docs.rdlabo.dev/projects/capacitor-codescanner/docs/code-scanner). Lancez la lecture depuis une action utilisateur, comme un bouton, après l’installation et la configuration de l’appareil photo.

<!-- rdlabo-docs-omit -->
Enregistrez un écouteur, présentez la fenêtre modale depuis le gestionnaire d’un bouton, puis supprimez le handle lorsque `present` se termine, y compris si l’utilisateur ferme la fenêtre sans effectuer de lecture :

```ts
import { CodeScanner } from '@rdlabo/capacitor-codescanner';
import type { PluginListenerHandle } from '@capacitor/core';

const scanQRCode = async () => {
  let handle: PluginListenerHandle | undefined;
  try {
    handle = await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
      console.log('Scanned code:', event.code);
    });

    await CodeScanner.present({
      detectionWidth: 0.6,
      detectionHeight: 0.15,
      isMulti: false,
    });
  } finally {
    await handle?.remove();
  }
};
```

<!-- /rdlabo-docs-omit -->

## Quand l’utiliser

Utilisez ce plugin pour disposer d’une fenêtre modale de lecture prête à l’emploi sans créer une interface caméra personnalisée. Il est utile pour :

- Lire les codes QR ou codes-barres de reçus, de produits ou de billets.
- Recueillir plusieurs codes dans une même session avec `isMulti: true`.

## Fonctionnalités

- **Éclairage automatique** : active par défaut la lampe dans les environnements sombres.
- **Retour par vibration** : vibre lorsqu’un code est détecté.
- **Overlay de zone de détection** : affiche un cadre rouge autour de la zone de lecture active.
- **Mise en évidence du code détecté** : trace un cadre rouge autour du code détecté.
- **Bouton de fermeture** : bouton de fermeture par défaut dans le coin supérieur droit.
- **Mode de lecture multiple** : poursuit la lecture jusqu’à ce que l’utilisateur ferme la fenêtre modale lorsque `isMulti: true`.

## Remarques sur les plateformes

- **iOS et Android** : entièrement pris en charge.
- **Web** : non pris en charge, car le plugin nécessite un accès natif à l’appareil photo.

## API

<docgen-index>

* [`present(...)`](/docs/readme#present)
* [`addListener('CodeScannerCatchEvent', ...)`](/docs/readme#addlistenercodescannercatchevent-)
* [Interfaces](/docs/readme#interfaces)
* [Alias de types](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### present(...)

```typescript
present(scannerOption: ScannerOption) => Promise<void>
```

| Paramètre               | Type                                                    |
| ------------------- | ------------------------------------------------------- |
| **`scannerOption`** | <code><a href="#scanneroption">ScannerOption</a></code> |

--------------------


### addListener('CodeScannerCatchEvent', ...)

```typescript
addListener(eventName: 'CodeScannerCatchEvent', listenerFunc: (event: { code: string; }) => void) => Promise<PluginListenerHandle>
```

| Paramètre              | Type                                               |
| ------------------ | -------------------------------------------------- |
| **`eventName`**    | <code>'CodeScannerCatchEvent'</code>               |
| **`listenerFunc`** | <code>(event: { code: string; }) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### ScannerOption

| Propriété                    | Type                               | Description                                                                                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`detectionWidth`**    | <code>number</code>                | Largeur de la zone de détection par rapport à la largeur disponible, de 0 à 1. Valeur par défaut : 0.4.                                              |
| **`detectionHeight`**   | <code>number</code>                | Hauteur de la zone de détection par rapport à sa largeur. Valeur par défaut : 1 sur iOS ; une valeur de 0.15 à 0.2 est courante sur Android.              |
| **`enableCloseButton`** | <code>boolean</code>               | Active le bouton de fermeture en haut à gauche de la zone de lecture (valeur par défaut : true)                                                        |
| **`sheetScreenRatio`**  | <code>number</code>                | Définit le rapport entre la zone de lecture, c’est-à-dire la taille de la fenêtre modale, et la taille de l’écran. Valeur par défaut : 0.9 sur Android et 1 (pageSheet) sur iOS. |
| **`CodeTypes`**         | <code>MetadataObjectTypes[]</code> | Définit les types de codes à reconnaître (valeur par défaut : ["qr", "code39", "ean13"])                                                    |
| **`isMulti`**           | <code>boolean</code>               | Active le mode de lecture multiple (valeur par défaut : false)                                                                                         |
| **`enableAutoLight`**   | <code>boolean</code>               | Active l’éclairage automatique dans un environnement sombre (valeur par défaut : true)                                                                      |


#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Alias de types


#### MetadataObjectTypes

<code>'aztec' | 'code128' | 'code39' | 'code39Mod43' | 'code93' | 'dataMatrix' | 'ean13' | 'ean8' | 'face' | 'interleaved2of5' | 'itf14' | 'pdf417' | 'qr' | 'upce' | 'catBody' | 'dogBody' | 'humanBody' | 'salientObject'</code>

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
