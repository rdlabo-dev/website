---
title: ルール一覧
---

パッケージは22個のルールを公開します。「推奨」のYesはIonic・Angular向け `rdlabo.configs.recommended`、Wは汎用TypeScriptの `workers/recommended`、TZは汎用TypeScriptの `workers-timezone/recommended` で有効になるルールです。

| ルール                                                                                                         | 目的                                                                  | Fix | 推奨 |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | :-: | :--: |
| [`component-property-use-readonly`](/eslint-plugin-rules/docs/rules/component-property-use-readonly)           | Angular Componentの不変プロパティに `readonly` を要求する。           | Yes | Yes  |
| [`deny-constructor-di`](/eslint-plugin-rules/docs/rules/deny-constructor-di)                                   | constructor DIを禁止する。`inject()`を推奨する非推奨ルール。          | No  |  No  |
| [`deny-element`](/eslint-plugin-rules/docs/rules/deny-element)                                                 | インラインIonic Overlayなど、設定したHTML要素を禁止する。             | No  | Yes  |
| [`deny-overlay-create`](/eslint-plugin-rules/docs/rules/deny-overlay-create)                                   | Modal・Popover Controllerの直接 `.create()` を禁止する。              | No  | Yes  |
| [`deny-soft-private-modifier`](/eslint-plugin-rules/docs/rules/deny-soft-private-modifier)                     | TypeScriptの `private` をハードプライベート `#` へ置換する。          | Yes | Yes  |
| [`implements-ionic-lifecycle`](/eslint-plugin-rules/docs/rules/implements-ionic-lifecycle)                     | Angular・Ionic lifecycle methodに対応するinterfaceを要求する。        | Yes | Yes  |
| [`initialize-timezone-at-module-scope`](/eslint-plugin-rules/docs/rules/initialize-timezone-at-module-scope)   | workers-timezoneの初期化を明確なモジュール直下の1箇所に限定する。     | No  |  TZ  |
| [`ionic-attr-type-check`](/eslint-plugin-rules/docs/rules/ionic-attr-type-check)                               | 文字列以外のIonic属性へproperty bindingを要求する。                   | Yes | Yes  |
| [`no-component-method-except-lifecycle`](/eslint-plugin-rules/docs/rules/no-component-method-except-lifecycle) | lifecycle以外の任意methodをComponentへ置かない。                      | No  | Yes  |
| [`no-component-writable-signal`](/eslint-plugin-rules/docs/rules/no-component-writable-signal)                 | Signal Forms modelの例外を除き、書き込み可能状態をViewModelへ置く。   | No  |  No  |
| [`no-implicit-timezone`](/eslint-plugin-rules/docs/rules/no-implicit-timezone)                                 | Date・Intl APIのhost timezoneへの暗黙依存を防ぐ。                     | No  |  TZ  |
| [`no-reactive-forms`](/eslint-plugin-rules/docs/rules/no-reactive-forms)                                       | Reactive Formsを禁止し、Angular Signal Formsへ移行する。              | No  |  No  |
| [`no-template-driven-forms`](/eslint-plugin-rules/docs/rules/no-template-driven-forms)                         | 許可した相互運用要素を除きtemplate-driven formsを禁止する。           | No  |  No  |
| [`prefer-disable-handler`](/eslint-plugin-rules/docs/rules/prefer-disable-handler)                             | 非同期操作の二重実行を防ぐwrapperを要求する。                         | No  | Yes  |
| [`prefer-ionic-standalone`](/eslint-plugin-rules/docs/rules/prefer-ionic-standalone)                           | Ionic 9 standalone importを優先し、`IonicModule` を禁止する。         | Yes | Yes  |
| [`prefer-modal-launcher`](/eslint-plugin-rules/docs/rules/prefer-modal-launcher)                               | `presentModal` 呼び出しを `launch*` 関数に限定する。                  | No  | Yes  |
| [`require-ion-error-text`](/eslint-plugin-rules/docs/rules/require-ion-error-text) | Signal FormsのIonic検証コントロールにerrorTextの供給元を要求する。 | No | Yes |
| [`require-ion-item-group`](/eslint-plugin-rules/docs/rules/require-ion-item-group)                             | iOS 26・MD3向けにIonic list itemのgroup化を要求する。                 | Yes | Yes  |
| [`require-viewmodel`](/eslint-plugin-rules/docs/rules/require-viewmodel)                                       | Component所有と `ViewModelStore` 境界を検査する。                     | No  | Yes  |
| [`restrict-try-block`](/eslint-plugin-rules/docs/rules/restrict-try-block)                                     | `try` を短く保ち、Promise・RxJS・Signal contextをポリシーで制限する。 | No  | Yes, W |
| [`signal-use-as-signal-template`](/eslint-plugin-rules/docs/rules/signal-use-as-signal-template)               | テンプレートでSignalを読むときに `()` を要求する。                    | No  | Yes  |
| [`signal-use-as-signal`](/eslint-plugin-rules/docs/rules/signal-use-as-signal)                                 | TypeScriptで正しいSignalの読み書きを要求する。                        | Yes | Yes  |

## ルール別ドキュメント

各ルールページに詳細・オプション・正誤例があります。

## 型情報を使うルール

TypeScript型を調べるルールでは `parserOptions.projectService` を有効にします。`no-implicit-timezone` は、Dateと同名のmethodを持つ無関係なobjectを誤検出しないためtyped lintingが必須です。typed lintingがない場合も `restrict-try-block` の構文検査は動作しますが、Promise・RxJSの型依存検査はスキップされます。

`initialize-timezone-at-module-scope` は構文だけを調べ、型情報は不要です。
