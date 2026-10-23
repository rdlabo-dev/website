---
title: 既存テーマを維持して Vertical Bars を追加する
---

# 既存テーマを維持して Vertical Bars を追加する

アプリの既存の外観を維持して Vertical Bars を追加します。Angular、React、Vue、その他のフレームワークでも、使用するコンポーネントに合わせて設定を選びます。

ソース DOM、投影コントロール、操作の関係は[投影の仕組み](../README.md#how-projection-works)を参照し、以下から設定を選んでください。

## 設定を選ぶ

| アプリ | 開始点 | 追加するもの |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 独自テーマ、Ionic 標準、その他のテーマの Ionic コンポーネント | [以下の Ionic 設定](#try-it-in-your-existing-ionic-app) | Foldable のデバイス配置、単独のレール CSS、Ionic Native UI アダプター。既存テーマは維持。 |
| Ionic コンポーネントなし（HTML、React、Vue、Angular など） | [HTML 設定](framework-independent.md)、次に[デバイスレール設定](framework-independent.md#device-placement-for-vertical-bars) | `@rdlabo/capacitor-native-ui/core` と Foldable。アプリがレール配置を提供し、テーマパッケージは不要。 |
| すでに iOS 27 テーマと Native UI を使用 | [デバイス配置を接続](vertical-bars.md#use-with-capacitor-foldable) | 既存ランタイムを再利用。別のものを起動しない。 |

**Ionic を使わない場合は、以下ではなく HTML ガイドに従ってください。** `@rdlabo/ionic-theme-ios27`、`vertical-bars.css`、`ion-app`、Ionic の遷移アニメーションは不要です。明示的な HTML ボタンと戻るボタンに対応し、任意の HTML タブは自動変換しません。ブラウザープレビューにはアプリで装飾した `webHost`、ネイティブレールには対応 iOS ハードウェア・ソフトウェアも必要です。

以降は **Ionic アプリ**向けです。`ios` と `md` の両モードに対応します。タブと対象ツールバー操作は側面へ移り、内容と水平コントロールは既存の外観を維持します。

iPhone Duo 対応と Vertical Bars は 2.0.0 から安定版です。

## 既存の Ionic アプリで試す

### 1. インストールして単独スタイルシートを読み込む

既存の Ionic アプリ（Ionic `>=8.8.1 <10`、Capacitor 8.5 以降）を使用します。既存の Foldable は[配置 API の要件](vertical-bars.md#use-with-capacitor-foldable)であるバージョン 8 の 8.3.3 以降を満たす必要があります。Native UI、レイアウトスタイルシートのパッケージ、必須のデバイス状態プラグインを一緒に導入します。

```bash
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

既存テーマのインポートを維持し、グローバル Sass に追加します。

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

iOS 27 テーマ全体のスタイルシートは不要です。Foldable の `ionic-tabs.css` ではなくこのスタイルシートを使います。両方を読み込むと同じタブを再配置します。

配置、折りたたみ状態、変更を公開し、レイアウト判断をアプリに委ねる [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を標準連携として採用しています。論理的なレール端と計測インセットをテーマのレイアウトヘルパーに渡します。Native UI はネイティブレールの利用可否を独立して確認します。

### 2. ナビゲーションアニメーションを接続する

Ionic の初期化前に `navAnimation` を設定します。レールランタイムの起動だけでは登録されません。アダプターは既存のページアニメーションを維持しながらネイティブコントロールを準備し、ナビゲーションの進行とキャンセルを調整します。

#### Ionic 標準のアニメーションを維持する

`navAnimation` 未設定なら Ionic 標準のビルダーをラップします。`ios` と `md` の通常アニメーションを維持するため、遷移の `mode` から選びます。

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUITransition(defaultTransition),
};
```

初期化前に既存の Ionic 設定へ統合し、Angular の `provideIonicAngular()`、React の `setupIonicReact()`、Vue の `IonicVue` オプションに渡します。既存のテーマスタイルシートは維持し、iOS 27 テーマのスタイルシートは不要です。

#### テーマの iOS アニメーションを使う

すでに iOS 27 の遷移を使う場合はこの設定を維持します。ネイティブアダプターを含み、縦レイアウトでは水平の戻るボタン効果を除外するため、追加のラッパーは不要です。JavaScript エントリーのインポートはテーマスタイルシートを読み込みません。

```ts
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  navAnimation: iosTransitionAnimation,
};
```

既存の iOS モード設定に適用し、MD 設定は維持します。

#### 独自アニメーションを維持する

別の `navAnimation` ビルダーを使う場合はラップします。

```ts
import type { AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

// アプリがすでに使っているアニメーションビルダーを渡します。
const configureNavigation = (existingTransition: AnimationBuilder) => ({
  navAnimation: withNativeUITransition(existingTransition),
});
```

アダプターは元の `Animation` を返し、効果、時間、イージングを維持します。ナビゲーション専用で、モーダル・ポップオーバーには使わないでください。Ionic は遷移後に破棄するため、各遷移で新しい `Animation` を返す必要があります。コントロール登録とアニメーションなしの遷移用にライフサイクルイベントを維持します。

アダプターは水平の戻るボタン効果も含めビルダーの対象を維持します。縦レイアウトでその効果を除く iOS 27 遷移が必要なら、`@rdlabo/ionic-theme-ios27` の `iosTransitionAnimation` を `navAnimation` に使います。アダプターを含むためラップは不要です。

### 3. デバイス配置を接続してコントロールを起動する

`ion-app` のマウント後に配置変更を購読し、初期配置を取得して 1 つのランタイムを起動します。既存の `ion-app` マークアップは維持します。ヘルパーがデバイス状態からレイアウトクラスを追加・削除します。

```ts
import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) => setVerticalBarsLayout({ edge: verticalBarEdge, inset });
const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
applyPlacement(await Foldable.getBarPlacement());
const rail = await enableNativeUI({ controls: 'verticalOnly' });
```

| デバイス配置 | Web レイアウト |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `leading` または `trailing` | 論理的な端に報告されたインセットを確保。RTL はヘルパーが解決。 |
| ブラウザーフォールバックを含む `null` | 通常のレイアウトへ復元し、サイドレールを強制しない。 |

アプリの所有元を破棄するときにリスナーを削除し、自身のランタイムを破棄します。

```ts
await listener.remove();
await rail.destroy();
```

Native UI が有効なら既存ランタイムを維持し、配置購読だけを追加します。2 つ目を起動しないでください。共有設定とアプリ所有 CSS は [Foldable 連携](vertical-bars.md#use-with-capacitor-foldable)を参照してください。

### 初期レイアウトのタイミング

`ion-app` がマウントされたらアプリルートから速やかに手順 3 を実行し、ページのデータ要求を待たないでください。`setVerticalBarsLayout()` は要素の存在が必要で、マウント前の配置を保存しません。[フレームワークのライフサイクル例](setup.md#place-startup-in-your-frameworks-app-root)に沿い、同じアプリ所有元で起動と終了を管理します。

ネイティブ起動、デバイス配置、描画は非同期です。`enableNativeUI()` の解決はハンドルの取得であり、投影完了の保証ではありません。速やかに起動するとアプリ側の待機は避けられますが、ネイティブ投影前に初期の Web レイアウトが見える場合があります。

### 4. ビルド・同期して iPhone Duo で実行する

Web アセットをビルドし、ネイティブプロジェクトを同期します。

```sh
npx cap sync ios
```

Xcode 27.1 以降でビルドし、iOS 27.1 以降の iPhone Duo で実行します。既存の SPM・CocoaPods 連携は維持します。[Native UI 設定](setup.md#4-build-sync-and-run)を参照してください。

**デバイスがレールを報告すると:** 既存タブバーと対象の固定ツールバー操作が側面へ移ります。内容はテーマを維持し、計測したインセットを確保します。対応 iOS レールは SwiftUI、利用不可なら Web レールになります。null の edge を報告するデバイスは通常レイアウトです。報告なしで模擬レールを試すには[任意のブラウザープレビュー](#optional-browser-preview)を使います。

既存のクリックハンドラー、ルーティング、フォームの関連付けを維持します。既定で操作は固定ツールバー内の `slot="icon-only"` の `ion-icon` または SVG が必要です。送信ボタンを含むすべての fill（`default`、`clear`、`solid`、`outline`）に適用します。他の操作は水平に残ります。`ion-buttons` または個々の `ion-button` に `.ios-theme-horizontal-only` を指定すると水平を維持できます。

### 任意: ネイティブボタンの外観を選ぶ

外観設定とローカル上書きは[ボタンの外観の選択](vertical-bars.md#choose-button-appearance)を参照してください。

既定は `system` で SwiftUI が縦ボタンを装飾しアイコンを着色します。既存テーマの fill と色を使うには手順 3 の `enableNativeUI` 呼び出しだけを次に置き換え、Foldable の購読は維持します。

```ts
const rail = await enableNativeUI({
  controls: 'verticalOnly',
  ionic: { verticalBars: { buttonProjection: 'source', buttonDefaultFill: 'solid' } },
});
```

`solid` の既定値は通常の Ionic ボタンに適します。`ion-buttons` 内は clear のままなので背景を投影するには `fill="solid"` を明示します。例外は[ローカル投影設定](vertical-bars.md#override-individual-buttons-or-groups)を使います。ネイティブ縦ボタンだけに作用し、Web の複製は既存の外観を維持します。

### レールが表示されない場合

| 症状 | 確認事項 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 通常レイアウト | Foldable の edge を確認。null なら意図的に通常レイアウト。 |
| edge はあるが側面余白がない | `vertical-bars.css` を読み、`ion-app` マウント後に初期配置と `barPlacementChange` を適用。 |
| 余白はあるが操作が水平のまま | ランタイムを一度起動し、既存タブまたは固定ヘッダー・フッターの対応 `slot="icon-only"` 操作を使用。 |
| 1 操作だけ水平のまま | アイコン slot、固定配置、除外を確認。[コントロール要件](vertical-bars.md#toolbar-actions)を参照。 |

## 任意のブラウザープレビュー

デバイス報告なしのローカル確認では一時的に手順 3 の Foldable 購読を省き、`ion-app` マウント後に模擬配置を適用します。

```ts
setVerticalBarsLayout({ edge: 'trailing', inset: 80 });
```

同じスタイルシートと単一 Native UI ランタイムを維持します。反対の論理端には `leading`、通常レイアウトへの復元には `null` を使います。ヘルパーが `ios-theme-vertical-bars` と物理左側のクラスを管理し、手動クラスはデバイス設定に含めません。CSS のみの確認は[レイアウトクラス](../../theme-ios27/docs/vertical-bars-layout.md#reserve-the-vertical-rail)を参照してください。

Web レールのタブはアイコンを表示し、押してドラッグするとラベルを表示します。ブラウザープレビューは Web 配置と操作を検証し、SwiftUI 外観の確認ではありません。デバイスビルドでは Foldable 購読を復元してください。

## コントロールを投影せずヒンジ状態を使う

既存テーマで折りたたみ状態による分割ペイン・レイアウト切り替えだけが必要なら、投影ランタイムを起動せず `.ios-theme-vertical-bars` も追加しません。`Foldable.getFoldState()` と `foldStateChange` を `applyFoldStateClasses(root, fold)` に渡し、終了時にリスナーを削除します。別の監視開始・停止の呼び出しはありません。

購読例、null 値、監視の寿命は[デバイスレイアウトの取得](../../theme-ios27/docs/vertical-bars-layout.md#read-the-device-layout)、明示的な幅の規則と半開き状態は[分割ペインの適応](../../theme-ios27/docs/vertical-bars-layout.md#adapt-the-split-pane)を参照してください。

## 共通レイアウト規則と API

セーフエリア、オーバーレイ、RTL、対象条件、Web シミュレーション、ハンドル API は [Vertical Bars](vertical-bars.md)に記載しています。カスタマイズ時の参照で、追加のインストール手順ではありません。
