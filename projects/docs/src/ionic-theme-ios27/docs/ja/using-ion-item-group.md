---
title: ion-item-group の使い方
---

# インセットリストでの `ion-item-group` の使い方

ほとんどの Ionic マークアップは変更せずに使えます。`ion-list` が `inset="true"` を使う場合、項目を `ion-item-group` で囲み、`ion-list-header` はグループの外に置いてください。

例ではフレームワークに依存しない Web Component のマークアップを使用します。React と Vue では対応するコンポーネントとプロパティの構文を使用してください。

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

`inset="true"` を使わないリストにはラッパーは不要です。

[ESLint でリスト構造を確認する](eslint.md)。

## ラッパーが必要な理由

通常 Ionic は `ion-list` に背景を適用するため、`ion-list-header` は項目と同じ面の中に表示されます。iOS 27 のレイアウトではヘッダーと項目の面を別々に扱います。

![ion-item-group が必要な理由を示すインセットリストの背景比較](https://raw.githubusercontent.com/rdlabo-dev/ionic-theme-ios27/v3.0.0/screenshots/why-ion-list-inset.png)

このためテーマは次のように動作します。

- インセットの `ion-list` の背景を透明にする。
- 項目の背景を `ion-item-group` に適用する。
- `ion-list-header` をその背景の外に置く。

## Material Design とマークアップを共有する

`@rdlabo/ionic-theme-md3` は同じグループ構造に対応するため、1 つのテンプレートを両方の Ionic モードで使用できます。

`@rdlabo/ionic-theme-md3` なしでこのパッケージを使う場合は、任意のスタイルシートを読み込むと Material モードでも同じグループ構造になります。

```css
@import '@rdlabo/ionic-theme-ios27/dist/css/md-ion-list-inset.css';
```

2 行の項目とセクションヘッダーのグループは[特別なマークアップとクラス](special-markup.md)を参照してください。
