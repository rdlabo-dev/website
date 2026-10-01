---
title: "Éditeur de photos"
sourceRevision: "d4b495090399c75bd7377cd4bc03a697c390ab9f03c230dd40b5f692024d9495"
---
Présentez `PhotoEditorPage` depuis un bouton ou une méthode de page existante via une fenêtre modale Ionic. Faites-le après l’[installation](../README.md#installation).

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
        save: '送信', // remplace la valeur par défaut '保存'
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

## Résultat de la fenêtre modale

Lors de l’enregistrement, la fenêtre modale se ferme avec :

```typescript
interface PhotoEditorResult {
  action: 'save';
  value: string; // URL de données de l’image modifiée
}
```

Une fermeture sans enregistrement ne renvoie aucune donnée.

## Options

### requireSquare: boolean

Si la valeur est `true`, l’image doit être recadrée en carré avant de poursuivre l’édition.

### value: string

URL de l’image ou URL de données à modifier.

### toolbarColorScheme: 'light' | 'dark'

**Obligatoire.** Utilisez `dark` pour un `ion-toolbar` sombre/noir et `light` pour une barre claire/blanche. La bibliothèque ne peut pas déduire l’apparence de la barre depuis le CSS, sa translucidité ou les modifications de thème à l’exécution. Consultez [Thème](./theme.md).

### labels: Partial&lt;PhotoEditorLabels&gt;

Remplace les textes de l’interface par défaut. Les clés non renseignées conservent les valeurs japonaises intégrées :

| Clé        | Valeur par défaut (ja)   |
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
