---
title: Storage・Overlay
---

## 型付きStorage

Ionic Storageを一度provideします。`KitStorageService` は遅延初期化し、すべてのpublic操作が完了を待つため、service作成直後のwriteも失われません。

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

存在しないkeyに対して `get<T>()` は `null` を返します。`kitClearStoragePreservingKeys()` はアプリデータをclearしながら、最後に入力した認証emailやthemeなど、指定した値を復元します。

## 型付きOverlay

`provideKitOverlay()` でアプリ所有のlabelを設定し、`KitOverlayController` をinjectします。Kitは翻訳文言をhard-codeしません。

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

Component propsはAngularの `input()` fieldから、dismiss dataはcomponentのstatic `modalReturn` 宣言から推論されます。Ionic controllerをinlineで呼ばず、各Modal・Popoverの隣に型付きlauncherを置いてください。

同じcontrollerが `presentPopover()`、`presentToast()`、`alertClose()`、`alertConfirm()` を提供します。Modal optionの `watchKeyboard: true` はNative Keyboard表示中にBottom Sheetを全高へ広げます。
