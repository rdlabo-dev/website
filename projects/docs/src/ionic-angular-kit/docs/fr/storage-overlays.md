---
title: "Stockage et overlays"
sourceRevision: "85f32ffe2725385a47b97cde37216eb654bd283d4e8c7c5466ce73cdd18ed3bb"
---
## Stockage typé

Fournissez Ionic Storage une seule fois. `KitStorageService` l’initialise à la demande, et chaque opération publique attend la fin de cette initialisation : les écritures effectuées immédiatement après la création du service ne sont donc pas perdues.

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

`get<T>()` renvoie `null` lorsqu’une clé est absente. `kitClearStoragePreservingKeys()` efface les données applicatives tout en rétablissant les valeurs sélectionnées, par exemple le dernier e-mail d’authentification ou le thème.

## Overlays typés

Configurez les libellés appartenant à l’application avec `provideKitOverlay()` et injectez `KitOverlayController`. Le kit ne code pas les textes localisés en dur.

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

Les propriétés du composant sont déduites des champs Angular `input()`, et les données de fermeture de sa déclaration statique `modalReturn`. Placez un lanceur typé à côté de chaque fenêtre modale ou popover plutôt que d’appeler directement un contrôleur Ionic.

Le même contrôleur fournit `presentPopover()`, `presentToast()`, `alertClose()` et `alertConfirm()`. L’option de fenêtre modale `watchKeyboard: true` agrandit une feuille inférieure lorsque le clavier natif est visible.
