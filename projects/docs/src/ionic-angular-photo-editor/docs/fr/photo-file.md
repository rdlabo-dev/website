---
title: "PhotoFileService"
sourceRevision: "53cdfc80235f4aabe79c254c4dee4f08257e8d7ca7870ab415e2c7a41f9cdd61"
---
Chargez des photos depuis le sélecteur de fichiers du navigateur ou, sur les plateformes natives, depuis l’appareil photo ou la galerie. Appelez cette fonction après l’[installation](../README.md#installation).

## Navigateur : sélectionner et afficher

`createImageEditor` est requis, car `loadPhoto` redimensionne toujours l’image avec l’adaptateur de l’éditeur d’images. Omettez `loadCamera` dans les applications exclusivement Web.

```typescript
import { Component, inject, signal } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { IonButton, IonImg } from '@ionic/angular';
import { providePhotoEditor, PhotoLoadError } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { PhotoFileService } from '@rdlabo/ionic-angular-photo-editor/file';

export const appConfig: ApplicationConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1000,
      createImageEditor: createTuiImageEditor,
    }),
  ],
};

@Component({
  selector: 'app-photo-pick',
  imports: [IonButton, IonImg],
  template: `
    <ion-button type="button" (click)="pick()">Select photo</ion-button>
    @if (previewUrl()) {
      <ion-img [src]="previewUrl()" alt="Selected photo"></ion-img>
    }
  `,
})
export class PhotoPickPage {
  private readonly photoFileService = inject(PhotoFileService);
  readonly previewUrl = signal('');

  async pick(): Promise<void> {
    try {
      const files = await this.photoFileService.loadPhoto({
        limit: 1,
        maxSize: 1000,
      });
      this.previewUrl.set(files[0] ?? '');
    } catch (error) {
      if (error instanceof PhotoLoadError && error.code === 'cancelled') {
        return;
      }
      throw error;
    }
  }
}
```

## Appareil photo et galerie natifs

Installez `@capacitor/camera`, configurez les autorisations des plateformes et enregistrez `loadCapacitorPhotoCamera`. Sur les plateformes natives, une feuille d’actions demande à l’utilisateur de choisir l’appareil photo ou la galerie. Les `labels` propres à la requête complètent les valeurs de `providePhotoEditor({ labels })` et les remplacent pour les mêmes clés.

```typescript
import { providePhotoEditor } from '@rdlabo/ionic-angular-photo-editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';
import { loadCapacitorPhotoCamera } from '@rdlabo/ionic-angular-photo-editor/file/capacitor';

export const appConfig = {
  providers: [
    providePhotoEditor({
      maxSize: 1000,
      labels: {
        camera: 'Camera',
        album: 'Album',
        cancel: 'Cancel',
      },
      createImageEditor: createTuiImageEditor,
      loadCamera: loadCapacitorPhotoCamera,
    }),
  ],
};
```

## loadPhoto(options?)

Ouvre le sélecteur de photos de la plateforme et renvoie des URL de données normalisées.

| Option    | Valeur par défaut                        | Description                                    |
| --------- | ------------------------------ | ---------------------------------------------- |
| `limit`   | `1`                            | Nombre maximal d’images, uniquement pour la galerie et le Web. |
| `maxSize` | `maxSize` configuré ou `1000` | Longueur du plus grand côté en pixels après redimensionnement.           |
| `labels`  | `labels` configurés            | Texte des boutons de la feuille d’actions, uniquement avec Capacitor.     |

### Comportement dans le navigateur

Sur le Web, `loadPhoto()` crée de façon synchrone un `<input type="file">` masqué, l’ajoute à `document.body` et appelle `click()` dans le même tour d’exécution que le geste de l’appelant. Cela préserve l’activation utilisateur transitoire de WebKit. Cet input n’a pas d’identifiant fixe ; il est supprimé après la sélection ou l’annulation.

N’ajoutez pas d’input de fichier statique à `index.html`.

### Comportement avec Capacitor

Enregistrez `loadCapacitorPhotoCamera` depuis `/file/capacitor` ; le point d’entrée de base `/file` reste utilisable par les applications exclusivement navigateur, sans `@capacitor/camera`.

### Erreurs

Les échecs attendus déclenchent `PhotoLoadError` :

| Code           | Cas                                                     |
| -------------- | -------------------------------------------------------- |
| `cancelled`    | L’utilisateur a fermé le sélecteur ou la feuille d’actions                |
| `invalid-type` | Le fichier sélectionné n’est pas une image, sur le Web uniquement                 |
| `unavailable`  | Échec d’autorisation, du plugin, du sélecteur, de lecture du fichier ou du redimensionnement |

## Libellés par défaut (ja)

Lorsqu’aucun `labels` global ni propre à la requête n’est fourni :

| Clé    | Valeur par défaut (ja)     |
| ------ | ---------------- |
| camera | カメラ撮影       |
| album  | アルバムから選択 |
| cancel | キャンセル       |

## providePhotoEditor(config?)

Enregistrez les valeurs par défaut de l’application dans `app.config.ts`. `PhotoFileService` lit ces adaptateurs, ainsi que les valeurs globales par défaut de `maxSize` et de `labels`, depuis cette configuration. Les valeurs de même nom propres à une requête les remplacent pour cet appel. Le redimensionnement nécessite `createImageEditor` ; le sélecteur natif nécessite `loadCamera`. Un adaptateur manquant déclenche `PhotoLoadError` avec `code: 'unavailable'`.
