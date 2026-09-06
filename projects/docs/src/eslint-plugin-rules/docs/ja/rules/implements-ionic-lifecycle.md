---
title: implements-ionic-lifecycle
---

# @rdlabo/rules/implements-ionic-lifecycle

> このプラグインはIonic Lifecycleのimplementsを推奨します。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

Ionicは `ionViewWillEnter` や `ionViewDidLeave` などのframework-level lifecycle methodを提供します。Componentでこれらのmethodを宣言する場合、TypeScriptがcontractを型検査できるよう、対応するinterface（`ViewWillEnter`、`ViewDidEnter`、`ViewWillLeave`、`ViewDidLeave`）もimplementsする必要があります。このルールはその組み合わせを強制し、`implements` clauseを自動修正できます。

## ルール詳細

`@Component` で装飾されたクラスを検査し、次のIonic lifecycle method名を持つmethod definitionを探します。

- `ionViewWillEnter` -> `ViewWillEnter`
- `ionViewDidEnter` -> `ViewDidEnter`
- `ionViewWillLeave` -> `ViewWillLeave`
- `ionViewDidLeave` -> `ViewDidLeave`

methodが存在し、対応するinterfaceがなければ報告します。欠けているinterfaceを修正する際は、`implements` clause全体を、使用中のmethodに対応するIonic lifecycle interfaceで置き換えます。この処理で `OnInit` など無関係なinterfaceが削除される場合があるため、修正内容を確認し、クラスに引き続き必要なIonic以外のinterfaceを戻してください。必要なinterfaceがすべて存在する場合、余分なlifecycle interfaceは報告も削除もされません。

- Component以外のクラスは検査しません。
- class bodyが空でもlifecycle interfaceをimplementsしている場合、古い `implements` clauseを削除します。
- fixの重複を避けるため、修正可能なgroupごとに一度だけ報告します。

## 例

### 誤り

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

### 正しい

```ts
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewWillEnter, ViewWillLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewDidEnter() {}
  ionViewDidLeave() {}
}
```

## オプション

このルールにオプションはありません。

## 有効にする場面

すべてのIonic Angularプロジェクトで、このルールを有効にします。lifecycle methodを追加・改名・削除したときに `implements` clauseを正確に保つのに役立ち、`--fix` と組み合わせて利用できます。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/implements-ionic-lifecycle.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/implements-ionic-lifecycle.ts)
