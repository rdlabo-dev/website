---
title: API
---

`@rdlabo/ionic-angular-photo-editor` v21.7.0 が公開するAPIのリファレンスです。ComponentのinputはIonic Modalの `componentProps` を通して渡します。

## Component

#### `component` PhotoEditorPage

画像EditorをIonic Modalで表示します。

| Input               | Type                            | Description                                | Default     |
| ------------------- | ------------------------------- | ------------------------------------------ | ----------- |
| **`value`**         | `string`                        | 画像URLまたはbase64文字列。必須です。      |             |
| **`requireSquare`** | `boolean`                       | 保存前に正方形への切り抜きを必須にします。 | `false`     |
| **`labels`**        | `Partial<IDictionaryForEditor>` | Editorのラベルを上書きします。             | `undefined` |

#### `component` PhotoViewerPage

1件以上の画像をIonic Modalで表示します。

| Input                      | Type                            | Description                           | Default     |
| -------------------------- | ------------------------------- | ------------------------------------- | ----------- |
| **`imageUrls`**            | `string[]`                      | 画像URLまたはbase64文字列。必須です。 |             |
| **`index`**                | `number`                        | 最初に選択する画像のindexです。       | `0`         |
| **`isCircle`**             | `boolean`                       | 画像を円形で表示します。              | `false`     |
| **`enableDelete`**         | `boolean`                       | 削除ボタンを表示します。              | `false`     |
| **`enableFooterSafeArea`** | `boolean`                       | iOSのFooter Safe Areaを追加します。   | `false`     |
| **`labels`**               | `Partial<IDictionaryForViewer>` | Viewerのラベルを上書きします。        | `undefined` |

## Service

#### `class` PhotoFileService

カメラ、アルバム、またはブラウザのfile inputから写真を読み込み、リサイズしてbase64文字列を返します。

| Member                 | Type                                   | Description                                             | Default |
| ---------------------- | -------------------------------------- | ------------------------------------------------------- | ------- |
| **`photoMaxSize`**     | `number`                               | 出力する画像の幅または高さの最大pixel数です。           | `1000`  |
| **`labels`**           | `IDictionaryForService`                | カメラ、アルバム、キャンセルのラベルを上書きします。    |         |
| **`loadPhoto(limit)`** | `(limit: number) => Promise<string[]>` | 写真の取得元を表示し、最大 `limit` 件の画像を返します。 |         |

## Modal result type

#### `interface` IPhotoEditorDismiss

| Prop        | Type     | Description                               |
| ----------- | -------- | ----------------------------------------- |
| **`value`** | `string` | 保存した画像のURLまたはbase64文字列です。 |

#### `interface` IPhotoViewerDismiss

| Prop         | Type                               | Description                   |
| ------------ | ---------------------------------- | ----------------------------- |
| **`delete`** | `{ index: number; value: string }` | 削除した画像のindexと値です。 |

## Component prop type

#### `interface` PhotoEditorProps

| Prop                | Type                            | Description                           | Default     |
| ------------------- | ------------------------------- | ------------------------------------- | ----------- |
| **`value`**         | `string`                        | 画像URLまたはbase64文字列。必須です。 |             |
| **`requireSquare`** | `boolean`                       | 正方形への切り抜きを必須にします。    | `false`     |
| **`labels`**        | `Partial<IDictionaryForEditor>` | Editorのラベルを上書きします。        | `undefined` |

#### `interface` PhotoViewerProps

| Prop                       | Type                            | Description                                                       | Default     |
| -------------------------- | ------------------------------- | ----------------------------------------------------------------- | ----------- |
| **`imageUrls`**            | `string[]`                      | 画像URLまたはbase64文字列。`PhotoViewerPage` の表示時は必須です。 |             |
| **`index`**                | `number`                        | 最初に選択する画像のindexです。                                   | `0`         |
| **`isCircle`**             | `boolean`                       | 画像を円形で表示します。                                          | `false`     |
| **`enableDelete`**         | `boolean`                       | 削除ボタンを表示します。                                          | `false`     |
| **`enableFooterSafeArea`** | `boolean`                       | iOSのFooter Safe Areaを追加します。                               | `false`     |
| **`labels`**               | `Partial<IDictionaryForViewer>` | Viewerのラベルを上書きします。                                    | `undefined` |

## Dictionary

#### `interface` IDictionaryForEditor

| Prop             | Type     | Description                    |
| ---------------- | -------- | ------------------------------ |
| **`save`**       | `string` | 保存actionのラベルです。       |
| **`crop`**       | `string` | Crop toolのラベルです。        |
| **`filter`**     | `string` | Filter toolのラベルです。      |
| **`brightness`** | `string` | Brightness toolのラベルです。  |
| **`original`**   | `string` | Original filterのラベルです。  |
| **`invert`**     | `string` | Invert filterのラベルです。    |
| **`sepia`**      | `string` | Sepia filterのラベルです。     |
| **`vintage`**    | `string` | Vintage filterのラベルです。   |
| **`blur`**       | `string` | Blur filterのラベルです。      |
| **`grayscale`**  | `string` | Grayscale filterのラベルです。 |
| **`sharpen`**    | `string` | Sharpen filterのラベルです。   |
| **`emboss`**     | `string` | Emboss filterのラベルです。    |

#### `interface` IDictionaryForViewer

| Prop         | Type     | Description              |
| ------------ | -------- | ------------------------ |
| **`delete`** | `string` | 削除actionのラベルです。 |

#### `interface` IDictionaryForService

| Prop         | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| **`camera`** | `string` | カメラのラベルです。           |
| **`album`**  | `string` | アルバムのラベルです。         |
| **`cancel`** | `string` | キャンセルactionのラベルです。 |

## Supporting type

#### `interface` IFilter

| Prop         | Type     | Description                  |
| ------------ | -------- | ---------------------------- |
| **`name`**   | `string` | Filter名です。               |
| **`type`**   | `string` | Filter typeです。            |
| **`option`** | `any`    | Filter固有のoptionです。     |
| **`data`**   | `string` | Filter適用後の画像dataです。 |
| **`width`**  | `number` | 画像の幅です。               |
| **`height`** | `number` | 画像の高さです。             |

#### `interface` IFilterPreset

| Prop         | Type     | Description              |
| ------------ | -------- | ------------------------ |
| **`name`**   | `string` | Preset名です。           |
| **`type`**   | `string` | Filter typeです。        |
| **`option`** | `any`    | Filter固有のoptionです。 |

#### `interface` ISize

| Prop         | Type     | Description           |
| ------------ | -------- | --------------------- |
| **`width`**  | `number` | pixel単位の幅です。   |
| **`height`** | `number` | pixel単位の高さです。 |
