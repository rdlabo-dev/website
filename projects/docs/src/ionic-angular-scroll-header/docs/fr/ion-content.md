---
title: "IonContent"
sourceRevision: "21a016a78f5b3a1dc1b58e2a695b517ba04fb34e2949d7faa04f3e47ecb5da2c"
---
Associez des en-têtes sensibles au défilement au contenu Ionic. Faites-le après l’[installation](../README.md#installation). Importez d’abord globalement le CSS du package. Les en-têtes masqués préservant la zone de sécurité et les en-têtes natifs toujours visibles sont décrits dans [Zone de sécurité](./safe-area.md).

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/projects/demo/src/app/scroll-header/scroll-header.page.html

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

Faites défiler vers le bas : l’en-tête du contenu disparaît. Faites défiler vers le haut : il réapparaît. L’élément externe `ion-header.hidden` réserve l’espace de la zone de sécurité ; consultez [Zone de sécurité](./safe-area.md) si vous avez besoin d’une autre disposition d’en-tête.
