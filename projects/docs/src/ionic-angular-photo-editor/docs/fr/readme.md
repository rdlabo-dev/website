---
title: "Premiers pas"
sourceRevision: "148043aae11d5b3e8acd888db7cb96fddefc290388a0ec476c89031d71350fa4"
---
# @rdlabo/ionic-angular-photo-editor

Pages modales d’édition et de visualisation de photos pour les applications Ionic Angular, avec sélection de fichiers dans le navigateur et prise en charge facultative de l’appareil photo et de la galerie via Capacitor.

## Installation

```bash
npm install @rdlabo/ionic-angular-photo-editor tui-image-editor
```

## Sélectionner et afficher une photo dans le navigateur

Enregistrez l’adaptateur de redimensionnement TUI, requis pour le redimensionnement de `loadPhoto`, puis choisissez un fichier et affichez l’URL de données renvoyée :

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
      const files = await this.photoFileService.loadPhoto({ limit: 1 });
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

Cliquez sur Select photo et choisissez une image : l’aperçu apparaît. La configuration de l’appareil photo et de la galerie natifs est présentée plus loin dans [PhotoFileService](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/photo-file).

## Ajouter une visionneuse ou l’appareil photo natif

Installez les dépendances correspondant aux fonctions ajoutées :

```bash
# visionneuse
npm install swiper

# sélection native depuis la caméra et l’album
npm install @capacitor/camera
```

Pour l’accès à l’appareil photo natif, configurez les [autorisations Camera](https://capacitorjs.com/docs/apis/camera#android-configuration) et l’adaptateur décrit dans [PhotoFileService](/docs/photo-file). Les applications iOS natives nécessitent iOS/iPadOS 16.4 ou une version ultérieure.

## Points d’entrée du package

| Chemin d’importation                                         | Exports                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | Types, `providePhotoEditor`, `PHOTO_EDITOR_CONFIG`, `PhotoLoadError` |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | Adaptateur `createTuiImageEditor` à activer explicitement                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                   |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | Adaptateur `loadCapacitorPhotoCamera` à activer explicitement                            |

Importez les composants et services uniquement depuis leur point d’entrée. Importez les types partagés et la configuration depuis la racine du package.

## Choisir selon l’objectif d’édition

| Objectif                              | Guide                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Charger une photo depuis l’appareil photo ou la galerie | [PhotoFileService](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/photo-file)                                     |
| Recadrer et modifier dans une fenêtre modale          | [Éditeur de photos](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/editor)                                             |
| Parcourir des images dans une fenêtre modale          | [Visionneuse de photos](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/viewer)                                             |
| Personnaliser les couleurs de l’éditeur            | [Thème](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/theme)                                                     |
| Mettre à niveau depuis une version antérieure   | [Guide de migration](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/docs/migration.md#rdlaboionic-angular-photo-editor) |

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-angular-photo-editor](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor)

<!-- /rdlabo-docs-omit -->
