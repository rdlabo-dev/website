---
title: deny-overlay-create
---

# @rdlabo/rules/deny-overlay-create

> ModalController / PopoverControllerの `.create()` を禁止し、launcher経由でoverlayを開く。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

このルールは、controllerの `.create()` 呼び出しによるIonic overlayの直接生成を防ぎます。rdlabo architectureでは、overlayはlauncher functionと共有の `presentModal` / `presentPopover` helperを通じて開きます。これによりoverlay logicを一元化し、呼び出し側をcontroller APIから分離できます。

## ルール詳細

receiverが `ModalController`、`PopoverController`（または設定した他のcontroller）である `.create()` 呼び出しを検出します。次のような複数のpatternからcontrollerを解決します。

- `this.modalCtrl.create()`
- `modalCtrl.create()`（`modalCtrl` が `inject(ModalController)` の場合）
- `inject(ModalController).create()`
- constructor parameter `constructor(private modalCtrl: ModalController)`
- `ModalController` 型のclass property

`LoadingController`、`AlertController`、`ToastController`、`ActionSheetController` など、その他のoverlay controllerは直接使うことが意図されている場合があるため、デフォルトでは禁止しません。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/deny-overlay-create": [
      "error",
      {
        "deny": ["ModalController", "PopoverController"]
      }
    ]
  }
}
```

### `deny`

- 型: `string[]`
- デフォルト: `["ModalController", "PopoverController"]`

`.create()` 呼び出しを禁止するcontroller class nameです。空の配列を指定するとルールを無効にできます。

## 例

### 誤り

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  async open() {
    await this.#modalCtrl.create({ component: OtherPage });
  }
}
```

```ts
export async function open(modalCtrl: ModalController) {
  await modalCtrl.create({ component: OtherPage });
}
```

```ts
export class ExamplePage {
  constructor(private modalCtrl: ModalController) {}

  async open() {
    await this.modalCtrl.create({ component: OtherPage });
  }
}
```

### 正しい

```ts
export const launchOtherPage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(OtherPage, props);
};
```

```ts
export class ExamplePage {
  readonly #loadingCtrl = inject(LoadingController);

  async showLoading() {
    await this.#loadingCtrl.create({ message: '...' });
  }
}
```

```ts
export class ExamplePage {
  readonly #modalCtrl = inject(ModalController);

  dismiss(data?: unknown) {
    this.#modalCtrl.dismiss(data);
  }
}
```

## 有効にする場面

launcher patternと共有overlay helperを使うIonicプロジェクトで、このルールを有効にします。[`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)および[`@rdlabo/rules/deny-element`](./deny-element.md)と組み合わせて使います。

## 関連項目

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/deny-element`](./deny-element.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-overlay-create.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-overlay-create.ts)
