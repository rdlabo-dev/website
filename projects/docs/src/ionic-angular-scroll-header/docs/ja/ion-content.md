---
title: 'IonContent'
code: []
scrollActiveLine: []
---

Ionic Content に Scroll 連動 Header を付けます。[インストール](/docs/readme#インストール) のあとで呼び出します。先にpackage CSSをグローバルへimportしてください。Safe Area用の非表示Headerと常時表示するNative Headerの使い分けは、[Safe Areaガイド](/docs/safe-area)を参照してください。

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header
- Source: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.0/projects/demo/src/app/scroll-header/scroll-header.page.html

```ts
import { Component } from '@angular/core';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular';
import { ScrollHeaderDirective } from '@rdlabo/ionic-angular-scroll-header';

@Component({
  selector: 'app-scroll-header',
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, ScrollHeaderDirective],
  template: `
    <ion-header class="hidden">
      <ion-toolbar></ion-toolbar>
    </ion-header>
    <ion-content rdlaboScrollHeader>
      <ion-header>
        <ion-toolbar>
          <ion-title>Scroll header</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list>
        @for (item of items; track item) {
          <ion-item>
            <ion-label>{{ item }}</ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>
  `,
})
export class ScrollHeaderPage {
  readonly items = Array.from({ length: 40 }, (_, index) => `Row ${index + 1}`);
}
```

下へスクロールするとContent Headerが隠れ、上へスクロールすると戻ります。外側の `ion-header.hidden` はSafe Area用の余白を確保します。別のHeader構成は [Safe Area](/docs/safe-area) を参照してください。
