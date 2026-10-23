---
title: 特別なマークアップとクラス
---

# 特別なマークアップとクラス

ほとんどの Ionic マークアップは変更せずに使えます。以下の組み合わせはテーマが提供する明示的な有効化の指定です。

## 主な送信ボタン

塗りつぶしの送信ボタンは、前景に Ionic カラーのコントラスト値を使用します。方向性のある縁の表現は iOS 27 の目立つボタンの外観に合わせており、追加の明るさの色は不要です。

```html preview
<ion-button type="submit" color="primary">Submit</ion-button>
<ion-button class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

同じ外観が必要でも `type="submit"` を使用できない場合は `.button-submit` を使います。

## 推奨するオーバーレイの操作

iOS のアラートやアクションシートでは、ボタンに `role: 'preferred'` を設定すると、背景が `--ion-color-primary`、テキストとアイコンが `--ion-color-primary-contrast` になります。押下中の背景には `--ion-color-primary-shade` を使います。Ionic のカスタムボタンロールを用いたテーマの規約であり、操作を自動選択・実行しません。閉じる際のロールは `preferred` として通知されます。

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

操作の意味に合わせてロールを選びます。

| ロール | 外観と動作 |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `preferred` | 塗りつぶしの主要操作。閉じる際は `preferred` と通知されます。自動で選択・実行しません。 |
| 未指定または `default` | 通常の文字色。 |
| `cancel` | Ionic のキャンセル動作を維持します。 |
| `selected` | 選択状態を維持します。 |
| `destructive` | `--ios-theme-destructive-color` を使用します。 |
| `confirm` | 推奨操作として扱いません。単なる確認ではなく、推奨する操作に `preferred` を使用してください。 |

## iPad の浮いたシート

`expandToScroll` でシートのスクロール動作を選びます。

| 設定 | iPad の外観 | スクロールとサイズ変更 |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `false` | 下側の角が浮き、下端に 20px の余白。 | 現在のブレークポイント内で内容がスクロールし、ハンドルのドラッグでサイズを変更します。Ionic が各ブレークポイントで表示ページのサイズを設定するため CSS で装飾できます。 |
| `true`（既定値） | Ionic の下端に接するレイアウト。 | スクロールで展開します。 |

## タブバーの位置

iOS の `ion-tab-bar` にクラスを指定して、セーフエリア内でバー全体の位置を選びます。

| クラス | 配置 |
| ------------------------- | ------------------------------- |
| `tab-bar-position-start` | 読字方向の始端。 |
| `tab-bar-position-center` | 中央。 |
| `tab-bar-position-end` | 読字方向の終端。 |
| なし | 既存の配置を維持。 |

すべて `slot="top"` と `slot="bottom"` に対応し、幅と押下時のアニメーションを維持し、RTL の始端・終端を解決します。

```html
<ion-tab-bar slot="bottom" class="tab-bar-position-center">
  <ion-tab-button tab="home">Home</ion-tab-button>
  <ion-tab-button tab="settings">Settings</ion-tab-button>
</ion-tab-bar>
```

これらのクラスは別の `ion-fab` の位置を変えません。バーの位置を選ぶときは、その領域を確保してください。

## iPhone Duo への対応

単独の Vertical Bars を含め、iPhone Duo 対応は 2.0.0 から安定版です。

iPhone Duo の縦向きシステムレール、ヒンジの状態、折りたたみ状態に応じた分割ペインのレイアウトは、iOS 27 テーマや Native UI 全体から独立しています。投影ランタイムなしでのデバイスレイアウト監視を含む設定は[デバイスレイアウトと分割ペイン](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/theme-ios27/docs/vertical-bars-layout.md)を参照してください。

レールのレイアウトクラス、コントロールの対象条件、ネイティブボタンの外観は [Vertical Bars](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/vertical-bars.md)を参照してください。

既存のテーマを維持した単独セットアップは[既存のテーマで iPhone Duo に対応する](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/ionic-vertical-bars.md)を参照してください。

## 2 行のインセットリスト項目

slot を指定しない `ion-label` のすぐ横に、slot を指定しない `ion-note` を置くと 2 行の項目になります。iOS スタイルのインセットリスト背景を使う場合は項目を `ion-item-group` で囲み、`ion-list-header` はグループの外に置いてください。

```html preview
<ion-list inset="true">
  <ion-list-header>
    <ion-label>Connections</ion-label>
  </ion-list-header>
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

通常の末尾注記のレイアウトを使う場合は、`ion-note` に `slot="end"` を指定します。

## インセットリストのセクションヘッダー

`ion-item-group` に `.item-group-header` を追加すると、コンポーネントのデモページ上部にある中央揃えのアイコン、タイトル、説明を作れます。

これは導入説明用のグループです。通常のリスト項目はその後に別の `ion-item-group` を置いて配置してください。

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

## 全幅のセグメント

`.segment-style-glass` を追加すると、タブバーと同じガラス面と選択インジケーターの表現をセグメントに適用できます。既存のサイズと文字色を維持し、スクロール可能なセグメントにも対応し、Ionic の公開プロパティ `--background` を尊重します。

```html
<ion-segment class="segment-style-glass" value="available">
  <ion-segment-button value="available">Available</ion-segment-button>
  <ion-segment-button value="away">Away</ion-segment-button>
</ion-segment>
```

色付きセグメントには Ionic の `color`（例: `color="primary"`、`color="secondary"`）を使います。Ionic はパレットの基本色でトラックを淡く着色し、選択面とラベルは中立色に保ちます。周囲の色付きツールバーは、セグメントに固有色がない場合のみ色を提供します。任意の移動するガラスは選択面の色を継承し、独自の Ionic パレットも追加登録なしで使えます。

セグメントボタンで使用可能な幅を均等に分けるには `.segment-expand` を追加します。`registerSegmentEffect` の使用時には Liquid Glass エフェクトのサイズも変わります。

### セグメントのサイズと押下動作

| 配置 | 最小の高さ | コンテナーの動作 |
| ----------------------------------------- | -------------- | ---------------------------------------------------------------- |
| コンテンツ内 | 32px | 小型で平らな背景とインジケーター。外側の境界は固定。 |
| `ion-toolbar` 内 | 48px | ガラスのコンテナー。押下中に外側のコンテナーが拡大縮小。 |
| ツールバー内を含む `.segment-expand` | 32px | 小型で平らな背景とインジケーター。外側の境界は固定。 |

任意の移動するガラスレンズは、コンテナーの背景から独立しています。

```html preview
<ion-segment class="segment-expand" value="new">
  <ion-segment-button value="new"><ion-label>New</ion-label></ion-segment-button>
  <ion-segment-button value="replied"><ion-label>Replied</ion-label></ion-segment-button>
</ion-segment>
```

## 縮小するヘッダー内の従来型検索バー

テーマは既定で iOS 検索バーに iOS 27 の外観を適用します。`collapse="condense"` を持つ `ion-header` の大きなタイトルの下に表示する検索欄には `.searchbar-classic` を追加します。従来の塗りつぶしの iOS 外観を使い、固定ヘッダーに残らず大きなタイトルと一緒に折りたたまれます。

`color="light"` など色を指定したツールバー内に置いてください。従来型の背景はその色のコントラスト値から生成します。

例は Ionic 標準の折りたたみ可能な大きなタイトル構造を使用します。プレビューをスクロールすると大きなタイトルが縮み、固定ヘッダーが表示されます。

```html preview
<div class="ion-page">
  <ion-header translucent="true">
    <ion-toolbar color="light">
      <ion-title>Search</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content color="light" fullscreen="true">
    <ion-header collapse="condense">
      <ion-toolbar color="light">
        <ion-title size="large">Search</ion-title>
      </ion-toolbar>
      <ion-toolbar color="light">
        <ion-searchbar class="searchbar-classic" placeholder="Filter results"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-list inset="true">
      <ion-item-group>
        <ion-item><ion-label>Recent item 1</ion-label></ion-item>
        <ion-item><ion-label>Recent item 2</ion-label></ion-item>
        <ion-item><ion-label>Recent item 3</ion-label></ion-item>
        <ion-item><ion-label>Recent item 4</ion-label></ion-item>
        <ion-item><ion-label>Recent item 5</ion-label></ion-item>
        <ion-item><ion-label>Recent item 6</ion-label></ion-item>
        <ion-item><ion-label>Recent item 7</ion-label></ion-item>
        <ion-item><ion-label>Recent item 8</ion-label></ion-item>
        <ion-item><ion-label>Recent item 9</ion-label></ion-item>
        <ion-item><ion-label>Recent item 10</ion-label></ion-item>
      </ion-item-group>
    </ion-list>
  </ion-content>
</div>
```

`.ion-page` ラッパーにより埋め込みプレビューが通常のルーティングされたページのように動作します。`ion-router-outlet` を使うアプリでは通常、このページコンテナーが自動で付与されます。インセットリストと項目はスクロール実演用の内容を確保するだけで、`.searchbar-classic` の必須要件ではありません。

## テーマの適用を除外する

Ionic 標準の iOS スタイルを維持したいコンポーネントに `.ios-theme-disabled` を追加します。

`.ios26-disabled` は非推奨ですが、同じ動作の別名として使用できます。新しいコードには `.ios-theme-disabled` を使用してください。

```html preview
<ion-button>iOS 27 theme</ion-button> <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

インセットリストの背景の仕組みは [`ion-item-group` の使い方](using-ion-item-group.md)を参照してください。
