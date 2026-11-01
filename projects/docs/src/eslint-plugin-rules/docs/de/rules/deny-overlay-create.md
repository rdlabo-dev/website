---
title: "deny-overlay-create"
sourceRevision: "0569ce7e261407d1b9dff03d7e11e0cd60bb16fb9f74f3c4e8dcdfc38790016e"
---
# @rdlabo/rules/deny-overlay-create

> Verbietet `.create()` an ModalController / PopoverController; Overlays werden stattdessen über Launcher geöffnet.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) enthalten.

Diese Regel verhindert die direkte Erstellung von Ionic-Overlays über Controller-Aufrufe `.create()`. In der rdlabo-Architektur sollten Overlays über Launcher-Funktionen und eine gemeinsame Hilfsfunktion `presentModal` / `presentPopover` geöffnet werden. Dadurch bleibt die Overlay-Logik zentralisiert und die Aufrufstelle von der Controller-API entkoppelt.

## Einzelheiten der Regel

Die Regel erkennt `.create()`-Aufrufe, deren Empfänger ein `ModalController` oder `PopoverController` beziehungsweise ein anderer konfigurierter Controller ist. Sie löst den Controller anhand mehrerer Muster auf:

- `this.modalCtrl.create()`
- `modalCtrl.create()` (wobei `modalCtrl` gleich `inject(ModalController)` ist)
- `inject(ModalController).create()`
- Konstruktorparameter `constructor(private modalCtrl: ModalController)`
- Klassenproperty mit Typ `ModalController`

Andere Overlay-Controller wie `LoadingController`, `AlertController`, `ToastController` und `ActionSheetController` werden standardmäßig nicht verboten, da sie bewusst direkt verwendet werden können.

## Optionen

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

- Typ: `string[]`
- Standard: `["ModalController", "PopoverController"]`

Namen der Controller-Klassen, deren `.create()`-Aufrufe verboten werden sollen. Verwenden Sie ein leeres Array, um die Regel zu deaktivieren.

## Beispiele

### Inkorrekt

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

### Korrekt

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

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-Projekten, die das Launcher-Muster und eine gemeinsame Overlay-Hilfsfunktion verwenden. Sie ergänzt [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher) und [`@rdlabo/rules/deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element).

## Siehe auch

- [`@rdlabo/rules/prefer-modal-launcher`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/prefer-modal-launcher)
- [`@rdlabo/rules/deny-element`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules/deny-element)

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/src/rules/deny-overlay-create.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.1/tests/rules/deny-overlay-create.ts)
