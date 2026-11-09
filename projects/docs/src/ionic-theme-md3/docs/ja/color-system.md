---
title: "カラーシステム"
sourceRevision: "95393078f806a13505d7d20cae6753b00b7e6538e69cc591c91a7a4f1215553a"
---

# カラーシステム

テーマは Ionic の標準カラーパレットだけで動作します。JavaScript、Capacitor プラグイン、完全な Material の配色は不要です。追加の Material カラーロールは、同じコンポーネントデザインを任意で細かく調整するためのものです。

## Ionic だけを使う既定値

通常の Ionic スタイルとこのテーマをインポートします。標準の Ionic の名前付きの色（コントラストを含む）、背景色、文字色を通常どおり定義します。ライト・ダークの両パレットで同じ規則を使い、別のハードコードされた MD3 パレットはありません。

通常のコンポーネントは Ionic の既存の色の意図を維持します。コンテンツとメニューは `--ion-background-color` を使用し、ツールバー、カード、項目、タブバーは専用の Ionic 背景／文字変数と通常のフォールバック順序を維持します。通常のカード、ページ、リスト、オーバーレイに無彩色サーフェスの色合いを生成しません。明示的な `color` 属性とコンポーネントの `--background` / `--color` の上書きは引き続き可能です。任意の Material ロールで、基になる Ionic パレットを明示的に調整します。アプリの最終的な制御は、コンポーネントの `--background` / `--color` の上書きにあります。

任意の Material ロールを指定すると、それを参照する対象だけを調整します。未指定のロールはコンポーネントの Ionic の色へフォールバックします。1つのロールを指定しても、生成された無彩色パレット全体が有効になるわけではありません。ライト・ダークで同じ仕組みを使います。

明示的なバリアント（`.md3-tonal`、`.md3-elevated`、`.md3-filled`、`.md3-outlined`、`.md3-selected`）は追加の色処理を意図的に要求します。不足するコンテナ／輪郭の色は CSS の色混合により Ionic パレットから導出できます。この導出は要求したバリアントだけに適用し、色を指定していない全コンポーネントを変更しません。任意の Material のアクセント／コンテナの組がない場合、アクセントコントロールは Ionic の primary/contrast を維持します。

## 任意のロール

ルートまたはローカルコンテナで、必要なロールだけを上書きします。

```css
.my-section {
  --md-sys-color-secondary-container: #d8e2ff;
  --md-sys-color-on-secondary-container: #001a41;
}

.ion-palette-dark .my-section {
  --md-sys-color-secondary-container: #243e68;
  --md-sys-color-on-secondary-container: #d8e2ff;
}
```

前景／背景のロールの組を変えるときは、両方を一緒に指定します。省略したロールは引き続き Ionic に従います。別途登録したり、完全な配色を指定したりする必要はありません。

Material You はこれらの値の任意のプロバイダーの1つです。ネイティブからの取得と外観制御は[動的な色](dynamic-colors.md)を参照してください。プロバイダーは MD3 コンポーネント向けに Material の `on*` ロールを維持します。Ionic の名前付きの色は、指定された `onPrimary`、`onSecondary`、`onTertiary`、`onError` をコントラスト値に使い、ロールごとのフォールバックとして Ionic のコントラスト計算を使います。shade と tint は Ionic の計算を維持します。ネイティブ API は、独自のコンポーネントデザイン向けに任意の fixed/inverse ロールも公開しています。

独自の Sass コンポーネントでは、パッケージが公開する `src/styles` パスから `utils/colors` をインポートし、そのモジュールの名前空間で `color(secondary-container)` を使います。関数は任意のロールと同じ Ionic フォールバックを出力します。`utils/_colors.scss` のロールに対応し、未知のロールでは Sass ビルドを失敗させます。生成するコンテナのフォールバックは明示的に要求したバリアント向けです。通常のコンポーネントは自身の Ionic フォールバック順序を維持します。プレーン CSS の独自コンポーネントでは、同じ `var(--md-sys-color-..., ...)` パターンに Ionic のフォールバックを指定します。

## コンポーネントへの割り当て

通常のサーフェスでは、**Base** はライトモードの `surface-container-lowest`、ダークモードの `surface-container-low` を指します。**Panel** はライトモードの `surface-container-lowest`、ダークモードの `surface-container-high` です。ロールがない場合、コンポーネントの Ionic 背景フォールバックを維持します。これにより既定のライトサーフェスは白を保ちます。`color="light"` は別のパレット選択（ライトでは `surface-container-low`、ダークでは `surface-container-highest`）であり、すべての既定背景の別名ではありません。

表は任意の Material ロールを使う対象を示します。ロールがない場合、コンポーネントは上述の Ionic フォールバックを維持します。

| コンポーネント／バリアント | 背景 | 前景／詳細 |
| --- | --- | --- |
| 塗りつぶしボタン | primary | on-primary |
| トーナルボタン（`md3-tonal`、solid fill） | secondary-container | on-secondary-container |
| 浮き上がったボタン（`md3-elevated`、solid fill） | surface-container-low | primary |
| 輪郭線／テキストボタン | 透明 | primary、輪郭線には outline の境界 |
| カード（既定は elevated） | Panel | on-surface、サブタイトルは on-surface-variant |
| 塗りつぶしカード（`md3-filled`） | surface-container-highest | on-surface |
| 輪郭線カード（`md3-outlined`） | surface | on-surface、outline-variant の境界 |
| FAB | primary-container | on-primary-container |
| チップ／選択済みチップ（`md3-selected`） | surface-container-low / secondary-container | on-surface-variant / on-secondary-container |
| コンテンツ／メニュー | Base | on-surface |
| ツールバー | Panel | on-surface |
| リスト／通常のリスト項目 | Panel | on-surface |
| インセットリスト項目 | Panel、panel ロールがなければ Ionic の前に surface へフォールバック | on-surface、透明な 2px の隙間 |
| ナビゲーションバー | Panel | on-surface-variant、選択インジケーターは secondary-container、選択アイコンは on-secondary-container |
| セグメント | 継承したサーフェス | 選択時 primary、未選択時 on-surface-variant |
| 検索フィールド | surface-container-high、色を指定しないダークなツールバー／項目内では surface-container-highest | on-surface、アイコンは on-surface-variant、プレースホルダーは Ionic の動作 |
| スイッチ、チェックボックス、ラジオ、プログレス、スライダー | オフ／非アクティブ時は無彩色サーフェスまたは secondary-container、選択時は primary | 対応する on-primary、outline、または on-surface-variant |
| テキスト入力 | Ionic の fill 状態の背景 | on-surface、フォーカス時 primary、不正な状態は error |
| モーダル／ポップオーバー | Base | Ionic の文字、入れ子のコンポーネントは自身のロールを解決。select のポップオーバーの選択肢はオーバーレイ背景を共有 |
| アクションシート | Base | アクションは on-surface、推奨は primary、破壊的操作は error、タイトルは on-surface-variant |
| アラート | Base | on-surface、推奨は primary/on-primary、破壊的操作は error/on-error、キャンセルは輪郭線 |
| ローディング／日時／ピッカー | surface-container-high | on-surface、アクション／スピナーは primary |
| スナックバー／トースト | inverse-surface | inverse-on-surface、アクションは inverse-primary |

既存の Ionic の `color="..."` は明示的なパレット選択のままです。MD3 の既定値で置き換えません。`md3-disabled` は個々のコンポーネントを MD3 のスタイルから除外します。既存のコンポーネントごとの CSS 変数は、通常のカスケードを通して選択したロールを引き続き上書きできます。バリアントのクラスが変えるのは外観だけです。`md3-selected` は選択動作やアクセシビリティの状態を実装しません。

```html
<ion-button class="md3-tonal" fill="solid">Tonal action</ion-button>
<ion-card class="md3-filled">Filled card</ion-card>
<ion-button color="danger">Explicit Ionic danger palette</ion-button>
```

デモの Color palette ページは、Ionic だけを使う結果と、ローカルで追加ロールを指定した結果を比較します。ブラウザーテストでは両方の外観、Ionic のローカル変更、任意ロールの削除、明示的な色、適用除外、アプリの JavaScript を無効にしたドキュメントを検査します。

外観の基準は Android 17 Settings で、Material ガイドラインは補足情報です。上記の base/panel ロールは、Ionic の色の意図を置き換えずに通常のサーフェスを調整します。これらのロールがなければ Ionic の背景は変わりません。グループは外側の角丸 20px と隙間 2px を維持します。上記の割り当ては任意のロールを示すもので、省略したロールのサーフェス色を生成することを意味しません。

アイコンのみのツールバーの戻るボタンは、56px のタッチ領域と 40px の円の形状を維持します。円は既定では透明で、`--md-sys-color-surface-container-highest` を指定すると塗られます。明示的に色を指定したツールバーでは、戻るボタンの背景は透明、前景は Ionic のコントラスト色を維持します。塗りを変えるには、戻るボタンに `--md3-back-background` を設定します。アイコンなしのスイッチは、Pixel の Android 17 Internet パネルから計測した 52×28px のトラックと 20px のつまみを使います。CSS だけのインストールでは、Ionic の通常のつまみと `enableOnOffLabels` API を維持します。標準トグルとデモはアイコンなしのつまみを使います。コンポーネントの `md3-disabled` と明示的な Ionic の色も引き続き使えます。

タイポグラフィ、Ionic の戻るボタンの責任範囲、スイッチの状態アイコンは [Android Settings の外観](android-settings.md)で説明します。これらはパレットを変更せず、デバイスの色を必要としません。

テーマの色と寸法は、任意の JavaScript ヘルパーや Capacitor プラグインなしで動作します。任意の HTML サーフェス上に range を置く場合は、`--md3-range-gap-color` をそのサーフェスの色に設定します。標準の Ionic コンテナは背景を自動で提供します。

計測したタブレットのダイアログ寸法、角、キーボードの動作、過去のネイティブ参照キャプチャは [Android 17 タブレットレビュー](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-tablet-2026-11-07.md)を参照してください。その後の Ionic 既定色への修正とブラウザー検証は [Ionic の色継承レビュー](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md)を参照してください。

## タブレットの Alert のサイズ

幅広のタブレットの Alert は、計測した Android 17 Settings の比率に従い、縦向き 85%、横向き 65% になります。Android タブレットで入力中に IME がビューポートをリサイズしても、その幅を維持します。スマートフォンサイズのウィンドウは Ionic の内容に応じたサイズを維持します。

ダイアログのカスタマイズには公開されたサイズプロパティを使います。コントローラーで作成した Alert では `cssClass: 'app-alert'` を設定し、テーマの後のグローバルスタイルシートへ、コンポーネント名を指定したルールを置きます。

```css
ion-alert.app-alert {
  --width: 400px;
  --max-width: min(400px, calc(100vw - 32px));
}
```

インラインスタイルのバインディングも使えます。通常の CSS の最小／最大制約は引き続き適用され、`md3-disabled` は Ionic 自身のサイズの既定値を復元します。
