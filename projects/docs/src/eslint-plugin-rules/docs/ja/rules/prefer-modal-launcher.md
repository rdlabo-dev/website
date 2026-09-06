---
title: prefer-modal-launcher
---

# @rdlabo/rules/prefer-modal-launcher

> `presentModal` 呼び出しを `launch*` launcher関数内に置くことを要求する。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

modalとsheetは、対象pageからexportされた専用launcher関数を介して表示してください。これにより、呼び出し側をmodal構築の詳細から分離し、application全体でmodal APIを統一できます。このルールは、`presentModal`（または設定した他のpresent method）がlauncher patternに一致する名前の関数内でのみ呼び出されることを保証します。

## ルール詳細

`presentModal`、`helper.presentModal(...)`、`overlay.presentSheet(...)` などの呼び出しについて `CallExpression` nodeを検査します。launcher関数内にない呼び出しは報告されます。

launcher関数とは、設定した正規表現（デフォルトは `^launch`）に名前が一致する関数です。次の形式を検査します。

- `function launchXxx(...)`
- `const launchXxx = (...)`
- `class Foo { launchXxx = (...) }`
- `class Foo { launchXxx() {} }`
  ネストした関数も考慮されます。たとえば `launchExamplePage` 内の `run` arrowは許可されます。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentModal"],
        "launcherNamePattern": "^launch"
      }
    ]
  }
}
```

### `presentMethodNames`

- 型: `string[]`
- デフォルト: `["presentModal"]`

制限対象とするpresent method名です。

### `launcherNamePattern`

- 型: `string`
- デフォルト: `"^launch"`

正規表現を表す文字列です。present method呼び出しは、このpatternに名前が一致する関数内になければなりません。

## 例

### 誤り

```ts
export class ExamplePage {
  readonly helper = inject(HelperService);

  async open() {
    await this.helper.presentModal(OtherPage, {}); // not in a launcher
  }
}
```

```ts
export class ExamplePage {
  readonly launchOtherPage = this.helper.presentModal(OtherPage, {}); // not a function
}
```

```ts
export async function openModal(overlay: Helper) {
  await overlay.presentModal(ExamplePage, {}); // name does not match ^launch
}
```

### 正しい

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  return overlay.presentModal(ExamplePage, props);
};
```

```ts
export function launchExamplePage(overlay: Helper, props: Props) {
  return overlay.presentModal(ExamplePage, props);
}
```

```ts
export const launchExamplePage = (overlay: Helper, props: Props) => {
  const run = () => overlay.presentModal(ExamplePage, props);
  return run();
};
```

### カスタム設定

```ts
export const openSheet = (overlay: Helper) => {
  return overlay.presentSheet(SheetPage, {});
};
```

```json
{
  "rules": {
    "@rdlabo/rules/prefer-modal-launcher": [
      "error",
      {
        "presentMethodNames": ["presentSheet"],
        "launcherNamePattern": "^(launch|open)"
      }
    ]
  }
}
```

## 有効にする場合

modal、sheet、その他のoverlayにlauncher patternを採用するIonic/Angularプロジェクトで有効にしてください。[`@rdlabo/rules/deny-element`](./deny-element.md) および [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md) と組み合わせて使用します。

## 関連項目

- [`@rdlabo/rules/deny-element`](./deny-element.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-modal-launcher.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-modal-launcher.ts)
