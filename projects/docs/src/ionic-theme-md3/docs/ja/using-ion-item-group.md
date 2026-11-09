---
title: ion-item-groupの使用方法
---

MD3 テーマは `@rdlabo/ionic-theme-ios27` と同じインセットリスト構造を使い、1つのテンプレートを Ionic の両モードで利用できます。`ion-list` に `inset="true"` を使う場合は、項目を `ion-item-group` で囲み、`ion-list-header` はグループの外へ置きます。

以下はframeworkに依存しないWeb Component形式のマークアップです。ReactまたはVueでは、各frameworkに対応するcomponentとpropertyの構文に置き換えてください。

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

`inset="true"` を使わないlistでは、このwrapperは不要です。

[ESLintでリストの構造を整える](/docs/eslint)。

## wrapperが必要な理由

共通構造は `ion-list-header` と項目のサーフェスを分離します。iOS 27 のレイアウトに合わせつつ、MD3 もプラットフォーム固有のテンプレートなしで同じマークアップをスタイル設定できます。

そのため、このテーマは次のようにstyleを適用します。

- inset `ion-list` の背景を透明にする
- itemのsurfaceを `ion-item-group` に適用する
- `ion-list-header` をsurfaceの外に置く

2行itemとsection header groupについては [特別なマークアップ](/docs/special-markup) を参照してください。

## サイズ設定と上書き

MD のグループ化した行は最小高さ 56px、ラジオコントロールを含む場合は 72px です。2行の項目はタイトル 16px、注記 14px、ブロック方向のパディング 16px を使い、内容に合わせて高さが増えます。タイトルの行高は通常の項目と同じ normal なので、注記を追加しても折り返したタイトルの行間は広がりません。見出し付きインセットリストは高さ 56px のセクションヘッダーと、グループ化した行間の 2px の隙間を使います。ヘッダーは `ion-item-group` の外に置いてください。

テーマの後に読み込むアプリのスタイルシートで、Ionic の公開 CSS 変数を使います。

```css
ion-item.app-setting {
  --min-height: 64px;
}
```

最小高さは長いテキストを切り詰めません。特定のデバイスフォントを補正するために行の高さを固定したり、位置を transform で調整したりしないでください。Ionic の通常の末尾注記（`slot="end"`）とラジオ／トグルのラベル API の意味は変わりません。[CSS の既定フォント](android-settings.md#default-font-css-only)は、アプリのフォント指定を尊重します。行のテキストはデバイスピクセルの補正をせず、通常のブラウザーのメトリクスに従います。
