---
title: 投影コンテナの対応状況
sourceRevision: "9bc3540661a88d8dbb2d990489f39c65f11aa1ec70c95320765676dbbae7a02d"
---
# 投影コンテナの対応状況

ネイティブサーフェスの意図した位置とWebレイヤーを占める、既存のDOM要素を選んでください。この対応表は、CapacitorとCordovaの両方で、`projectionSelector`と`createWebProjectionScope`に渡す要素に適用されます。

**⭕️** は、記載した条件下でEngineの投影画像を要素内に保持できることを示します。**❌** は直接の投影先として非対応であり、周囲の適切なコンテナを選ぶ必要があることを示します。これはDOM上の表示仕様であり、Engineがそのコンポーネントのネイティブコントロール、操作、アニメーションを実装するという保証ではありません。ネイティブキャプチャの適格性は、別途満たす必要があります。

## 共通の要件

- ドキュメントに接続されたHTML要素を1つ用意し、サイズがゼロでなく、分断されていないレイアウトボックスを持たせてください。サイズ、配置、レイヤーはアプリケーション側の責務です。インラインのホストには`display: inline-block`または`block`を使い、意図した寸法を与えてください。
- `projectionSelector`はドキュメントのCSSセレクター（ID、クラス、属性、子孫）を使います。正確に1つの要素に一致する必要があり、Shadow DOM内には入りません。存在しない要素は後から作成できます。一致がゼロまたは複数の場合、Nativeは非表示のままです。
- 保持する画像は、要素のopen ShadowRoot内へ挿入し、それがなければlight DOMの子として挿入します。closed shadowのコンテンツはホストのvisibilityを継承し、画像を表示できるslotを公開する必要があります。
- オーバーレイ、折りたたまれた項目、非アクティブなページは、表示されるレイアウトボックスを持つ間だけ対象になります。投影先に使うためだけに、非表示の設定用要素を強制的に描画しないでください。
- ホストと祖先のクリッピング、不透明度、変形、フィルターは引き続き画像に適用されます。画像は操作できず、キャプチャ時の外観を静止した状態で保持します。ライフサイクル、MutationObserverの除外条件、ネイティブキャプチャの制約は、[投影の動作](projection.md#dom-and-native-surface-requirements)を参照してください。

## HTMLコンテナ

| コンテナ要素 | 例 | 対応 | 備考 |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ブロックコンテナ | `div`, `section`, `nav`, `article`, `header`, `footer` | ⭕️ | コンテナに意図したサイズとWebレイヤーを与えてください。 |
| インラインコンテナ | `span`, `a`, `label` | ⭕️ | `inline-block`または`block`を使ってください。折り返されたインラインテキストは、単一の投影サーフェスではありません。 |
| ボタン | `button` | ⭕️ | 元のボタン、リスナー、値は保持されます。画像はクリックを受け取りません。 |
| Shadow DOMを持たないカスタム要素 | `native-ad` | ⭕️ | レイアウトボックスを用意し、画像の子要素を許可してください。 |
| open Shadow DOMを持つカスタム要素 | `native-control` | ⭕️ | Engineはopen rootの直下に画像を挿入し、投影中はフォールバックコンテンツを非表示にします。 |
| closed Shadow DOMと適切なslotを持つカスタム要素 | デフォルトslotを持つ`native-control` | ⭕️ | 画像をslot経由で表示できる必要があります。内部コンテンツはホストのvisibilityを継承する必要があり、Engineはclosed root内にルールを強制できません。 |
| 描画内容にアクセスできないカスタム要素 | 適切なslotのないclosed root | ❌ | 外側のコンテナを使ってください。light DOMの画像は描画されません。 |
| ネイティブフォームコントロール | `select`, `input`, `textarea` | ❌ | 直接のスコープ指定は拒否されます。コントロールをラップしてください。値とリスナーは保持されます。 |
| 置換されるメディア要素または描画サーフェス | `img`, `canvas`, `video`, `audio`, `iframe`, `embed`, `object` | ❌ | 直接のスコープ指定は拒否されます。コンテンツを囲むコンテナを使ってください。 |
| void要素 | `br`, `hr`, `area`, `base`, `link`, `meta`, `source`, `track`, `wbr` | ❌ | 直接のスコープ指定は拒否されます。投影画像を子として保持できません。 |
| 設定用要素または子の描画方法が特殊な要素 | `option`, `optgroup`, `template` | ❌ | HTMLElementのチェックを通っても、画像の子要素を描画できるとは限りません。通常のコンテナを使ってください。 |
| HTML以外の要素 | `svg`, SVG `g`, MathML `math` | ❌ | SVG/MathMLノード自体ではなく、HTMLのラッパーを使ってください。 |
| 利用可能なボックスのない要素 | `display: none`, `display: contents`, サイズがゼロ | ❌ | 意図した寸法を持つ、表示中のコンテナを選んでください。 |
| 疑似要素 | `::before`, `::after` | ❌ | DOM要素ではないため、スコープには指定できません。どちらもアプリケーションのCSSで引き続き使えます。 |

## Ionicの要素

以下の一覧は[Ionic APIインデックス](https://ionicframework.com/docs/api)の全コンポーネントを網羅し、要素ごとに1行を設けています。`@ionic/core` **9.0.9**で確認しました。`ion-icon`はIoniconsから提供されます。最後の表には、このバージョンに同梱される追加の内部コンポーネントを別に記載しています。

Ionicのカスタム要素と、似た名前のHTML要素は別物です。`ion-select`、`ion-input`、`ion-textarea`、`ion-img`は画像コンテナにできますが、HTMLの`select`、`input`、`textarea`、`img`は使えません。以下のすべての⭕️には、上記の共通レイアウト条件と、そのコンポーネントの通常のIonicの親要素・コンテキストが必要です。

### ボタンとツールバー

| コンテナ要素 | 例 | 対応 | 備考 |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `ion-button` | `ion-button#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-buttons` | `ion-buttons#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-back-button` | `ion-back-button#native-slot` | ⭕️ | 表示を維持するには、戻り先またはdefaultHrefが必要です。 |
| `ion-menu-button` | `ion-menu-button#native-slot` | ⭕️ | 利用可能なメニュー、またはautoHide=falseが必要です。 |
| `ion-toolbar` | `ion-toolbar#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-header` | `ion-header#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-footer` | `ion-footer#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-title` | `ion-title#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-ripple-effect` | `ion-ripple-effect#native-slot` | ⭕️ | キャプチャされた装飾サーフェスであり、ボタンではありません。コントロールには、それを所有するボタンを優先してください。 |

### フォームと選択

| コンテナ要素 | 例 | 対応 | 備考 |
| --------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `ion-checkbox` | `ion-checkbox#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-input` | `ion-input#native-slot` | ⭕️ | ホストは対応していますが、内部のHTML inputは投影先にはできません。 |
| `ion-input-otp` | `ion-input-otp#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-input-password-toggle` | `ion-input-password-toggle#native-slot` | ⭕️ | ion-input内で使ってください。インラインのベースラインによるずれを避けるため、ホストにinline-blockのボックスを与えてください。 |
| `ion-textarea` | `ion-textarea#native-slot` | ⭕️ | ホストは対応していますが、内部のHTML textareaは投影先にはできません。 |
| `ion-radio` | `ion-radio#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-radio-group` | `ion-radio-group#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-range` | `ion-range#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-searchbar` | `ion-searchbar#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-select` | `ion-select#native-slot` | ⭕️ | ホストは対応しています。別に表示される選択肢のオーバーレイは、ホスト画像に含まれません。 |
| `ion-select-option` | `ion-select-option#native-slot` | ❌ | ion-select用の設定であり、単独で描画されるボックスはありません。代わりにion-selectを選んでください。 |
| `ion-toggle` | `ion-toggle#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-datetime` | `ion-datetime#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-datetime-button` | `ion-datetime-button#native-slot` | ⭕️ | 対象のion-datetimeと関連付けてください。開いたピッカーは別のサーフェスです。 |
| `ion-picker` | `ion-picker#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-picker-column` | `ion-picker-column#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-picker-column-option` | `ion-picker-column-option#native-slot` | ⭕️ | 描画されないion-select-optionと異なり、描画されるピッカーの選択肢です。親のpicker-columnを維持してください。 |

### コンテンツとレイアウト

| コンテナ要素 | 例 | 対応 | 備考 |
| ----------------- | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `ion-app` | `ion-app#native-slot` | ⭕️ | 内側の個別コントロールではなく、アプリ全体のサイズのボックスが対象です。 |
| `ion-content` | `ion-content#native-slot` | ⭕️ | 外側のコンテンツサーフェスが対象です。スクロールされる個別コントロールには、そのコントロール自身のコンテナを選んでください。 |
| `ion-grid` | `ion-grid#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-row` | `ion-row#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-col` | `ion-col#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-split-pane` | `ion-split-pane#native-slot` | ⭕️ | 分割レイアウト全体が対象です。1つのペインだけを対象にする場合は、子コンテナを選んでください。 |

### カード、テキスト、メディア

| コンテナ要素 | 例 | 対応 | 備考 |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `ion-card` | `ion-card#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-card-content` | `ion-card-content#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-card-header` | `ion-card-header#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-card-title` | `ion-card-title#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-card-subtitle` | `ion-card-subtitle#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-text` | `ion-text#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-label` | `ion-label#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-note` | `ion-note#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-badge` | `ion-badge#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-chip` | `ion-chip#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-avatar` | `ion-avatar#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-thumbnail` | `ion-thumbnail#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-img` | `ion-img#native-slot` | ⭕️ | 内部のHTML imgではなく、Ionicのホストを選んでください。意図した画像サイズになるまで待ってください。 |
| `ion-icon` | `ion-icon#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-skeleton-text` | `ion-skeleton-text#native-slot` | ⭕️ | 画像はキャプチャ時の1つの状態を保持し、インジケーターのアニメーションは継続しません。 |
| `ion-spinner` | `ion-spinner#native-slot` | ⭕️ | 画像はキャプチャ時の1つの状態を保持し、インジケーターのアニメーションは継続しません。 |
| `ion-progress-bar` | `ion-progress-bar#native-slot` | ⭕️ | 画像はキャプチャ時の1つの状態を保持し、インジケーターのアニメーションは継続しません。 |

### リストとジェスチャー

| コンテナ要素 | 例 | 対応 | 備考 |
| ----------------------------- | ----------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `ion-accordion` | `ion-accordion#native-slot` | ⭕️ | 現在のアコーディオンのボックスが対象です。展開状態の変更時には、ジオメトリの更新が必要です。 |
| `ion-accordion-group` | `ion-accordion-group#native-slot` | ⭕️ | 現在の展開状態を含む、グループのボックスが対象です。 |
| `ion-list` | `ion-list#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-list-header` | `ion-list-header#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-item` | `ion-item#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-item-divider` | `ion-item-divider#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-item-group` | `ion-item-group#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-item-sliding` | `ion-item-sliding#native-slot` | ⭕️ | スライドする行全体が対象です。画像はスワイプ操作を実装しません。 |
| `ion-item-options` | `ion-item-options#native-slot` | ⭕️ | 親のsliding itemによって選択肢が表示されている間だけ対応します。 |
| `ion-item-option` | `ion-item-option#native-slot` | ⭕️ | 親のitem-optionsが表示されている間だけ対応します。 |
| `ion-infinite-scroll` | `ion-infinite-scroll#native-slot` | ⭕️ | 表示中でサイズがゼロでないボックスが必要です。読み込みとスクロールの動作はIonicが引き続き管理します。 |
| `ion-infinite-scroll-content` | `ion-infinite-scroll-content#native-slot` | ⭕️ | 画像は現在の読み込みインジケーターを静止した状態で保持します。 |
| `ion-refresher` | `ion-refresher#native-slot` | ⭕️ | ion-content内で表示されているアクティブ状態だけが対象です。非表示の待機状態は対象外です。 |
| `ion-refresher-content` | `ion-refresher-content#native-slot` | ⭕️ | アクティブなrefresher内で使ってください。画像は現在のインジケーターを静止した状態で保持します。 |
| `ion-reorder` | `ion-reorder#native-slot` | ⭕️ | item/reorder-groupとの関係を維持してください。画像はドラッグ操作を実装しません。 |
| `ion-reorder-group` | `ion-reorder-group#native-slot` | ⭕️ | グループ全体が対象です。並べ替えとドラッグの動作はIonicが引き続き管理します。 |

### ナビゲーションとタブ

| コンテナ要素 | 例 | 対応 | 備考 |
| --------------------- | --------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `ion-breadcrumb` | `ion-breadcrumb#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-breadcrumbs` | `ion-breadcrumbs#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-nav` | `ion-nav#native-slot` | ⭕️ | ナビゲーションのビューポートが対象です。ページ固有のサーフェスには、現在のページのコンテナを使ってください。 |
| `ion-nav-link` | `ion-nav-link#native-slot` | ⭕️ | この操作用ラッパーにinline-block/blockのボックスを与えてください。 |
| `ion-router` | `ion-router#native-slot` | ❌ | ルーティング設定であり、表示サーフェスではありません。描画されたページのコンテナを選んでください。 |
| `ion-router-link` | `ion-router-link#native-slot` | ⭕️ | この操作用ラッパーにinline-block/blockのボックスを与えてください。 |
| `ion-router-outlet` | `ion-router-outlet#native-slot` | ⭕️ | outletのビューポートが対象です。ページ固有の配置には、アクティブなページのコンテナを使ってください。 |
| `ion-route` | `ion-route#native-slot` | ❌ | ルート定義であり、表示サーフェスではありません。描画されたページのコンテナを選んでください。 |
| `ion-route-redirect` | `ion-route-redirect#native-slot` | ❌ | リダイレクト定義であり、表示サーフェスではありません。描画されたページのコンテナを選んでください。 |
| `ion-tabs` | `ion-tabs#native-slot` | ⭕️ | タブのビューポートが対象です。バーだけを対象にする場合はion-tab-barを使ってください。 |
| `ion-tab` | `ion-tab#native-slot` | ⭕️ | 表示中のアクティブなタブだけが対象です。 |
| `ion-tab-bar` | `ion-tab-bar#native-slot` | ⭕️ | バー全体が1つのサーフェスです。個別のタブにはion-tab-buttonを使ってください。 |
| `ion-tab-button` | `ion-tab-button#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-segment` | `ion-segment#native-slot` | ⭕️ | segment全体が1つのサーフェスです。個別のコントロールにはion-segment-buttonを使ってください。 |
| `ion-segment-button` | `ion-segment-button#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-segment-view` | `ion-segment-view#native-slot` | ⭕️ | viewのビューポートが対象です。個別のページにはion-segment-contentを使ってください。 |
| `ion-segment-content` | `ion-segment-content#native-slot` | ⭕️ | 画面外のページではなく、表示中のsegmentページを使ってください。 |

### オーバーレイ、メニュー、FAB

| コンテナ要素 | 例 | 対応 | 備考 |
| ------------------ | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ion-action-sheet` | `ion-action-sheet#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-alert` | `ion-alert#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-modal` | `ion-modal#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-popover` | `ion-popover#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-loading` | `ion-loading#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-toast` | `ion-toast#native-slot` | ⭕️ | 表示中だけが対象です。オーバーレイのホストボックスが対象であり、内側のパネルが自動的に選ばれるわけではありません。個別コントロールにはオーバーレイ内のコンテナを優先してください。 |
| `ion-backdrop` | `ion-backdrop#native-slot` | ⭕️ | 装飾用の被覆サーフェスです。オーバーレイの検出やネイティブのz-orderを設定するものではありません。 |
| `ion-menu` | `ion-menu#native-slot` | ⭕️ | 表示中のボックスがある場合だけが対象です。開閉の動作はIonicが引き続き管理します。 |
| `ion-menu-toggle` | `ion-menu-toggle#native-slot` | ⭕️ | 表示中のコンテンツが必要です。inline-block/blockを使い、autoHideも考慮してください。 |
| `ion-fab` | `ion-fab#native-slot` | ⭕️ | 意図したレイアウトボックスを持つ、表示中のホストを使ってください。 |
| `ion-fab-button` | `ion-fab-button#native-slot` | ⭕️ | このボタンは、親のFABグループとは独立したサーフェスです。 |
| `ion-fab-list` | `ion-fab-list#native-slot` | ⭕️ | 展開中だけが対象です。親のion-fabとsideによる配置を維持してください。 |

### 内部コンポーネント

| コンテナ要素 | 例 | 対応 | 備考 |
| ------------------ | ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ion-select-modal` | 内部の選択オーバーレイコンテンツ | ❌ | Ionic 9.0.9に同梱されていますが、公開された投影先の対応仕様には含まれません。公開コンポーネントのion-selectホスト、またはアプリケーションが所有するコンテナを選んでください。 |

## 非対応要素のラップ

HTMLの`select`ではなく、`#seat-projection`を選んでください。

```html
<span id="seat-projection" style="display: inline-block; width: 12rem; height: 2.75rem">
  <select aria-label="Seat" style="width: 100%; height: 100%">
    <option>Any seat</option>
  </select>
</span>
```

コントロールのDOM、値、イベントリスナーは切り替えをまたいで保持されます。ネイティブの動作と値の同期は引き続きプラグインが管理し、準備済み画像は入力を受け付けません。

## 検証の範囲

一時的なChromium・WebKitの検証コードで、明示的なレイアウトボックス、必要な親要素、表示状態を用意してIonicの一覧を検証しています。単色の準備済み画像で配置と可視ピクセルの被覆を調べ、元の子要素の同一性・値の保持と、終了処理時のEngine画像の削除も確認しています。設定用要素では、描画可能なボックスがないことを確認します。refresherの検証はアクティブなCSS状態を選ぶもので、引っ張るジェスチャーは検証しません。アニメーションする読み込みインジケーターは、前後のキャプチャ間で変化する場合があります。

両ブラウザーで、対応する公開Ionic要素90個すべてについて、計測した画像フレームの差はゼロで、検査した内側の領域は単色で完全に覆われ、元の子要素・値が保持され、破棄後にEngine画像が残らないことを確認しました。公開の設定用要素4個には、描画可能なボックスがありませんでした。内部コンポーネントも検証しましたが、公開された対応仕様には引き続き含めません。HTMLの検証では、open・closed shadow rootを含む41通りの要素とレイアウトの組み合わせを確認しています。

これらはDOMコンテナの検証であり、ネイティブキャプチャ、SDKの適格性、Ionicの操作全体を検証するものではありません。あらゆるテーマ、closed shadowの実装、アプリケーションのスタイルシートでの動作を保証するものでもありません。この検証コードは、ライブラリの恒久的なテストスイートには含まれていません。
