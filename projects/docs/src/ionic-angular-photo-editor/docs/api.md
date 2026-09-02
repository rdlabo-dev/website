---
title: API
---

Reference for the public entry points exported by `@rdlabo/ionic-angular-photo-editor` v22.0.0. Import components, services, and optional implementations from their dedicated secondary entry points.

## Entry points

| Import path                                         | Principal exports                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | Configuration, shared types, `PhotoLoadError`                        |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | `createTuiImageEditor`                                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                     |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | `loadCapacitorPhotoCamera`                                            |

## Configuration and photo loading

#### `function` providePhotoEditor(config?: PhotoEditorConfig): EnvironmentProviders

Registers application-wide photo-loading defaults and the optional editor and camera adapters.

#### `constant` PHOTO_EDITOR_CONFIG

Angular injection token containing the resolved `maxSize`, labels, image-editor factory, and camera loader.

#### `interface` PhotoEditorConfig

| Prop                      | Type                         | Description                                              | Default     |
| ------------------------- | ---------------------------- | -------------------------------------------------------- | ----------- |
| **`maxSize`**             | `number`                     | Longest edge in pixels after resize.                     | `1000`      |
| **`labels`**              | `Partial<PhotoFileLabels>`   | Camera, album, and cancel label overrides.               | `undefined` |
| **`createImageEditor`**   | `PhotoImageEditorFactory`    | Adapter used for editing and resizing.                   |             |
| **`loadCamera`**          | `PhotoCameraLoader`          | Adapter used for native camera and album selection.      |             |

#### `class` PhotoFileService

Imported from `@rdlabo/ionic-angular-photo-editor/file`. Selects and normalizes photos from browser and Capacitor sources.

| Member                   | Type                                                     | Description                                              |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| **`loadPhoto(options?)`** | `(options?: PhotoLoadOptions) => Promise<string[]>`      | Opens the platform picker and returns normalized data URLs. |

#### `interface` PhotoLoadOptions

| Prop          | Type                       | Description                                    | Default                        |
| ------------- | -------------------------- | ---------------------------------------------- | ------------------------------ |
| **`limit`**   | `number`                   | Maximum images for album and browser selection. | `1`                            |
| **`maxSize`** | `number`                   | Longest edge in pixels after resize.           | Configured `maxSize` or `1000` |
| **`labels`**  | `Partial<PhotoFileLabels>` | Per-request native action-sheet label overrides. | Configured labels              |

#### `class` PhotoLoadError

Typed error for expected photo-selection failures. Its readonly `code` is a `PhotoLoadErrorCode`.

#### `type alias` PhotoLoadErrorCode

`'cancelled' | 'invalid-type' | 'unavailable'`

#### `interface` PhotoFileLabels

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`camera`** | `string` | Camera source label. |
| **`album`**  | `string` | Album source label.  |
| **`cancel`** | `string` | Cancel action label. |

## Editor

#### `component` PhotoEditorPage

Imported from `@rdlabo/ionic-angular-photo-editor/editor` and presented through an Ionic modal.

| Input                         | Type                           | Description                                                | Default     |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------- | ----------- |
| **`value`**                   | `string`                       | Image URL or data URL. Required.                           |             |
| **`requireSquare`**           | `boolean`                      | Requires square cropping before editing continues.         | `false`     |
| **`toolbarColorScheme`**      | `PhotoToolbarColorScheme`      | Toolbar appearance behind the header buttons. Required.    |             |
| **`labels`**                  | `Partial<PhotoEditorLabels>`   | Editor label overrides.                                    | `undefined` |

#### `interface` PhotoEditorProps

The modal `componentProps` contract. It contains the same `value`, `requireSquare`, `toolbarColorScheme`, and `labels` fields shown above.

#### `interface` PhotoEditorResult

| Prop         | Type       | Description                       |
| ------------ | ---------- | --------------------------------- |
| **`action`** | `'save'`   | Identifies a successful save.     |
| **`value`**  | `string`   | Data URL of the edited image.     |

#### `interface` PhotoEditorLabels

String fields: `save`, `close`, `back`, `apply`, `crop`, `rotate`, `cropCover`, `crop16x9`, `cropSquare`, `cropFree`, `filter`, `brightness`, `original`, `invert`, `sepia`, `vintage`, `blur`, `grayscale`, `sharpen`, and `emboss`.

## Viewer

#### `component` PhotoViewerPage

Imported from `@rdlabo/ionic-angular-photo-editor/viewer` and presented through an Ionic modal.

| Input                           | Type                                              | Description                                             | Default     |
| ------------------------------- | ------------------------------------------------- | ------------------------------------------------------- | ----------- |
| **`imageUrls`**                 | `string[]`                                        | Image URLs or data URLs. Required.                      |             |
| **`index`**                     | `number`                                          | Initially selected image index.                         | `0`         |
| **`isCircle`**                  | `boolean`                                         | Displays images as circles.                             | `false`     |
| **`enableDelete`**              | `boolean`                                         | Displays the delete button.                             | `false`     |
| **`enableFooterSafeArea`**      | `boolean`                                         | Adds iOS footer safe-area padding.                      | `false`     |
| **`toolbarColorScheme`**        | `PhotoToolbarColorScheme`                         | Toolbar appearance behind the header buttons. Required. |             |
| **`imageAlt`**                  | `string \| ((url: string, index: number) => string)` | Accessible image alt text or resolver.                  | `''`        |
| **`labels`**                    | `Partial<PhotoViewerLabels>`                      | Viewer label overrides.                                 | `undefined` |

#### `interface` PhotoViewerProps

The modal `componentProps` contract. It contains the same fields shown for `PhotoViewerPage`.

#### `interface` PhotoViewerResult

| Prop         | Type       | Description                         |
| ------------ | ---------- | ----------------------------------- |
| **`action`** | `'delete'` | Identifies a delete request.         |
| **`index`**  | `number`   | Index of the selected image.         |
| **`value`**  | `string`   | URL or data URL at that index.       |

#### `interface` PhotoViewerLabels

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`close`**  | `string` | Close action label.  |
| **`delete`** | `string` | Delete action label. |

#### `type alias` PhotoToolbarColorScheme

`'light' | 'dark'`

## Optional adapters

#### `function` createTuiImageEditor

Imported from `@rdlabo/ionic-angular-photo-editor/editor/tui`. A `PhotoImageEditorFactory` that loads the TUI Image Editor implementation in a bundler-resolvable lazy chunk.

#### `function` loadCapacitorPhotoCamera

Imported from `@rdlabo/ionic-angular-photo-editor/file/capacitor`. A `PhotoCameraLoader` that loads the Capacitor Camera implementation in a bundler-resolvable lazy chunk.

#### `type alias` PhotoImageEditorFactory

`(host: Element, options: PhotoImageEditorOptions) => Promise<PhotoImageEditor>`

#### `interface` PhotoImageEditorOptions

| Prop                 | Type     | Description                         |
| -------------------- | -------- | ----------------------------------- |
| **`cssMaxWidth`**    | `number` | Maximum editor canvas width.        |
| **`cssMaxHeight`**   | `number` | Maximum editor canvas height.       |

#### `interface` PhotoCropRect

Rectangle with numeric `left`, `top`, `width`, and `height` fields.

#### `interface` PhotoImageEditor

Minimal editor-adapter contract:

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

| Member           | Type                                                                          | Description      |
| ---------------- | ----------------------------------------------------------------------------- | ---------------- |
| **`getPhoto`**   | `(options: PhotoCameraOptions) => Promise<PhotoCameraImage>`                  | Camera capture.  |
| **`pickImages`** | `(options: PhotoCameraOptions) => Promise<{ photos: PhotoCameraImage[] }>`     | Album selection. |

#### `interface` PhotoCameraOptions

| Prop          | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| **`quality`** | `number`     | Requested image quality.            |
| **`width`**   | `number`     | Requested image width.              |
| **`limit?`**  | `number`     | Optional album selection limit.     |
| **`source?`** | `'camera'`   | Optional camera-only source marker. |

#### `interface` PhotoCameraImage

| Prop           | Type     | Description                 |
| -------------- | -------- | --------------------------- |
| **`dataUrl?`** | `string` | Image data URL.             |
| **`webPath?`** | `string` | Browser-accessible image URL. |

## Supporting image types

#### `interface` PhotoFilter

Rendered filter preview with `name`, `type`, `option`, `data`, `width`, and `height`.

#### `type alias` PhotoFilterOptions

`{ blur: number } | { brightness: number } | { noise: number } | { blocksize: number } | { color: string; distance: number; useAlpha?: boolean } | { mode: string; color: string; alpha?: number } | { maskObjId: number } | null`

#### `interface` PhotoFilterPreset

Filter menu preset with `name`, `type`, and `option`.

#### `interface` PhotoSize

Two-dimensional pixel size with numeric `width` and `height`.
