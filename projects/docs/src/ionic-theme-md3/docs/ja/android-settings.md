---
title: "Android Settings の外観"
sourceRevision: "b01855a5b6b64a8aaeea578be975259eb9d608321bb81f66c7f583b8ef33a3a0"
---

# Android Settings の外観

テーマは Ionic のコンポーネント API、名前付きの色、アプリ独自のスタイルを維持しながら、Android Settings の外観を参考にしています。Ionic コンポーネントを Android ウィジェットに置き換えるものではありません。計測の基準は Android 17 の Pixel Settings であり、他の Android メーカーではデザインが異なる場合があります。

## テーマの既定値とアプリでの上書き

| 機能 | テーマの既定値 | アプリでのカスタマイズ |
| --- | --- | --- |
| ツールバー、グループ化したリスト、コントロール | Android に合わせた寸法 | Ionic の CSS 変数とアプリの CSS |
| トグルのつまみ | 状態アイコンなし | Ionic の `enableOnOffLabels`、または以下の状態アイコンヘルパー |
| フォント | 端末内の Google Sans Flex、次に Roboto / Helvetica Neue / sans-serif | Ionic の `--ion-font-family` |
| 戻る矢印 | Ionic で設定したアイコン | Ionic 自身のアイコン設定。テーマのアイコンは同梱しません |
| パレット | 既存の Ionic の色の意図 | デバイスの色は別の[動的な色](dynamic-colors.md)機能 |

## CSS のみの既定フォント

[README](../README.md#installation)の説明に従い、メインテーマを **Ionic のコアスタイルの後に**インポートします。MD のタイポグラフィは自動で含まれるため、追加スタイルシート、JavaScript の初期化、クラス、終了処理は不要です。

テーマは `html.md` に `--ion-default-font` を設定します。アプリが独自の値を指定しない限り、Ionic の `--ion-font-family` はその既定値を解決し続けます。

```css
:root {
  --ion-font-family: 'My App Font', sans-serif;
}
```

テーマは `--ion-font-family` を上書きしません。コンポーネントごとにフォントを変える場合は通常の `font-family` スタイルを使います。ローカルのカスタムプロパティだけでは、それを参照するコンポーネントにしか作用しません。iOS のルートの既定フォントは変わりません。個々の `md3-disabled` コンポーネントも、他の Ionic コンポーネントと同じようにアプリのフォントを継承します。このクラスはアプリ全体のタイポグラフィをリセットしません。

ローカルフォントの別名は、デバイス／ブラウザーが提供する場合だけ `GoogleSansFlex-Regular` を解決します。フォントファイルの同梱・ダウンロードは行いません。利用できなければ Roboto、Helvetica Neue、汎用 sans-serif のフォールバックを使います。未対応の文字体系は通常のブラウザー／プラットフォームのフォールバックを使い、日本語フォントを強制しません。同じ CSS がネイティブ WebView とブラウザーのデモで動作します。

テーマは DPR を監視せず、テキストを物理ピクセルへ丸めず、フォントメトリクスを上書きせず、可変フォントの軸も強制しません。テキストのレイアウトは、選択されたフォント、ブラウザー、ユーザー設定に従います。ネイティブの Android TextView と WebView で文字が異なる場合があります。特定の Pixel の字形の境界と一致しても、他の環境での一致を保証するものではありません。

## 戻るボタンは Ionic コンポーネントのまま

テーマは戻る矢印のアイコンを同梱・置換しません。既定アイコン、`backButtonIcon` 設定、ボタンごとの `icon` プロパティ、ナビゲーション、アクセシビリティは Ionic が管理します。アプリは既存の Ionic API を直接使えます。

テーマはボタンの間隔、56px のタッチ領域、40px の円形の描画領域をスタイル設定します。任意の色のロールを指定しない限り、円は透明です。[カラーシステム](color-system.md)を参照してください。ネイティブの Settings と Ionic で字形が異なる場合があります。ネイティブの矢印と一致することはテーマの要件ではありません。

## Alert のフォーカス表示

MD テーマはダイアログのサーフェス自体の周囲にあるブラウザーのアウトラインを抑制します。Ionic は引き続き表示時に Alert 内へフォーカスを移し、Tab ナビゲーション、フォーカスの範囲制限、終了を管理します。アクションボタンのキーボードフォーカス表示は維持します。`md3-disabled` と iOS モードの Alert は Ionic の既定の外観を維持します。

## トグルのラベルと任意の状態アイコン

既定のトラックは 52×28px、つまみは 20px で、バツ／チェックのアイコンはありません。Ionic 自身のオン／オフラベルには、公開プロパティを使います。

```html
<ion-toggle enable-on-off-labels="true">Notifications</ion-toggle>
```

フレームワークのバインディングでは、対応する `enableOnOffLabels` プロパティを使います。アプリ側のサイズ上書きは引き続き Ionic の CSS 変数を使います。

```css
ion-toggle.app-toggle {
  --handle-width: 18px;
  --handle-height: 18px;
}
```

バツ／チェックのアイコンは、明示的に必要なアプリ向けの別のバリアントです。

```ts
import { applyToggleStateIcons } from '@rdlabo/ionic-theme-md3/toggle-state-icons';

const toggle = document.querySelector<HTMLElement>('ion-toggle')!;
const removeIcons = await applyToggleStateIcons(toggle);
// 終了処理で:
removeIcons();
```

トグルを作成・接続した後に呼び出します。ヘルパーはカスタム要素の登録を待ち、`componentOnReady()` があればその完了も待ちます。このメソッドがないビルドでは、先に Shadow DOM の描画を待ってください。セットアップの待機中にビューが破棄された場合は、返されたクリーンアップをすぐに呼び出します。

ヘルパーは公開された handle Part の Shadow DOM に style 要素を1つ追加します。コンポーネントのプロパティを横取りしたり、ドキュメントを監視したりしません。`enableOnOffLabels` が有効な場合は、その後のプロパティ変更も含めて Ionic 自身のラベルが優先されます。`md3-disabled` と iOS モードでは、このアイコン拡張は無効です。デモはこのヘルパーを自動で適用しません。

## 更新と検証

寸法の変更は[移行の注意事項](migration.md#migrating-to-9.2.0%3A-android-settings-alignment)、サイズ設定は[グループ化したリストのマークアップ](using-ion-item-group.md)を確認してください。Ionic の明示的な `color`、disabled 状態、操作、ローカルの上書きの意味は変わりません。[計測レポート](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-pixel-pass1-2026-11-09.md)は実機の根拠とブラウザーの回帰検証を区別しています。描画結果の完全一致やネイティブタブレットでの受け入れ完了を主張するものではありません。
