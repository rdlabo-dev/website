---
title: Vertical Bars のレイアウト
---

# Vertical Bars のレイアウト

この任意のテーマスタイルシートは縦向きレール周辺の Web の余白と配置を管理します。iOS 27 の外観全体を読み込まず、既存のテーマと併用できます。ネイティブ描画と状態の同期は、別途 [Capacitor Native UI](/capacitor-native-ui/docs/vertical-bars) が提供します。

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

以下のレイアウト動作は、このスタイルシートを読み込んだ状態を前提とします。ネイティブランタイムの設定とデバイス上の配置は[連携ガイド](/capacitor-native-ui/docs/ionic-vertical-bars)に従ってください。

## 縦向きレールの領域を確保する

デバイスの設定にはインストール済みの Foldable を使い、初期配置とイベントを `setVerticalBarsLayout` に渡します。[標準の Ionic レール設定](../../capacitor-native-ui/docs/ionic-vertical-bars.md)を参照してください。以下のクラスはスタイルシートのレイアウト入力と任意のブラウザーシミュレーション用で、デバイス設定で手動追加する手順ではありません。

`ion-app` に `.ios-theme-vertical-bars` を追加すると物理的な右側にレールの領域を確保します。物理的な左側に置くには `.ios-theme-vertical-bars-left` も追加します。

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

CSS とネイティブ描画は物理座標を扱うため、クラスも物理的な位置を表し、`-left` は常に物理的な左端を意味します。`setVerticalBarsLayout` はデバイスプラグインの論理的な `verticalBarEdge` をドキュメントの方向に合わせて解決するため、RTL アプリで独自の変換は不要です。

### レールの幅

| 指定元 | 確保する幅 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Chrome プレビューを含む、クラスだけの指定 | `80px`。ネイティブプラグインは不要。 |
| `setVerticalBarsLayout({ edge, inset })` | 指定したインセット。`80px` 未満でも適用。 |
| 独自 CSS のプレビュー | `--ios-theme-vertical-bars-safe-area-left` または `--ios-theme-vertical-bars-safe-area-right` を上書き。 |

### Web ツールバーの配置

デバイス寸法がない場合、Web レールは計測した iPhone Duo の外側ディスプレイのツールバーレイアウトを既定値として使います。上部起点は 174px、正方形のコントロールは 48px、グループ内のコントロール間は 4px、グループ間は 12px です。コントロールは物理端から最低 24px 離して配置し、予約したレールの中央配置でそれ以上の余白が必要なら中央に配置します。シートモーダルの背後のコントロールにも同じ既定値を使います。戻るボタンはコントロール1つ分を占め、その後にグループ間の余白を置きます。

`--ios-theme-vertical-bars-toolbar-top` で上端の基準位置を上書きできます。モーダルのツールバー配置では引き続きシートのオフセットを考慮します。ネイティブの計測値が利用できる場合は、これらの Web の既定値より優先します。

### デバイスのレイアウト値を適用する

アプリの既存の初期レイアウト処理と Foldable 変更ハンドラーで、デバイスの寸法を取得します。

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

const metrics = await resolveVerticalBarsLayout(Foldable);
setVerticalBarsLayout(metrics);
```

リゾルバーは SDK に依存しない Native UI の integration エントリーを使用し、ネイティブ投影を開始しません。アプリの既存の配置・姿勢・リサイズの購読を再利用してください。リゾルバー自体は購読も Native UI の起動も行いません。読み取りが重なる可能性がある場合は、既存のハンドラー内で古い結果を破棄します。

リゾルバーは Foldable 自体に依存せず、`getBarPlacement()` と `getReservedRegions()` を公開するオブジェクトを受け取ります。論理的な `edge`、`inset`、`toolbarTop` を返します。API が未対応または読み取りが失敗した場合、これらのフィールドは未定義のままです。現在のビューポートとドキュメントの方向から、レールの物理的な側を求めます。領域の矩形はビューポートの CSS ピクセル単位で、すでにマージンを含んでいます。

**互換性のため、既定値は `setVerticalBarsLayout` に残しています。** 配置がなければ Web レールを無効にし、inset を省略すればスタイルシートのレール幅を維持します。ツールバーの上部起点を省略した場合は既存の CSS／インラインのオーバーライドを維持し、値が設定されていないときだけ 174px を使います。寸法の解除やレールの無効化では、インラインの値と優先度がヘルパーの書き込みと一致している場合だけ、以前のインライン／CSS 設定を復元します。その後アプリが異なる値を書き込んでいれば維持します。同一値の書き込みはヘルパー自身の書き込みと区別できません。予約領域が空または利用できない場合は、デバイスの寸法を推測せず `toolbarTop` を未定義のままにします。計測した内側ディスプレイのツールバー起点は 124px です。この値を使うにはプロバイダーの結果を渡してください。寸法を取得できない場合、固定された外側ディスプレイのフォールバックでは内側の配置を再現できません。

リゾルバーは Native UI アダプターの API であり、テーマや Engine のデバイス API ではありません。この例には `resolveVerticalBarsLayout` を公開するアダプターのバージョンが必要です。Capacitor Native UI 2.1.0 にはありません。テーマはデバイス SDK をインポートせず、通常のレイアウト値を受け取ります。

### コンテンツとオーバーレイのレイアウト

| サーフェス | レールのスタイルシートを使う場合の配置 |
| --- | --- |
| ルーターとコンポーネントの背景 | ビューポート全体を維持します。 |
| `ion-content` | スクロールする前景を内側へ寄せます。 |
| `ion-toolbar` | コンテナの前景を内側へ寄せます。 |
| `ion-fab` | システム UI の隣に配置した場合だけ調整します。 |
| 有効なレール列に重なる `ion-modal` | 前景の inset を適用します。ランタイム有効時、最前面のモーダルは対象のツールバーコントロールを独自のレールへ投影します。シートのレールはブレークポイントの変化に合わせて可視境界へ追従します。 |
| 有効なレール列に重ならないモーダル | ツールバーボタンを維持し、ページのレールの inset を受けません。 |
| `ion-menu` / `ion-popover` | 内部の前景コンポーネントは、メインページの変換をせず Ionic 標準のセーフエリア処理を維持します。 |
| システム UI 側のメニュー | 全ビューポートのアニメーションホストを維持し、表示コンテナだけを inset 分ずらします。 |
| 反対側のメニュー | 変更しません。 |

インセットを適用した前景コンポーネント内では、対応する Ionic セーフエリア変数をリセットし、子孫で二重に余白が付くのを防ぎます。

モーダルの対象判定はダイアログのレイアウト位置と幅を使います。有効なレール列に重なるダイアログは、外側ディスプレイのフローティングシートも含め、対象のコントロールを投影します。その列と重ならないダイアログはツールバーコントロールを維持します。表示時の transform は判定に影響しません。inset の寸法が指定されない場合、全幅のダイアログは既存の動作を維持します。RTL でも left と right は物理座標で、Ionic の `side="start"` と `side="end"` は論理方向のままです。

iOS 27 テーマを読み込み、`ion-app` で `ios-theme-vertical-bars` または `ios-theme-fold-expanded` を有効にすると、フローティングカードとシートモーダルは左右に最低 8px の余白を残します。高さ 600px 以上のビューポートでは幅の上限が 653px、それより低ければ利用可能な幅から 16px を引いた幅になります。最大高さは、モーダル上部に最低 8px または上部セーフエリアを確保します。シートのブレークポイントは引き続き可視高さを制御します。これらのレイアウトでは、大きなビューの通常のダイアログも同じ幅と上部余白を使います。どちらのレイアウトクラスも有効でない場合、通常のスマートフォンとタブレットの既定値は変わりません。

アプリ固有のサイズ調整には Ionic の `--width`、`--max-width`、`--height` を使います。明示的な全画面表示では `--width: 100%`、`--max-width: none`、`--height: 100%` を指定できます。レールの対象判定は、引き続き結果のダイアログ幅に従います。

このモードはコンポーネントのモードから独立しています。iOS 上で Ionic の `mode: 'md'` を維持したまま Vertical Bars を有効にできます。コンポーネントに `mode="ios"` を指定する必要はありません。

## レイアウト API

```ts
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

setVerticalBarsLayout({ edge: 'trailing', inset: 80 });
// 必要に応じて後続の引数にルート要素と明示的な RTL の真偽値を渡します。
setVerticalBarsLayout({ edge: null }); // 通常の Web レイアウトを復元します
```

ヘルパーは Web CSS だけを操作し、Capacitor や Native UI の起動なしで動作します。デバイス状態の提供と購読はアプリが管理します。Native UI を起動・無効化・破棄してもレイアウトクラスや確保したインセットは変わりません。ネイティブレールが非対応でも選択済みの Web レールを維持します。水平レイアウトに戻す場合はアプリが明示的に `edge: null` を指定してください。

## デバイスレイアウトを取得する

標準のテーマと Native UI のセットアップコマンドは、Foldable をアプリの独立した依存関係としてインストールします。Web アセットのビルド後、ネイティブプロジェクトを同期します。

```bash
npx cap sync
```

iPhone Duo の iOS 27.1 API には Capacitor 8.5 以降と Xcode 27.1 以降を使用します。標準設定では Foldable が配置と折りたたみ状態を提供します。ブラウザーシミュレーションでは一時的に購読を固定のレイアウト値へ置き換えられます。プラグインの `ionic-tabs.css` とこのパッケージのレール投影は併用しないでください。同じタブの配置を両方が変更してしまいます。

`ion-app` のマウント後、デバイス状態を `applyFoldStateClasses` に渡します。購読とクリーンアップはアプリが管理します。折りたたみ状態に応じたレイアウトに投影ランタイムは不要です。

```ts
import { Foldable } from '@erkamyaman/capacitor-foldable';
import { applyFoldStateClasses } from '@rdlabo/ionic-theme-ios27';

const root = document.querySelector('ion-app')!;
const listener = await Foldable.addListener('foldStateChange', (fold) => applyFoldStateClasses(root, fold));
applyFoldStateClasses(root, await Foldable.getFoldState());
```

アプリの所有コンポーネントを破棄するとき:

```ts
await listener.remove();
```

変更を購読してから現在の状態を取得します。初期値とイベントは同じヘルパーで処理できます。

### 折りたたみ状態のクラス

`applyFoldStateClasses` は無関係なクラスを維持して、指定したルートを更新します。

| クラス | 適用条件 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ios-theme-fold-flat` | 平らに開いた状態。 |
| `ios-theme-fold-half-opened` | 半開きの状態。 |
| `ios-theme-fold-closed` | 閉じた状態。 |
| `ios-theme-fold-expanded` | 半開き、またはヒンジの形状情報がある平らな状態。形状情報がない平らな状態（Web フォールバックを含む）と閉じた状態では解除。 |

最初の 3 クラスは 1 つだけが残ります。ヘルパーはプラグインを購読せず、Ionic の分割ペインの `when` も変更しません。

## 分割ペインを適応させる

iPhone Duo でメニューを横に並べるには、`ion-split-pane` でテーマの折りたたみ状態に応じたレイアウトを明示的に有効にします。スタイルシートの既定値は完全に開いた状態で `320px`、半開きで `50vw` です。これはテーマの既定値で、システムの設定アプリが選ぶ幅を保証するものではありません。アプリが折りたたみ状態を渡します。どちらも同じビューポート幅になり得るため、幅のメディアクエリーでは判別できません。

```html
<ion-split-pane class="split-pane-fold-layout" contentId="main-content" when="(min-width: 900px)">
  <ion-menu contentId="main-content">...</ion-menu>
  <div id="main-content">...</div>
</ion-split-pane>
```

アプリのスタイルシートで分割ペインの幅をテーマ変数に接続し、半開きのクラスは幅の値だけを変更するようにします。

```css
ion-split-pane.split-pane-fold-layout {
  --ios-theme-menu-width: var(--ios-theme-split-pane-width);
  --side-width: var(--ios-theme-menu-width);
  --side-max-width: var(--ios-theme-menu-width);
  transition: --ios-theme-split-pane-width 300ms ease;
}
```

登録された `--ios-theme-split-pane-width` の既定値は `320px` です。`applyFoldStateClasses` が `ion-app` に `ios-theme-fold-half-opened` を設定すると、スタイルシートは子孫のうち `split-pane-fold-layout` を持つ分割ペインだけを `50vw` にします。この有効化クラスを一度追加すれば、状態に応じたクラスのバインドは不要です。他の分割ペインは既存の幅を維持します。

`ios-theme-fold-expanded` は内側ディスプレイの利用を表し、サイドバーの幅を選択しません。完全に開いた場合は通常の幅を維持します。対象の分割ペインを `50vw` にするのは `ios-theme-fold-half-opened` だけです。

メニューを常設するかは引き続き Ionic の `when` が制御します。例は固定の 900px ブレークポイントを選んでいます。折りたたみ式と通常のディスプレイで異なるブレークポイントが必要なら、ヘルパーが適用する `ios-theme-fold-expanded` クラスを使ってアプリのレイアウトコードで方針を選択してください。ヘルパーは状態クラスだけを更新し、`when` は変更しません。このレイアウトは Vertical Bars の有効化やオーバーレイメニューの移動を行いません。

## 移行

プラグインの `setVerticalControlAreaPlacement` 呼び出しを、テーマの `setVerticalBarsLayout({ edge, inset })` へ移します。`applyFoldStateClasses` のインポートもテーマへ移してください。`nativeEdge` は利用可否を表さなくなったため削除します。以前のプラグインのヘルパーは非推奨です。[移行ガイド](../../capacitor-native-ui/docs/migration.md#web-layout-ownership)に従って既存のインポートを更新してください。
