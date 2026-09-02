---
title: PhotoFileService
---

CameraまたはAlbumから写真を読み込みます。[Installation](/docs/readme#installation)の後に呼び出してください。

```typescript
import { providePhotoEditor, PhotoLoadError } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { PhotoFileService } from '@rdlabo/ionic-angular-photo-editor/file';
import { loadCapacitorPhotoCamera } from '@rdlabo/ionic-angular-photo-editor/file/capacitor';

// app.config.ts — optional global defaults
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

// component
export class AppComponent {
  private photoFileService = inject(PhotoFileService);

  async upload() {
    try {
      const files = await this.photoFileService.loadPhoto({
        limit: 1,
        maxSize: 1000,
        labels: { camera: 'Camera' }, // merges over configured defaults
      });
      if (files.length > 0) {
        // upload files
      }
    } catch (error) {
      if (error instanceof PhotoLoadError && error.code === 'cancelled') {
        return;
      }
      throw error;
    }
  }
}
```

## loadPhoto(options?)

PlatformのPhoto Pickerを開き、正規化したData URLを返します。

| Option    | Default                        | 説明                                             |
| --------- | ------------------------------ | ------------------------------------------------ |
| `limit`   | `1`                            | 最大画像数（Album・Webのみ）。                   |
| `maxSize` | 設定済みの `maxSize` または `1000` | Resize後の長辺pixel数。                          |
| `labels`  | 設定済みの `labels`              | Action SheetのButton text（Capacitorのみ）。     |

### Browserでの動作

Webでは、`loadPhoto()` がhiddenな `<input type="file">` を同期的に作成し、`document.body` へattachして、callerのgestureと同じturnで `click()` を呼びます。これによりWebKitのtransient user activationが維持されます。Inputには固定IDがなく、選択またはcancel後に削除されます。

`index.html` へstaticなfile inputを追加しないでください。

### Capacitorでの動作

Native platformではAction SheetでCameraまたはAlbumを選択します。Requestごとの `labels` は `providePhotoEditor({ labels })` の値にmergeされます。

`/file/capacitor` の `loadCapacitorPhotoCamera` を登録してください。Baseの `/file` entry pointは、`@capacitor/camera` のないBrowser専用アプリでも利用できます。

### Error

想定される失敗では `PhotoLoadError` をthrowします。

| Code           | 発生条件                                                          |
| -------------- | ----------------------------------------------------------------- |
| `cancelled`    | UserがPickerまたはAction Sheetを閉じた                            |
| `invalid-type` | 選択fileが画像ではない（Webのみ）                                 |
| `unavailable`  | Permission、Plugin、Picker、File read、Resizeの失敗                |

## Default label（ja）

Global・request単位の `labels` がない場合は次の値を使います。

| Key    | Default（ja）     |
| ------ | ----------------- |
| camera | カメラ撮影        |
| album  | アルバムから選択  |
| cancel | キャンセル        |

## providePhotoEditor(config?)

`app.config.ts` でアプリ全体のdefaultを登録します。

```typescript
export const appConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1200,
      labels: { camera: '…', album: '…', cancel: '…' },
      createImageEditor: createTuiImageEditor,
      loadCamera: loadCapacitorPhotoCamera, // omit in browser-only applications
    }),
  ],
};
```

`PhotoFileService` はこの設定からadapterとglobalの `maxSize`・`labels` defaultを読み取ります。同名のrequest単位の値は、その呼び出しだけdefaultを上書きします。Resizeには `createImageEditor`、Native Pickerには `loadCamera` が必要です。Adapterがない場合は、`code: 'unavailable'` の `PhotoLoadError` をthrowします。
