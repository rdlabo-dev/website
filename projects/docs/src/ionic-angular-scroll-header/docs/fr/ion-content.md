---
title: "IonContent"
sourceRevision: "1cbdf6ba2a8d0c2c126ea7dba3a0d820d21e7a38ee1c5fec543288cd0e675282"
---
Associez des en-têtes sensibles au défilement au contenu Ionic. Faites-le après l’[installation](/docs/readme#installation). Importez d’abord globalement le CSS du package. Les en-têtes masqués préservant la zone de sécurité et les en-têtes natifs toujours visibles sont décrits dans [Zone de sécurité](/docs/safe-area).

- Démonstration : https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header
- Code source : https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.6/projects/demo/src/app/scroll-header/scroll-header.page.html

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

Faites défiler vers le bas : l’en-tête du contenu disparaît. Faites défiler vers le haut : il réapparaît. L’élément externe `ion-header.hidden` réserve l’espace de la zone de sécurité ; consultez [Zone de sécurité](/docs/safe-area) si vous avez besoin d’une autre disposition d’en-tête.
