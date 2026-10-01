---
title: "Visionneuse de photos"
sourceRevision: "1cb39a942464db1e23c19cd0897b6369034e7c8f0a187af65bc6de0cad39d582"
---
Présentez `PhotoViewerPage` depuis un bouton ou une méthode de page existante via une fenêtre modale Ionic. Faites-le après l’[installation](../README.md#installation). Installez `swiper` pour utiliser la visionneuse.

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

## Résultat de la fenêtre modale

Lorsque l’utilisateur appuie sur Supprimer, la fenêtre modale se ferme avec :

```typescript
interface PhotoViewerResult {
  action: 'delete';
  index: number;
  value: string; // URL de l’image à cet index
}
```

La fermeture ou un balayage vers le bas ne renvoie aucune donnée.

## Options

### imageUrls: string[]

**Obligatoire.** URL des images ou URL de données à afficher.

### index: number

Index de la diapositive initiale. Valeur par défaut : `0`.

### isCircle: boolean

Si la valeur est `true`, les images s’affichent dans un cercle.

### enableDelete: boolean

Si la valeur est `true`, affiche le bouton de suppression.

### enableFooterSafeArea: boolean

Si la valeur est `true`, ajoute une marge interne de zone de sécurité au pied de page sur iOS.

### toolbarColorScheme: 'light' | 'dark'

**Obligatoire.** Utilisez `dark` pour un `ion-toolbar` sombre/noir et `light` pour une barre claire/blanche. Consultez [Thème](./theme.md).

### imageAlt: string | ((url: string, index: number) => string)

Texte `alt` accessible pour chaque image de diapositive. La valeur par défaut est une chaîne vide. Fournissez une fonction si le texte alternatif dépend de l’URL ou de l’index.

### labels: Partial&lt;PhotoViewerLabels&gt;

Remplace les textes de l’interface par défaut. Les clés non renseignées conservent les valeurs japonaises intégrées :

| Clé    | Valeur par défaut (ja) |
| ------ | ------------ |
| close  | 閉じる       |
| delete | 削除         |

Le bouton de fermeture utilise également le `aria-label` du libellé `close`.
