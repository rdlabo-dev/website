---
title: 既存テーマでiPhone Duoに対応する（実験的機能）
---

既存のテーマを維持したまま、Ionicアプリに縦のナビゲーション領域を追加します。タブと対応するtoolbarの操作部品は画面の側面へ移り、コンテンツと水平の操作部品は現在の外観を保ちます。Ionicの `ios` と `md` の両modeに対応します。

**まずChromeで試せます。** iPhone DuoやiOSビルドを準備する前に、Webの操作部品でレイアウトを確認できます。対応するCapacitor iOSでは、同じIonicマークアップからシステム操作領域にSwiftUIのネイティブ部品を表示します。

`1.2.0-0` で利用できる **実験的機能** です。APIと対応する動作は変更される可能性があります。

## 既存のIonicアプリで試す

### 1. インストールして専用スタイルシートを読み込む

```bash
npm install @rdlabo/ionic-theme-ios27@1.2.0-0 @capacitor/core@^8
```

既存テーマのimportを維持し、グローバルSassファイルに次を追加します。

```scss
@use @rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css;
```

独立したJavaScriptのentry pointはChromeでも `@capacitor/core` を必要とします。iOS 27テーマのスタイルシートは不要です。

### 2. アプリを側面のレイアウトへ切り替える

既存のapp rootにクラスを追加し、その中のコンテンツを維持します。

```html
<ion-app class="ios-theme-vertical-bars">
  <!-- 既存のページ、タブ、toolbarの操作部品をここに維持します。 -->
</ion-app>
```

プレビューは物理的な右側に `80px` を確保します。左側を試すには `ios-theme-vertical-bars-left` も追加します。

### 3. App rootのマウント後に操作部品を起動する

`ion-app` がDOMに存在してから、アプリの起動処理で一度呼びます。

```ts
import { enableVerticalControlArea } from @rdlabo/ionic-theme-ios27/vertical-bars;

const rail = await enableVerticalControlArea();
```

**確認できる結果:** 既存のタブバーが側面へ移り、対応するアイコン付きの固定toolbarの操作部品も表示されます。コンテンツは既存テーマを維持し、操作部品の領域を空けます。Webのタブはアイコンを表示し、押したままドラッグするとラベルが現れます。

既存のIonic click handlerとルーティングを使います。文字だけのtoolbar操作は水平に残ります。`ion-buttons` グループまたは個別の `ion-button` に `.ios-theme-horizontal-only` を追加すると、水平toolbarに残せます。

アプリ内の利用元を破棄するときは `await rail.destroy()` を呼び、元の部品を復元してruntimeを解放します。既に `enableNativeUIShell()` を使う場合はそのruntimeを維持し、[共通の配置ガイド](/docs/iphone-duo#操作部品を縦の領域へ描画する)に従ってください。

### プレビューが表示されない場合

| 表示の状態 | 確認すること |
| --- | --- |
| 側面に空きができない | `vertical-bars.css` を読み込み、`ion-app` にクラスを追加します。 |
| 空きはできるが部品が水平に残る | App rootのマウント後に `enableVerticalControlArea()` を起動します。既存のタブや、固定toolbarの対応するアイコン付き操作を使います。 |
| 一部の操作だけ水平に残る | 文字だけの操作、独自のfill、明示的に除外した部品は元の表示を維持します。[操作部品の対応条件](/docs/iphone-duo#操作部品を縦の領域へ描画する)を参照してください。 |

## iPhone Duoと接続する

Capacitor iOSでは `npx cap sync ios` を実行します。実際の操作領域の端、safe areaのinset、ヒンジの状態を取得するには、Xcode 27.1以降でビルドし、iOS 27.1以降のSDKとリンクしてください。プラグインはSwift Package Managerを使います。既存のCocoaPodsアプリは[Native UI Shellの導入](/docs/native-ui-shell#有効化)を参照してください。

ブラウザ用の起動コードを、`ion-app` のマウント後に実行する次のコードへ置き換えます。

```ts
import { Capacitor, type PluginListenerHandle } from @capacitor/core;
import { enableVerticalControlArea, IonicNativeUIShell } from @rdlabo/ionic-theme-ios27/vertical-bars;

const rail = await enableVerticalControlArea();
let layoutListener: PluginListenerHandle | undefined;

if (Capacitor.getPlatform() === ios) {
  // Runtimeが既にレイアウトを監視しているため、購読だけを行います。
  layoutListener = await IonicNativeUIShell.addListener(deviceLayoutChange, ({ placement }) =>
    rail.setPlacement(placement),
  );
  rail.setPlacement((await IonicNativeUIShell.getDeviceLayout()).placement);
}

// アプリ内の利用元を破棄するときに呼びます。
const stopVerticalArea = async () => {
  await layoutListener?.remove();
  await rail.destroy();
};
```

`setPlacement()` は実測insetを適用し、論理方向をdocumentの文字方向で解決します。`null` の端は操作領域のない端末で通常のレイアウトを復元します。古いtoolchainでは実際のシステム操作領域とヒンジの計測値なしで、DOMによる互換対応を維持します。

対応するiOSでは操作領域の部品はシステムのSwiftUIの外観を使い、通常のコンテンツと水平の操作部品は独自のWebスタイルを維持します。WebとAndroidはWebクローンを使います。

## 操作部品を描画せずヒンジの状態だけを使う

開閉状態に応じたsplit paneやレイアウト切り替えだけが必要なら、描画runtimeを起動せず、`.ios-theme-vertical-bars` も追加しません。`getDeviceLayout()` と `deviceLayoutChange` を直接使い、`startDeviceLayoutMonitoring()` と `stopDeviceLayoutMonitoring()` を対応させ、終了時にlistenerを削除します。

購読例、null値、監視の寿命は[デバイスのレイアウトを取得する](/docs/iphone-duo#デバイスのレイアウトを取得する)、opt-inの幅指定と半開き状態は[Split paneを開閉状態に合わせる](/docs/iphone-duo#split-paneを開閉状態に合わせる)を参照してください。

## 共通のレイアウト規則とAPI

safe area、overlay、RTL、操作部品の対応条件、Webでのシミュレーション、handleのAPIは[iPhone Duo対応](/docs/iphone-duo)に記載しています。独立した構成にも同じ規則が適用されます。
