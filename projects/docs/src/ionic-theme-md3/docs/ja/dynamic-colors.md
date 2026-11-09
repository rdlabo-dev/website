---
title: "Androidの動的な配色"
sourceRevision: "6ebe7b39be22337397e0e7b7a3e8058b446e8d1258bdbf1a1ee7fed47327ab34"
---
# Androidの動的な配色

動的な配色に対応しており、任意で有効にできます。Android 12以降がライトとダークのMaterial配色を提供し、このパッケージはIonic Docsのカラージェネレーターのアルゴリズムで各ロールを変換します。古いAndroid、iOS、Webでは既存のIonicパレットとコンポーネントのデフォルト色を使います。[カラーシステム](color-system.md)を参照してください。Ionicパレットだけで十分であり、ネイティブのMaterialロールは任意のCSSトークンを補うだけです。

`getDynamicColorScheme`と`addDynamicColorListener`のAPIは、`@rdlabo/capacitor-native-ui`のルートエントリーポイントからインポートします。Native UIの投影を有効にする必要はありません。テーマの変換ヘルパーは引き続き`@rdlabo/ionic-theme-md3/dynamic-colors`から利用できます。

## デバイスの配色例

Android 17を実行するPixel 8aで、任意のMaterial Youの配色を有効にした例です。デフォルトのテーマはIonic独自のパレットで動作します。これらのスクリーンショットは、ライトとダークの外観で追加のネイティブ配色連携を示しています。

<img src="../screenshots/android17-light.png" alt="任意のMaterial Youの配色をライトの外観で表示" width="270"> <img src="../screenshots/android17-dark.png" alt="任意のMaterial Youの配色をダークの外観で表示" width="270">

## セットアップ

Capacitorアプリケーションにテーマとネイティブプロバイダーをインストールします。

```sh
npm install @rdlabo/ionic-theme-md3 @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

プラグインのルートエクスポートとネイティブgetterは2.1.3に含まれます。古いネイティブバイナリ（例：2.1.1）は、新しいJavaScriptを配布するだけでなく、再ビルドする必要があります。以下のマッピングにはテーマ9.2.0以降を使ってください。[プラグインガイド](/capacitor-native-ui/docs/dynamic-colors)で、利用可否、ロールの型、ネイティブ通知を説明しています。

Ionicとテーマのスタイルシートの順序は、[テーマのインストール](../README.md)に従ってください。グローバルスタイルシートにクラスベースのダークパレットを含めます。

```scss
@import '@ionic/core/css/palettes/dark.class.css';
```

Ionic Angularでは`@ionic/angular/css/palettes/dark.class.css`も同等です。ブラウザー内でDOMの生成後、アプリ起動時に一度だけ初期化します。このヘルパーはドキュメントに書き込むため、サーバーレンダリング中に実行してはいけません。

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// これらの切り替えはネイティブを呼び出さず、キャッシュ済みパレットを使います。
theme.setMode('dark');
theme.setMode('light');
theme.setMode('system');

await theme.refresh(); // 任意で壁紙／パレットを明示的に更新します。

// 初期化直後ではなく、アプリの終了処理で実行します。
await theme.destroy(); // 購読を解除し、元のルートプロパティ／クラスを復元します。
```

## 外観とライフサイクル

`dark.system.css`や`dark.always.css`を併せてインポートしないでください。このコントローラーは、`document.documentElement`上の`ion-palette-dark`クラスとルートの`color-scheme`プロパティを管理します。グローバルなパレットの上書きはそのルートに置いてください。bodyや個々のコンポーネントの変数は、継承したルートの値を隠す可能性があります。

- `system`（デフォルト）：デバイスの外観に従います。
- `light`：デバイスがダークへ切り替わってもライトを維持します。
- `dark`：デバイスがライトへ切り替わってもダークを維持します。

ネイティブの再開／設定変更イベント、ドキュメントの再開／表示状態、ブラウザーの外観変更が更新を引き起こします。同時リクエストはブリッジの読み取りを共有します。両方の配色をまとめて取得し、変更のないパレットは変換せず、変更のないプロパティはCSSへ書き込みません。更新エラー時は最後に正常に適用できたパレットを維持します。自動更新の失敗は`onError`へ渡し、明示的な`theme.refresh()`は呼び出し側が処理できるようrejectします。初期化エラーではrejectしてクリーンアップします。ドキュメントごとにコントローラーを1つだけ使用できます。アプリの終了処理で`destroy()`を呼び出してください。

| コントローラーのメソッド | 動作 |
| --- | --- |
| `setMode(mode)` | キャッシュ済みの配色で`system`、`light`、`dark`を同期的に選択します。ネイティブの読み取りは行いません。 |
| `refresh()` | 再度読み取り、選択した外観を適用します。失敗時はrejectします。 |
| `destroy()` | リスナーを削除し、元のインラインプロパティとダーククラスを復元します。繰り返し呼んでも安全です。 |

`available`がfalseの場合、コントローラーは選択した外観の管理を続けながら、アプリのパレットを維持／復元します。初期化失敗時は`enableDynamicColors()`のPromiseをrejectし、リスナーをクリーンアップします。`onError`は自動更新のエラーを処理するもので、初期化や明示的な`refresh()`呼び出しは対象外です。別の外観コントローラーから同じルートクラス／プロパティへ書き込まないでください。任意の`document`オプションで特定のブラウザードキュメントを対象にできます。

## マッピング

| Materialロール | Ionicトークン |
| --- | --- |
| primary / secondary / tertiary | 対応する名前付きカラー |
| error | danger |
| ライトではsurfaceContainerLowest／ダークではsurfaceContainerLow（surfaceへフォールバック） | 背景色 |
| ライトではsurfaceContainerLow／ダークではsurfaceContainerHighest（surfaceへフォールバック） | light |
| outline（surface/onSurfaceの中間値へフォールバック） | medium |
| onSurface | dark |
| onSurface | テキスト色 |

ネイティブブリッジは両モードで対応するMaterialのカラーロールを提供します。元の6フィールドは互換性のための入力として残り、追加ロールはTypeScriptの契約では任意です。名前付きカラーは、ベース、RGB、コントラスト、コントラストRGB、shade、tintを生成します。primary、secondary、tertiary、dangerは、提供された`onPrimary`、`onSecondary`、`onTertiary`、`onError`ロールをコントラストとコントラストRGBに使います。不足するロールは個別にIonicの黒／白のコントラスト比比較へフォールバックします。shade/tintの生成とlight/medium/darkパレットはIonicの計算を維持します。MD3コンポーネントも、提供されていれば`on*`ロールを使います。背景とテキストは別々のstep-50からstep-950までのトークンを生成し、従来の`--ion-color-step-*`エイリアスも提供します。successとwarningは既存のIonic値を維持します。light、medium、darkはデバイスのニュートラルパレットに従い、RGB、コントラスト、shade、tintをまとめて生成します。ライトのベースにはsurfaceContainerLowest（白）、ダークのベースにはsurfaceContainerLowを使います。古い6ロールの配色は、background/lightにはsurface、mediumにはsurface/onSurfaceの中間値へフォールバックします。

デフォルトのライトサーフェスは白のままです。対象はContent、Menu、Toolbar、TabBar、Card、リスト／項目、Modal/Popover/Alert/ActionSheetです。ダークモードではページとオーバーレイのシェルがsurfaceContainerLowを使い、Toolbar、TabBar、Card、リスト／項目がsurfaceContainerHighを使います。名前付きのlightパレットはダークモードでsurfaceContainerHighestを使い、すべてを黒に平坦化せず、ページ、パネル、light色のサーフェスの順序を維持します。これらのロールは各コンポーネントで解決するため、ローカルな上書きも引き続き機能します。任意のロールがなければ、既存のIonic背景変数がフォールバックになります。

明示的なMaterialバリアント（filled/outlinedカードとtonal/elevatedボタン）、検索フィールド、読み込みインジケーター、反転したToastサーフェスは、それぞれの専用ロールを維持します。明示的なcolor属性とmd3-disabledは、引き続きコンポーネントのデフォルトの描画より優先されます。

提供されたネイティブロールは、MD3コンポーネントが使う任意の`--md-sys-color-*`トークンにもなります。不足する任意のロールは、モード切り替えや更新時も含め、ローカル／ユーザーの上書きまたはIonic由来のCSSフォールバックに戻ります。たとえば明示的な`color="light"`は、生成されたデバイスのニュートラルパレットに従いながら、Ionicのlightロールを維持します。

DOMを変更せずに変換するには、Ionic変数に`materialToIonicColors(scheme)`、任意のMD3トークンに`materialToMd3Colors(partialRoles)`を使います。どちらの変換関数も`Record<string, string>`のCSS変数マップを返します。`materialToIonicColors`は`MaterialColorScheme`の必須6ロールを必要とし、`materialToMd3Colors`は`MaterialColorRole`名の任意の部分集合を受け取り、提供されたロールだけを出力します。入力は不透明な`#RRGGBB`文字列です。不正な色を渡すと`TypeError`をスローします。どちらもDOMへの書き込みやブリッジ呼び出しを行いません。ランタイムのカラーライブラリ依存はありません。アルゴリズムの帰属表示と上流のライセンスは`THIRD_PARTY_NOTICES.md`にあります。

## トラブルシューティングと検証

- **動的な配色が出ない：** Android 12以降が必要です。他のプラットフォームではIonicパレットが有効なままです。これは想定どおりのフォールバック動作です。
- **ネイティブgetterが未実装：** プラグインを更新して同期し、ネイティブアプリを再ビルドして再インストールしてください。Webアセットだけの更新では不十分です。
- **ダークモードが競合する：** クラスベースのダークパレットだけを使い、ルートクラスは1つのコントローラーに管理させます。ルート変数を隠すbody／コンポーネントの上書きがないか確認してください。
- **更新が失敗する：** 自動更新の失敗は`onError`へ渡され、最後に正常に適用できたパレットを維持します。明示的な`refresh()`の失敗は呼び出し側で捕捉してください。
- **コンポーネントがロールを無視する：** 明示的な`color`、`md3-disabled`、コンポーネントのCSS変数、[利用先の表](color-system.md#component-assignments)を確認してください。

デモにはSystem / Light / Darkのコントロールがあります。型付きのブリッジアダプターはブラウザー専用ビルドにも対応しますが、Androidには引き続き`getDynamicColorScheme`を含むネイティブプラグインが必要です。このアダプターはデモ用の基盤であり、アプリ向けの公開インポート方法ではありません。

ルートとデモの依存関係をインストールしてから`npm run test:dynamic-colors`を実行します。ブラウザーの画像テストは記録済みのAndroid色を使うため、デバイス接続は不要です。スクリーンショットのベースライン更新は、PRの`/update-screenshots` CIで行います。

[前景色のペア変更](https://github.com/webview-native-ui/ionic-theme-md3/pull/67)は、Android 17を実行するPixel 8aで確認しました。明示的に色を指定した4つのIonicボタンが、両モードでネイティブの背景／前景値と一致しました。最終的なIonic 8と9のCIは、それぞれ34件のユニットテストと265件のE2Eテストに不安定な結果なく合格しました。これは色のペアの検証であり、デバイス全体のUIや壁紙変更の受け入れ検証ではありません。

## 検証に関する補足

過去の連携計測です（テーマ全体の受け入れ検証ではありません。[Android 16のレビュー証跡](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android16-2026-11-07.md)を参照）。Android 15（API 35）エミュレーターで、両方のネイティブ配色が適用済みのIonicトークンと一致すること、systemの外観がAndroidに追従すること、明示的なlight/darkモードがOSの変更にかかわらず固定されることを確認しました。ブラウザーE2Eも同じ外観ポリシーを検証します。ユニットテストは、パレット変更、再開／設定変更通知、処理中の無効化、未変更時の更新抑制、エラー、終了処理を対象とします。

その過去の連携計測では、拡張された46ロールのAPIをAndroidエミュレーターで検証し、すべてのネイティブロールが対応する`--md-sys-color-*`値と一致しました。Ionic 8と9のブラウザーテストは、Ionicだけのフォールバック、任意の上書き、明示的なカラーパレット、コンポーネント単位の無効化を検証します。別のテストではアプリのJavaScriptを無効にします。[2026-11-07のスクリーンショット更新CI](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42332891975)は、ライト／ダークのスクリーンショット84枚を含め、Ionic 8と9でそれぞれ141件のテストを検証しました。その過去の配色ポリシー修正と、ブラウザーだけの検証範囲については、[Ionicの色継承レビュー](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md)を参照してください。

拡張APIをローカルWebViewで計測した結果（ネイティブの連続読み取り30回、ウォームアップ後の変換1,000回）、取得は中央値約9 ms／p90約21 ms、両配色をIonicとMD3の変数へ変換する処理は約0.6 msでした。これはデバッグ用エミュレーターでの観測値であり、あらゆるデバイスでの性能保証ではありません。変換時間にはCSSの描画を含みません。通常のIonicだけのテーマ設定はCSSを直接使い、変換の実行もブリッジ呼び出しも行いません。

実機での壁紙変更は未検証です。このエミュレーターでシェルからプリセットを変更すると、ネイティブの色の値を変えずにWebViewが再起動したため、壁紙変更のエンドツーエンドの動作は確認できませんでした。テスト設定は削除し、元のパレットが復元されたことを確認しました。
