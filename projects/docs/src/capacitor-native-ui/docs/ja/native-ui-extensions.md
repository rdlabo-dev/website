---
title: アプリ内の Native UI 拡張（実験的）
---

# アプリ内の Native UI 拡張（実験的）

> **実験的:** 拡張 API、ネイティブ登録インターフェース、動作は今後のリリースで変更される場合があります。`element` と `tab-accessory` 配置を含む SwiftUI と Kotlin/Compose の両方に適用されます。

拡張は既存の Web UI を iOS の SwiftUI View または Android の Jetpack Compose コンテンツに投影します。両方の定義をアプリ内に置くため、npm パッケージ、別のライブラリー、Capacitor プラグインは不要です。Web 要素を正とし、フォールバック UI としても維持します。

拡張は組み込みコントロールと同じ[投影モデル](../README.md#how-projection-works)を使います。公開する DOM データと操作を定義し、ネイティブ表示を用意してください。

## 始める前に

既存の Capacitor 8 アプリで、未導入ならプラグインをインストールします。

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

対応するネイティブプラットフォームを選びます。

- **Android:** Capacitor Android プロジェクトと API 24 以降のデバイス・エミュレーターを使います。手順 1、[Kotlin/Compose の登録](#2b-register-compose-content-on-android)、手順 3–4 に進みます。iOS プロジェクト、Xcode、Ionic、テーマパッケージは不要です。
- **iOS:** Capacitor iOS プロジェクト、Xcode 26 以降、iOS 26 以降のデバイス・シミュレーターを使います。手順 1、[SwiftUI の登録](#2a-register-a-swiftui-view-on-ios)、手順 3–4 に進みます。標準コントロールも投影する場合は [Ionic 設定](setup.md)または [HTML 設定](framework-independent.md)に従ってください。
- **両方:** 手順 1 の DOM リーダーを共有し、各プラットフォームで同じ名前にネイティブコンテンツを登録します。

以下の TypeScript 例は Ionic エントリーを使います。Ionic を使わない場合は `defineNativeUI` と `enableNativeUI` の両方を `@rdlabo/capacitor-native-ui/core` からインポートします。

## 1. DOM リーダーを定義する

```ts
// src/native-ui/counter.ts
import { defineNativeUI } from '@rdlabo/capacitor-native-ui';

export const counter = defineNativeUI({
  name: 'app.counter',
  selector: '[data-counter]',
  read(element) {
    return {
      props: { count: Number(element.getAttribute('data-count') ?? 0) },
      actions: { increment: element.querySelector<HTMLButtonElement>('button') },
    };
  },
});
```

たとえば次の Web ソースを使います。確保した領域にはネイティブコンテンツと操作エラーも表示できます。

```html
<div data-counter data-count="0" style="width: 280px; min-height: 128px">
  <p data-count-label>Count: 0</p>
  <button type="button">Increment</button>
</div>
```

フレームワークのクリックハンドラーでカウントと `data-count` を更新します。通常の HTML なら次で十分です。

```ts
const source = document.querySelector<HTMLElement>('[data-counter]')!;
source.querySelector('button')!.addEventListener('click', () => {
  const count = Number(source.dataset.count ?? 0) + 1;
  source.dataset.count = String(count);
  source.querySelector('[data-count-label]')!.textContent = `Count: ${count}`;
});
```

Shell が DOM 変更を監視し、新しい props をネイティブへ送信します。DOM 属性やテキストに描画した状態は自動で監視します。DOM を変更しないプロパティや外部状態をリーダーが読む場合は、変更後に `shell.markForCheck()` を呼んでください。

### リーダーの契約

| 項目 | 要件 |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| 実行 | 同期的で読み取り専用。 |
| Web フォールバック | ソースを Web に残す場合は `null` を返す。 |
| `props` | 有限数、文字列、真偽値、null、配列、オブジェクトを含む JSON オブジェクト。64K 文字まで。 |
| 操作対象 | ソース自身または子孫。存在しない・非表示・無効の対象は実行不可。 |
| 操作数 | ソースごとに最大 30。 |

## 2a. iOS で SwiftUI View を登録する

プラグインの導入後に `npx cap sync ios` を実行し、アプリの Xcode ターゲットに Swift ファイルを追加します。`@rdlabo/capacitor-native-ui` が提供する `NativeUIPlugin` モジュールをインポートします。既存の SPM または CocoaPods 連携は維持してください。

```swift
import SwiftUI
import NativeUIPlugin

struct CounterProps: Decodable {
    let count: Int
}

struct CounterView: View {
    let props: CounterProps
    let actions: NativeUIActions
    @State private var error: String?

    var body: some View {
        HStack {
            Text("Count: \(props.count)")
            Button("Increment") {
                Task { @MainActor in
                    do {
                        try await actions.activate("increment")
                        error = nil
                    } catch {
                        self.error = "Action unavailable"
                    }
                }
            }
            .disabled(!actions.isAvailable("increment"))
            if let error { Text(error) }
        }
    }
}

@MainActor func registerAppNativeUI() throws {
    try NativeUI.register("app.counter") {
        (props: CounterProps, actions: NativeUIActions) in
        CounterView(props: props, actions: actions)
    }
}
```

JavaScript が Shell を有効にする前に、`application(_:didFinishLaunchingWithOptions:)` から `registerAppNativeUI()` を一度呼びます。重複・空の名前は拒否されるため、ここで登録エラーを処理してください。Swift はアプリにコンパイルされるので、View の追加・変更には iOS の再ビルドが必要です。登録は同期的な初期設定で、ネイティブブリッジのコマンドではありません。

## 2b. Android で Compose コンテンツを登録する

Android は **element 拡張のみ**に対応します。明示的に指定したボタンを含め、標準の Ionic・HTML コントロールは Web に残ります。ネイティブ Vertical Bars と `tab-accessory` は iOS の機能です。Android では Web サイドレールと element 拡張を併用できます。同じ DOM リーダー、props、操作対象、`markForCheck()` が両方で使えます。

導入後に `npx cap sync android` を実行し、Android アプリで Kotlin を使います。ルートの `build.gradle` の `buildscript.dependencies` に Kotlin と Compose コンパイラープラグインを追加し、アプリと同じ Kotlin バージョンを使います（プラグインの既定値は `2.2.20`）。未定義ならルートの `buildscript` に `ext.kotlin_version = '2.2.20'` を定義します。

```groovy
classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
classpath "org.jetbrains.kotlin:compose-compiler-gradle-plugin:$kotlin_version"
```

`app/build.gradle` で `kotlin-android` と `org.jetbrains.kotlin.plugin.compose` を適用し、`android { buildFeatures { compose true } }` を有効にします。Native UI の依存関係は Compose UI と Foundation を公開します。Material を使う拡張では依存関係を追加してください。

JavaScript が Shell を有効にする前に、メインスレッドの `Application.onCreate()` から一度登録します。`AndroidManifest.xml` の `<application>` に `android:name=".App"` を設定した `Application` サブクラスを使用し、Activity の再生成ごとの登録は避けてください。

```kotlin
import android.app.Application
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import dev.rdlabo.capacitor.nativeui.NativeUI
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        NativeUI.register(
            name = "app.counter",
            decode = { json -> json.getInt("count") },
        ) { count, actions, context ->
            val scope = rememberCoroutineScope()
            var error by remember { mutableStateOf<String?>(null) }
            val enabled = actions.isAvailable("increment")
            val foreground = if (context.dark) Color.White else Color.Black
            val background = if (context.dark) Color(0xFF202020) else Color.White
            val textStyle = TextStyle(color = foreground)
            Column(Modifier.fillMaxSize().background(background).padding(8.dp)) {
                BasicText("Count: $count", style = textStyle)
                Box(
                    Modifier.fillMaxWidth().heightIn(min = 48.dp)
                        .alpha(if (enabled) 1f else 0.5f)
                        .clickable(enabled = enabled, role = Role.Button, onClickLabel = "Increment count") {
                            scope.launch {
                                try {
                                    actions.activate("increment")
                                    error = null
                                } catch (cancelled: CancellationException) {
                                    throw cancelled
                                } catch (unavailable: IllegalStateException) {
                                    error = "Action unavailable. Try again."
                                }
                            }
                        },
                    contentAlignment = Alignment.Center,
                ) { BasicText("Increment", style = textStyle) }
                BasicText(
                    error ?: "",
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                    style = textStyle,
                )
            }
        }
    }
}
```

Shell はソース DOM の矩形から Compose ホストの位置とサイズを決めます。`context.sourceFrame` は CSS ピクセル、`sourceFrameInDp` は Compose dp、`dpPerCSSPixel` は変換係数です。`sourceID` と `viewportWidth` は現在のソースとビューポートを表します。`rtl` は `LocalLayoutDirection` にも適用します。Compose テーマの選択には `dark` を使います。コンテンツ内でソースの `x` と `y` を再度適用しないでください。

`decode` は投影を受理する前に呼びます。例外が出たソースは Web に残ります。空・重複の登録名は拒否します。スタイルとアクセシビリティーは Compose コンテンツが管理します。Kotlin 変更後は Android アプリを再ビルドしてください。

## 3. ローカル定義で有効にする

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
import { counter } from './native-ui/counter';

const shell = await enableNativeUI({ ionic: { auto: false }, extensions: [counter] });
```

この例は Ionic コントロールの自動投影なしで拡張を有効にします。明示的な `data-native-ui` ソースは有効のままです。対応する iOS で標準 Ionic コントロールも投影するには `ionic: { auto: false }` を省略します。Android の標準コントロールはどちらも Web 描画です。

既存の起動呼び出しを上記へ置き換え、2 つ目の Shell を起動しないでください。[アプリルートのライフサイクル例](setup.md#place-startup-in-your-frameworks-app-root)でフレームワークに接続し、共有の起動呼び出しにこれらのオプションを入れます。

繰り返しの有効化でも拡張オブジェクトを安定して維持します。実行中の拡張変更には先に `await shell.destroy()` が必要です。有効化内で拡張名は一意にし、同じソースに重なるセレクターを登録しないでください。拡張はソースの部分木を所有するため、内部の組み込みコントロールは別途投影しません。

## 4. 拡張をビルドして試す

Web アセットをビルドし、設定したプラットフォームを同期・再ビルドします。

- **Android:** `npx cap sync android` を実行し、Android Studio からビルド・起動します。カウンターは Compose で描画されます。
- **iOS:** `npx cap sync ios` を実行し、Xcode からビルド・起動します。iOS 26 以降ではカウンターは SwiftUI で描画されます。

Increment をタップすると元の Web ハンドラーが `data-count` を更新し、ネイティブのカウントも追従します。ブラウザーでは元の Web カウンターが引き続き動作することを確認してください。

ソースごとのフォールバック理由には一時的に [`debug: true`](configuration.md#understand-why-a-source-stays-on-the-web) を有効にします。Web のままなら、JavaScript の有効化前に登録が実行され、両側の名前・props が一致することを確認します。Android では `Application` サブクラスのマニフェスト宣言、iOS では Swift ファイルのアプリターゲットへの所属を確認してください。

## 内容と配置は独立している

| `placement` | 動作 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| 省略または `'element'` | iOS 26 以降・Android API 24 以降でソース要素の Web フレーム内にネイティブ内容を配置。 |
| `'tab-accessory'` | iOS 26.1 以降で、投影タブバーのシステム SwiftUI タブアクセサリーに View を付加。 |

拡張は `enableVerticalControlArea()` 使用時も `controls` と `ionic.auto` から独立しています。表示はアプリが制御し、Web に残す場合はリーダーから `null` を返し、条件変更時に `markForCheck()` を呼びます。アクセサリーには対応するネイティブタブホストが必要です。

### タブアクセサリーの要件

| 要件 | 対応する構成 |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| ソース位置 | 所属する `ion-tabs` の内側。Shell がその `ion-tab-bar` を解決。 |
| ネイティブホスト | iOS 26.1 以降の Vertical Bars SwiftUI タブホスト。 |
| アクセサリー数 | ホストに 1 つ。 |
| Web フォールバックのレイアウト | 固定フッターなど同等の Web レイアウトを維持。ソースは隠れても領域を保つ。 |

通常の UIKit タブバー、ネイティブタブなし、iOS 26.0、競合するアクセサリーでは Web に残ります。アプリはネイティブコントローラー参照を渡さず、Shell も浮いたオーバーレイでシステムアクセサリーを近似しません。

## ソースの形状と表示状態を取得する

Shell はソース DOM を自動計測します。既定の `element` 配置ではその矩形に合わせて SwiftUI ホストの位置・サイズを決めるため、`props` に座標を送ったり手動でネイティブビューを配置したりする必要はありません。

情報を受け取るには引数 3 個の登録クロージャーを使います。

```swift
try NativeUI.register("app.counter") {
    (props: CounterProps, actions: NativeUIActions, context: NativeUIContext) in
    CounterView(props: props, actions: actions)
        .padding(.horizontal, context.sourceFrame.width < 240 ? 4 : 12)
}
```

従来の `(props, actions)` クロージャーも使用できます。どちらも同じ登録名と重複名チェックを使います。

| コンテキストのプロパティ | 意味 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `sourceID` | 現在の寿命に対する不透明なソース識別子。HTML の `id` ではありません。 |
| `sourceFrame` | Web ビューポート基準の CSS ピクセルによる DOM の `getBoundingClientRect()`。`x`、`y`、`width`、`height` を含む。 |
| `sourceFrameInWebView` | ソース矩形を WebView のローカル座標の UIKit ポイントへ変換した値。画面座標ではありません。 |
| `viewportWidth` | スナップショットの座標変換に使う CSS ビューポート幅。 |
| `pointsPerCSSPixel` | CSS ピクセルあたりの UIKit ポイント。デバイスのピクセル密度ではありません。 |
| `placement` | `.element` または `.tabAccessory`。 |
| `colorScheme` | `.light` または `.dark`。SwiftUI 環境にも適用。 |
| `layoutDirection` | `.leftToRight` または `.rightToLeft`。SwiftUI 環境にも適用。 |

ソースの移動、サイズ、外観の変更を含む更新スナップショットを Shell が適用すると、クロージャーは新しいコンテキストを受け取ります。形状を `@State` にキャッシュせず、現在のコンテキストを使用してください。更新は Web/ネイティブブリッジを経由し、Swift からの同期 DOM 計測ではありません。

`tabAccessory` でも `sourceFrame` は元の DOM 要素を表します。アクセサリーの実際の位置・サイズはシステムが決定します。どちらの配置でも実際のローカル領域は View 内の SwiftUI の `GeometryReader` で取得します。

```swift
GeometryReader { geometry in
    CounterView(props: props, actions: actions)
        .frame(width: geometry.size.width, height: geometry.size.height)
}
```

`sourceFrame.x` や `y` を追加の SwiftUI オフセットに適用しないでください。`element` のホストは Shell がすでに配置しています。View はそのホスト内の内容を配置します。

## 共通の投影機能を使う

| 機能 | 拡張での利用方法 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 位置とサイズ | ホストの自動配置と `NativeUIContext`。実際のローカル範囲は `GeometryReader`。 |
| ダークモードと RTL | `context` または SwiftUI の `@Environment(\.colorScheme)` と `@Environment(\.layoutDirection)`。 |
| Reduce Motion（視差効果を減らす設定）とアクセシビリティー | `@Environment(\.accessibilityReduceMotion)` などの SwiftUI 環境値とネイティブのアクセシビリティー修飾子。独自コントロールにアクセス可能な名前を設定。 |
| DOM に基づくアプリ状態 | `read(element)` から JSON の `props` を返す。DOM 変更で同期し、DOM 変更がない場合は `shell.markForCheck()`。 |
| 有効・表示中の操作対象 | `actions.availableNames` または `actions.isAvailable("increment")`。利用不可の DOM 対象は省略。 |
| 元の Web 操作を実行 | `try await actions.activate("increment")`。完了・失敗は後述の契約に従う。 |
| 一時的な Web フォールバックと終了処理 | 非対応内容、オーバーレイ、ナビゲーション中断、ソース削除に対して自動管理。 |
| アプリによる中断 | JavaScript から Shell の `suspend()`、返されたトークンの `resume()`、`destroy()` を使用。 |

たとえば、元の操作が利用できない場合はネイティブボタンを無効にします。

```swift
Button("Increment") {
    Task { @MainActor in
        do { try await actions.activate("increment") }
        catch { /* Present an application-appropriate error. */ }
    }
}
.disabled(!actions.isAvailable("increment"))
```

利用可否はスナップショットで予約ではありません。実行前に対象が消える場合があるため、エラーも処理してください。独自のテキスト、選択状態、フォント、色、バッジは拡張の `props` と SwiftUI View に持たせます。Shell は CSS から独自コンポーネントの視覚構造を推測しません。リーダーで必要な要素の計算済みスタイルと属性を読みます。画像・色の変換には再実装せず後述の共通 API を使ってください。

## ソースの確認を予約する

DOM 属性、テキスト、子、監視対象の要素サイズ、スクロール、対応ライフサイクルイベントは自動確認を発生させます。Shell は JavaScript 変数や任意の DOM プロパティをポーリングしません。リーダーが使う状態を DOM 変更なしで更新した場合は確認を要求します。

```ts
source.playbackPosition = newPosition; // 拡張が読み取るアプリ定義のプロパティです。
shell.markForCheck();
```

`markForCheck(): void` は再読み取りと形状計測を予約し、アプリの DOM 更新やネイティブの強制再描画はしません。複数呼び出しはまとめ、変更のないスナップショットは送りません。ブリッジ更新中の呼び出しは終了後の確認を予約します。中断中の投影は再開まで中断を維持します。`destroy()` 後や投影ランタイムのない環境では何もしません。

フレームワークが関連する DOM 変更を反映した後に呼びます。Angular の変更検知、React・Vue の描画を起動せず、ネイティブ完了を待つ Promise でもありません。観測可能な変更なしで標準コントロールのプロパティが変わる場合にも使えます。

## ネイティブの画像と色変換を再利用する

リーダーの第 2 引数は標準の SVG 取得・ラスタライズ処理を公開します。ソースに属するローカル `svg` または解決済み `ion-icon` を受け、**不透明な画像参照**、非対応なら `null` を返します。参照を `props` で返し、同期的に画像バイトを読み取ろうとしないでください。

```ts
const badge = defineNativeUI({
  name: 'app.badge',
  selector: '[data-badge]',
  read(element, context) {
    return {
      props: {
        icon: context.image(element.querySelector<HTMLElement>('ion-icon')),
        color: getComputedStyle(element).color,
      },
    };
  },
});
```

送信前に Shell が参照を `{ data, width, height, template }`（base64 PNG、CSS 寸法、描画モード）へ解決します。入れ子の参照やコピーにも対応します。`$nativeUIImage` は現在の読み取りコンテキストが返す参照の予約キーです。SwiftUI でアイコンを着色する場合は `image()` の第 2 引数に `{ template: true }` を指定します。既定ではソースの色を維持します。標準コントロールと同じローカル SVG 制約、RTL 取得、表示倍率のラスタライズ、画像キャッシュを使います。外部リソースや非対応 SVG は `null` を返します。未解決の `ion-icon` は読み込み完了まで Web フォールバックを維持してください。ラスタライズ失敗や props のサイズ超過では拡張は Web に残ります。

iOS では結果を `NativeUIImage` でデコードし、共通コンバーターを使います。

```swift
struct BadgeProps: Decodable {
    let icon: NativeUIImage?
    let color: String
}

struct BadgeView: View {
    let props: BadgeProps
    var body: some View {
        if let icon = props.icon, let image = NativeUIRendering.image(icon) {
            Image(uiImage: image)
                .foregroundStyle(Color(uiColor: NativeUIRendering.color(props.color)))
        }
    }
}
```

`NativeUIRendering.image` は不正な画像データに `nil` を返します。`NativeUIRendering.color` は計算済み `rgb()` / `rgba()` を受け、非対応形式では `.label` または指定した `fallback:` 色を使います。どちらも標準ネイティブ描画と共有し、CSS セレクター、変数、色名、任意のスタイルシートは評価しません。

## ライフサイクルと操作の完了

Shell は検出、形状、状態同期、ネイティブコントローラーの包含、オーバーレイに応じた投影の解除、中断、終了処理を管理します。拡張に attach/detach フックは不要です。Web ソースはネイティブが受理してから隠します。未登録レンダラー、props デコード失敗、非対応配置、リーダー失敗ではそのインスタンスは Web に残ります。既存の Shell オーバーレイ方針が適用され、Web オーバーレイがページを覆う間、拡張は Web に戻ります。

element 配置ではソースがビューポートと祖先の overflow クリップ範囲（Ionic の shadow スクロールコンテナーを含む）内に完全に収まる必要があります。一部が切れるソースは Web に残り、全体が見える位置へスクロールすると再び対象になります。タブアクセサリーはシステムホストの配置を使います。

### 操作の完了

| イベント | `try await actions.activate(name)` の結果 |
| ------------------------------------------------------------------ | -------------------------------------------- |
| 元の Web 要素がクリックを受け取る | 完了。 |
| ハンドラーが通信、ナビゲーション、モーダル表示を開始 | そのアプリの処理は待たない。 |
| 操作が無効・削除済み・古い | 拒否。 |
| 終了処理、ネイティブタスクのキャンセル、ブリッジタイムアウト | 保留中の呼び出しを確定。 |

ブリッジの確認応答は Capacitor の Promise メソッドです。

[デモのリーダー](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/demo/src/native-ui/counter.ts)と [SwiftUI View](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/demo/ios/App/App/NativeUICounter.swift)はアプリ内のファイルで両配置を示します。Native UI デモページでネイティブ投影と Web フォールバックを比較できます。

## 例: ミニプレーヤー

デモのミニプレーヤーは曲のメタデータと再生操作で同じ方式を示します。[DOM リーダーと Web フォールバック](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/demo/src/native-ui/mini-player.ts)と[アプリ内 SwiftUI View](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/demo/ios/App/App/NativeMiniPlayer.swift)を組み合わせます。再生状態とモーダル表示は Web アプリが管理し、ネイティブの `open` と `toggle` は元のボタンを実行します。音声エンジンではなく UI の例です。上記の拡張設定を終えてからファイルを調整してください。
