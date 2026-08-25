---
title: API
---

Reference for the public API exported by `@rdlabo/ionic-angular-photo-editor` v21.7.0. Pass component inputs through Ionic Modal `componentProps`.

## Components

#### `component` PhotoEditorPage

Presents the image editor in an Ionic modal.

| Input               | Type                            | Description                                                          | Default     |
| ------------------- | ------------------------------- | -------------------------------------------------------------------- | ----------- |
| **`value`**         | `string`                        | Image URL or base64 string. This input is required.                  |             |
| **`requireSquare`** | `boolean`                       | Requires the image to be cropped to a square before it can be saved. | `false`     |
| **`labels`**        | `Partial<IDictionaryForEditor>` | Overrides editor labels.                                             | `undefined` |

#### `component` PhotoViewerPage

Presents one or more images in an Ionic modal.

| Input                      | Type                            | Description                                           | Default     |
| -------------------------- | ------------------------------- | ----------------------------------------------------- | ----------- |
| **`imageUrls`**            | `string[]`                      | Image URLs or base64 strings. This input is required. |             |
| **`index`**                | `number`                        | Initially selected image index.                       | `0`         |
| **`isCircle`**             | `boolean`                       | Displays images as circles.                           | `false`     |
| **`enableDelete`**         | `boolean`                       | Displays the delete button.                           | `false`     |
| **`enableFooterSafeArea`** | `boolean`                       | Adds the iOS footer safe area.                        | `false`     |
| **`labels`**               | `Partial<IDictionaryForViewer>` | Overrides viewer labels.                              | `undefined` |

## Service

#### `class` PhotoFileService

Loads photos from the camera, album, or browser file input and resizes them before returning base64 strings.

| Member                 | Type                                   | Description                                                     | Default |
| ---------------------- | -------------------------------------- | --------------------------------------------------------------- | ------- |
| **`photoMaxSize`**     | `number`                               | Maximum output width or height in pixels.                       | `1000`  |
| **`labels`**           | `IDictionaryForService`                | Overrides camera, album, and cancel labels.                     |         |
| **`loadPhoto(limit)`** | `(limit: number) => Promise<string[]>` | Opens the photo source picker and returns up to `limit` images. |         |

## Modal result types

#### `interface` IPhotoEditorDismiss

| Prop        | Type     | Description                            |
| ----------- | -------- | -------------------------------------- |
| **`value`** | `string` | Saved image as a URL or base64 string. |

#### `interface` IPhotoViewerDismiss

| Prop         | Type                               | Description                    |
| ------------ | ---------------------------------- | ------------------------------ |
| **`delete`** | `{ index: number; value: string }` | Deleted image index and value. |

## Component prop types

#### `interface` PhotoEditorProps

| Prop                | Type                            | Description                           | Default     |
| ------------------- | ------------------------------- | ------------------------------------- | ----------- |
| **`value`**         | `string`                        | Image URL or base64 string. Required. |             |
| **`requireSquare`** | `boolean`                       | Requires square cropping.             | `false`     |
| **`labels`**        | `Partial<IDictionaryForEditor>` | Editor label overrides.               | `undefined` |

#### `interface` PhotoViewerProps

| Prop                       | Type                            | Description                                                               | Default     |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------- | ----------- |
| **`imageUrls`**            | `string[]`                      | Image URLs or base64 strings. Required when presenting `PhotoViewerPage`. |             |
| **`index`**                | `number`                        | Initially selected image index.                                           | `0`         |
| **`isCircle`**             | `boolean`                       | Displays images as circles.                                               | `false`     |
| **`enableDelete`**         | `boolean`                       | Displays the delete button.                                               | `false`     |
| **`enableFooterSafeArea`** | `boolean`                       | Adds the iOS footer safe area.                                            | `false`     |
| **`labels`**               | `Partial<IDictionaryForViewer>` | Viewer label overrides.                                                   | `undefined` |

## Dictionaries

#### `interface` IDictionaryForEditor

| Prop             | Type     | Description             |
| ---------------- | -------- | ----------------------- |
| **`save`**       | `string` | Save action label.      |
| **`crop`**       | `string` | Crop tool label.        |
| **`filter`**     | `string` | Filter tool label.      |
| **`brightness`** | `string` | Brightness tool label.  |
| **`original`**   | `string` | Original filter label.  |
| **`invert`**     | `string` | Invert filter label.    |
| **`sepia`**      | `string` | Sepia filter label.     |
| **`vintage`**    | `string` | Vintage filter label.   |
| **`blur`**       | `string` | Blur filter label.      |
| **`grayscale`**  | `string` | Grayscale filter label. |
| **`sharpen`**    | `string` | Sharpen filter label.   |
| **`emboss`**     | `string` | Emboss filter label.    |

#### `interface` IDictionaryForViewer

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`delete`** | `string` | Delete action label. |

#### `interface` IDictionaryForService

| Prop         | Type     | Description          |
| ------------ | -------- | -------------------- |
| **`camera`** | `string` | Camera source label. |
| **`album`**  | `string` | Album source label.  |
| **`cancel`** | `string` | Cancel action label. |

## Supporting types

#### `interface` IFilter

| Prop         | Type     | Description             |
| ------------ | -------- | ----------------------- |
| **`name`**   | `string` | Filter name.            |
| **`type`**   | `string` | Filter type.            |
| **`option`** | `any`    | Filter-specific option. |
| **`data`**   | `string` | Filtered image data.    |
| **`width`**  | `number` | Image width.            |
| **`height`** | `number` | Image height.           |

#### `interface` IFilterPreset

| Prop         | Type     | Description             |
| ------------ | -------- | ----------------------- |
| **`name`**   | `string` | Preset name.            |
| **`type`**   | `string` | Filter type.            |
| **`option`** | `any`    | Filter-specific option. |

#### `interface` ISize

| Prop         | Type     | Description       |
| ------------ | -------- | ----------------- |
| **`width`**  | `number` | Width in pixels.  |
| **`height`** | `number` | Height in pixels. |
