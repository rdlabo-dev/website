---
title: 移行
---

# 移行

## 2.1.0 からの更新

この節はテーマと Native UI の両ガイドで同じ更新を説明しています。どちらか一方に従えば十分です。既存のテーマのインポート、スタイルシート、アニメーション設定を維持してください。Native UI は引き続き任意です。有効にしている場合は、既存の `enableNativeUI()` 呼び出し、コントロールの選択、アプリルートのランタイムを維持します。以下にある以前のパッケージ分離の移行を繰り返す必要はありません。

### 依存関係の更新

テーマだけを使うアプリでは、テーマを更新します。

```sh
npm install @rdlabo/ionic-theme-ios27@latest
```

デバイスのレール寸法や Native UI を使うアプリでは、Foldable を含む3つのパッケージをすべて更新します。これらは独立してバージョン管理されています。テーマの peer dependency に従って互換性のあるバージョンを使ってください。

```sh
npm install @rdlabo/ionic-theme-ios27@latest @rdlabo/capacitor-native-ui@latest @erkamyaman/capacitor-foldable@latest
```

以下のリゾルバーのインポートは、ネイティブ投影を有効にせずレイアウト値を取得します。デバイスのレールを使わないテーマ専用アプリでは、デバイス寸法の手順を省略できます。

### デバイス寸法の更新

アプリで `getBarPlacement()` を直接 `setVerticalBarsLayout({ edge, inset })` に対応付けている場合は、リゾルバーを使い、予約領域から取得したツールバーの起点も含めます。

```diff
- import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
+ import { Foldable } from '@erkamyaman/capacitor-foldable';
+ import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
 import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

- const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) =>
-   setVerticalBarsLayout({ edge: verticalBarEdge, inset });
- const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
- applyPlacement(await Foldable.getBarPlacement());
+ const updateLayout = async () => {
+   setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
+ };
+ const listener = await Foldable.addListener('layoutChange', () => void updateLayout());
+ await updateLayout();
```

2つ目の更新経路を追加せず、古い配置リスナーを置き換えます。既存のアプリ終了処理にある `await listener.remove()` は維持します。すでに `layoutChange` ハンドラーがある場合は、そこでリゾルバーを呼び出してください。姿勢に対応する既存の `foldStateChange` / `applyFoldStateClasses` の配線は維持します。リゾルバーが提供するのはレールの寸法だけです。

報告されたレールのレイアウトをそのまま使い、`isDeviceFoldable()`、デバイス名、ビューポートサイズの推測で適用を制限しないでください。デバイス寸法を模倣するための固定ツールバー起点の回避策は削除します。意図したアプリの CSS オーバーライドは引き続き対応しています。既定値はリゾルバーではなく、テーマの `setVerticalBarsLayout` にあります。テーマの外側ディスプレイ向け既定値は 174px で、デバイスが報告する寸法から内側ディスプレイの起点 124px を取得できます。[レイアウト値とフォールバックの動作](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#apply-device-layout-values)を参照してください。

### モーダルの修正と送信ボタンの外観

フローティングカードとシートは計測した境界を使って Duo のレールとの重なりを避けるようになり、Native UI もレールに重なるフローティングダイアログを正しく認識します。モーダルのレイアウトとネイティブコントロールの処理を修正するもので、アプリのコード変更は不要です。この不具合を回避するためだけに全幅を強制する CSS を追加していた場合、その回避策を削除できます。製品の要件として全画面が必要な場合は、明示したサイズを維持してください。`ion-app` に `ios-theme-vertical-bars` または `ios-theme-fold-expanded` があると、フローティングカードとシートは左右に最低 8px の余白を残します。高さ 600px 以上のビューポートでは幅の上限が 653px、それより低いビューポートでは利用可能な幅から 16px を引いた幅になります。上部余白はセーフエリアに従い、最低 8px を確保します。シートのブレークポイントは引き続き表示の高さを制御します。`--width`、`--max-width`、`--height` によるアプリ側のサイズ設定も維持されます。どちらのレイアウトクラスも有効でない場合、通常のスマートフォンとタブレットの既定値は変わりません。

塗りつぶしの Ionic 送信ボタンは、自動で目立つネイティブのガラス表現を使います。

```html
<ion-button type="submit" fill="solid">Save</ion-button>
```

同じ外観は、塗りつぶしを使う既存の `.button-submit` アクションにも適用されます。このクラスはスタイルを提供するだけで、フォームを送信しません。clear と outline の fill には送信の強調を適用しません。既存の明示的な `data-native-ui="button-submit"` 宣言も引き続き対応しています。

ネイティブコントロールは、ナビゲーション、モーダルのアニメーション、画像へのハンドオフ中も所有権を維持します。WebView に表示される画像もネイティブ投影の表示であり、元の Web ボタンへ戻ったわけではありません。これらのコントロールを強制的に Web へ戻す、遷移専用の回避策は再検証して削除してください。意図した適用除外や、未対応のコントロール・ネイティブエラーへの対処は維持します。追加のアニメーションフラグや2つ目のランタイムは不要です。

左右両側のレール、レールの消失、折りたたみと回転、カード・シート・全画面の表示、塗りつぶしの送信アクションを確認してください。通常の iPhone とブラウザーのフォールバックも確認します。Cordova では[同梱の連携](https://github.com/webview-native-ui/cordova-plugin)を使用します。固定されたテーマとネイティブの変更は、これらの Capacitor のインストールコマンドではなく、Cordova プラグインのリリースで提供されます。

## 1.2.1 からの更新

このガイドは、Native UI Shell Preview と単独の Vertical Control Area を含む `@rdlabo/ionic-theme-ios27` **1.2.1** を使用するアプリ向けです。

- **テーマのみ:** テーマパッケージを更新します。既存のテーマのインポート、CSS/Sass パス、アニメーションのインポートは有効なままで、ネイティブ起動は不要です。
- **Native UI または Vertical Control Area:** ネイティブパッケージを直接導入し、以下のインポートと起動設定を置き換え、Capacitor を同期してネイティブアプリを再ビルドします。

Native UI は 2.0.0 で Preview を卒業し、正式サポートになりました。実験的な拡張は[現在の拡張ガイド](native-ui-extensions.md)に記載しています。このガイドは公開済み 1.2.1 のコントロールと設定を扱います。

## Native UI パッケージの分離

新規連携には [Native UI 設定](setup.md)、iOS テーマを使用中なら[テーマに Native UI を追加](/ionic-theme-ios27/docs/add-native-ui)を参照してください。以下は既存アプリのパッケージ名とネイティブプロジェクトの移行です。

テーマとネイティブコントロールは別パッケージになりました。使用する動作に応じて依存関係を選びます。

| アプリの動作 | 直接使用するパッケージ |
| ------------------------------------------------------ | ----------------------------- |
| テーマスタイル、Ionic Web 動作、テーマアニメーション | `@rdlabo/ionic-theme-ios27` |
| Native UI または単独の Vertical Control Area | `@rdlabo/capacitor-native-ui` |
| テーマとネイティブコントロールの併用 | 両パッケージ |

テーマは Ionic の Web 要素の外観と動作を管理します。Native UI は対応コントロールを iOS のネイティブビューに投影し、Web ナビゲーションと寿命を調整します。iOS 27 テーマなしでも使え、導入だけではテーマスタイルを適用しません。Android とブラウザーの標準コントロールは Web 表示を維持します。Android は[アプリ内 Compose 拡張](native-ui-extensions.md#2b-register-compose-content-on-android)を描画できます。

テーマはネイティブパッケージの共通遷移・検索連携を内部利用します。この依存関係はネイティブコントロールを自動有効化しません。利用するアプリは Capacitor が検出できるようネイティブパッケージを直接宣言してください。

### 1. アプリの依存関係を更新する

テーマと Native UI は独立してバージョン管理されます。併用する場合は、テーマが宣言する peer dependency と互換性のある Native UI バージョンを選んでください。以下のコマンドは配置・折りたたみ状態用の [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) も独立したアプリ依存として導入します。Foldable は独自のリリースバージョンを持ちます。

テーマのみのアプリはテーマパッケージを更新し、既存インポートと CSS/Sass パスを維持します。ネイティブ起動やプラグイン設定は不要です。

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

両方を使う場合は、両パッケージをアプリの直接依存に追加します。

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

既存の Web 外観でネイティブコントロールを使うには [Native UI のみ](setup.md)を参照してください。直接導入し、既存の Web スタイルを維持します。対象選択にテーマ変数は不要になりました。Web レイアウトはアプリ・テーマの責務です。ネイティブ起動には Capacitor 8、Ionic アダプターには Ionic 8/9 の 8.8.1 以降が必要です。`/core` に Ionic は不要です。

### 2. ネイティブのインポートを置き換える

| 以前のインポート | 置き換え先 |
| ----------------------------------------- | ------------------------------------------- |
| `@rdlabo/ionic-theme-ios27/native`        | `@rdlabo/capacitor-native-ui`               |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

遅延インポート、テストの別名、バンドラー設定を含め、値と型のインポートを更新します。以前のテーマの `/native` と `/vertical-bars` は削除され、互換エイリアスはありません。

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
```

既存のコントロールのマークアップを維持し、部分的な `controls` の既定値を含む[起動オプション変更](#startup-options)を確認します。通常の `@rdlabo/ionic-theme-ios27`、CSS/Sass パス、テーマアニメーションのインポートは変更しません。独自遷移は後述の[遷移アダプター](#native-ui-transition-adapter)を参照してください。

### 3. ネイティブプロジェクトを同期する

依存関係とインポート更新後、通常のビルドコマンドで Web アセットを再ビルドして実行します。

```sh
npx cap sync ios
```

Capacitor プラグインはネイティブパッケージが提供します。手動リンクした旧テーマの Swift パッケージを削除し、新パッケージだけが提供するようにします。Swift パッケージ・product と CocoaPods pod は `RdlaboCapacitorNativeUi`、Swift モジュールは `NativeUIPlugin` です。ブリッジ名は JavaScript・iOS・Android とも `NativeUI` です。利用する各ネイティブプラットフォームを同期し再ビルドしてください。旧プラグインのみを含むインストール済みバイナリーは OTA/Web のみの更新では移行できません。JavaScript とネイティブのバージョンを揃えてください。

npm 依存に対する Capacitor の生成連携を使います。アプリにこのリポジトリーのチェックアウトや手動リンクの Swift パッケージは不要です。

### 4. 移行を確認する

- ネイティブ利用アプリが `@rdlabo/capacitor-native-ui` を直接宣言していることを確認し、ビルドして削除済みテーマエントリーのインポートが残らないことを確認します。
- 同期後に iOS をビルド・起動し、ネイティブコントロール、ナビゲーション・戻るジェスチャー、終了後の Web 復元を確認します。
- 対応するブラウザー・Android の Web 表示と、テーマの外観を確認します。
- 部分的な Preview 設定を展開後も以前無効だった種類が無効か確認します。水平・縦配置でグループ化、個別選択、戻る操作をテストします。

## Native UI の命名変更

分離パッケージは全体で Native UI の名前を使います。破壊的な改名で、旧名はエイリアスではありません。以下の旧名は公開済み 1.2.1 Preview の名前です。

| 以前の名前 | 新しい名前 |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `enableNativeUIShell()`                                                                                                                            | `enableNativeUI()`                                                                                                   |
| `NativeUIShellOptions`, `NativeUIShellHandle`, `NativeUIShellStatus`, `NativeUIShellSuspension`, `NativeUIShellControls`, `NativeUIShellComponent` | `NativeUIOptions`, `NativeUIHandle`, `NativeUIStatus`, `NativeUISuspension`, `NativeUIControls`, `NativeUIComponent` |
| `IonicNativeUIShell`（プラグイン export とブリッジ登録） | `NativeUI` |
| `withNativeUIShellTransition()` | `withNativeUITransition()`（引き続きテーマパッケージから export） |
| `IonicNativeUIShellPlugin`（Swift モジュール・ネイティブクラス） | `NativeUIPlugin` |
| `RdlaboIonicThemeIos27`（SPM パッケージ・product） | `RdlaboCapacitorNativeUi` |
| `data-shell="disabled"`                                                                                                                            | `data-native-ui="disabled"`                                                                                          |
| `.ios-theme-shell-disabled`                                                                                                                        | `.native-ui-disabled`                                                                                                |

ランタイム所有の属性・イベントは内部用で設定ではありません。`data-native-ui-shell` は `data-native-ui-projected`、他の `data-native-ui-shell-*` は `data-native-ui-*`、`nativeUIShell*` イベントは `nativeUI*`、`.ios-theme-native-ui-shell-*` は `.native-ui-*` になります。参照するテスト・診断を更新してください。**`data-native-ui="button"` など明示的ソース宣言は維持してください。** 投影マーカーは別物でランタイムが管理します。

## Native UI の遷移アダプター

Ionic の遷移アダプターは `@rdlabo/ionic-theme-ios27` に移りました。1.2.1 の `@rdlabo/ionic-theme-ios27/vertical-bars` からの `withNativeUIShellTransition` を、テーマルートの `withNativeUITransition` へ置き換えます。ネイティブのみのアプリは `shell.suspend()` と返された `resume()` を直接使えます。

`withNativeUITransition()` で既存の Ionic ナビゲーションアニメーションを維持しつつ Native UI を調整します。

- `@rdlabo/ionic-theme-ios27` の `iosTransitionAnimation` を使う場合は[パッケージのアニメーション設定](ionic-vertical-bars.md#use-the-themes-ios-animation)を維持し、設定変更は不要です。共通アダプターを内蔵するため追加のラッパーは付けないでください。
- `navAnimation` なしで Ionic 標準を使う場合は [Ionic 標準のアニメーションを維持する](ionic-vertical-bars.md#keep-ionics-default-animation)を参照します。遷移モードから iOS/MD 標準ビルダーを選ぶ例です。
- Native UI または単独の Vertical Control Area で独自アニメーションを使う場合は、Ionic 設定時に既存ビルダーをラップします。

```diff
+ import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUITransition(existingTransition),
  };
```

初期化前に既存の Ionic 設定へ統合します。効果、時間、イージングを維持し、ネイティブ終了、スワイプ進行、キャンセルを調整します。既存のテーマスタイルシートと Native UI・Vertical Control Area の起動は維持します。

ナビゲーションだけに使い、モーダル・ポップオーバーは変更しません。Ionic が終了後に破棄するため、各遷移で新しい `Animation` を作ります。登録とアニメーションなし遷移のライフサイクルイベントは維持します。独自ビルダーが水平の戻るボタンを別にアニメーションするなら `.ios-theme-vertical-bars` 有効時はその効果を除外してください。

設定と対応範囲は[ナビゲーションアニメーションの接続](ionic-vertical-bars.md#2-connect-your-navigation-animation)を参照してください。

## 起動オプション

1.2.1 で `controls` を指定すると **`true` の項目だけ**が有効でした。新 API は部分オブジェクトでも省略項目が `true` です。移行時は以前の選択をすべて明示してください。

| 1.2.1 | 新しい設定 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controls` なし | `controls` なし。対応する全種類を既定で選択。 |
| `controls: {}` | 既定選択を無効にする `controls: false`、または Ionic 検出全体を無効にする `ionic: { auto: false }`。 |
| `controls.toolbar` | `controls.buttonGroup`、`controls.button`、`controls.backButton` に旧 toolbar の値を設定。 |
| `controls.tabs`、`.segment`、`.fab` | 名前は同じ。以前省略した項目に明示的な `false` を指定。 |
| `buttonProjection`                  | `ionic.verticalBars.buttonProjection`                                                                                                                     |
| `buttonDefaultFill: null` | `ionic.verticalBars.buttonDefaultFill: 'glass'`（既定値でもある） |
| `buttonDefaultFill: 'solid'`        | `ionic.verticalBars.buttonDefaultFill: 'solid'`                                                                                                           |
| `verticalBarsOnly: true` | レール内の既定選択は `controls: 'verticalOnly'`。部分選択は各有効項目を `'verticalOnly'`、残りを `false`。 |
| `enabled: false` | ランタイムを開始しない、または有効なハンドルの `destroy()` を呼ぶ。 |

旧起動オプション名は削除されエイリアスはありません。単独の `enableVerticalControlArea()` は引き続き使用でき、`controls` の既定値が `'verticalOnly'` です。外観設定も `ionic.verticalBars` に移ります。アプリで使う起動エントリーは 1 つにしてください。

### タブのみの設定を維持する

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

- const shell = await enableNativeUIShell({
-   controls: { tabs: true },
-   buttonProjection: 'source',
-   buttonDefaultFill: null,
+ const shell = await enableNativeUI({
+   controls: {
+     buttonGroup: false,
+     button: false,
+     backButton: false,
+     tabs: true,
+     segment: false,
+     fab: false,
+   },
+   ionic: {
+     verticalBars: { buttonProjection: 'source', buttonDefaultFill: 'glass' },
+   },
  });
```

### 配置によってコントロールを選ぶ

6 項目すべてが `boolean | 'horizontalOnly' | 'verticalOnly'` を受けます。スカラーの `controls` は全項目に適用します。水平・縦は通常配置・レールを意味し、端末の向きや機種ではありません。

```ts
const shell = await enableNativeUI({ controls: 'verticalOnly' });
```

厳密な投影範囲ではなく選択の既定値です。対応する既定値が `false` でも、明示的 `data-native-ui` やローカルの `data-horizontal-bars="true"` / `data-vertical-bars="true"` で有効にできます。Web に残すには明示的マーカーを削除するか `data-native-ui="disabled"` を使います。`ionic.auto: false` はローカルのレイアウト指定を含む Ionic 自動検出を無効にしますが、明示的ソース宣言は有効です。

`buttonGroup` はグループ化だけです。子を選択しないので `buttonGroup: true, button: false` は明示的選択なしでは通常操作を投影しません。`backButton` は `ion-buttons` 内も含め独立して戻る操作を制御します。完全な選択表は[全設定](configuration.md)、ローカル上書きは[ツールバーのグループ化](native-ui.md#toolbar-selection-and-grouping)を参照してください。

## Web レイアウトの管理元

テーマ CSS には `@rdlabo/ionic-theme-ios27` から `setVerticalBarsLayout` と `applyFoldStateClasses` をインポートします。`setVerticalControlAreaPlacement({ edge, nativeEdge, inset })` を `setVerticalBarsLayout({ edge, inset })` へ置き換えます。Native UI は自身のデバイスメトリクスから利用可否を取得し、非推奨の互換ヘルパーは `nativeEdge` を無視します。通常の起動、レール無効化、終了処理でテーマクラスや確保した Web 余白は変わりません。ネイティブレールが利用不可でも Web レールは維持し、水平に戻したいアプリが自分で選択します。ネイティブのみのアプリは独自のレイアウト CSS を引き続き使用できます。
