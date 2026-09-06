---
title: no-component-method-except-lifecycle
---

# @rdlabo/rules/no-component-method-except-lifecycle

> `@Component` 上のlifecycle以外のmethodを禁止する。許可するlifecycle methodは `implements` から導出する（プロパティは許可）。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

`@Component` クラスは薄く保ちます。振る舞いは `ViewModel`（またはmodalの `launch*` ヘルパー）に置きます。

許可される**method**は、`implements` に列挙したlifecycle interfaceと一致するものだけです。対応するinterfaceなしのlifecycle methodもエラーです。

**プロパティは対象外**です。`readonly open = () => ...` のようなarrow-functionフィールドも含みます。getter / setter と `constructor` は許可されます。

`@Directive` / `@Injectable` / 通常のクラスは検査しません。`@rdlabo/rules/require-viewmodel` および `@rdlabo/rules/implements-ionic-lifecycle` と併用します。

> 既存アプリにはComponent methodが多いことがよくあります。まず `"warn"` から始め、ViewModelへロジックを移してから `"error"` に切り替えるのが望ましいです。

## ルール詳細

✅ 正しい: methodが `implements` と一致する

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  open() {
    launchOtherPage(this.helper, {});
  }

  reload() {
    this.vm.reload$.next();
  }
}
```

❌ 誤り: `implements` なしのlifecycle method

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  ionViewWillEnter() {} // missing implements ViewWillEnter
}
```

❌ 誤り: implementsしたinterfaceがmethodをカバーしていない

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter, ViewWillLeave, OnDestroy {
  readonly vm = new ViewModel(this);
  readonly open = () => launchOtherPage(this.helper, {});

  ionViewWillEnter() {
    this.vm.reload$.next();
  }

  ionViewWillLeave() {}
  ngOnDestroy() {}
}
```

❌ 誤り: Component上の任意method

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter {
  ionViewWillEnter() {}

  trackById(_index: number, item: { id: number }) {
    return item.id;
  }

  customHook() {}
}
```

## Interface → method の対応

### Angular

| `implements`          | メソッド                |
| --------------------- | ----------------------- |
| `OnChanges`           | `ngOnChanges`           |
| `OnInit`              | `ngOnInit`              |
| `DoCheck`             | `ngDoCheck`             |
| `AfterContentInit`    | `ngAfterContentInit`    |
| `AfterContentChecked` | `ngAfterContentChecked` |
| `AfterViewInit`       | `ngAfterViewInit`       |
| `AfterViewChecked`    | `ngAfterViewChecked`    |
| `OnDestroy`           | `ngOnDestroy`           |

### Ionic

| `implements`     | メソッド            |
| ---------------- | ------------------- |
| `ViewWillEnter`  | `ionViewWillEnter`  |
| `ViewDidEnter`   | `ionViewDidEnter`   |
| `ViewWillLeave`  | `ionViewWillLeave`  |
| `ViewDidLeave`   | `ionViewDidLeave`   |
| `ViewWillUnload` | `ionViewWillUnload` |

許可（報告しない）: `constructor`、`get` / `set` アクセサ、すべてのプロパティ。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": ["trackById", "customHook"]
      }
    ]
  }
}
```

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": []
      }
    ]
  }
}
```

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-component-method-except-lifecycle.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-component-method-except-lifecycle.ts)
