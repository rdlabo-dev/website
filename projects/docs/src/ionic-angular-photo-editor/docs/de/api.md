---
title: "API"
sourceRevision: "186e095f7211f50b6712021ea82aad435b94c80e1bc71d18af0d5b8393984b06"
---
Referenz für die von `@rdlabo/ionic-angular-photo-editor` v22.0.3 exportierten öffentlichen Einstiegspunkte. Importieren Sie Komponenten, Services und optionale Implementierungen über ihre jeweiligen sekundären Einstiegspunkte.

## Einstiegspunkte

| Importpfad                                         | Wesentliche Exporte                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | Konfiguration, gemeinsame Typen, `PhotoLoadError`                        |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | `createTuiImageEditor`                                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | `loadCapacitorPhotoCamera`                                            |

## Konfiguration und Laden von Fotos

#### `function` providePhotoEditor(config?: PhotoEditorConfig): EnvironmentProviders

Registriert anwendungsweite Standardwerte zum Laden von Fotos sowie die optionalen Editor- und Kameraadapter.

#### `constant` PHOTO_EDITOR_CONFIG

Angular-Injection-Token mit den aufgelösten Werten für `maxSize`, Beschriftungen, Bildeditor-Factory und Kameralader.

#### `interface` PhotoEditorConfig

| Eigenschaft                      | Typ                         | Beschreibung                                              | Standard     |
| ------------------------- | ---------------------------- | -------------------------------------------------------- | ----------- |
| **`maxSize`**             | `number`                     | Längste Kante in Pixeln nach der Größenänderung.                     | `1000`      |
| **`labels`**              | `Partial<PhotoFileLabels>`   | Abweichende Beschriftungen für Kamera, Album und Abbruch.               | `undefined` |
| **`createImageEditor`**   | `PhotoImageEditorFactory`    | Adapter zur Bearbeitung und Größenänderung.                   |             |
| **`loadCamera`**          | `PhotoCameraLoader`          | Adapter für die native Kamera- und Albumauswahl.      |             |

#### `class` PhotoFileService

Wird aus `@rdlabo/ionic-angular-photo-editor/file` importiert. Wählt Fotos aus Browser- und Capacitor-Quellen aus und normalisiert sie.

| Mitglied                   | Typ                                                     | Beschreibung                                              |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| **`loadPhoto(options?)`** | `(options?: PhotoLoadOptions) => Promise<string[]>`      | Öffnet die Auswahloberfläche der Plattform und gibt normalisierte Daten-URLs zurück. |

#### `interface` PhotoLoadOptions

| Eigenschaft          | Typ                       | Beschreibung                                    | Standard                        |
| ------------- | -------------------------- | ---------------------------------------------- | ------------------------------ |
| **`limit`**   | `number`                   | Maximale Anzahl Bilder für Album- und Browserauswahl. | `1`                            |
| **`maxSize`** | `number`                   | Längste Kante in Pixeln nach der Größenänderung.           | Konfigurierter Wert `maxSize` oder `1000` |
| **`labels`**  | `Partial<PhotoFileLabels>` | Anfragespezifische Überschreibungen der Beschriftungen des nativen Action Sheets. | Konfigurierte Beschriftungen              |

#### `class` PhotoLoadError

Typisierter Fehler für erwartete Fehler bei der Fotoauswahl. Die readonly-Eigenschaft `code` hat den Typ `PhotoLoadErrorCode`.

#### `type alias` PhotoLoadErrorCode

`'cancelled' | 'invalid-type' | 'unavailable'`

#### `interface` PhotoFileLabels

| Eigenschaft         | Typ     | Beschreibung          |
| ------------ | -------- | -------------------- |
| **`camera`** | `string` | Beschriftung der Kameraquelle. |
| **`album`**  | `string` | Beschriftung der Albumquelle.  |
| **`cancel`** | `string` | Beschriftung der Abbrechen-Aktion. |

## Editor

#### `component` PhotoEditorPage

Wird aus `@rdlabo/ionic-angular-photo-editor/editor` importiert und über einen modalen Ionic-Dialog angezeigt.

| Eingabe                         | Typ                           | Beschreibung                                                | Standard     |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------- | ----------- |
| **`value`**                   | `string`                       | Bild-URL oder Daten-URL. Erforderlich.                           |             |
| **`requireSquare`**           | `boolean`                      | Verlangt einen quadratischen Zuschnitt, bevor die Bearbeitung fortgesetzt wird.         | `false`     |
| **`toolbarColorScheme`**      | `PhotoToolbarColorScheme`      | Darstellung der Toolbar hinter den Header-Schaltflächen. Erforderlich.    |             |
| **`labels`**                  | `Partial<PhotoEditorLabels>`   | Abweichende Editorbeschriftungen.                                    | `undefined` |

#### `interface` PhotoEditorProps

Der Vertrag für die `componentProps` des modalen Dialogs. Er enthält dieselben oben gezeigten Felder `value`, `requireSquare`, `toolbarColorScheme` und `labels`.

#### `interface` PhotoEditorResult

| Eigenschaft         | Typ       | Beschreibung                       |
| ------------ | ---------- | --------------------------------- |
| **`action`** | `'save'`   | Kennzeichnet erfolgreiches Speichern.     |
| **`value`**  | `string`   | Daten-URL des bearbeiteten Bildes.     |

#### `interface` PhotoEditorLabels

String-Felder: `save`, `close`, `back`, `apply`, `crop`, `rotate`, `cropCover`, `crop16x9`, `cropSquare`, `cropFree`, `filter`, `brightness`, `original`, `invert`, `sepia`, `vintage`, `blur`, `grayscale`, `sharpen` und `emboss`.

## Betrachter

#### `component` PhotoViewerPage

Wird aus `@rdlabo/ionic-angular-photo-editor/viewer` importiert und über einen modalen Ionic-Dialog angezeigt.

| Eingabe                           | Typ                                              | Beschreibung                                             | Standard     |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------- |
| **`imageUrls`**                 | `string[]`                                        | Bild-URLs oder Daten-URLs. Erforderlich.                      |             |
| **`index`**                     | `number`                                          | Anfänglich ausgewählter Bildindex.                         | `0`         |
| **`isCircle`**                  | `boolean`                                         | Zeigt Bilder kreisförmig an.                             | `false`     |
| **`enableDelete`**              | `boolean`                                         | Zeigt die Löschen-Schaltfläche an.                             | `false`     |
| **`enableFooterSafeArea`**      | `boolean`                                         | Ergänzt unter iOS einen Safe-Area-Abstand im Footer.                      | `false`     |
| **`toolbarColorScheme`**        | `PhotoToolbarColorScheme`                         | Darstellung der Toolbar hinter den Header-Schaltflächen. Erforderlich. |             |
| **`imageAlt`**                  | `string \| ((url: string, index: number) => string)` | Barrierefreier Bildalternativtext oder Resolver.                  | `''`        |
| **`labels`**                    | `Partial<PhotoViewerLabels>`                      | Abweichende Betrachterbeschriftungen.                                 | `undefined` |

#### `interface` PhotoViewerProps

Der Vertrag für die `componentProps` des modalen Dialogs. Er enthält dieselben für `PhotoViewerPage` gezeigten Felder.

#### `interface` PhotoViewerResult

| Eigenschaft         | Typ       | Beschreibung                         |
| ------------ | ---------- | ----------------------------------- |
| **`action`** | `'delete'` | Kennzeichnet eine Löschanforderung.         |
| **`index`**  | `number`   | Index des ausgewählten Bildes.         |
| **`value`**  | `string`   | URL oder Daten-URL an diesem Index.       |

#### `interface` PhotoViewerLabels

| Eigenschaft         | Typ     | Beschreibung          |
| ------------ | -------- | -------------------- |
| **`close`**  | `string` | Beschriftung der Schließen-Aktion.  |
| **`delete`** | `string` | Beschriftung der Löschen-Aktion. |

#### `type alias` PhotoToolbarColorScheme

`'light' | 'dark'`

## Optionale Adapter

#### `function` createTuiImageEditor

Wird aus `@rdlabo/ionic-angular-photo-editor/editor/tui` importiert. Eine `PhotoImageEditorFactory`, die die TUI-Image-Editor-Implementierung als verzögert geladenen, vom Bundler auflösbaren Chunk lädt.

#### `function` loadCapacitorPhotoCamera

Wird aus `@rdlabo/ionic-angular-photo-editor/file/capacitor` importiert. Ein `PhotoCameraLoader`, der die Capacitor-Camera-Implementierung als verzögert geladenen, vom Bundler auflösbaren Chunk lädt.

#### `type alias` PhotoImageEditorFactory

`(host: Element, options: PhotoImageEditorOptions) => Promise<PhotoImageEditor>`

#### `interface` PhotoImageEditorOptions

| Eigenschaft                 | Typ     | Beschreibung                         |
| -------------------- | -------- | ----------------------------------- |
| **`cssMaxWidth`**    | `number` | Maximale Breite der Editorzeichenfläche.        |
| **`cssMaxHeight`**   | `number` | Maximale Höhe der Editorzeichenfläche.       |

#### `interface` PhotoCropRect

Rechteck mit numerischen Feldern `left`, `top`, `width` und `height`.

#### `interface` PhotoImageEditor

Minimaler Vertrag für einen Editor-Adapter:

| Mitglied                   | Typ                                                                                         |
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

| Mitglied           | Typ                                                                          | Beschreibung      |
| ---------------- | ----------------------------------------------------------------------------- | ---------------- |
| **`getPhoto`**   | `(options: PhotoCameraOptions) => Promise<PhotoCameraImage>`                  | Kameraaufnahme.  |
| **`pickImages`** | `(options: PhotoCameraOptions) => Promise<{ photos: PhotoCameraImage[] }>`     | Albumauswahl. |

#### `interface` PhotoCameraOptions

| Eigenschaft          | Typ         | Beschreibung                         |
| ------------- | ------------ | ----------------------------------- |
| **`quality`** | `number`     | Gewünschte Bildqualität.            |
| **`width`**   | `number`     | Gewünschte Bildbreite.              |
| **`limit?`**  | `number`     | Optionale Begrenzung der Albumauswahl.     |
| **`source?`** | `'camera'`   | Optionale Quellenmarkierung ausschließlich für die Kamera. |

#### `interface` PhotoCameraImage

| Eigenschaft           | Typ     | Beschreibung                 |
| -------------- | -------- | --------------------------- |
| **`dataUrl?`** | `string` | Daten-URL des Bildes.             |
| **`webPath?`** | `string` | Im Browser erreichbare Bild-URL. |

## Ergänzende Bildtypen

#### `interface` PhotoFilter

Gerenderte Filtervorschau mit `name`, `type`, `option`, `data`, `width` und `height`.

#### `type alias` PhotoFilterOptions

`{ blur: number } | { brightness: number } | { noise: number } | { blocksize: number } | { color: string; distance: number; useAlpha?: boolean } | { mode: string; color: string; alpha?: number } | { maskObjId: number } | null`

#### `interface` PhotoFilterPreset

Filtermenü-Vorgabe mit `name`, `type` und `option`.

#### `interface` PhotoSize

Zweidimensionale Pixelgröße mit numerischen Werten für `width` und `height`.
