---
title: はじめに
---

## 概要

CapacitorのCamera・Albumに対応した、Ionic Angularアプリ向けのPhoto Editor・Viewer Modal Pageです。

## 機能

### 編集目的から選ぶ

| 目的                                   | ガイド                                  |
| -------------------------------------- | --------------------------------------- |
| CameraまたはAlbumから写真を読み込む    | [PhotoFileService](/docs/photo-file)    |
| Modalで切り抜き・編集する              | [Photo Editor](/docs/editor)            |
| Modalで画像を閲覧する                  | [Photo Viewer](/docs/viewer)            |
| Editorの色を上書きする                 | [Theme](/docs/theme)                    |
| 以前のreleaseからupgradeする           | [Migration guide](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/docs/migration.md#rdlaboionic-angular-photo-editor) |

## Quick start

[Installation](#installation)の後に、任意のdefaultを登録して写真を読み込みます。

```typescript
import { providePhotoEditor } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { PhotoFileService } from '@rdlabo/ionic-angular-photo-editor/file';
import { loadCapacitorPhotoCamera } from '@rdlabo/ionic-angular-photo-editor/file/capacitor';

// app.config.ts
export const appConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1000,
      createImageEditor: createTuiImageEditor,
      loadCamera: loadCapacitorPhotoCamera,
    }),
  ],
};

// component
const files = await this.photoFileService.loadPhoto({ limit: 1 });
```

EditorまたはViewerは、それぞれのsecondary entry pointから表示します。詳細は[PhotoFileService](/docs/photo-file)、[Photo Editor](/docs/editor)、[Photo Viewer](/docs/viewer)を参照してください。

## Package entry point

| Import path                                         | Export                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | 型、`providePhotoEditor`、`PHOTO_EDITOR_CONFIG`、`PhotoLoadError` |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | opt-inの `createTuiImageEditor` adapter                              |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                   |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | opt-inの `loadCapacitorPhotoCamera` adapter                          |

ComponentとServiceは、そのentry pointからだけimportしてください。共有型と設定はroot packageからimportします。

## Installation

```bash
npm install @rdlabo/ionic-angular-photo-editor
```

アプリが使う任意機能の依存だけをinstallします。

```bash
# editor, and resizing in PhotoFileService
npm install tui-image-editor

# viewer
npm install swiper

# native camera and album selection
npm install @capacitor/camera
```

Android・iOSのCamera permissionは[Capacitor Camera docs](https://capacitorjs.com/docs/apis/camera#android-configuration)に従って設定してください。Native iOSアプリはiOS/iPadOS 16.4以降をdeployment targetにする必要があります。

`index.html` にstaticな `<input type="file">` は不要です。Webでは、`loadPhoto()` を呼ぶと `PhotoFileService` がhidden file inputを同期的に作成してattachします。

Root、`/editor`、`/file` entry pointは任意実装をimportしません。`/editor/tui` と `/file/capacitor` からopt-inしてください。Web専用consumerはCapacitor adapterと依存を省略できます。

## ドキュメント

[Installation](#installation)から始め、目的に合うGuideを選んでください。

- [PhotoFileService](/docs/photo-file) — Camera・Album。
- [Photo Editor](/docs/editor) — Modalでの切り抜き・編集。
- [Photo Viewer](/docs/viewer) — Modalでの画像閲覧。
- [Theme](/docs/theme) — CSS variableとToolbar color scheme。
- [Migration guide](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/docs/migration.md#rdlaboionic-angular-photo-editor) — Breaking changeと必要なconsumer update。
