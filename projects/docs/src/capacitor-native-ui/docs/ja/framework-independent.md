---
title: Ionic なしで Native UI を使う
---

# Ionic なしで Native UI を使う

Ionic やテーマ CSS を使わず、既存の Web アプリにネイティブボタンを追加します。ラベル、状態、クリックハンドラーは通常の HTML 要素に維持します。標準ボタンに独自の Swift 登録は不要です。

iOS プロジェクトを持つ Capacitor 8 アプリ、Xcode 26 以降、iOS 26 以降のデバイス・シミュレーターを使います。ブラウザーと Android は Web コントロールを維持します。独自の Android ネイティブ内容には [Kotlin/Compose 拡張](native-ui-extensions.md#2b-register-compose-content-on-android)を使用してください。

まず[投影の仕組み](../README.md#how-projection-works)を参照してください。HTML 要素をソースとして維持し、ネイティブコントロールや Web プロキシが表示を担当します。

**Vertical Bars だけを使う場合**は、以下の手順 1–4 と[デバイス配置の設定](#device-placement-for-vertical-bars)に従います。手順 3 のランタイムは固定の配置希望値なしで再利用します。Web に残すボタンからは明示的なマーカーを削除します。Ionic、`@rdlabo/ionic-theme-ios27`、`vertical-bars.css` は不要です。

独自テーマで `ion-tabs`、`ion-toolbar` などの Ionic コンポーネントを使うアプリの Vertical Bars には、[Ionic Vertical Bars 設定](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app)を使用してください。Angular・React・Vue というフレームワークだけでアダプターは決まりません。

## 1. プラグインをインストールする

デバイス状態の標準連携には [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を使用します。配置と折りたたみ状態の API でレイアウトの適応をアプリが制御できます。インストール後に初期値と変更イベントを接続してください。

既存の Capacitor 環境を維持し、Native UI と Foldable を一緒に追加します。

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

`/core` には `@capacitor/core` が必要ですが Ionic 依存はありません。現在ブラウザー専用の場合は、ネイティブコントロールの実行前に Capacitor 8 iOS プロジェクトを設定してください。

## 2. ソースコントロールを指定する

```html
<main id="app">
  <button type="button" data-native-ui="button" data-native-ui-placement="element">Add</button>
  <button type="button" data-native-ui="back-button" data-native-ui-placement="rail">Back</button>
</main>
<aside id="rail" aria-label="Navigation"></aside>
```

| 属性 | 値 | 効果 |
| -------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `data-native-ui` | `button` | 標準の操作ボタンを投影。 |
| `data-native-ui` | `back-button` | 標準の戻るボタンを投影。ナビゲーションはソースのクリックハンドラーが管理し、プラグインは `history.back()` を呼ばない。 |
| `data-native-ui` | `disabled` | 要素と部分木を投影から除外。 |
| `data-native-ui-placement` | `element`（既定値） | ソース要素の矩形を使用。 |
| `data-native-ui-placement` | `rail` | Vertical Bars を要求。ネイティブレールが利用不可なら任意の Web レールホストを使用。 |

`button` と `back-button` は `<button>`、明示的に指定した `ion-button`、または `role="button"` とクリック動作を持つ要素に適用します。指定のない HTML をコントロールと推測しません。`data-native-ui-placement` は宣言済みソースの配置を選択し、未指定 HTML を投影対象にはしません。

コントロールのデータと動作をソースに維持します。

| ソースのプロパティ | 投影の動作 |
| -------------------- | ------------------------------------------------------------------------------------------ |
| アクセシブルな名前 | `aria-labelledby`、`aria-label`、テキストの順に解決。 |
| 画像 | 対応する静的 SVG を使用。 |
| 無効状態 | ネイティブの `disabled`、無効な fieldset、`aria-disabled="true"` を尊重。 |
| 表示と範囲 | 非表示・削除・除外・範囲外のソースを終了し、古い操作は拒否。 |
| アプリのハンドラー | 元の要素に維持。 |

ネイティブと Web プロキシの操作は元の要素をクリックします。そのため通常の `<button type="submit">` は元のフォーム動作を維持します。送信しない操作は `type="button"` を使います。ネイティブブリッジはポップアップを開く API などのブラウザーのユーザー操作権限を維持しません。

## 3. コントロールのマウント後に起動する

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
});
```

ソースルートが存在してから一度呼びます。ハンドルを保持し、ルート破棄時に `await shell.destroy()` を呼んでください。プラグインはページ余白やセーフエリア規則を追加しないため、アプリの CSS を維持します。Angular・React・Vue は `/core` インポートで[アプリルートのライフサイクル例](setup.md#place-startup-in-your-frameworks-app-root)を使用します。アニメーション付き遷移は[完了・キャンセルまでの中断](setup.md#navigation-without-the-theme)を参照してください。

### HTML テーマに合わせる

独自 HTML テーマでは Web パレットを選ぶ同じ CSS に `color-scheme: light` または `color-scheme: dark` を宣言します。背景色だけではネイティブ外観は選択されません。手動切り替えの例、Ionic・テーマ変数の優先順位、共有レールの動作は[ライト・ダーク外観](appearance.md)を参照してください。

## 4. iOS でビルドして実行する

Web アプリをビルドして `npx cap sync ios` を実行し、Xcode から iOS プロジェクトを起動します。手順 3 の設定では Add はソース位置に描画され、元のクリックハンドラーを実行します。Back は利用可能ならデバイスが報告するネイティブレールを要求します。Web の余白を同期するため後述のデバイス配置を接続してください。ブラウザーでは同じボタンが通常の Web ボタンのままです。マーカーのない HTML は変わりません。

対応 iOS で Web のままなら、設定した root 内で表示され、アクセシブルな名前があり、直接依存のプラグインを同期して iOS アプリを再ビルドしたことを確認します。

Ionic も使うアプリで明示的ソースと登録拡張だけを投影するには `ionic: { auto: false }` を設定します。[選択的な Ionic 投影](configuration.md#select-controls-explicitly-in-a-customized-ionic-app)を参照してください。

## Vertical Bars のデバイス配置

Foldable は手順 1 の標準インストールに含まれています。次のようにレイアウトへ接続します。

手順 3 のランタイムを **`verticalBars.placement` なし**で再利用します。Native UI がデバイスの edge に従います。固定の `edge: 'trailing'` は制約となり、leading 側のレールを拒否する場合があります。

[Foldable 連携](vertical-bars.md#with-application-owned-css-or-without-ionic)に従います。

1. `barPlacementChange` を購読し、`getBarPlacement()` で初期 edge と inset を取得します。
2. edge と inset をアプリの CSS に適用します。null の edge では通常の余白に戻して `shell.disableVerticalControlArea()` を呼び、edge が戻れば `shell.enableVerticalControlArea()` を呼びます。レイアウト更新と直列化してください。
3. 終了時にリスナーを削除し、このアプリが所有するランタイムを破棄します。

手順 2 の明示的マーカーはコントロールと希望配置を宣言するので維持します。Back だけを投影するには Add から `data-native-ui="button"` を削除します。`controls` は明示的宣言を無効にしません。Web レールホストがなければ、利用不可のネイティブレールコントロールは元の Web 位置に残ります。テーマパッケージは不要です。

## 任意のブラウザーレールプレビュー

ブラウザーのみのレイアウト確認では、一時的に手順 3 の起動とデバイス購読の代わりに固定の Web レールを使います。固定配置を標準のデバイス設定へコピーしないでください。ソースルートとホストのマウント後に一度呼び、所有元の破棄時に `await shell.destroy()` を呼びます。

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
  verticalBars: {
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
});
```

プラグインはデバイスが報告するレールの利用可否を使い、ドキュメント方向で leading/trailing を解決します。配置希望値で非対応システムレールを強制できません。ネイティブが拒否すると Web を復元します。`webHost` があれば明示的なレール HTML コントロールに Web プロキシを作り、なければ元要素を表示します。ホストのスタイル・位置・内容余白はアプリが管理します。ホストはソースルートの外に置きます。

配置は明示的マークアップで選びます。Back はプレビューレール、Add は元の位置です。レール投影の無効化は通常のネイティブ投影を破棄せず、元のレールコントロールを復元し Web プロキシを削除します。デバイス向けビルド前に手順 3 のランタイムと前述の Foldable 購読へ戻してください。

現在の HTML アダプターはボタンと戻るボタンに対応します。任意の HTML タブ、セグメント、検索バー、FAB 構造は変換しません。Ionic アダプターは既存の対応コントロールを維持します。独自 element 拡張は同じ範囲限定の root で動作し、`tab-accessory` 配置には引き続き Ionic タブバーの所有元が必要です。

## 使用例

[通常の HTML の例](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v2.0.2/examples/native-ui-html)は Add、ルーターなしの Home/Details/Back 遷移、任意の Web レール投影、クリーンアップを示します。Ionic・テーマ CSS は使いません。
