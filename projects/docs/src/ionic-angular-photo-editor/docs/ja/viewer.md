---
title: Photo Viewer
---

Buttonまたは既存pageのmethodから、Ionic Modalで `PhotoViewerPage` を表示します。[Installation](/docs/readme#installation)の後に呼び出してください。Viewerを使う場合は `swiper` をinstallします。

```typescript
import { Component, inject } from '@angular/core';
import { ModalController, IonButton } from '@ionic/angular';
import { PhotoViewerProps, PhotoViewerResult } from '@rdlabo/ionic-angular-photo-editor';
import { PhotoViewerPage } from '@rdlabo/ionic-angular-photo-editor/viewer';

@Component({
  selector: 'app-view-photos',
  imports: [IonButton],
  template: `<ion-button type="button" (click)="openViewer()">View photos</ion-button>`,
})
export class ViewPhotosPage {
  private readonly modalCtrl = inject(ModalController);

  async openViewer(): Promise<void> {
    const componentProps = {
      imageUrls: ['https://picsum.photos/200/300', 'https://picsum.photos/200/301'],
      index: 0,
      isCircle: false,
      enableDelete: true,
      toolbarColorScheme: 'dark',
      imageAlt: (url, index) => `Photo ${index + 1}`,
      labels: {
        delete: 'Delete',
      },
    } satisfies PhotoViewerProps;
    const modal = await this.modalCtrl.create({
      component: PhotoViewerPage,
      componentProps,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss<PhotoViewerResult>();
    if (data?.action === 'delete') {
      console.log(data.index, data.value);
    }
  }
}
```

## Modal result

UserがDeleteをtapすると、Modalは次のdataでdismissします。

```typescript
interface PhotoViewerResult {
  action: 'delete';
  index: number;
  value: string; // URL of the image at index
}
```

閉じる、または下へswipeすると、dataなしでdismissします。

## Options

### imageUrls: string[]

**必須。** 表示するImage URLまたはdata URL。

### index: number

初期slide index。Defaultは `0`。

### isCircle: boolean

`true` の場合、画像を円形で描画します。

### enableDelete: boolean

`true` の場合、Delete buttonを表示します。

### enableFooterSafeArea: boolean

`true` の場合、iOSでfooterのsafe-area paddingを追加します。

### toolbarColorScheme: 'light' | 'dark'

**必須。** 暗い／黒い `ion-toolbar` には `dark`、明るい／白いtoolbarには `light` を使います。[Theme](/docs/theme)を参照してください。

### imageAlt: string | ((url: string, index: number) => string)

各slide画像のaccessibleな `alt` 文言。Defaultは空文字です。URLまたはindexに依存する場合はfunctionを渡します。

### labels: Partial&lt;PhotoViewerLabels&gt;

DefaultのUI文言を上書きします。未指定のkeyは組み込みの日本語defaultのままです。

| Key    | Default (ja) |
| ------ | ------------ |
| close  | 閉じる       |
| delete | 削除         |

Close buttonの `aria-label` にも `close` labelが使われます。
