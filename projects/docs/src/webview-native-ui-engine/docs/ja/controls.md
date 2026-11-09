---
title: "ネイティブアダプターの共有コントロール"
sourceRevision: "df25f5115089f83ef851866adc2db0f16a2ce21ac4a1eed70cb497b56c35c2ba"
---
# ネイティブアダプターの共有コントロール

既存のEngineパッケージは、Capacitor Native UIで使うコントロールの実装も管理します。追加のnpmパッケージやワークスペースは不要です。

- `@webview-native-ui/engine`：汎用の投影API。依存関係の境界は変わりません。
- `@webview-native-ui/engine/controls`：コントロールのランタイムとトランスポートの契約。
- `@webview-native-ui/engine/controls/ionic`：任意のIonicオーバーレイ実装。
- `@webview-native-ui/engine/integration`：遷移と検索の連携状態を一元的に共有します。

アダプターは`createNativeUI({ plugin, getPlatform, isAvailable })`のインスタンスをひとつ作成し、そのライフタイムを通じて保持します。プラグインは`NativeUIPlugin`トランスポートインターフェースを実装します。アダプターはホスト登録、メソッドの振り分け、リスナーへの通知、ライフサイクルフックを管理し、Engineは描画、DOMの所有権、拡張の確認応答、終了処理の順序を管理します。CordovaもCapacitorをインポートせずに同じトランスポートを提供できます。Cordova Native UIプラグイン自体は後続の変更です。

SwiftPMは、`WebViewNativeUIEngine`に依存する任意の`WebViewNativeUIControls`プロダクトを公開します。CocoaPodsも同じ依存関係で`WebViewNativeUIControls`を公開します。Androidは`android/controls`から任意の`io.github.webview-native-ui:controls`アーティファクトを公開し、`engine`とComposeに依存します。汎用Engineの利用者は、既存の依存関係とAndroidの最低SDK 23を維持します。ControlsにはAndroid API 24が必要です。ネイティブアダプターは`NativeUIController`を作成し、要求とイベントを転送します。iOSはJSON辞書と完了クロージャーを、AndroidはJSONObjectsを受け取ります。

IonicテーマはEngineの連携機能を直接インポートします。Capacitor互換の連携エクスポートは、そのモジュールを再エクスポートします。アプリ内でEngineのバージョンをひとつに解決してください。テーマやアダプターに連携機能の独自コピーをバンドルしてはいけません。`/controls`エントリーはIonicのランタイムコードを読み込みません。Ionicオーバーレイを有効にする場合だけ`/controls/ionic`を読み込んでください。

## 検証とリリースの順序

移管したコントロールのテストには`npm run test:controls`を、汎用投影には`npm test`を実行します。SwiftPMの`WebViewNativeUIEngine-Package`スキームは両方のネイティブターゲットを対象とします。Androidの`:controls:testReleaseUnitTest`は移管したスナップショットパーサーを対象とします。既存のCapacitorトランスポートとホスト上のライフサイクルのテストは、そのリポジトリに残ります。テーマは実際のデモのE2Eテストスイートを維持します。

まずEngineをビルドして検証します。同じCentralバンドル内の両方の署名済みMavenアーティファクトと、npmで配布する両方のpodspecも対象です。Capacitorとテーマのレジストリ用ロックファイルを更新する前に、Engineのネイティブアーティファクトとnpmパッケージを同じバージョンでリリースしてください。候補版の検証ではローカルのnpm tarballと一時的なSwiftPMパスまたはローカルMavenリポジトリを使います。これらの一時パスはコミットしないでください。
