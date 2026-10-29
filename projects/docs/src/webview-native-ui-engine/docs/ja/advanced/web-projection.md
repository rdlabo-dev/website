---
title: "Web投影とバッチ"
sourceRevision: "baa0ddcede13b0edcba2bd889f3f13d3f279f711197f63c5ef4d27b735842f0f"
---
# 低レベルのWeb投影

サーフェスのヘルパーがレンダラーの既存の所有権モデルに合わない場合にのみ、以下の基本APIを使います。`createWebProjectionSurface`は、スコープとバッチハンドオフをすでに管理しています。同じフォールバックに別のマネージャーを手動で作成すると、所有権が競合します。

たとえば、レンダラーがネイティブパネルごとに1つのフォールバックコンテナを所有し、独自のリビジョンプロトコルでネイティブ更新を受理しているとします。投影スコープを使えば、その所有権の判断を維持しながら、画像の準備と復帰の調整を委譲できます。ページやモーダル単位のグループ化で対応できる場合は、サーフェスのヘルパーを優先してください。同じコンテナに2つ目のマネージャーを置くと、ピクセルの所有権を奪い合います。

スコープは、そのライフタイム中、既存のWebフォールバック要素1つにバインドします。要素はプラグインのDOMから取得してください。Engineは代替ホストを作らず、ページ、積み重なりの順序、z-indexを選びません。別のフォールバック要素には新しいスコープが必要です。Documentは`element.ownerDocument`から取得します。

```ts
import { createWebProjectionScope, createWebProjection } from '@webview-native-ui/engine';

const fallback = container.querySelector<HTMLElement>('[data-web-fallback]');
if (!fallback) throw new Error('Web fallback is missing');
const scope = createWebProjectionScope(fallback, 'my-plugin');
const projection = await createWebProjection(
  scope,
  {
    send: (request) => plugin.snapshot(request),
    listen: (listener) => plugin.addListener('snapshotInteraction', listener),
  },
  {
    wake: () => schedulePluginUpdate(),
    blocked: () => overlayIsActive(),
    revision: () => lastSentRevision,
  },
);
```

上のコンテナ、ブリッジ、更新コールバックは利用側のプラグインに属します。投影マネージャーには`document`、`target`、`layer`、CSSセレクター、レイヤー解決関数は渡しません。

1. ネイティブ更新が受理された後、`projection.consider(revision, sources)`を呼びます。ソースはネイティブIDとビューポートのフレームを、元のDOMに対応付けます。フォールバック要素の内側にある必要はありません。画像は事前にキャプチャしてデコードします。
2. 外観変更では`projection.changed()`を、スクロールのジオメトリを無効化する場合は`projection.changed(scrollElement)`を呼びます。レイアウト更新は`consider`を通し、その他のジオメトリ変更には`invalidate()`を使います。
3. Webオーバーレイでネイティブを覆う前に、`projection.begin()`を呼びます。固定のフォールバック位置に準備済みピクセルを表示します。ここでは新しいキャプチャやデコードを開始しません。キャプチャできなければ、プラグインは通常のWebフォールバックを維持します。
4. 画像がソースを所有する間、`projection.owners`を通常のネイティブ更新から除外します。`visibleOwners`はネイティブの復元中に復帰用ピクセルを維持し、`preparedOwners`は準備済み画像を持つソースを示します。これらの配列は読み取り専用のスナップショットです。
5. `projection.end()`を呼び、通常のネイティブ更新を送ってから、`projection.updated(snapshotToken, acceptedIDs, revision)`を呼びます。キャプチャしたすべてのIDを含む新しい確認応答が、画像を破棄します。
6. サーフェスの破棄時に`projection.destroy()`を呼びます。自身の画像とリスナーだけを解放します。最終的なネイティブのリセットとDOMはプラグインが所有します。

Engineはネイティブが見えている間に、操作できない`img`をフォールバックコンテナ内（開かれたShadowRootがあれば、その直下）に準備します。デコード済み画像とDOMノードをハンドオフ間で再利用し、スコープの終了・破棄時に解放します。画像は`inert`で、アクセシビリティから隠され、ヒットテストから除外されます。既存のフォールバックとその子は、複製、置換、削除されず、`inert`/`aria-hidden`も付与されません。リスナー、値、アプリ側の変更は投影をまたいで維持されます。`::before`と`::after`は、どちらもアプリで引き続き利用できます。

`div`、`button`、カスタム要素など、既存のコンテナを提供してください。`img`、`input`、`video`などの置換要素・void要素はスコープにできないため、それらの既存のフォールバックコンテナを使います。レンダラーは同じコンテナの親を変えてもかまいませんが、低レベルスコープの要素を置き換えたり、2つのマネージャーに同時に制御させたりしてはいけません。投影中に配置を変える場合は、`moved()`でマネージャーへ通知します。

画像は、レイアウト領域を維持するフォールバック内で絶対配置されます。staticなホストは画像の表示中に配置基準となります。ホストと祖先のクリッピング、transform、filterは引き続き適用されます。開かれたShadowRootへの挿入は内部のslotラッパーを迂回しますが、ホスト自身のクリッピングは迂回しません。閉じたshadow rootの内部は調べられないため、画像を描画できるフォールバックコンテナを提供してください。

Engine所有のノードは、プール内のライフタイム全体で`data-native-ui-projection-node`を持ちます。フォールバックの子を調べるレンダラーは、アプリのコンテンツ探索からこれらのノードを除外する必要があります。MutationObserverでキャプチャを無効化するレンダラーは、これらのノードの挿入・削除・属性変更、内部の変更、Engine所有の`data-native-ui-snapshot-*`属性も無視してください。アプリが作成したコンテンツ、寸法、disabled状態の変更は監視し続けます。投影ホストのすべての変更を無視すると、本物の更新を見逃します。そうしなければ、画像の準備が自らを無効化し、キャプチャと解放を繰り返す原因になります。Engineは破棄時に自身のノードだけを取り除きます。子の挿入はフォールバック内の構造セレクターに影響する場合がありますが、flex、grid、仮想リストにフォールバックと並ぶ項目を増やすことはありません。

### 既存プラグインからの通知

低レベルマネージャーは、`options.events`で既存プラグインのイベントを購読できます。

```ts
events: {
  addListener: (name, listener) => plugin.addListener(name, listener),
  update: ['setColors', 'setTabs', 'tabSelected'],
  projection: {
    native: ['shown'],
    web: ['transitionStarted'],
    none: ['hidden'],
  },
}
```

これらは**通知**であり、横取りするメソッド名ではありません。プラグインはネイティブ変更の成功後に更新イベントを発行します。Web投影イベントは移動が始まる前に届く必要があり、準備済みの画像を使います。nativeイベントは復元を要求しますが、通常のレンダラー確認応答でネイティブの準備完了が確認されるまで画像は残ります。hiddenイベントはプラグインのネイティブ非表示操作に続き、画像を破棄します。`hide()`の呼び出しや、アプリ所有のフォールバックDOMの変更は行いません。外観更新は、`none`を含め、要求された投影先を維持します。

複数のサーフェスを持つプラグインでは、`accepts(event)`を提供し、このスコープの安定したサーフェス識別情報を選びます。`update`と投影先で共有されるイベントは一度だけ購読され、一緒に処理されます。同じイベントに競合する投影先を指定すると、購読前に拒否されます。マネージャーの破棄は、初期化失敗後に遅れて完了する登録も含め、すべての購読を解除します。プラグインの公開メソッドをラップしたり、再実行したりはしません。

マネージャーは、ホストランタイムのリソースURL変換（CapacitorまたはCordova）を内部で使います。プラグインの作者がURL解決関数を提供する必要はありません。

この節は、単一のネイティブビューの登録ではなく、バッチの調整をすでに所有するレンダラー向けの低レベルマネージャーを説明しています。新しい組み込みでは、プラグインガイドのネイティブ登録を優先してください。起動、計測、描画の確認応答を管理します。

### 1回のネイティブトランザクションで複数のフォールバックを扱う

たとえば、ツールバーに別々のフォールバックホストを持つ2つのボタングループがあり、レンダラーがそれらを1回のネイティブトランザクションで非表示・復元するとします。独立したマネージャーでは、片方が先に表示されるおそれがあります。バッチはグループに1つのハンドオフトークンを使い、一緒に描画の境界を越えられるようにします。

複数のフォールバック要素を同時に切り替える必要がある場合、`createWebProjectionBatch(transport, options)`を使います。同じ画像エンジンを使い、リスナーとcapture/cover/restoreのトークンは1つです。各エントリーの`{ scope, element, control, ... }`を`batch.consider(revision, sources)`へ渡します。ボタングループのように、複数のネイティブIDで1つのスコープを共有できます。

バッチは最初の空でない`consider`からDocumentを取得します。それ以降のスコープとソースは、すべてそのDocumentに属する必要があります。初回更新より前は`begin()`は何もせず、`destroy()`は安全です。フォールバックが変わる場合は新しいスコープが必要です。スコープの識別情報はキャッシュの無効化に使われます。表示中は、復元が完了するまでキャプチャ時のスコープを保持します。

`WebProjectionRequest`はアクションで判別される共用体です。`prepare`には`revision`、`viewportWidth`、`ids`が必要です。`cover`には`token`が必要で、一時的な移動には`viewportWidth`と投影先の`parts`を含めます。`restore`には`token`、`viewportWidth`、投影先の`parts`が必要です。`painted`、`restored`、`release`には`token`が必要で、`reset`はペイロードを取りません。準備結果が空の場合や`{ shown: false }`の場合、プラグインは通常のWebフォールバックを使います。プラグインの既存の順序付きブリッジを使ってください。Engineはユーザー操作を再試行しません。
