---
title: はじめに
---

Ionic Angularアプリ向けのPhoto Editor・Viewer Modal Pageです。Browserのfile選択に対応し、任意でCapacitorのCamera・Albumも使えます。

## Installation

```bash
npm install @rdlabo/ionic-angular-photo-editor tui-image-editor
```

## ブラウザで写真を選んで表示する

TUIのresize adapterを登録し（`loadPhoto` のresizeに必須）、fileを選んで返されたdata URLを表示します。

```typescript
import { Component, inject, signal } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { IonButton, IonImg } from '@ionic/angular';
import { providePhotoEditor, PhotoLoadError } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { PhotoFileService } from '@rdlabo/ionic-angular-photo-editor/file';

export const appConfig: ApplicationConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1000,
      createImageEditor: createTuiImageEditor,
    }),
  ],
};

@Component({
  selector: 'app-photo-pick',
  imports: [IonButton, IonImg],
  template: `
    <ion-button type="button" (click)="pick()">Select photo</ion-button>
    @if (previewUrl()) {
      <ion-img [src]="previewUrl()" alt="Selected photo"></ion-img>
    }
  `,
})
export class PhotoPickPage {
  private readonly photoFileService = inject(PhotoFileService);
  readonly previewUrl = signal('');

  async pick(): Promise<void> {
    try {
      const files = await this.photoFileService.loadPhoto({ limit: 1 });
      this.previewUrl.set(files[0] ?? '');
    } catch (error) {
      if (error instanceof PhotoLoadError && error.code === 'cancelled') {
        return;
      }
      throw error;
    }
  }
}
```

Select photoをクリックして画像を選ぶと、previewが表示されます。NativeのCamera・Album設定は後段の[PhotoFileService](/docs/photo-file)です。

## Viewer・ネイティブカメラを追加する

追加する機能に合わせて依存をインストールします。

```bash
# viewer
npm install swiper

# native camera and album selection
npm install @capacitor/camera
```

ネイティブカメラを使う場合は、[カメラ権限](https://capacitorjs.com/docs/apis/camera#android-configuration)と[PhotoFileService](/docs/photo-file)のadapterを設定します。iOSアプリの対象はiOS/iPadOS 16.4以降です。

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

## 編集目的から選ぶ

| 目的                                   | ガイド                                  |
| -------------------------------------- | --------------------------------------- |
| CameraまたはAlbumから写真を読み込む    | [PhotoFileService](/docs/photo-file)    |
| Modalで切り抜き・編集する              | [Photo Editor](/docs/editor)            |
| Modalで画像を閲覧する                  | [Photo Viewer](/docs/viewer)            |
| Editorの色を上書きする                 | [Theme](/docs/theme)                    |
| 以前のreleaseからupgradeする           | [Migration guide](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/docs/migration.md#rdlaboionic-angular-photo-editor) |
