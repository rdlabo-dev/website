---
title: 移行
---

## iOS 27の命名

現在のテーマには `@rdlabo/ionic-theme-ios27` を使います。スタイルシートのimportを `ionic-theme-ios27.scss` または `ionic-theme-ios27.css` に更新してください。`-dark-always`、`-dark-system`、`-dark-class` も同様です。

CSS変数にはバージョンに依存しない `--ios-theme-*` を使います。対応する `--ios26-*` はdeprecatedのフォールバックとして引き続き利用できます。両方を指定した場合は新名が優先されます。例えば `--ios26-content-box-shadow-rgb` の代わりに `--ios-theme-content-box-shadow-rgb` を使います。

テーマの適用を除外する場合は `ios-theme-disabled` クラスを使います。`ios26-disabled` はdeprecatedの互換名として引き続き利用できます。既存のマークアップは都合のよいタイミングで移行してください。

現在の名称は[特別なマークアップとクラス](/docs/special-markup)と[デフォルト変数](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v0.1.0-1/src/styles/default-variables.scss)を参照してください。

以前の移行案内は[iOS 26の移行ガイド](/ionic-theme-ios26/docs/migration)に残しています。
