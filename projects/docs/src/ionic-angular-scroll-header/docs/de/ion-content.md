---
title: "IonContent"
sourceRevision: "1cbdf6ba2a8d0c2c126ea7dba3a0d820d21e7a38ee1c5fec543288cd0e675282"
---
Binden Sie scrollabhängige Header an Ionic-Inhalte an. Verwenden Sie dies nach der [Installation](/docs/readme#installation) und importieren Sie zuvor das Paket-CSS global. Verborgene Safe-Area-Header und dauerhaft sichtbare native Header werden unter [Safe Area](/docs/safe-area) beschrieben.

- Demo: https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header
- Quellcode: https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.6/projects/demo/src/app/scroll-header/scroll-header.page.html

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

Scrollen Sie nach unten: Der Inhaltsheader wird ausgeblendet. Scrollen Sie nach oben: Er erscheint wieder. Der äußere `ion-header.hidden` reserviert Platz für die Safe Area. Für ein anderes Header-Layout siehe [Safe Area](/docs/safe-area).
