---
title: はじめに
---

Angular・Ionicアプリ向けの共有コード規約と、Cloudflare Workers向けのフレームワーク非依存TypeScript presetです。Component境界、templateの使い方、暗黙のタイムゾーン操作を、レビュー前のlintで検出します。

[検出と自動修正を試す](/docs/quickstart)では、Angular・Ionicなしで小さなTypeScriptプロジェクトから始められます。

## インストール

開発依存関係としてプラグインをインストールします。

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

Angular・Ionicルールを使う場合は、下表のframework peerもインストールしてください。完全なセットアップは[設定](/docs/configuration)を参照してください。

## 要件

| パッケージ                        | 対応バージョン                 |
| --------------------------------- | ------------------------------ |
| Node.js                           | 20以降                         |
| ESLint                            | 9以降                          |
| `@typescript-eslint/utils`        | 8.33以上9未満                  |
| `@angular-eslint/template-parser` | 21.xまたは22.x                  |
| `@ionic/angular`                  | Ionicルール利用時は9.x          |
| `@ionic/core`                     | Ionicルール利用時は9.x          |

## エントリポイントを選ぶ

| Preset | エントリポイント | 用途 |
| --- | --- | --- |
| `recommended` | `@rdlabo/eslint-plugin-rules` | Angular・IonicのTypeScriptとHTML規約 |
| `workers/recommended` | `@rdlabo/eslint-plugin-rules/typescript` | Workersの `try/catch` ポリシー（opt-in） |
| `workers-timezone/recommended` | `@rdlabo/eslint-plugin-rules/typescript` | `@rdlabo/workers-timezone` 向けcompanionポリシー（opt-in） |

Angularの `recommended` はパッケージルートに含まれます。Workersの2つのpresetは `/typescript` 上の独立したopt-inで、互いに含み合いません。日時変換と検査は[`@rdlabo/workers-timezone`](/workers-timezone/docs/readme)と組み合わせてください。Flat Configの対象指定とIonic list構造は[設定](/docs/configuration)にあります。

## ドキュメント

- [設定](/docs/configuration) — Angular/Ionic・TypeScript・Workers向けの構成例
- [ルール](/docs/rules) — presetの範囲、オプション、例
- [移行ガイド](/docs/migration) — 既存インストールの更新
