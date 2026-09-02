---
title: API
---

`@rdlabo/ionic-angular-photo-editor` v22.0.0が公開するpublic entry pointのリファレンスです。Component、Service、任意実装は、それぞれ専用のsecondary entry pointからimportしてください。

## Entry point

| Import path                                         | 主なexport                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | 設定、共有型、`PhotoLoadError`                                       |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | `createTuiImageEditor`                                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | `loadCapacitorPhotoCamera`                                            |

## 設定・写真読み込み

#### `function` providePhotoEditor(config?: PhotoEditorConfig): EnvironmentProviders

アプリ全体の写真読み込みdefaultと、任意のEditor・Camera adapterを登録します。

#### `constant` PHOTO_EDITOR_CONFIG

解決済みの `maxSize`、label、Image Editor factory、Camera loaderを保持するAngular Injection Tokenです。

#### `interface` PhotoEditorConfig

| Prop                      | Type                         | Description                                      | Default     |
| ------------------------- | ---------------------------- | ------------------------------------------------ | ----------- |
| **`maxSize`**             | `number`                     | Resize後の長辺pixel数です。                       | `1000`      |
| **`labels`**              | `Partial<PhotoFileLabels>`   | Camera、Album、Cancel labelの上書きです。         | `undefined` |
| **`createImageEditor`**   | `PhotoImageEditorFactory`    | 編集・Resizeに使うadapterです。                   |             |
| **`loadCamera`**          | `PhotoCameraLoader`          | NativeのCamera・Album選択に使うadapterです。      |             |

#### `class` PhotoFileService

`@rdlabo/ionic-angular-photo-editor/file` からimportします。Browser・Capacitorから写真を選択し、正規化します。

| Member                   | Type                                                     | Description                                        |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| **`loadPhoto(options?)`** | `(options?: PhotoLoadOptions) => Promise<string[]>`      | Platform Pickerを開き、正規化したData URLを返します。 |

#### `interface` PhotoLoadOptions

| Prop          | Type                       | Description                                          | Default                        |
| ------------- | -------------------------- | ---------------------------------------------------- | ------------------------------ |
| **`limit`**   | `number`                   | Album・Browserで選択する最大画像数です。             | `1`                            |
| **`maxSize`** | `number`                   | Resize後の長辺pixel数です。                           | 設定済みの `maxSize` または `1000` |
| **`labels`**  | `Partial<PhotoFileLabels>` | Request単位のNative Action Sheet label上書きです。   | 設定済みのlabel                |

#### `class` PhotoLoadError

想定される写真選択エラーの型付きErrorです。Readonlyの `code` は `PhotoLoadErrorCode` です。

#### `type alias` PhotoLoadErrorCode

`'cancelled' | 'invalid-type' | 'unavailable'`

#### `interface` PhotoFileLabels

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`camera`** | `string` | Camera選択labelです。 |
| **`album`**  | `string` | Album選択labelです。  |
| **`cancel`** | `string` | Cancel labelです。    |

## Editor

#### `component` PhotoEditorPage

`@rdlabo/ionic-angular-photo-editor/editor` からimportし、Ionic Modalで表示します。

| Input                         | Type                           | Description                                         | Default     |
| ----------------------------- | ------------------------------ | --------------------------------------------------- | ----------- |
| **`value`**                   | `string`                       | Image URLまたはData URLです。必須です。             |             |
| **`requireSquare`**           | `boolean`                      | 編集を続ける前に正方形へのcropを必須にします。      | `false`     |
| **`toolbarColorScheme`**      | `PhotoToolbarColorScheme`      | Header Button背後のToolbar外観です。必須です。      |             |
| **`labels`**                  | `Partial<PhotoEditorLabels>`   | Editor labelを上書きします。                        | `undefined` |

#### `interface` PhotoEditorProps

Modalの `componentProps` contractです。上記の `value`、`requireSquare`、`toolbarColorScheme`、`labels` と同じfieldを持ちます。

#### `interface` PhotoEditorResult

| Prop         | Type       | Description                         |
| ------------ | ---------- | ----------------------------------- |
| **`action`** | `'save'`   | Save成功を示します。                |
| **`value`**  | `string`   | 編集済み画像のData URLです。        |

#### `interface` PhotoEditorLabels

文字列field: `save`、`close`、`back`、`apply`、`crop`、`rotate`、`cropCover`、`crop16x9`、`cropSquare`、`cropFree`、`filter`、`brightness`、`original`、`invert`、`sepia`、`vintage`、`blur`、`grayscale`、`sharpen`、`emboss`。

## Viewer

#### `component` PhotoViewerPage

`@rdlabo/ionic-angular-photo-editor/viewer` からimportし、Ionic Modalで表示します。

| Input                           | Type                                              | Description                                      | Default     |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------ | ----------- |
| **`imageUrls`**                 | `string[]`                                        | Image URLまたはData URLです。必須です。          |             |
| **`index`**                     | `number`                                          | 最初に選択するImage indexです。                  | `0`         |
| **`isCircle`**                  | `boolean`                                         | 画像を円形で表示します。                         | `false`     |
| **`enableDelete`**              | `boolean`                                         | Delete Buttonを表示します。                      | `false`     |
| **`enableFooterSafeArea`**      | `boolean`                                         | iOS FooterのSafe Area paddingを追加します。      | `false`     |
| **`toolbarColorScheme`**        | `PhotoToolbarColorScheme`                         | Header Button背後のToolbar外観です。必須です。   |             |
| **`imageAlt`**                  | `string \| ((url: string, index: number) => string)` | Accessibleな画像alt textまたはresolverです。     | `''`        |
| **`labels`**                    | `Partial<PhotoViewerLabels>`                      | Viewer labelを上書きします。                     | `undefined` |

#### `interface` PhotoViewerProps

Modalの `componentProps` contractです。`PhotoViewerPage` に示したものと同じfieldを持ちます。

#### `interface` PhotoViewerResult

| Prop         | Type       | Description                         |
| ------------ | ---------- | ----------------------------------- |
| **`action`** | `'delete'` | Delete要求を示します。              |
| **`index`**  | `number`   | 選択した画像のindexです。           |
| **`value`**  | `string`   | そのindexのURLまたはData URLです。  |

#### `interface` PhotoViewerLabels

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`close`**  | `string` | Close labelです。    |
| **`delete`** | `string` | Delete labelです。   |

#### `type alias` PhotoToolbarColorScheme

`'light' | 'dark'`

## 任意adapter

#### `function` createTuiImageEditor

`@rdlabo/ionic-angular-photo-editor/editor/tui` からimportします。TUI Image Editor実装をbundlerが解決できるLazy Chunkで読み込む `PhotoImageEditorFactory` です。

#### `function` loadCapacitorPhotoCamera

`@rdlabo/ionic-angular-photo-editor/file/capacitor` からimportします。Capacitor Camera実装をbundlerが解決できるLazy Chunkで読み込む `PhotoCameraLoader` です。

#### `type alias` PhotoImageEditorFactory

`(host: Element, options: PhotoImageEditorOptions) => Promise<PhotoImageEditor>`

#### `interface` PhotoImageEditorOptions

| Prop                 | Type     | Description                         |
| -------------------- | -------- | ----------------------------------- |
| **`cssMaxWidth`**    | `number` | Editor Canvasの最大widthです。      |
| **`cssMaxHeight`**   | `number` | Editor Canvasの最大heightです。     |

#### `interface` PhotoCropRect

数値の `left`、`top`、`width`、`height` fieldを持つRectangleです。

#### `interface` PhotoImageEditor

最小限のEditor adapter contractです。

| Member                   | Type                                                                                         |
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

| Member           | Type                                                                          | Description   |
| ---------------- | ----------------------------------------------------------------------------- | ------------- |
| **`getPhoto`**   | `(options: PhotoCameraOptions) => Promise<PhotoCameraImage>`                  | Camera撮影。  |
| **`pickImages`** | `(options: PhotoCameraOptions) => Promise<{ photos: PhotoCameraImage[] }>`     | Album選択。   |

#### `interface` PhotoCameraOptions

| Prop          | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| **`quality`** | `number`     | 要求するImage qualityです。         |
| **`width`**   | `number`     | 要求するImage widthです。           |
| **`limit?`**  | `number`     | 任意のAlbum選択上限です。           |
| **`source?`** | `'camera'`   | 任意のCamera専用source markerです。 |

#### `interface` PhotoCameraImage

| Prop           | Type     | Description                    |
| -------------- | -------- | ------------------------------ |
| **`dataUrl?`** | `string` | Image Data URLです。           |
| **`webPath?`** | `string` | Browserから参照できるImage URLです。 |

## 画像関連の補助型

#### `interface` PhotoFilter

`name`、`type`、`option`、`data`、`width`、`height` を持つrender済みFilter previewです。

#### `type alias` PhotoFilterOptions

`{ blur: number } | { brightness: number } | { noise: number } | { blocksize: number } | { color: string; distance: number; useAlpha?: boolean } | { mode: string; color: string; alpha?: number } | { maskObjId: number } | null`

#### `interface` PhotoFilterPreset

`name`、`type`、`option` を持つFilter Menu presetです。

#### `interface` PhotoSize

数値の `width` と `height` を持つ2次元pixel sizeです。
