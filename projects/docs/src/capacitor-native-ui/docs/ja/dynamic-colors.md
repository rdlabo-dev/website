---
sourceRevision: "0ed08a5bc4e61a961fca993c3e8e50da51b29dcc99005812b1c14e8703c9e6a9"
title: Androidの動的な配色
---

# Android の動的な配色

動的な配色は、正式対応のオプトイン API です。Native UI の投影を有効にしたり、Activity のテーマを変更したり、壁紙・ストレージへの権限を要求したりせずに、デバイスの Material You パレットを読み取れます。色の取得に Ionic は不要です。アプリ内の SwiftUI／Compose 拡張は引き続き実験的であり、そのステータスとは独立しています。

## インストールとインポート

プラグインをアプリの直接依存としてインストールし、同期してから Android アプリを再ビルドします。JavaScript だけを更新しても、インストール済み APK にネイティブメソッドは追加されません。

```sh
npm install @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

関数と型はパッケージルートからインポートします：

```ts
import {
  getDynamicColorScheme,
  addDynamicColorListener,
  materialColorRoles,
  type DynamicColorScheme,
  type MaterialColorScheme,
  type MaterialColorRole,
} from '@rdlabo/capacitor-native-ui';
```

ネイティブの取得メソッドとルートのエクスポートは 2.1.3 に含まれます。2.1.1 など古いインストールでは、更新とネイティブの再ビルドが必要です。このガイドは現在のソース API を説明します。実験的という指定の解除は、この変更を含むリリースから有効になります。以前のプラグインサブパス `/dynamic-colors` は使わないでください。

## 配色を取得する

```ts
const result = await getDynamicColorScheme();
if (result.available) {
  const colors = result.systemDark ? result.dark : result.light;
  console.log(colors.primary, colors.onPrimary);
}
```

`getDynamicColorScheme(): Promise<DynamicColorScheme>` は、1回のネイティブ呼び出しで両方の外観を取得します。スナップショットを返し、キャッシュや CSS の適用は行いません。

| プラットフォーム | 結果 |
| --- | --- |
| Android 12 以降（API 31 以降） | `{ available: true, systemDark, light, dark }` |
| Android 11 以前 | `{ available: false, systemDark }` |
| iOS / Web | `{ available: false, systemDark }`。ネイティブブリッジの読み取りなし |

`systemDark` は Android 構成のナイトモードフラグです。iOS／Web では `prefers-color-scheme: dark` から取得し、`matchMedia` が利用できない場合は false になります。`available` が false の場合、`light` と `dark` プロパティはありません。アプリの既存のパレットを維持してください。ネイティブの読み取り失敗は Promise を拒否し、`available: false` には変換されません。

### 色の契約

各 `MaterialColorScheme` は、不透明な6桁の `#RRGGBB` 文字列を含みます。16進数の英字の大文字・小文字は区別しません。`primary`、`secondary`、`tertiary`、`error`、`surface`、`onSurface` は必須です。他のロールは、利用側が部分的な配色も受け入れられるよう、公開型では任意です。現在の Android 実装は、各外観に対して `materialColorRoles` の46個の名前をすべて返します：

- primary／secondary／tertiary のコンテナを含む、アクセントと前景のロール。
- エラーとエラーコンテナの組み合わせ。
- サーフェス、サーフェスコンテナの各レベル、サーフェスの前景。
- アウトライン、アウトラインのバリアント、スクリム、反転および固定ロール。

ロール名には `MaterialColorRole`、対応する名前の列挙には `materialColorRoles` を使います。描画時は `primary` と `onPrimary` など、背景と前景の組み合わせを維持してください。値は AndroidX Material 3 の動的なライト／ダーク配色から取得します。プラグインは1つのシードカラーからパレットを再生成せず、生のトーンパレットも公開しません。値はデバイスのシステムパレットに依存します。

## 変更の監視とクリーンアップ

`addDynamicColorListener(listener: () => void)` は、`remove(): Promise<void>` を持つ `PluginListenerHandle` の Promise を返します。

Android は Activity の再開時と構成変更時に通知します。通知は**再度取得すること**を意味し、色が必ず変わったことを意味するわけではありません。通知に配色は含まれず、壁紙の変更を継続的に購読する機能でもありません。iOS／Web では、削除可能で何もしないハンドルを返します。独自のコントローラーを実装する場合は、ブラウザーの外観を別途監視してください。

起動中の変更を取りこぼさないよう、初回の読み取り前に登録します：

```ts
const refresh = async () => {
  const result = await getDynamicColorScheme();
  // ここで結果を適用または保存し、利用できない場合はフォールバックを維持します。
  console.log(result);
};
const handle = await addDynamicColorListener(() => {
  void refresh().catch(console.error);
});
try {
  await refresh();
} catch (error) {
  await handle.remove();
  throw error;
}

// アプリの終了処理で：
await handle.remove();
```

独自のコントローラーでは同時に走る読み取りをまとめ、更新が失敗した場合は最後に機能したパレットを維持してください。以下の Ionic コントローラーは、それらを処理します。

## Ionic への適用

プラグインは色の取得を担当し、テーマは変換と CSS のライフサイクルを管理します。`enableNativeUI()` の呼び出しや、他の投影設定は不要です。

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// ユーザーの外観設定が変わったとき：
theme.setMode('dark'); // 'light' と 'system' にも対応します。

// アプリの終了処理で：
await theme.destroy();
```

MD3 テーマをインストールし、グローバルスタイルシートで Ionic の `dark.class.css` をインポートします。`dark.system.css` や `dark.always.css` と併用しないでください。DOM が利用可能になってから、ブラウザードキュメントごとに1つのコントローラーを初期化します。サーバーレンダリング中には実行しないでください。スタイルシートの完全な設定、フォールバック規則、エラー、外観制御は[テーマの設定とマッピングのガイド](/ionic-theme-md3/docs/dynamic-colors)を参照してください。

この機能がなくても Ionic パレットで十分に対応できます。Material のロールは、明示的な Ionic の色指定、デフォルトの白いサーフェス、独立した light／medium／dark パレットを維持しながら、任意のトークンを拡充します。success と warning は Ionic の値を維持します。

## トラブルシューティング

- **ネイティブメソッドが未実装：** プラグイン依存関係を更新し、Capacitor の同期を実行して、Android アプリを再ビルド・再インストールします。JavaScript のバージョンだけでなく、ネイティブバイナリも確認してください。
- **iOS／Web／古い Android で色が取得できない：** `available: false` は想定どおりです。既存のパレットを維持してください。インストール失敗ではありません。
- **壁紙の変更がすぐに反映されない：** アプリに戻った後に再取得するか、明示的に更新を要求します。通知はライフサイクルや構成による無効化であり、壁紙イベントの即時通知を保証しません。
- **色は取得できるが UI が変わらない：** この API は CSS を書き込みません。テーマコントローラーを接続するか、独自のレンダラーで値を適用してください。
