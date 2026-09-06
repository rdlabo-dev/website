---
title: PhotoFileService
---

Browserのfile picker、またはNative platformではCamera・Albumから写真を読み込みます。[Installation](/docs/readme#installation)の後に呼び出してください。

## Browser: 選んで表示する

`loadPhoto` は常にimage-editor adapter経由でresizeするため、`createImageEditor` が必要です。Web専用アプリでは `loadCamera` を省略します。

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
      const files = await this.photoFileService.loadPhoto({
        limit: 1,
        maxSize: 1000,
      });
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

## Native Camera・Album

`@capacitor/camera` をinstallし、platform permissionを設定してから `loadCapacitorPhotoCamera` を登録します。Native platformではAction SheetでCameraまたはAlbumを選びます。Per-requestの `labels` は `providePhotoEditor({ labels })` の値へmergeされます。

```typescript
import { providePhotoEditor } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { loadCapacitorPhotoCamera } from '@rdlabo/ionic-angular-photo-editor/file/capacitor';

export const appConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1000,
      labels: {
        camera: 'Camera',
        album: 'Album',
        cancel: 'Cancel',
      },
      createImageEditor: createTuiImageEditor,
      loadCamera: loadCapacitorPhotoCamera,
    }),
  ],
};
```

## loadPhoto(options?)

Platformのphoto pickerを開き、正規化したdata URLを返します。

| Option    | Default                        | Description                                    |
| --------- | ------------------------------ | ---------------------------------------------- |
| `limit`   | `1`                            | 画像の最大数（AlbumとWebのみ）。 |
| `maxSize` | configured `maxSize` or `1000` | Resize後の最長辺（pixel）。           |
| `labels`  | configured `labels`            | Action Sheetのbutton文言（Capacitorのみ）。     |

### Browserの動作

Webでは、`loadPhoto()` がhiddenな `<input type="file">` を同期的に作成して `document.body` へattachし、呼び出し側のgestureと同じturnで `click()` します。これによりWebKitのtransient user activationを維持します。Inputに固定idはなく、選択またはキャンセル後に削除されます。

`index.html` にstaticなfile inputを追加しないでください。

### Capacitorの動作

`/file/capacitor` から `loadCapacitorPhotoCamera` を登録します。Baseの `/file` entry pointは、`@capacitor/camera` なしのBrowser専用アプリでも使えます。

### Errors

想定される失敗は `PhotoLoadError` をthrowします。

| Code           | When                                                     |
| -------------- | -------------------------------------------------------- |
| `cancelled`    | UserがpickerまたはAction Sheetを閉じた                |
| `invalid-type` | 選択したfileが画像でない（Webのみ）                 |
| `unavailable`  | Permission、plugin、picker、file-read、またはresizeの失敗 |

## Default labels (ja)

Globalまたはper-requestの `labels` を指定しない場合:

| Key    | Default (ja)     |
| ------ | ---------------- |
| camera | カメラ撮影       |
| album  | アルバムから選択 |
| cancel | キャンセル       |

## providePhotoEditor(config?)

`app.config.ts` でアプリ全体のdefaultを登録します。`PhotoFileService` はこれらのadapterと、globalな `maxSize`・`labels` defaultをこの設定から読みます。同じ名前のper-request値が1回の呼び出しを上書きします。Resizeには `createImageEditor`、Native pickerには `loadCamera` が必要です。Adapterがない場合は `code: 'unavailable'` の `PhotoLoadError` をthrowします。
