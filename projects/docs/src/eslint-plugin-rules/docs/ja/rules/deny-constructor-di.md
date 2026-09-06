---
title: deny-constructor-di
---

# @rdlabo/rules/deny-constructor-di

> このプラグインはconstructor内のDependency Injectionを禁止します。

このルールは、`constructor(private readonly auth: AuthService)` のようにDependency Injectionに使われるconstructor parameter propertyを報告します。Angularの `inject()` 関数は、standalone Componentやserviceで依存関係を取得する現代的な方法です。constructorの定型コードをなくし、DIを明示的にします。

## ルール詳細

クラスのconstructorを検査し、`TSParameterProperty`（`public`、`private`、`readonly` などの修飾子を持つparameter）を報告します。これらはクラスフィールドになり、DIに使われるparameterです。

- 修飾子のない通常のconstructor parameterは許可されます。
- このルールは自動修正しません。constructor DIを手動で `inject()` に置き換える必要があります。

## 例

### 誤り

```ts
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  constructor(
    private store: Store<IApp>,
    public readonly navCtrl: NavController,
  ) {}
}
```

### 正しい

```ts
import { inject } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  private readonly store = inject(Store<IApp>);
  private readonly navCtrl = inject(NavController);
}
```

```ts
// Non-DI constructor parameters are allowed
export class LogManager {
  constructor(logDomain: string) {
    this.logDomain = logDomain;
  }
}
```

## オプション

このルールにオプションはありません。

## 有効にする場面

constructor parameter propertyではなく `inject()` でAngularの依存関係を取得することをプロジェクトで要求する場合に、このopt-inルールを有効にします。このルールは `TSParameterProperty` nodeだけを報告するため、通常のconstructor parameterは引き続き許可されます。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-constructor-di.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-constructor-di.ts)
