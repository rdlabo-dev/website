---
title: 設定
---
# Native UIの設定

設定のリファレンスです。まず[投影の仕組み](../README.md#how-projection-works)を読み、インストールは[Ionicの設定](setup.md)または[HTMLの設定](framework-independent.md)を参照してください。

アプリのDOMがマウントされた後に `enableNativeUI()` を一度呼び出します。Ionicと明示的に指定したHTMLコントロールは、標準のSwiftレンダラーを共有します。テーマは任意です。Webレイアウト、セーフエリア、余白はアプリまたはテーマが管理します。

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Ionicを使わない場合は、同じAPIを `@rdlabo/capacitor-native-ui/core` からimportします。このエントリーポイントでは、Ionicの任意のポップオーバー連携は読み込まれません。[プレーンHTML](framework-independent.md)を参照してください。

## プラットフォームごとの動作

| 機能 | 対応するiOS | Android | ブラウザ／古いiOS |
| --- | --- | --- | --- |
| Ionicコントロールの自動検出（`ionic.auto`） | ネイティブ | 元のWebコントロール | 元のWebコントロール |
| 明示的に指定した要素のボタン | ネイティブ | 元のWebコントロール | 元のWebコントロール |
| 要素の拡張 | SwiftUI | Kotlin／Compose | 元のWebコンテンツ |
| Vertical Bars | 利用可能ならネイティブ、それ以外はWebレール | Webレール | Webレール |
| `tab-accessory` 拡張 | 対応するiOSのタブホストのみ | 元のWebコンテンツ | 元のWebコンテンツ |

Webレールには、Ionicのレールレイアウトまたはアプリが所有するHTMLの `webHost` が必要です。設定によってデバイスにない機能が追加されることはありません。

HTMLに基づくライト／ダークの動作は、[ライト／ダーク表示](appearance.md)を参照してください。表示は起動オプションではなく、WebのCSSで設定します。

## すべての設定

`controls` は選択とグループ化の既定値、`verticalBars` はレール、`ionic` はIonicの検出と表示を設定します。`controls` で省略したフィールドは、一部だけ指定したオブジェクトでも `true` が既定値になります。

```ts
const shell = await enableNativeUI({
  root: document.body,
  controls: {
    buttonGroup: true,
    button: true,
    backButton: true,
    tabs: true,
    segment: true,
    fab: true,
  },
  verticalBars: {
    enabled: true,
    // 任意: placement: { edge: 'trailing', webHost: appOwnedHost },
  },
  extensions: [],
  ionic: {
    auto: true,
    verticalBars: {
      buttonProjection: 'system',
      buttonDefaultFill: 'glass',
      popover: false,
    },
  },
  debug: false,
});
```

### 選択の既定値

各コントロールには `ControlProjection` を指定できます。`controls` 自体にも同じ値を指定でき、6つのフィールドすべてに適用する省略記法になります。

| 値 | 通常の配置 | 垂直レール内の配置 |
| --- | --- | --- |
| `true`（既定値） | 選択する | 選択する |
| `false` | 選択しない | 選択しない |
| `'horizontalOnly'` | 選択する | 選択しない |
| `'verticalOnly'` | 選択しない | 選択する |

水平・垂直は**コントロールの配置**を指し、画面の向きやデバイスの機種を指すものではありません。この既定値によってコントロールを移動したり、デバイスにない機能を提供したり、未対応のマークアップを対象にしたりすることはできません。

| コントロール | 役割 |
| --- | --- |
| `buttonGroup` | グループが条件を満たす場合に、選択済みのアクションをグループ化します。子要素は選択しません。 |
| `button` | 通常のボタンとIonicのメニューボタンを選択します。 |
| `backButton` | 親グループとは独立して戻る操作を選択します。 |
| `tabs` | タブと、タブに登録された検索表示を選択します。 |
| `segment` | 対応するセグメントを選択します。 |
| `fab` | 対応するフローティングアクションボタンを選択します。 |

ローカルの `data-horizontal-bars="true|false"` と `data-vertical-bars="true|false"` は、対応する選択の既定値を上書きします。`ion-buttons` ではグループ化だけを制御します。明示的な `data-native-ui` の投影元は、これらの既定値とは独立しています。構造上の除外条件とレールの利用可否は引き続き適用されます。[ツールバーの選択とグループ化](native-ui.md#toolbar-selection-and-grouping)を参照してください。

### その他の設定

| 設定 | 既定値 | 意味 |
| --- | --- | --- |
| `root` | `document.body` | ドキュメントに接続された投影元のサブツリーです。この外のコントロールは投影しません。 |
| `verticalBars.enabled` | `true` | 利用可能な場合にレールへの投影を許可します。 |
| `verticalBars.placement` | 省略 | 任意の `{ edge: 'leading' \| 'trailing', webHost?: HTMLElement }` です。edgeは希望する配置であり、機能の利用可否を宣言するものではありません。 |
| `extensions` | `[]` | **実験的機能。** アプリ固有のSwiftUI／Compose拡張です。`controls` と `ionic.auto` から独立し、readerがコンテンツを返すタイミングはアプリが決めます。 |
| `ionic.auto` | `true` | Ionicの自動検出を有効にします。`false` ではローカル属性による配置の指定も含めて無効になります。明示的な `data-native-ui` の投影元と拡張は独立しています。 |
| `ionic.verticalBars.buttonProjection` | `'system'` | `'system'` はネイティブのスタイル、`'source'` は対応するIonicのスタイルを投影します。ローカルの表示設定が優先されます。 |
| `ionic.verticalBars.buttonDefaultFill` | `'glass'` | 塗りを明示していない、投影元のスタイルを使う単独のIonicボタンに `'glass'` または `'solid'` を適用します。明示した塗りと、グループ内の既定のclearが優先されます。 |
| `ionic.verticalBars.popover` | `false` | ネイティブレールのボタンを起点とするIonicポップオーバーを有効にします。Ionicエントリーポイントと、その任意のpeer依存関係が必要です。 |
| `debug` | `false` | 投影元の要素とフォールバックの理由を開発者コンソールに記録します。 |

### HTMLフォールバック用のレールホスト

`webHost` は、アプリがスタイルを設定する任意のHTMLフォールバックレールです。次の要件を満たす必要があります。

- `root` と同じドキュメントに接続されていること。
- `root` の外にあり、どちらも他方を包含しないこと。
- コンテンツ用に確保する余白も含め、アプリがスタイルと位置を設定すること。

`<main>` などの範囲を限定した `root` と、その兄弟要素のホストを使ってください。既定の `document.body` には、この条件を満たすホストを指定できません。ホストがない場合、利用できないHTMLレールの元のコントロールは表示されたままになります。Ionicの既存のレールレイアウトは専用のフォールバックアダプターを使います。

現在、HTMLはボタンと戻るボタンに対応しています。タブ、セグメント、FABのreaderはIonicアダプターのままです。それらの設定を有効にしても、任意のHTMLから同等の構造を推測することはありません。

## よく使う設定

```ts
// IonicまたはHTML：対応する全コントロールとレールを既定で有効にします。
const shell = await enableNativeUI();

// 別の設定例：レール内だけを自動選択します。
const railOnly = await enableNativeUI({ controls: 'verticalOnly' });

// 別の設定例：タブだけを自動選択します。
const tabsOnly = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: false, tabs: true, segment: false, fab: false },
});
```

これらは選択肢です。shellは1つだけ起動してください。同等の起動設定を再指定すると、そのハンドルが返ります。別の設定を使う場合は、前のshellを破棄する必要があります。

`controls: false` は既定の選択とグループ化をすべて無効にしますが、ローカル属性による有効化は可能です。一方、`ionic: { auto: false }` はIonicの自動検出そのものを無効にします。どちらも明示的なHTMLの投影元や拡張を無効にはしません。

`verticalBars.enabled: false` は選択設定にかかわらずレールのコントロールをWebに残します。通常のコントロールには影響しません。`data-native-ui-placement="element"` は、`controls: 'verticalOnly'` の場合でも明示的なコントロールの元の位置を維持します。Ionicのグループでは、共有するネイティブの表示面が1つの配置になるよう、`ion-buttons` グループ全体に配置を指定してください。

## カスタマイズしたIonicアプリでコントロールを明示的に選ぶ

ネイティブレールと独自の拡張を維持したまま、Ionicの自動投影を無効にします。

```ts
const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#content')!,
  ionic: { auto: false },
  verticalBars: {
    enabled: true,
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
  extensions: [myExtension],
});
```

```html
<main id="content">
  <ion-button>Keep this on the Web</ion-button>
  <ion-button data-native-ui="button" data-native-ui-placement="rail">Project this action</ion-button>
  <button data-native-ui="button">Project at its original position</button>
</main>
<aside id="rail" aria-label="Actions"></aside>
```

各投影元の元のハンドラーを維持してください。明示的な `ion-button` は標準のボタンreaderを使うため、対応するコンテンツとスタイルの規則は引き続き適用されます。属性を付けても任意のカスタムマークアップが対応対象になるわけではありません。`data-native-ui-placement="rail"` は、利用可能な場合にシステムレールを要求します。任意の `webHost` のスタイルと余白はアプリで設定してください。ホストがなければ、明示的に要求したレールが利用できない場合に投影元のコントロールを表示したままにします。マーカーのないIonicコントロールはWeb表示を維持します。明示的な投影元を含む自動投影対象のグループは、同じ投影元を二重に覆わないようWebに残ります。

明示的な組み込みの投影元は、`data-native-ui="button"` または `"back-button"` を指定した個々の `button`、`ion-button`、`[role="button"]` 要素に対応します。既存の `ion-back-button`、`ion-menu-button`、ボタングループ、タブ、セグメント、FABに指定しても、Ionic固有のreaderが有効になるわけではありません。対応する種類の自動投影を有効にするか、独自のクリックハンドラーを持つ標準の明示的なボタンを使うか、カスタムUI向けの拡張を登録してください。

レールの利用可否は引き続き `verticalBars.enabled` が制御します。特定の投影元をWebに残すには、明示的なマーカーを削除するか `data-native-ui="disabled"` を使います。

## 起動後にレールの利用を切り替える

```ts
await shell.disableVerticalControlArea();
await shell.enableVerticalControlArea();
```

これらのメソッドは、表示、コントロール、配置を維持したまま、このshellの `verticalBars.enabled` を変更します。別のshellを作らず、既存の投影を終了してから表示の管理を引き渡します。呼び出しは直列化されます。`destroy()` 後にどちらのメソッドを呼んでも拒否されます。

```ts
const lease = await shell.suspend(); // 一時的にすべてのWebコントロールを復元します
await lease.resume();
await shell.destroy(); // shellを停止して投影元を復元します
```

レールへの投影を無効にしても、アプリのCSSを削除したり、アプリが管理する余白を変えたりしません。必要に応じて、この設定とともにアプリ側のレイアウトも更新してください。

## 監視されない変更後に確認を要求する

```ts
shell.markForCheck();
```

DOM変更を発生させないプロパティやreaderの状態を変更した後に使います。確認をスケジュールし、繰り返しの要求をまとめ、変更されたネイティブスナップショットだけを送ります。戻り値は `void` です。ネイティブ処理の完了を待機したり、フレームワークのDOMを描画したりはしません。破棄後の呼び出しは無視されます。[投影元の確認と監視](native-ui-extensions.md#schedule-a-source-check)を参照してください。

## 投影元がWebに残る理由を確認する

既存の起動オプションに一時的に `debug: true` を追加し、Webアプリを再ビルドします。診断のために別のshellを起動しないでください。

```ts
const shell = await enableNativeUI({ debug: true, extensions: [myExtension] });
console.info(shell.getStatus());
```

WebViewの開発者コンソールを開き、`[Native UI]` で絞り込みます。診断には、利用可能な場合に投影元のDOMも含まれます。有効になっている間、各理由は投影元ごとに一度だけ記録されるため、スクロールや `markForCheck()` の繰り返しでログが大量に出ることはありません。props、操作のペイロード、アプリの例外メッセージは記録しません。

| 診断 | 確認すること |
| --- | --- |
| `web-fallback` | プラットフォームの対応状況、ネイティブプラグインの登録、sync、ネイティブの再ビルド。 |
| `unregistered-extension` | ネイティブの登録名がDOMの定義と一致し、起動前に登録されていること。新しく挿入した投影元も確認されます。 |
| `reader-error` / `invalid-props` | readerの実装、JSONのみの値、64Kのサイズ制限。 |
| `unsupported-placement` / `missing-tab-owner` | プラットフォームと、タブアクセサリーを所有するネイティブタブホスト。 |
| `source-hidden` / `source-clipped` / `source-focused` | 可視性、クリッピング・変形された祖先要素、フォーカスされたWebの子孫要素。 |
| `reader-opt-out` | readerがnullを返したこと。 |
| `unsupported-control` | 対応するマークアップ、アクセシブルな名前、固定配置、スタイル。 |
| `native-rejected` | ネイティブ側のpropsのデコード、配置、デバイスの対応状況。ブリッジが報告するのは拒否であり、ネイティブの例外ではありません。 |

`getStatus()` はshellの概要を返し、要素ごとの診断レポートではありません。通常のナビゲーション、中断、未対応のコンテンツでは、意図的にWeb表示が維持されることがあります。調査後はdebugを無効にしてください。debugは投影の対象条件を変更しません。

## 既存のアプリ

単独の `enableVerticalControlArea()` は、選択の既定値を `'verticalOnly'` にします。その `setPlacement()` ヘルパーは非推奨のWeb CSSアダプターです。Webレイアウトにはテーマの `setVerticalBarsLayout({ edge, inset })` を使ってください。ネイティブ機能の利用可否はプラグインのデバイス情報から取得されます。

パッケージの分割、削除されたオプション、部分指定時のコントロールの既定値変更については、[1.2.1からの更新](migration.md)を参照してください。
