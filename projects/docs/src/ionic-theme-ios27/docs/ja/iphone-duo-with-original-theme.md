---
title: 既存テーマでiPhone Duoに対応する（実験的機能）
---

アプリの既存のIonicテーマを維持し、iPhone Duo対応だけを追加します。[Native UI Shell](/docs/native-ui-shell)と同じく実験的機能で、APIと対応する動作は変更される可能性があります。

独立したVertical Control AreaにはiOS 27テーマのスタイルシートや完全なNative UI Shellは不要です。通常のコンテンツと水平の操作部品は既存テーマを維持します。対応するCapacitor iOSでは、縦の領域の対象部品をシステムのSwiftUIの外観で描画します。独自のWebテーマをネイティブ部品へ再現するものではありません。Web、Android、ネイティブ描画が利用できない場合はWebクローンへフォールバックします。

## 独立した対応機能をインストールする

プレリリースとCapacitorのpeer dependencyをインストールします。

```bash
npm install @rdlabo/ionic-theme-ios27@1.2.0-0 @capacitor/core@^8
```

既存テーマのimportを維持し、グローバルSassファイルにこのスタイルシートだけを追加します。

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

通常のテーマのスタイルシートから独立しており、opt-inクラスが必要です。`/vertical-bars` のentry pointはWebだけで使う場合も `@capacitor/core` をimportします。スタイルシートだけの利用にはruntimeもCapacitor依存も不要です。

Capacitor iOSでは `npx cap sync ios` を実行します。プラグインはSwift Package Managerを使います。既存のCocoaPodsアプリは[Native UI Shellの導入](/docs/native-ui-shell#有効化)を参照してください。実際のシステム操作領域とヒンジ情報にはXcode 27.1以降とiOS 27.1以降のSDKへのリンクが必要です。古いtoolchainではDOMによる互換レイアウトを維持し、ネイティブの操作領域の実測値とヒンジの状態は取得できません。

## 縦の操作領域を有効にする

アプリへ操作領域のレイアウトを適用します。

```html
<ion-app class="ios-theme-vertical-bars">...</ion-app>
```

このクラスは物理的な右側を確保します。左側に置く場合は `ios-theme-vertical-bars-left` も追加します。ネイティブの計測値がない場合は開発用に `80px` を確保します。runtimeの `setPlacement()` はプラグインの論理方向をdocumentの文字方向で解決し、実測insetを適用します。`null` を渡すと通常のレイアウトへ戻ります。

`ion-app` のマウント後、runtimeを一度だけ起動して端末の配置を適用します。

```ts
import { Capacitor } from '@capacitor/core';
import { enableVerticalControlArea, IonicNativeUIShell } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();

if (Capacitor.getPlatform() === 'ios') {
  // Runtimeが既にレイアウトを監視しているため、購読だけを行います。
  await IonicNativeUIShell.addListener('deviceLayoutChange', ({ placement }) => rail.setPlacement(placement));
  rail.setPlacement((await IonicNativeUIShell.getDeviceLayout()).placement);
}
```

runtimeはアプリ内の1か所で管理し、その利用元の破棄時にlistenerを削除して `rail.destroy()` を呼んでください。`enableNativeUIShell()` も同時に起動しないでください。既に完全なshellを使う場合はそのruntimeを維持し、`setVerticalControlAreaPlacement()` を使います。

縦の領域は対象のタブ、戻る操作、メニューボタン、アイコンを持つ固定toolbarの操作に対応します。文字だけの操作は水平toolbarに残ります。`ion-buttons` グループまたは個別の `ion-button` に `.ios-theme-horizontal-only` を付けると、水平toolbarに残せます。このモードはIonicの `ios` と `md` の両modeで動作し、既存modeの変更は不要です。

## 操作部品を描画せずヒンジの状態だけを使う

開閉状態に応じたsplit paneやレイアウト切り替えだけが必要なら、描画runtimeを起動せず、`.ios-theme-vertical-bars` も追加しません。`getDeviceLayout()` と `deviceLayoutChange` を直接使い、`startDeviceLayoutMonitoring()` と `stopDeviceLayoutMonitoring()` を対応させ、終了時にlistenerを削除します。

購読例、null値、監視の寿命は[デバイスのレイアウトを取得する](/docs/iphone-duo#デバイスのレイアウトを取得する)、opt-inの幅指定と半開き状態は[Split paneを開閉状態に合わせる](/docs/iphone-duo#split-paneを開閉状態に合わせる)を参照してください。

## 共通のレイアウト規則とAPI

safe area、overlay、RTL、操作部品の対応条件、Webでのシミュレーション、handleのAPIは[iPhone Duo対応](/docs/iphone-duo)に記載しています。独立した構成にも同じ規則が適用されます。
