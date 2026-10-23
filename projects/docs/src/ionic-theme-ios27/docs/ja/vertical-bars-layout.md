---
title: Vertical Bars のレイアウト
---

# Vertical Bars のレイアウト

この任意のテーマスタイルシートは縦向きレール周辺の Web の余白と配置を管理します。iOS 27 の外観全体を読み込まず、既存のテーマと併用できます。ネイティブ描画と状態の同期は、別途 [Capacitor Native UI](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/vertical-bars.md) が提供します。

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

以下のレイアウト動作は、このスタイルシートを読み込んだ状態を前提とします。ネイティブランタイムの設定とデバイス上の配置は[連携ガイド](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/capacitor-native-ui/docs/ionic-vertical-bars.md)に従ってください。

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

### コンテンツとオーバーレイのレイアウト

| 対象 | レールスタイルシート適用時のレイアウト |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ルーターとコンポーネントの背景 | ビューポート全体を維持。 |
| `ion-content` | スクロールする前景にインセットを適用。 |
| `ion-toolbar` | コンテナーの前景にインセットを適用。 |
| `ion-fab` | システム UI の隣に配置した場合のみ調整。 |
| シートを含む全幅の `ion-modal` | 前景にインセットを適用。ランタイム有効時は最前面のモーダルが対象のツールバーコントロールを自身のレールへ投影します。シートのレールはブレークポイントの変更に伴う表示範囲に追従します。 |
| 中央配置のモーダル | ツールバーボタンを維持し、ページレールのインセットは適用しません。 |
| `ion-menu` / `ion-popover` | 内部の前景コンポーネントはメインページ用の変換をせず、Ionic 標準のセーフエリア処理を維持。 |
| システム UI 側のメニュー | 全ビューポートのアニメーションホストを維持し、表示コンテナーだけをインセット分移動。 |
| 反対側のメニュー | 変更なし。 |

インセットを適用した前景コンポーネント内では、対応する Ionic セーフエリア変数をリセットし、子孫で二重に余白が付くのを防ぎます。

モーダルの対象判定にはヒンジの状態やモーダルの種類ではなく、表示中のダイアログの幅を使います。左右は RTL でも物理座標のままです。Ionic の `side="start"` と `side="end"` は論理的な方向を維持します。

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
