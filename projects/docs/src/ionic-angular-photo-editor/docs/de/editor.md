---
title: "Fotoeditor"
sourceRevision: "d4b495090399c75bd7377cd4bc03a697c390ab9f03c230dd40b5f692024d9495"
---
Öffnen Sie `PhotoEditorPage` über eine Schaltfläche oder eine vorhandene Seitenmethode als modalen Ionic-Dialog. Verwenden Sie dies nach der [Installation](../README.md#installation).

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
        save: '送信', // Standardwert '保存' überschreiben
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

## Dialogergebnis

Beim Speichern schließt sich der Dialog mit:

```typescript
interface PhotoEditorResult {
  action: 'save';
  value: string; // Daten-URL des bearbeiteten Bildes
}
```

Beim Schließen ohne Speichern werden keine Daten zurückgegeben.

## Optionen

### requireSquare: boolean

Bei `true` muss das Bild quadratisch zugeschnitten werden, bevor die Bearbeitung fortgesetzt werden kann.

### value: string

Zu bearbeitende Bild-URL oder Daten-URL.

### toolbarColorScheme: 'light' | 'dark'

**Erforderlich.** Verwenden Sie `dark` für eine dunkle bzw. schwarze `ion-toolbar` und `light` für eine helle bzw. weiße Toolbar. Die Bibliothek kann das Aussehen der Toolbar nicht aus CSS, Transparenz oder Theme-Überschreibungen zur Laufzeit ableiten. Siehe [Theme](./theme.md).

### labels: Partial&lt;PhotoEditorLabels&gt;

Überschreibt die vorgegebenen Oberflächentexte. Nicht angegebene Schlüssel behalten die integrierten japanischen Standardwerte:

| Schlüssel        | Standard (ja)   |
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
