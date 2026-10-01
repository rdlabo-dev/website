---
title: "Fotobetrachter"
sourceRevision: "1cb39a942464db1e23c19cd0897b6369034e7c8f0a187af65bc6de0cad39d582"
---
Öffnen Sie `PhotoViewerPage` über eine Schaltfläche oder eine vorhandene Seitenmethode als modalen Ionic-Dialog. Verwenden Sie dies nach der [Installation](../README.md#installation). Installieren Sie `swiper`, wenn Sie den Betrachter einsetzen.

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

## Dialogergebnis

Wenn der Nutzer auf Löschen tippt, schließt sich der Dialog mit:

```typescript
interface PhotoViewerResult {
  action: 'delete';
  index: number;
  value: string; // URL des Bildes am angegebenen Index
}
```

Beim Schließen oder beim Wischen nach unten werden keine Daten zurückgegeben.

## Optionen

### imageUrls: string[]

**Erforderlich.** Anzuzeigende Bild-URLs oder Daten-URLs.

### index: number

Anfänglicher Folienindex. Standardwert: `0`.

### isCircle: boolean

Bei `true` werden Bilder kreisförmig dargestellt.

### enableDelete: boolean

Bei `true` wird die Löschen-Schaltfläche angezeigt.

### enableFooterSafeArea: boolean

Bei `true` wird unter iOS ein Safe-Area-Abstand im Footer ergänzt.

### toolbarColorScheme: 'light' | 'dark'

**Erforderlich.** Verwenden Sie `dark` für eine dunkle bzw. schwarze `ion-toolbar` und `light` für eine helle bzw. weiße Toolbar. Siehe [Theme](./theme.md).

### imageAlt: string | ((url: string, index: number) => string)

Barrierefreier `alt`-Text für jedes Folienbild. Der Standardwert ist eine leere Zeichenfolge. Übergeben Sie eine Funktion, wenn der Alternativtext von der URL oder dem Index abhängt.

### labels: Partial&lt;PhotoViewerLabels&gt;

Überschreibt die vorgegebenen Oberflächentexte. Nicht angegebene Schlüssel behalten die integrierten japanischen Standardwerte:

| Schlüssel    | Standard (ja) |
| ------ | ------------ |
| close  | 閉じる       |
| delete | 削除         |

Für die Schließen-Schaltfläche wird auch das `aria-label` aus der Beschriftung `close` verwendet.
