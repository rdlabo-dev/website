---
title: "Erste Schritte"
sourceRevision: "148043aae11d5b3e8acd888db7cb96fddefc290388a0ec476c89031d71350fa4"
---
# @rdlabo/ionic-angular-photo-editor

Modale Fotoeditor- und Betrachterseiten für Ionic-Angular-Anwendungen mit Dateiauswahl im Browser und optionaler Kamera-/Album-Unterstützung über Capacitor.

## Installation

```bash
npm install @rdlabo/ionic-angular-photo-editor tui-image-editor
```

## Ein Foto im Browser auswählen und anzeigen

Registrieren Sie den TUI-Adapter zur Größenänderung, der für die Größenänderung mit `loadPhoto` erforderlich ist. Wählen Sie anschließend eine Datei aus und zeigen Sie die zurückgegebene Daten-URL an:

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

Klicken Sie auf Select photo und wählen Sie ein Bild aus: Die Vorschau erscheint. Die Einrichtung von nativer Kamera und Album folgt unter [PhotoFileService](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/photo-file).

## Einen Betrachter oder die native Kamera ergänzen

Installieren Sie die Abhängigkeiten der Funktionen, die Sie hinzufügen:

```bash
# Bildanzeige
npm install swiper

# Native Kamera- und Albumauswahl
npm install @capacitor/camera
```

Für nativen Kamerazugriff konfigurieren Sie die [Kameraberechtigungen](https://capacitorjs.com/docs/apis/camera#android-configuration) und den Adapter unter [PhotoFileService](/docs/photo-file). Native iOS-Apps erfordern iOS/iPadOS 16.4 oder neuer.

## Einstiegspunkte des Pakets

| Importpfad                                         | Exporte                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-photo-editor`                | Typen, `providePhotoEditor`, `PHOTO_EDITOR_CONFIG`, `PhotoLoadError` |
| `@rdlabo/ionic-angular-photo-editor/editor`         | `PhotoEditorPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/editor/tui`     | Optionaler Adapter `createTuiImageEditor`                                |
| `@rdlabo/ionic-angular-photo-editor/viewer`         | `PhotoViewerPage`                                                    |
| `@rdlabo/ionic-angular-photo-editor/file`           | `PhotoFileService`                                                   |
| `@rdlabo/ionic-angular-photo-editor/file/capacitor` | Optionaler Adapter `loadCapacitorPhotoCamera`                            |

Importieren Sie Komponenten und Services ausschließlich über ihren Einstiegspunkt. Gemeinsam genutzte Typen und Konfiguration importieren Sie aus dem Root-Paket.

## Nach Bearbeitungsziel auswählen

| Ziel                              | Anleitung                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Ein Foto von Kamera oder Album laden | [PhotoFileService](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/photo-file)                                     |
| In einem modalen Dialog zuschneiden und bearbeiten          | [Fotoeditor](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/editor)                                             |
| Bilder in einem modalen Dialog durchsehen          | [Fotobetrachter](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/viewer)                                             |
| Editorfarben überschreiben            | [Theme](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor/docs/theme)                                                     |
| Von einer älteren Version aktualisieren   | [Migrationsanleitung](https://github.com/rdlabo-dev/ionic-angular-library/blob/v22.0.3/docs/migration.md#rdlaboionic-angular-photo-editor) |

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-angular-photo-editor](https://docs.rdlabo.dev/projects/ionic-angular-photo-editor)

<!-- /rdlabo-docs-omit -->
