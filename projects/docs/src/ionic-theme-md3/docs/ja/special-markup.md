---
title: 特別なマークアップ
---

ほとんどの Ionic マークアップは変更せず使えます。共通のマークアップは `@rdlabo/ionic-theme-ios27` とこのテーマで同じ意味を持ち、外観は有効なプラットフォームに従います。MD3 の外観の基準は Android Settings です。共通のマークアップが Android に iOS の Glass 表現を要求するわけではありません。

## 送信ボタン

実際のフォーム送信には `type="submit"` を使います。フォーム経由で送信できない場合は、`type="button" class="button-submit"` で同等のアクションを示します。このクラスは外観を示すだけで、送信・検証・ハンドラーの登録は行いません。塗りつぶしの主要アクションには Ionic の公開属性 `fill="solid"` を使います。MD3 の solid ボタンはすでにパレットの base/contrast の組で描画されるので、追加の効果や JavaScript ヘルパーなしで、両方とも同じ Android の外観になります。

```html preview
<ion-button type="submit" fill="solid" color="primary">Submit</ion-button>
<ion-button type="button" class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

明示した Ionic の色、disabled 状態、`fill="clear"` / `fill="outline"` の意味は通常どおりです。このクラスは別の fill を強制しません。

## オーバーレイの推奨アクション

アラートとアクションシートの推奨アクションには、iOS 27 テーマの規約に合わせて `role: 'preferred'` を使います。外観はオーバーレイの目的に従います。Alert は primary/on-primary の塗りつぶしアクションを使い、Action Sheet は他の選択肢と同じ全幅の行形状を維持し、文字とアイコンを primary 色と medium の太さで強調します。Action Sheet の Cancel グループは余白と区切り線で選択肢から分離されます。任意の Material ロールが指定されない限り、色は Ionic パレットから導出します。通常／既定のアクションはテキストアクションのままで、`confirm` だけでは強調しません。キャンセル、選択、破壊的操作のロールと推奨は別です。

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

この独自の Ionic ロールは、アクションを自動選択・実行しません。ボタンのハンドラーは通常どおり実行され、終了結果に `preferred` を返します。アプリが終了結果を調べる場合は、このロールを明示的に処理してください。`cancel` は Ionic のキャンセル動作を維持します。色を変えるためだけに `cancel`、`selected`、`destructive` を `preferred` に置き換えないでください。

## 2行のinset list item

2行の項目を描画するには、slot を指定しない `ion-label` のすぐ隣に、slot を指定しない `ion-note` を置きます。インセット項目は `ion-item-group` で囲み、`ion-list-header` はグループの外へ置きます。標準の末尾注記レイアウトを使う場合は、`ion-note` に `slot="end"` を指定します。

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

## square button

buttonのcornerをよりsquareにする場合は `.button-square` を追加します。text buttonとicon-only buttonの両方で使えます。

```html preview
<ion-button class="button-square" fill="solid">Continue</ion-button>
<ion-button class="button-square" fill="solid">
  <ion-icon name="add" slot="icon-only"></ion-icon>
</ion-button>
```

## inset listのsection header

`.item-group-header` を `ion-item-group` に追加すると、component demo pageの先頭で使われている中央揃えのicon、title、descriptionを表示できます。

これは導入用のgroupです。通常のlist itemは、その後に置く別の `ion-item-group` に入れてください。

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Android Settings のコントロール

標準トグルにアイコンはありません。アプリが明示的にラベルを要求する場合、Ionic の `enableOnOffLabels` は引き続き使えます。

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-toggle justify="space-between">Notifications</ion-toggle></ion-item>
    <ion-item>
      <ion-toggle justify="space-between" enable-on-off-labels="true">Notifications with on/off labels</ion-toggle>
    </ion-item>
  </ion-item-group>
</ion-list>
```

テーマは 52×28px のトラックと 20px のつまみを使います。グループ化した行の最小高さは 56px、ラジオの行は 72px で、長い内容に合わせて高さが増えます。アプリのサイズ設定には Ionic の公開 CSS 変数を使い、[共通のリスト構造](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group)を維持してください。

メインテーマは CSS だけで MD の既定フォントを提供し、ローカルの Google Sans Flex があれば使い、なければ標準のフォールバックを使います。アプリの `--ion-font-family` が優先されます。戻るアイコンは Ionic が管理し、テーマは代替を同梱しません。既定フォント、フォールバック、アプリでの上書きは [Android Settings の外観](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/android-settings)を参照してください。独自の寸法を使うアプリを更新する際は[移行ガイド](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration)を確認します。これらの設定は Ionic のパレットの意図と明示的なコンポーネントのプロパティを維持します。

## プラットフォーム固有の拡張

上記の共通構造はプラットフォーム専用のテンプレートなしで使えます。iOS 専用の `segment-style-glass`、`searchbar-classic`、iPad のフローティングシート、iOS のタブバー配置は Android の外観要件ではありません。MD3 は Ionic のセグメント、検索バー、モーダル、タブバーの動作を維持します。`.button-square` は MD3 の任意の形状拡張であり、共通マークアップの必須規約ではありません。

## Themeを無効にする

個別のIonic componentで標準のMaterial styleを維持する場合は `.md3-disabled` を追加します。

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
