---
title: 既存テーマでiPhone Duoに対応する（プレビュー）
---

既存のテーマを維持したまま、Ionicアプリに縦のナビゲーション領域を追加します。タブと対応するtoolbarの操作部品は画面の側面へ移り、コンテンツと水平の操作部品は現在の外観を保ちます。Ionicの `ios` と `md` の両modeに対応します。

**まずChromeで試せます。** iPhone DuoやiOSビルドを準備する前に、Webの操作部品でレイアウトを確認できます。対応するCapacitor iOSでは、同じIonicマークアップからシステム操作領域にSwiftUIのネイティブ部品を表示します。

`1.2.0` で利用できる **プレビュー機能** です。APIと対応する動作は変更される可能性があります。

## 既存のIonicアプリで試す

### 1. インストールして専用スタイルシートを読み込む

Ionic `>=8.8.1 <10` とCapacitor Core `>=8 <9` を使う既存アプリを前提とします。既存のCapacitor 8は再インストール不要です。別majorを使う場合は、Core・CLI・platformパッケージをまとめて移行してから進めてください。Capacitorを使わないWeb専用アプリでは `@capacitor/core@^8` もインストールします。JavaScriptのentry pointはChromeでもこの依存を必要とします。

```bash
npm install @rdlabo/ionic-theme-ios27@1.2.0
```

既存テーマのimportを維持し、グローバルSassファイルに次を追加します。

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
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

### 3. 画面遷移アニメーションを接続する

Ionicの初期化前に `navAnimation` を設定します。操作領域のruntimeを起動するだけでは、この設定は登録されません。アダプターは既存アニメーションを維持しながらネイティブ部品の退避を待ち、スワイプの進捗とキャンセルを連携します。

#### Ionicの標準アニメーションを維持する

`navAnimation` を設定していない場合は、Ionic標準のbuilderをラップします。Ionicが遷移時に渡す `mode` でbuilderを選び、`ios` と `md` のどちらも通常のアニメーションを維持します。

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUIShellTransition(defaultTransition),
};
```

初期化前に、既存のIonic設定へこのオプションを統合します。Angularでは `provideIonicAngular()`、Reactでは `setupIonicReact()`、Vueでは `IonicVue` pluginのオプションへ渡してください。既存テーマのスタイルシートのimportは維持します。iOS 27テーマのスタイルシートは不要です。

#### 本パッケージのiOSアニメーションを使う

既にiOS 27の画面遷移を使っている場合は、この設定を維持します。ネイティブ連携のアダプターを含み、縦レイアウトでは水平の戻るボタンの効果を対象から外すため、追加のラップは不要です。このJavaScriptのentry pointをimportしても、テーマのスタイルシートは読み込まれません。

```ts
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  navAnimation: iosTransitionAnimation,
};
```

既存のiOS mode用設定へこのオプションを適用し、MD用設定は維持してください。

#### 独自アニメーションを維持する

`navAnimation` に他のbuilderを使っている場合は、それをラップします。

```ts
import type { AnimationBuilder } from '@ionic/core';
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

// アプリで既に使っているanimation builderを渡します。
const configureNavigation = (existingTransition: AnimationBuilder) => ({
  navAnimation: withNativeUIShellTransition(existingTransition),
});
```

アダプターは元の `Animation` を返し、効果、duration、easingを維持します。画面遷移だけに使い、modalやpopoverのアニメーションには使いません。Ionicが遷移後に破棄するため、builderは遷移ごとに新しい `Animation` を返してください。部品登録とアニメーションなしの遷移には、引き続きlifecycle eventを使います。

アダプターは、水平の戻るボタンへの効果を含むbuilderのアニメーション対象を維持します。縦レイアウトでその効果を除外するiOS 27の画面遷移が必要なら、`@rdlabo/ionic-theme-ios27` の `iosTransitionAnimation` を `navAnimation` に使ってください。こちらにはアダプターが組み込まれているため、ラップは不要です。

### 4. App rootのマウント後に操作部品を起動する

`ion-app` がDOMに存在してから、アプリの起動処理で一度呼びます。

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

**確認できる結果:** 既存のタブバーが側面へ移り、`slot="icon-only"` を指定した `ion-icon` またはSVGを持つ固定toolbarボタンも表示されます。コンテンツは既存テーマを維持し、操作部品の領域を空けます。Webのタブはアイコンを表示し、押したままドラッグするとラベルが現れます。

既存のIonic click handler、ルーティング、フォームとの関連付けを使います。すべてのfill（`default`、`clear`、`solid`、`outline`）と送信ボタンに同じ `icon-only` の規則が適用されます。このslotがない操作部品は水平に残ります。`ion-buttons` グループまたは個別の `ion-button` に `.ios-theme-horizontal-only` を追加すると、水平toolbarに残せます。

アプリ内の利用元を破棄するときは `await rail.destroy()` を呼び、元の部品を復元してruntimeを解放します。既に `enableNativeUIShell()` を使う場合はそのruntimeを維持し、[共通の配置ガイド](/docs/iphone-duo#操作部品を縦の領域へ描画する)に従ってください。

### 任意: ネイティブボタンの外観を選ぶ

`buttonProjection` と要素単位の描画設定は `1.2.0` から利用できます。利用条件と移行の詳細は[ボタンの外観を選ぶ](/docs/vertical-bars#ボタンの外観を選ぶ)を参照してください。

新しい既定値は `system` です。SwiftUIが縦型ボタンのスタイルとアイコンの色を設定します。既存テーマのfillと色を反映する場合は次のように指定します。

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source', buttonDefaultFill: 'solid' });
```

通常のIonicボタンには `solid` が適しています。`ion-buttons` 内では引き続きclearが既定値なので、背景を描画するには `fill="solid"` を明示します。例外には[要素単位の描画設定](/docs/vertical-bars#個別のボタンやグループを上書きする)を使います。これらの設定はネイティブの縦型ボタンだけに作用し、Webクローンは既存の外観を維持します。

### プレビューが表示されない場合

| 表示の状態 | 確認すること |
| --- | --- |
| 側面に空きができない | `vertical-bars.css` を読み込み、`ion-app` にクラスを追加します。 |
| 空きはできるが部品が水平に残る | App rootのマウント後に `enableVerticalControlArea()` を起動します。既存のタブや、固定header/footer toolbarの `slot="icon-only"` を指定した操作部品を使います。 |
| 一部の操作だけ水平に残る | アイコンの `slot="icon-only"` と、スクロール内容の外にある固定toolbarを確認します。明示的に除外した部品や中央のmodal内の部品は水平に残ります。`fill` と `type="submit"` は移動を妨げません。[操作部品の対応条件](/docs/vertical-bars#toolbarの操作部品)を参照してください。 |

## iPhone Duoと接続する

端末状態の取得用に [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) をインストールします。

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync ios
```

iOS 27.1で実際の操作領域の配置とヒンジ状態を取得するには、Capacitor 8.5以降とXcode 27.1以降を使います。Native UI ShellはSwift Package Managerを使います。既存のCocoaPodsアプリは[Native UI Shellの導入](/docs/native-ui-shell#有効化)を参照してください。このパッケージの `vertical-bars.css` を維持し、同じ操作領域へ描画するプラグインの `ionic-tabs.css` は読み込まないでください。

ブラウザ用の起動コードを[端末配置の設定](/docs/iphone-duo#操作部品を縦の領域へ描画する)へ置き換えます。その設定は初期値と `barPlacementChange` イベントを `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })` へ渡し、購読と後処理はアプリが管理します。

要求する端とネイティブの端の両方に、Foldableの実測insetを添えて渡します。配置APIはRTLを解決します。端がnullなら通常のレイアウトへ戻ります。

対応するiOSでは操作領域をSwiftUIでネイティブ描画し、通常のコンテンツと水平の操作部品は独自のWebスタイルを維持します。WebとAndroidはWebクローンを使います。

## 操作部品を描画せずヒンジの状態だけを使う

開閉状態に応じたsplit paneやレイアウト切り替えだけが必要なら、描画runtimeを起動せず、`.ios-theme-vertical-bars` も追加しません。`Foldable.getFoldState()` の結果と `foldStateChange` イベントを `applyFoldStateClasses(root, fold)` に渡し、終了時にlistenerを削除します。監視を開始・停止する別の呼び出しは不要です。

購読例、null値、監視の寿命は[デバイスのレイアウトを取得する](/docs/iphone-duo#デバイスのレイアウトを取得する)、opt-inの幅指定と半開き状態は[Split paneを開閉状態に合わせる](/docs/iphone-duo#split-paneを開閉状態に合わせる)を参照してください。

## 共通のレイアウト規則とAPI

safe area、overlay、RTL、操作部品の対応条件、Webでのシミュレーション、handleのAPIは[縦型バー](/docs/vertical-bars)に記載しています。独立した構成にも同じ規則が適用されます。
