---
title: "Speicher und Overlays"
sourceRevision: "85f32ffe2725385a47b97cde37216eb654bd283d4e8c7c5466ce73cdd18ed3bb"
---
## Typisierter Speicher

Stellen Sie Ionic Storage einmal bereit. `KitStorageService` initialisiert den Speicher bei Bedarf, und jede öffentliche Operation wartet auf diese Initialisierung. Deshalb gehen Schreibzugriffe unmittelbar nach der Erstellung des Services nicht verloren.

```ts
import { importProvidersFrom, type ApplicationConfig } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(IonicStorageModule.forRoot({ name: '__mydb' }))],
};
```

```ts
import { inject, Injectable } from '@angular/core';
import { KitStorageService } from '@rdlabo/ionic-angular-kit';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  readonly #storage = inject(KitStorageService);

  async save(token: string): Promise<void> {
    await this.#storage.set('token', token);
  }

  get(): Promise<string | null> {
    return this.#storage.get<string>('token');
  }

  remove(): Promise<void> {
    return this.#storage.remove('token');
  }
}
```

`get<T>()` gibt für einen fehlenden Schlüssel `null` zurück. `kitClearStoragePreservingKeys()` löscht Anwendungsdaten und stellt ausgewählte Werte wie die zuletzt verwendete Authentifizierungs-E-Mail-Adresse oder das Theme wieder her.

## Typisierte Overlays

Konfigurieren Sie anwendungseigene Beschriftungen mit `provideKitOverlay()` und injizieren Sie `KitOverlayController`. Das Kit legt keine lokalisierten Oberflächentexte fest vor.

```ts
provideKitOverlay({
  labels: {
    close: $localize`Close`,
    cancel: $localize`Cancel`,
  },
});
```

```ts
export class DetailPage {
  declare static readonly modalReturn: DetailResult;
  readonly item = input.required<Item>();
}

export const launchDetailPage = (overlay: KitOverlayController, props: { item: Item }): Promise<DetailResult | undefined> =>
  overlay.presentModal(DetailPage, props, { backdropDismiss: false });
```

Komponenten-Props werden aus Angular-`input()`-Feldern abgeleitet, Rückgabedaten beim Schließen aus der statischen `modalReturn`-Deklaration der Komponente. Legen Sie neben jedem modalen Dialog oder Popover einen typisierten Starter an, statt einen Ionic-Controller direkt aufzurufen.

Derselbe Controller stellt `presentPopover()`, `presentToast()`, `alertClose()` und `alertConfirm()` bereit. Die Dialogoption `watchKeyboard: true` erweitert ein Bottom Sheet, während die native Tastatur sichtbar ist.
