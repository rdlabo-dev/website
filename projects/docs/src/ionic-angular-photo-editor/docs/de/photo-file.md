---
title: "PhotoFileService"
sourceRevision: "53cdfc80235f4aabe79c254c4dee4f08257e8d7ca7870ab415e2c7a41f9cdd61"
---
Laden Sie Fotos über die Dateiauswahl im Browser oder auf nativen Plattformen von Kamera oder Album. Verwenden Sie dies nach der [Installation](../README.md#installation).

## Browser: auswählen und anzeigen

`createImageEditor` ist erforderlich, da `loadPhoto` die Größe immer über den Bildeditor-Adapter anpasst. Lassen Sie `loadCamera` bei reinen Web-Apps weg.

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

## Native Kamera und Album

Installieren Sie `@capacitor/camera`, konfigurieren Sie die Plattformberechtigungen und registrieren Sie `loadCapacitorPhotoCamera`. Auf nativen Plattformen lässt ein Action Sheet die Nutzer zwischen Kamera und Album wählen. Anfragespezifische `labels` überschreiben die entsprechenden Werte aus `providePhotoEditor({ labels })`.

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

Öffnet die Fotoauswahl der Plattform und gibt normalisierte Daten-URLs zurück.

| Option    | Standard                        | Beschreibung                                    |
| --------- | ------------------------------ | ---------------------------------------------- |
| `limit`   | `1`                            | Maximale Anzahl Bilder, nur für Album und Web. |
| `maxSize` | Konfigurierter Wert `maxSize` oder `1000` | Längste Kante in Pixeln nach der Größenänderung.           |
| `labels`  | Konfigurierte `labels`            | Schaltflächentexte des Action Sheets, nur Capacitor.     |

### Browserverhalten

Im Web erstellt `loadPhoto()` synchron ein verborgenes `<input type="file">`, hängt es an `document.body` an und ruft `click()` im selben Ablauf wie die Nutzeraktion des Aufrufers auf. Dadurch bleibt die vorübergehende Nutzeraktivierung von WebKit erhalten. Das Eingabeelement besitzt keine feste ID und wird nach Auswahl oder Abbruch entfernt.

Fügen Sie kein statisches Dateieingabeelement zu `index.html` hinzu.

### Capacitor-Verhalten

Registrieren Sie `loadCapacitorPhotoCamera` aus `/file/capacitor`; der grundlegende Einstiegspunkt `/file` bleibt für reine Browseranwendungen ohne `@capacitor/camera` nutzbar.

### Fehler

Erwartete Fehler lösen `PhotoLoadError` aus:

| Code           | Auslöser                                                     |
| -------------- | -------------------------------------------------------- |
| `cancelled`    | Der Nutzer hat die Auswahl oder das Action Sheet geschlossen                |
| `invalid-type` | Die ausgewählte Datei ist kein Bild, nur Web                 |
| `unavailable`  | Fehler bei Berechtigung, Plugin, Auswahl, Dateilesen oder Größenänderung |

## Vorgabebeschriftungen (ja)

Wenn weder globale noch anfragespezifische `labels` angegeben werden:

| Schlüssel    | Standard (ja)     |
| ------ | ---------------- |
| camera | カメラ撮影       |
| album  | アルバムから選択 |
| cancel | キャンセル       |

## providePhotoEditor(config?)

Registrieren Sie anwendungsweite Standardwerte in `app.config.ts`. `PhotoFileService` liest diese Adapter sowie die globalen Vorgaben für `maxSize` und `labels` aus dieser Konfiguration. Anfragespezifische Werte gleichen Namens überschreiben sie für einen einzelnen Aufruf. Eine Größenänderung erfordert `createImageEditor`; eine native Auswahl erfordert `loadCamera`. Fehlende Adapter lösen `PhotoLoadError` mit `code: 'unavailable'` aus.
