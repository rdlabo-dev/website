---
title: Native UI Shell（実験的機能）
---

Native UI Shellは実験的機能です。APIと対応するコントロールは変更される可能性があります。

IonicアプリのWebコンテンツの周囲に、ネイティブのナビゲーションと操作部品を表示します。同梱の任意のCapacitor iOSプラグインが、対応する固定IonicコントロールをUIKitとシステムのLiquid Glassで描画します。ページ内容、スクロール、アプリの状態、ルーティングはIonicのWebViewに残ります。

## 背景

Basecampは2014年5月8日の[Hybrid sweet spot: Native navigation, web content](https://signalvnoise.com/posts/3743-hybrid-sweet-spot-native-navigation-web-content)で、Webコンテンツを中心に据え、体験が向上する部分にネイティブUIを使う構成を紹介しました。2018年2月27日の[Capacitor 1.0.0 Alphaの発表](https://ionic.io/blog/announcing-capacitor-1-0-0-alpha)も、ロードマップに **Native UI Shell** を明記し、この記事を参照しています。WebとネイティブUIの組み合わせは、Capacitorの初期からの方向性です。

このパッケージは、その考え方をIonicとLiquid Glassへ適用します。既存のIonicマークアップがshellを定義し、対応するtoolbarの操作部品、タブ、固定FAB、検索付きタブがネイティブ表示になります。UIKitが外観と操作を担当し、bridgeがDOM状態を同期して元のIonicコンポーネントへ操作を返します。ナビゲーションスタック、画面遷移、アプリのロジックは引き続きIonicが管理します。対象は以下の固定コントロールです。

## 有効化

READMEに従ってテーマCSSを読み込んだ後、アプリの起動時に一度呼びます。

```ts
import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';

void enableNativeUIShell();
```

`enableNativeUIShell()` はWebViewの左上の有効な角丸半径も読み取り、画面遷移へ適用します。ネイティブ部品を有効にせず、画面遷移だけを設定する場合は次を呼びます。

```ts
import { configureNativeTransition } from '@rdlabo/ionic-theme-ios27/native';

await configureNativeTransition();
```

既存の `navAnimation: iosTransitionAnimation` 設定を維持してください。ページごとの登録、コンポーネント一覧、ネイティブcallback、Swift view controllerは不要です。インストール・更新後に `npx cap sync ios` を実行します。ネイティブプラグインはSwift Package Manager（SPM）を使います。既存のCocoaPodsアプリでは `npx cap spm-migration-assistant` を実行し、生成された `CapApp-SPM` パッケージをXcodeでアプリのtargetにリンクします。Xcode 26以降とCapacitor 8でビルドし、ネイティブglassにはiOS 26以降が必要です。Web、Android、SSR、古いiOSではWeb実装を維持します。

明示的に有効化する機能です。通常のパッケージentry pointはCapacitorをimportせず、`@capacitor/core` は任意のpeer dependencyです。ただし、Capacitorプロジェクトへパッケージをインストールすると、`enableNativeUIShell()` を呼ばなくてもsyncがネイティブソースを検出してビルドします。

ネイティブの外観は、適用したclass、system、always-darkのテーマCSSに従います。runtimeの稼働中はシステムのテーマ変更も同期します。

## 対応マークアップ

| Ionicコンポーネント | 対応する外観と配置 | ネイティブ描画 |
| --- | --- | --- |
| `ion-button` | 固定header/footerのtoolbar内、`fill="default"` の標準glass | glassの `UIButton` |
| `ion-buttons` | 固定toolbar内、テーマのglassを共有する2個以上の直接のclear `ion-button` / `ion-menu-button` | 1つの `UIGlassEffect` 面と独立したネイティブボタン |
| `ion-back-button` | 固定header/footerのtoolbar内、標準のアイコンと色 | Ionicが解決したラベル・アイコンを使うglassの `UIButton` |
| `ion-menu-button` | 固定toolbar内のテーマglassの `ion-buttons` | glassの `UIButton`、元のIonicのメニュー切り替え |
| `ion-tab-bar` | 固定タブ、アイコンのみ・ラベルのみ、各項目1アイコン、点・文字バッジ、選択・disabled状態 | `UITabBar` と `UITabBarItem` |
| `ion-segment` | 固定toolbar内、スクロールなし、各項目は文字または1アイコン | `UISegmentedControl` |
| `ion-fab` / `ion-fab-button` / `ion-fab-list` | `ion-content` のfixed slot内のglass FAB、主ボタン1つと任意の方向別リスト | 各ボタンの永続的なglass `UIButton`、FAB単位の同期 |

テーマ変数を読み込んだiOS modeのコンポーネントが対象です。要素または祖先の `ionic-theme-disabled`、`ios-theme-disabled`、旧 `ios26-disabled` は常に対象外にします。タブ・segmentの1項目でテーマを無効化すると、そのグループ全体がWeb描画になります。

Webテーマを維持したままNative UI Shellだけを無効にするには、`ios-theme-shell-disabled` を使います。要素とすべての子孫が対象外になります。実行時にclassを追加・削除すると、自動的にWeb描画を復元したりネイティブ描画の適格性を再評価したりします。

```html
<ion-toolbar class="ios-theme-shell-disabled">
  <ion-button>Web glass button</ion-button>
</ion-toolbar>
```

共有面内の子が対象外になれば、ボタングループ、タブバー、segment、FABリストの面全体がWeb描画になります。検索FABや検索footerの一部を対象外にするとネイティブ検索連携が無効になりますが、タブバー自体は条件を満たせばネイティブ表示できます。

glassの外観でも配置条件を満たす必要があります。ボタン、戻るボタン、メニューボタングループ、segmentは `ion-header` または `ion-footer` 直下のtoolbarに置き、コントロールの祖先に `ion-content` がないことが必要です。header/footer直下のボタン、単独toolbar、スクロール内容内のtoolbarやheaderはWeb描画を維持します。`slot="fixed"` のないFABも対象外です。ネイティブ表示中の部品を対象外の場所へ動かすとWebに戻り、元に戻すと再評価します。

ネイティブタブは等幅項目とIonic既定の `layout="icon-top"` に対応します。バー内部だけで横方向compact・縦方向regularのsize classを使い、iPadと横向きでもWebのアイコン・ラベルの縦積みを維持します。アプリのsize classは変更しません。ラベルのサイズと太さはWebのsnapshotに従います。`icon-start`、`icon-end`、`icon-bottom`、`icon-hide`、`label-hide` や不均等幅ではバー全体がWeb描画です。start・center・end配置はRTLを含め元の `ion-tab-bar` に従い、方向性のある `ion-icon` のRTL反転も維持します。

単独のclear、solid、outlineボタンは対象外です。2個以上のclearボタンを持つglass `ion-buttons` は1つの面として描画し、各操作は独立します。メニューボタンも共有でき、単独のメニューボタンは親 `ion-buttons` をglass面として使うため、その下にWeb glassが残りません。テーマglass外のメニューボタンはWeb描画です。fillの混在、非対応の子、テーマ無効の子があればグループ全体がWebになります。単独clearボタンもWebのままです。独自のボタン色・戻るアイコンと色、縮小するheader、スクロール内toolbar、modal内、スクロール可能・expandedのsegment、segment-view連携もWeb描画です。複雑なslotや非対応SVGも同様です。任意のアプリCSSをUIKitへ変換するものではありません。

ネイティブglassは実際に背後へ描画されたWeb内容を参照します。既存のtoolbar背景とheader blurも影響します。headerの背後を内容がスクロールするには、通常のtranslucent headerとfullscreen contentを使います。プラグインが内容を移動したり、アプリの不透明toolbar背景を上書きしたりはしません。

Web入力がソフトウェアキーボードを使用中は通常の操作部品をWeb描画へ戻し、閉じると再評価します。キーボードがvisual viewportを動かさないiPadも対象です。ネイティブ検索欄は自身のキーボードと検索面を維持します。

既存の部品が非対応になったときは、Webの元要素を描画してからネイティブの覆いを外します。空白を避けますが、WebとUIKitの更新は不可分ではなく短時間重なる可能性があります。通常の画面遷移で変更のない共有タブを維持する動作とは異なります。

## 状態とイベント

メニューボタンはIonicが解決した既定・設定済みアイコンか、対応するslotのアイコン・ラベルを使います。ネイティブ操作は元の `ion-menu-button` をクリックし、`menu` の対象指定を維持します。`submit` / `reset` はWebに残ります。`disabled`、`autoHide`、メニューの利用可否、split pane表示は実際のDOMに従います。メニューを開くとWeb表示を復元してネイティブ表示を取り除き、閉じると条件を満たす部品を再表示します。

ラベル、SVG、配置、選択値、アプリ動作はDOMが管理します。配置基準は `ion-tab-bar` 自体です。ネイティブタブはその矩形をサイズの提案と配置基準として使い、UITabBarのより大きい外枠を考慮します。`tab-bar-position-start`、`tab-bar-position-center`、`tab-bar-position-end` がRTLを含む水平基準を決め、`slot="bottom"` は下端、`slot="top"` は上端を維持します。class変更も自動反映します。内部余白と背景面のサイズはUIKitが管理し、対応する縦積み配置と文字はWebに従います。幅いっぱいの指定でもUIKitが幅を制限することがあります。

幅768px以上では、Webテーマの標準2・3・4・5項目バーの上限を、iPadの計測値に近い188・274・336・414ptとします。狭い画面では電話向けサイズを維持します。標準バーは高さ62pt、選択面54pt、内側余白4ptです。隣接ボタンはUIKit同様に重なり、アイコンとラベルはSimulator画像と照合しています。これは標準外観の目安で、独自フォント・アイコン・ラベルを保証する値ではありません。固有幅はUIKitが決め、ネイティブの幅・高さが異なるだけでは対象外になりません。バッジ・タイトル更新でも項目のidentityと配置基準を維持して再計測します。CSSの幅へ強制的に合わせるためにアイコンを伸ばしたりUIKit内部を変更したりしません。

privateなclass名や固定のinset補正を使わず、ネイティブタブを含むview subtreeを計測します。認識できない配置はWebへ戻します。runtimeは構造、関係するshadow root、サイズ、ページのlifecycle、overlayを監視します。祖先の `display: none`、`hidden`、テーマclass、部品削除、disabled変更も自動反映し、現在のDOMとrevisionを確認してから元のIonic要素をクリックします。

フォームは `ion-button type="submit"` と既存のsubmit handlerを維持します。フォーム外からは引き続き `[form]="formRef"` で渡します。プラグインは `form.submit()` を呼ばず、別の送信経路を追加せず、Angularのフォーム管理を変更しません。segmentも元の `ion-segment-button` をクリックするため値の型を維持し、プログラムによる値変更では合成 `ionChange` を発火しません。

ラベルはネイティブ文字です。ローカルの静的SVGと解決済み `ion-icon` SVG（`name` とその変更も含む）は表示倍率でラスタライズし、色を維持してキャッシュします。文字色に従うタブSVGはtemplate描画で、bridgeからの画像更新を待たずラベルと選択色を揃えます。明示的な多色画像は元の色を維持します。外部参照、`<use>`、アニメーション、埋め込みHTML・画像、SVG文字、stylesheetは対象外です。Web fontや任意のslot配置は完全には再現しません。

ネイティブhostは操作部品内だけで入力を受け、空白部分のtouchはWebViewへ通します。タブの操作とアクセシビリティは標準の[UITabBar](https://developer.apple.com/documentation/uikit/uitabbar)を使います。Ionic iOSは空バッジを通常隠しますが、空の可視 `ion-badge` は通知の点、空でなければ文字として表示します。背景・文字色はIonic `color` パレットを含むDOMの計算済みstyleから取得し、非表示・削除でネイティブバッジも消します。選択更新で項目のidentityを維持します。内部配置はUIKitが管理し、任意のCSS配置は再現しません。ネイティブ側は名前、disabled・selected特性、バッジをアクセシビリティへ公開し、描画中の元要素はWebアクセシビリティから隠します。WebとUIKitのVoiceOver巡回順序が同一になる保証はありません。

## 検索付きタブ

既存の `attachTabBarSearchable(tabBar, fabButton, footer)` 登録は、下部タブバーとglass検索部品が対応していれば自動的にネイティブ検索を使います。追加の設定・route・ネイティブ初期化・ページlistenerは不要です。通常タブは `UITabBar`、検索グループは永続的な `UITabBarController`、`UITab` / `UISearchTab`、`UISearchController` を使います。元のCapacitor WebViewが結果とナビゲーションを担当します。

登録しても配置制限は変わりません。検索バーと閉じるボタンは固定footer toolbarへ置きます。トリガーは `ion-content` 直下の `ion-fab[slot="fixed"]`、または既存の非スクロール `.ion-page` 直下の配置が必要です。スクロール内容内のwrapperはfixed slotではありません。

登録が有効な間は、ページ遷移中や一時的に利用不可（`available: false`）でも検索コントローラーを維持し、別の通常タブとして作り直しません。検索前のAlbumを含む通常の表示は、一般のタブと同じ `UITabBar` と `ShellTabBar.fit` で配置します。利用可能な場合は検索トリガーをFABに固定し、検索中だけ `UISearchTab` を表示します。利用可否の変化や検索の開始・終了では両レイヤーをcrossfadeします。初回に通常タブを描画してから切り替わるのを防ぐため、遷移先ページの表示が終わる前（例: `ionViewWillEnter`）に登録してください。

検索を開いても選択中のIonicタブを維持し、キーボードは自動表示しません（`automaticallyActivatesSearch` は無効のままです）。検索欄をタップするか `ion-searchbar.setFocus()` を呼びます。検索中はWebの配置投影を固定し、Capacitor Keyboardのresizeを `none` に保ちます。UIKitがタブと検索の操作部を管理するため、その間Ionic側の `fit` を繰り返しません。閉じると通常タブを `ion-tab-bar`、検索をFABに合わせて再計測します。通常タブの選択はWebの `selected` 状態が追いつくまで先行表示を維持します。検索が閉じるまで入力イベントとアプリからの `value` 更新をbridgeで同期します。トリガーSVGと検索アイコンも `ion-icon name` を含めIonicから取得します。

ネイティブ編集はIonicの入力handlerを経由し、`ionInput` のdebounce、`ionChange`、`ionFocus`、`ionBlur`、`ionClear` を維持します。プログラムの `value` 変更では `ionInput` を発火せず、アプリによる同期的修正と古いネイティブ入力を区別します。変換中の文字とcaretはネイティブ編集が管理します。footerの閉じる操作は値を保持し、`ionCancel` や `ionClear` を発火しません。

初期対応は、標準検索キーボード、既定clear、内部cancelなし、既定の自動修正・大文字化設定を持つiOS modeのglass検索バーです。独自input mode、return key hint、最小・最大文字数、autocomplete、自動修正、spellcheck、clear icon、classic検索バーはWebに残ります。対応グループの `disabled`、`placeholder`、`value`、`setFocus()` を同期します。一般の単独検索バーは対象外です。

ページの表示終了、overlay、テーマ除外、ネイティブ制御の喪失時は検索を閉じ、最後に同期した値またはアプリの値を保持します。次の検索は閉じた状態から始まります。登録はキャッシュされたページ間の遷移でも維持され、戻るたびの再登録は不要です。bridgeの待機には期限があり、検索開始中にbridgeを失った場合は保留中のEnterを既存のWebアニメーションで完了できます。ただしJavaScriptへ届かなかったネイティブ文字は復元できません。

登録済み `ion-searchbar` またはinputの置換で旧編集sessionを終了します。置換先は自身のアプリの値を維持し、再表示時に新sessionを開始します。

有効な間はWebView上端のscroll-edge effectを抑えます。Ionicがheaderの縁を描画するため、OSとWebテーマが異なる際の二重の暗いgradientを防ぎます。destroy時に元の設定へ戻します。

ネイティブ検索controllerは自身のキーボード上で表示を維持します。他のネイティブ部品はWeb入力のキーボード表示中は隠します。標準部品にはUIKitのアクセシビリティとReduce Motionが適用されますが、VoiceOverの完全な同等性は検証済みの保証ではありません。

## 画面遷移と復旧

FABはIonicの `activated`、子ごとの `show`、`close()`、元のclick handlerを維持します。複数リスト、初期展開、小さいボタン、`edge` は各ボタンの実測配置を使います。別のtimerや開閉controllerを追加せず、Ionicの順次表示を反映します。主ボタンのアイコン変更は解決済み `closeIcon` でcrossfadeし、Reduce Motionでは無効です。ネイティブFABのinstanceと元FABのネイティブ表示は通常の開閉中も維持します。

標準の円形glass、文字、解決済み静的SVG・`ion-icon`、RTL反転に対応します。非対応の子が1つでもあれば、リストを閉じていてもFAB全体がWeb表示になります。色付きsolid、submit/reset・href FAB、独自背景・形・動き、fixed slot外、非対応画像もWebです。デモの赤背景 `floating-action-button-fixed` ページもWebの外観を維持します。fixed slotのFABは `ion-content` の直下が必要で、ページの兄弟要素に `slot="fixed"` を付けてもcontent slotにはなりません。

FAB、リスト、ボタンに独自host animationやtransitionがあれば、削除するまでWebです。transformは標準のidentityと隠れた子のscale(0)に対応し、独自scaleは非対応です。`display:none` 内の子では独自transformがあっても計算値が `none` になる場合があるため、配置可能になった時に検査し、必要ならFAB全体をWebへ戻します。stylesheetの解析や、非表示配置を予測するための一時的なリスト展開はしません。

`src/transition/ios.transition.ts` はネイティブ表示の終了を待ってWebアニメーションを始めます。待機中のinteractive progressと完了・キャンセルはqueueに保持します。動かない共有タブは維持します。初回描画とanimation builderなしの遷移は、起動runtimeとIonic lifecycle eventで対応します。

標準Ionic overlayはdismissまでネイティブ表示を一時停止します。非対応の検索付きタブは既存Webアニメーションを使い、Web glass gestureと制御を共有します。対応する親面のCSS motion中も一時的にWeb表示になります。

ネイティブ表示を終了するときは元要素を復元して描画させてから覆いを外し、開始するときは有効な最新のネイティブ応答を確認してから元要素を隠します。遅延応答は部品ごとに再検証します。既存の対象部品は内容更新中もネイティブ表示を維持し、削除・対象外の部品だけWebへ戻します。新規取得には正確な応答確認が必要です。通常のページ変更では全体clearを呼びません。UIKitタブinstanceと項目を維持し、同一frame・選択を再適用せず、重複・古い操作は破棄します。意図的な空白frameは避けますが、WebKitとUIKitは別描画でOSレベルの不可分な合成を保証しません。独自遷移・overlayは対象Simulatorで検証してください。未知のoverlay systemは自動連携の対象外です。

bridge更新の失敗・timeout時はruntimeを停止してWeb表示を復元し、自動再接続はしません。`getStatus()` が `stopped` と理由を返します。再試行するにはhandleの `destroy()` 後に `enableNativeUIShell()` を再度呼びます。

診断やアプリの終了処理には次を使います。

```ts
const shell = await enableNativeUIShell(); // 繰り返し呼んでもruntimeを共有します
console.log(shell.getStatus()); // 状態、描画部品数、更新数、失敗理由
await shell.destroy(); // DOM復元、ネイティブ部品削除、listenerとcacheの解放
```

ネイティブ描画は既定ですべての対応部品に有効です。一部だけを使う場合は、対象を指定します。全体を無効にすると、すべての部品がWeb描画に戻ります。

```ts
const shell = await enableNativeUIShell({
  enabled: true,
  controls: {
    tabs: true,
  },
});

// Native UI Shellを使わず、すべての部品をWebで描画します。
const disabledShell = await enableNativeUIShell({ enabled: false });
```

`controls` を省略するとすべての対応部品が対象です。指定した場合は `true` の部品だけがネイティブ描画の対象になります。指定できる項目は `tabs`、`toolbar`、`segment`、`fab` です。

自動検出できない独自のmodalやoverlayを表示する前は、一時停止を取得します。取得が完了すると対象部品はWeb描画に戻っています。閉じた後は必ず再開してください。

```ts
const suspension = await shell.suspend();

try {
  await modal.present();
  await modal.onDidDismiss();
} finally {
  await suspension.resume();
}
```

一時停止は重ねて取得でき、`resume()` は繰り返し呼んでも安全です。すべての一時停止を解除すると、現在のDOMからネイティブ描画を再評価します。

ネイティブの素材と外観は実行中のiOSに従います。このテーマを入れるだけでiOS 26端末がiOS 27の外観になるわけではありません。

## Native UI Shell API

`enableNativeUIShell()` が返すhandleの操作です。型と起動オプションは[APIリファレンス](/docs/api)も参照してください。

### getStatus()

```typescript
getStatus() => NativeUIShellStatus
```

現在のWeb・ネイティブ描画の状態を返します。

### suspend()

```typescript
suspend() => Promise<NativeUIShellSuspension>
```

対象部品を一時的にWeb描画へ戻し、再開用のleaseを返します。

### destroy()

```typescript
destroy() => Promise<void>
```

同期を止め、Web描画を復元してネイティブのリソースを解放します。

## ソース構成

[src/native/components](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.0.1/src/native/components) の各TypeScript moduleがIonic tagとDOM readerを定義します。`components/index.ts` が探索selectorとcomponent型をまとめます。共有のDOM計測、項目データ、SVG描画は `src/native/shared`、同期・表示切り替え・lifecycleは `runtime.ts` が担当します。

iOSの[Components](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.0.1/ios/Sources/IonicNativeUIShellPlugin/Components)はUIKit部品の生成・更新・名前を管理します。`ShellButton` が通常・戻る・メニューボタンの実装を共有し、`Shared` がhost view、型付きsnapshot、形状、色、画像cacheを管理します。Capacitorは完全なsnapshotを `Decodable` で一度decodeし、描画側は型付きmodelと `Equatable` で内容を比較します。不正batchは表示変更前に拒否します。`IonicNativeUIShellPlugin.swift` がCapacitor呼び出し、revision、ネイティブviewの寿命を調整します。

## デモと検証

デモには固定コントロールを確認する `native-ui-shell` ページがあります。リポジトリのルートからライブラリをビルドし、ブラウザテストを実行します。

```sh
npm ci
npm run build
cd demo
npm ci
npx --no-install playwright install chromium
npx --no-install playwright test e2e/native-ui-shell.spec.ts e2e/native-ui-shell-edge.spec.ts
```

ネイティブ操作と配置のテストには、Xcode 26以降、XcodeGen、起動済みのiOS 26以降のSimulatorを使用します。リポジトリのルートで `sh scripts/verify-native-ui-shell.sh SIMULATOR_UDID` を実行してください。npmパッケージから独立したSwift Package Manager consumerもビルドします。検索タブの統合テストには `sh scripts/verify-native-search.sh SIMULATOR_UDID`、配置、画面遷移、キーボードの境界条件には同じコマンドの末尾に `edge` を付けます。テスト成果物の保存先は各スクリプトに表示されます。

検索controllerはUIKit管理のtransitionを維持し、通常部品の取得時crossfadeからは除外されます。
