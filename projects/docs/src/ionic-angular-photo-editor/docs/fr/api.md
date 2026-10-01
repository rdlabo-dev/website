---
title: "API"
sourceRevision: "186e095f7211f50b6712021ea82aad435b94c80e1bc71d18af0d5b8393984b06"
---
Référence des points d’entrée publics exportés par `@rdlabo/ionic-angular-photo-editor` v22.0.3. Importez les composants, services et implémentations facultatives depuis leurs points d’entrée secondaires dédiés.

## Points d’entrée

| Chemin d’importation                                         | Principaux exports                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | Configuration, types partagés, `PhotoLoadError`                        |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | `createTuiImageEditor`                                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | `loadCapacitorPhotoCamera`                                            |

## Configuration et chargement des photos

#### `function` providePhotoEditor(config?: PhotoEditorConfig): EnvironmentProviders

Enregistre les valeurs par défaut de chargement des photos pour l’application ainsi que les adaptateurs facultatifs de l’éditeur et de l’appareil photo.

#### `constant` PHOTO_EDITOR_CONFIG

Token d’injection Angular contenant les valeurs résolues de `maxSize`, les libellés, la factory de l’éditeur d’images et le chargeur de l’appareil photo.

#### `interface` PhotoEditorConfig

| Propriété                      | Type                         | Description                                              | Valeur par défaut     |
| ------------------------- | ---------------------------- | -------------------------------------------------------- | ----------- |
| **`maxSize`**             | `number`                     | Longueur du plus grand côté en pixels après redimensionnement.                     | `1000`      |
| **`labels`**              | `Partial<PhotoFileLabels>`   | Personnalisation des libellés de l’appareil photo, de la galerie et de l’annulation.               | `undefined` |
| **`createImageEditor`**   | `PhotoImageEditorFactory`    | Adaptateur utilisé pour l’édition et le redimensionnement.                   |             |
| **`loadCamera`**          | `PhotoCameraLoader`          | Adaptateur utilisé pour la sélection native depuis l’appareil photo ou la galerie.      |             |

#### `class` PhotoFileService

Importé depuis `@rdlabo/ionic-angular-photo-editor/file`. Sélectionne et normalise les photos provenant du navigateur et de Capacitor.

| Membre                   | Type                                                     | Description                                              |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| **`loadPhoto(options?)`** | `(options?: PhotoLoadOptions) => Promise<string[]>`      | Ouvre le sélecteur de la plateforme et renvoie des URL de données normalisées. |

#### `interface` PhotoLoadOptions

| Propriété          | Type                       | Description                                    | Valeur par défaut                        |
| ------------- | -------------------------- | ---------------------------------------------- | ------------------------------ |
| **`limit`**   | `number`                   | Nombre maximal d’images sélectionnées dans la galerie et le navigateur. | `1`                            |
| **`maxSize`** | `number`                   | Longueur du plus grand côté en pixels après redimensionnement.           | `maxSize` configuré ou `1000` |
| **`labels`**  | `Partial<PhotoFileLabels>` | Personnalisation des libellés de la feuille d’actions native pour chaque requête. | Libellés configurés              |

#### `class` PhotoLoadError

Erreur typée pour les échecs attendus de sélection de photos. Son `code` en lecture seule est un `PhotoLoadErrorCode`.

#### `type alias` PhotoLoadErrorCode

`'cancelled' | 'invalid-type' | 'unavailable'`

#### `interface` PhotoFileLabels

| Propriété         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`camera`** | `string` | Libellé de la source appareil photo. |
| **`album`**  | `string` | Libellé de la source galerie.  |
| **`cancel`** | `string` | Libellé de l’action d’annulation. |

## Éditeur

#### `component` PhotoEditorPage

Importé depuis `@rdlabo/ionic-angular-photo-editor/editor` et présenté dans une fenêtre modale Ionic.

| Entrée                         | Type                           | Description                                                | Valeur par défaut     |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------- | ----------- |
| **`value`**                   | `string`                       | URL d’image ou URL de données. Obligatoire.                           |             |
| **`requireSquare`**           | `boolean`                      | Impose un recadrage carré avant de poursuivre l’édition.         | `false`     |
| **`toolbarColorScheme`**      | `PhotoToolbarColorScheme`      | Apparence de la barre d’outils derrière les boutons d’en-tête. Obligatoire.    |             |
| **`labels`**                  | `Partial<PhotoEditorLabels>`   | Personnalisation des libellés de l’éditeur.                                    | `undefined` |

#### `interface` PhotoEditorProps

Contrat `componentProps` de la fenêtre modale. Il contient les mêmes champs `value`, `requireSquare`, `toolbarColorScheme` et `labels` que ci-dessus.

#### `interface` PhotoEditorResult

| Propriété         | Type       | Description                       |
| ------------ | ---------- | --------------------------------- |
| **`action`** | `'save'`   | Identifie un enregistrement réussi.     |
| **`value`**  | `string`   | URL de données de l’image modifiée.     |

#### `interface` PhotoEditorLabels

Champs de type chaîne : `save`, `close`, `back`, `apply`, `crop`, `rotate`, `cropCover`, `crop16x9`, `cropSquare`, `cropFree`, `filter`, `brightness`, `original`, `invert`, `sepia`, `vintage`, `blur`, `grayscale`, `sharpen` et `emboss`.

## Visionneuse

#### `component` PhotoViewerPage

Importé depuis `@rdlabo/ionic-angular-photo-editor/viewer` et présenté dans une fenêtre modale Ionic.

| Entrée                           | Type                                              | Description                                             | Valeur par défaut     |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------- |
| **`imageUrls`**                 | `string[]`                                        | URL d’images ou URL de données. Obligatoire.                      |             |
| **`index`**                     | `number`                                          | Index de l’image sélectionnée initialement.                         | `0`         |
| **`isCircle`**                  | `boolean`                                         | Affiche les images dans des cercles.                             | `false`     |
| **`enableDelete`**              | `boolean`                                         | Affiche le bouton de suppression.                             | `false`     |
| **`enableFooterSafeArea`**      | `boolean`                                         | Ajoute la marge interne de zone de sécurité au pied de page sur iOS.                      | `false`     |
| **`toolbarColorScheme`**        | `PhotoToolbarColorScheme`                         | Apparence de la barre d’outils derrière les boutons d’en-tête. Obligatoire. |             |
| **`imageAlt`**                  | `string \| ((url: string, index: number) => string)` | Texte alternatif accessible de l’image ou résolveur.                  | `''`        |
| **`labels`**                    | `Partial<PhotoViewerLabels>`                      | Personnalisation des libellés de la visionneuse.                                 | `undefined` |

#### `interface` PhotoViewerProps

Contrat `componentProps` de la fenêtre modale. Il contient les mêmes champs que ceux décrits pour `PhotoViewerPage`.

#### `interface` PhotoViewerResult

| Propriété         | Type       | Description                         |
| ------------ | ---------- | ----------------------------------- |
| **`action`** | `'delete'` | Identifie une demande de suppression.         |
| **`index`**  | `number`   | Index de l’image sélectionnée.         |
| **`value`**  | `string`   | URL ou URL de données à cet index.       |

#### `interface` PhotoViewerLabels

| Propriété         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`close`**  | `string` | Libellé de l’action de fermeture.  |
| **`delete`** | `string` | Libellé de l’action de suppression. |

#### `type alias` PhotoToolbarColorScheme

`'light' | 'dark'`

## Adaptateurs facultatifs

#### `function` createTuiImageEditor

Importé depuis `@rdlabo/ionic-angular-photo-editor/editor/tui`. Une `PhotoImageEditorFactory` qui charge l’implémentation TUI Image Editor dans un chunk différé que le bundler peut résoudre.

#### `function` loadCapacitorPhotoCamera

Importé depuis `@rdlabo/ionic-angular-photo-editor/file/capacitor`. Un `PhotoCameraLoader` qui charge l’implémentation Capacitor Camera dans un chunk différé que le bundler peut résoudre.

#### `type alias` PhotoImageEditorFactory

`(host: Element, options: PhotoImageEditorOptions) => Promise<PhotoImageEditor>`

#### `interface` PhotoImageEditorOptions

| Propriété                 | Type     | Description                         |
| -------------------- | -------- | ----------------------------------- |
| **`cssMaxWidth`**    | `number` | Largeur maximale du canevas de l’éditeur.        |
| **`cssMaxHeight`**   | `number` | Hauteur maximale du canevas de l’éditeur.       |

#### `interface` PhotoCropRect

Rectangle doté des champs numériques `left`, `top`, `width` et `height`.

#### `interface` PhotoImageEditor

Contrat minimal de l’adaptateur d’éditeur :

| Membre                   | Type                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| **`applyFilter`**         | `(type: string, options?: Exclude<PhotoFilterOptions, null>) => Promise<unknown>`             |
| **`crop`**                | `(rect: PhotoCropRect) => Promise<unknown>`                                                  |
| **`destroy`**             | `() => void`                                                                                 |
| **`getCropzoneRect`**     | `() => PhotoCropRect`                                                                        |
| **`hasFilter`**           | `(type: string) => boolean`                                                                  |
| **`loadImageFromFile`**   | `(file: File) => Promise<{ newWidth: number; newHeight: number }>`                            |
| **`removeFilter`**        | `(type: string) => Promise<unknown>`                                                         |
| **`rotate`**              | `(angle: number) => Promise<unknown>`                                                        |
| **`setCropzoneRect`**     | `(ratio?: number) => void`                                                                   |
| **`startDrawingMode`**    | `(mode: string) => void`                                                                     |
| **`stopDrawingMode`**     | `() => void`                                                                                 |
| **`toDataURL`**           | `(options?: { multiplier?: number }) => string`                                              |

#### `type alias` PhotoCameraLoader

`() => Promise<PhotoCameraAdapter>`

#### `interface` PhotoCameraAdapter

| Membre           | Type                                                                          | Description      |
| ---------------- | ----------------------------------------------------------------------------- | ---------------- |
| **`getPhoto`**   | `(options: PhotoCameraOptions) => Promise<PhotoCameraImage>`                  | Prise de vue avec l’appareil photo.  |
| **`pickImages`** | `(options: PhotoCameraOptions) => Promise<{ photos: PhotoCameraImage[] }>`     | Sélection dans la galerie. |

#### `interface` PhotoCameraOptions

| Propriété          | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| **`quality`** | `number`     | Qualité d’image demandée.            |
| **`width`**   | `number`     | Largeur d’image demandée.              |
| **`limit?`**  | `number`     | Limite facultative de sélection dans la galerie.     |
| **`source?`** | `'camera'`   | Marqueur facultatif de source limitée à l’appareil photo. |

#### `interface` PhotoCameraImage

| Propriété           | Type     | Description                 |
| -------------- | -------- | --------------------------- |
| **`dataUrl?`** | `string` | URL de données de l’image.             |
| **`webPath?`** | `string` | URL d’image accessible dans le navigateur. |

## Types d’images auxiliaires

#### `interface` PhotoFilter

Aperçu de filtre rendu avec `name`, `type`, `option`, `data`, `width` et `height`.

#### `type alias` PhotoFilterOptions

`{ blur: number } | { brightness: number } | { noise: number } | { blocksize: number } | { color: string; distance: number; useAlpha?: boolean } | { mode: string; color: string; alpha?: number } | { maskObjId: number } | null`

#### `interface` PhotoFilterPreset

Préréglage de menu de filtre avec `name`, `type` et `option`.

#### `interface` PhotoSize

Dimensions en pixels sur deux axes, avec `width` et `height` numériques.
