---
title: Photo Editor
---

Buttonまたは既存pageのmethodから、Ionic Modalで `PhotoEditorPage` を表示します。[Installation](/docs/readme#installation)の後に呼び出してください。

```typescript
import { Component, inject } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { ModalController, IonButton } from '@ionic/angular';
import { PhotoEditorProps, PhotoEditorResult, providePhotoEditor } from '@rdlabo/ionic-angular-photo-editor';
import { PhotoEditorPage } from '@rdlabo/ionic-angular-photo-editor/editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';

export const appConfig: ApplicationConfig = {
  providers: [providePhotoEditor({ createImageEditor: createTuiImageEditor })],
};

@Component({
  selector: 'app-edit-photo',
  imports: [IonButton],
  template: `<ion-button type="button" (click)="openEditor()">Edit photo</ion-button>`,
})
export class EditPhotoPage {
  private readonly modalCtrl = inject(ModalController);

  async openEditor(): Promise<void> {
    const componentProps = {
      requireSquare: false,
      value: 'https://picsum.photos/200/300',
      toolbarColorScheme: 'dark',
      labels: {
        save: '送信', // override default '保存'
      },
    } satisfies PhotoEditorProps;
    const modal = await this.modalCtrl.create({
      component: PhotoEditorPage,
      componentProps,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss<PhotoEditorResult>();
    if (data?.action === 'save') {
      console.log(data.value);
    }
  }
}
```

## Modal result

SaveするとModalは次のdataでdismissします。

```typescript
interface PhotoEditorResult {
  action: 'save';
  value: string; // data URL of the edited image
}
```

Saveせずに閉じると、dataなしでdismissします。

## Options

### requireSquare: boolean

`true` の場合、編集を続ける前に画像を正方形へcropする必要があります。

### value: string

編集するImage URLまたはdata URL。

### toolbarColorScheme: 'light' | 'dark'

**必須。** 暗い／黒い `ion-toolbar` には `dark`、明るい／白いtoolbarには `light` を使います。LibraryはCSS、translucency、runtime theme overrideからtoolbarの見た目を推測できません。[Theme](/docs/theme)を参照してください。

### labels: Partial&lt;PhotoEditorLabels&gt;

DefaultのUI文言を上書きします。未指定のkeyは組み込みの日本語defaultのままです。

| Key        | Default (ja)   |
| ---------- | -------------- |
| save       | 保存           |
| close      | 閉じる         |
| back       | 戻る           |
| apply      | 適用           |
| crop       | 切り抜き・回転 |
| rotate     | 回転           |
| cropCover  | 画像に合わせる |
| crop16x9   | 16対9          |
| cropSquare | 正方形         |
| cropFree   | 自由           |
| filter     | フィルター     |
| brightness | 明るさ         |
| original   | オリジナル     |
| invert     | 反転           |
| sepia      | セピア         |
| vintage    | ヴィンテージ   |
| blur       | ぼかし         |
| grayscale  | グレースケール |
| sharpen    | 輪郭           |
| emboss     | エンボス       |
