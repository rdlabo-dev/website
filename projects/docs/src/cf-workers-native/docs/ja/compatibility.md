---
title: "互換性と制限"
sourceRevision: "eabce73d3a2453218f8df88a57e0edc701428356d16b61eb18fd6b8065336747"
---

# 互換性と制限

対象は Cloudflare Workers であり、単独の Node.js プロセスではありません。Node プロファイルは workerd `1.20261012.1`、compatibility date `2026-10-17` を追加フラグなしで使います。他の日付やフラグはこのプロファイルの対象外です。WebView は workerd や V8 を含みません。iOS は独自の JavaScript エンジンを使います。

リリースには[リモート優先のアプリケーションリリース基準](../CONTRIBUTING.md#remote-first-application-release-gate)を適用します。既定のネットワークポリシーでは、サーバー実装をデプロイ済みWorkerに保持します。モバイルアプリケーションでの検証に成功しても、WorkersやNode.jsとの完全互換を証明するものではありません。ローカルAPIの完成に向けた作業は、以下の制限を伴いながら独立して進みます。

## ネイティブホスト

| ホスト | 範囲 |
| --- | --- |
| iOS埋め込み | UIKit/SwiftUI向け0.1.7の`WorkersIOS` SwiftPM product。UIKitコントローラーを取り除く前に閉じてください。SwiftUIのdismantlingでは自動で閉じます。 |
| Android埋め込み | Maven Central SDK `io.github.rdlabo:cf-workers-native-android:0.1.7`。WebViewの`MULTI_PROFILE`が必須です。SDK画面は同時に1つで、永続SDK CookieはホストCookieから分離されます。 |
| Capacitor | 既存のCapacitor 8連携。8.5.3で検証済みです。汎用ネイティブプラグインにはこの経路を使用します。 |

npmのPreviewは`cf-workers-native`という名前です。[依存関係の対応表](native-embedding.md#dependency-setup)にある正確なバージョンと対応するネイティブ依存を使ってください。文書化された互換性のあるJS・ネイティブ依存セットを使用します。これらは旧`workers-capacitor@0.1.1`には含まれません。両ホストとも30秒後に未完了の起動を検出します。同じランタイムとビルドツールを再利用するため、以下のAPI・フレームワーク制限を維持します。プラットフォームの動作は[埋め込み設定とライフサイクル](native-embedding.md)、ホストごとの根拠は[検証範囲](native-embedding.md#verification)を参照してください。

## Node.js

Node全体の互換性は未完成です。モジュールのインポートに成功しても、メソッド、検証、状態、スケジューリング、エンジンの動作が同等であるとは確認できません。

既存の契約テストに合格するモジュールも含め、モジュール全体の状態は引き続き**進行中**です。リリース検証は実装済みのシナリオを対象とし、未検証の操作を認定するものではありません。以下の未実装API、既知の差異、未検証の操作範囲は、リリース後も未完了の課題として残ります。

| 領域 | 動作と制限 |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | 固定したWorkersプロファイルを実装します。Workersのstubはstubのままです。例えばmatchesGlobは固定したバージョンの拒否動作を再現します。 |
| HTTPとnet | インメモリのサーバーディスパッチです。OSで待ち受けるサーバーはありません。外向きTCP/TLSにはネイティブトランスポートが必要です。 |
| fs / fs/promises | 読み取り専用の埋め込みファイルに加え、リクエスト内だけで有効なインメモリの`/tmp`を提供し、書き込み、ディスクリプター、FileHandle操作に対応します。Workersと同様にwatchは未対応です。ファイルシステム全体のセマンティクスは引き続き監査中です。 |
| module | 限定的なbuiltin registryです。createRequireはVFSのJSONだけを読み込みます。実行可能モジュールはバンドルする必要があり、任意の動的解決は未対応です。 |
| process, console, util / util/types / sys | processは設定、環境ファイルの読み込み、標準ストリームを含みます。abort/reallyExit/getBuiltinModuleは未実装です。エンジンのintrospection、call site、host objectの検出はWorkersと同等ではありません。 |
| cryptoとzlib | 選択されたプロファイルはrandom/Hash/HMAC/PBKDF2/HKDF/scrypt、共通鍵・非対称鍵、署名、素数、Brotli/Zstdストリーミングを扱います。X509Certificateの解析、フィールド、チェックは固定したWorkersの制限に合わせて実装しています。追加アルゴリズムや暗号・codecの完全な同等性には未対応の部分が残ります。 |
| TLSとHTTP内部 | 直接TLSとSTARTTLSは認証付きのネイティブトランスポートを使い、close_notifyと途中で切れた接続を区別します。STARTTLSはWorkersの早期secureConnect通知を公開しますが、アプリケーションのI/Oは証明書認証が終わるまで待ちます。クラス・状態全体の受け入れ検証は未完了です。 |
| WebSocket | 独自実装のWebSocketとWebSocketPairは、ネイティブWS/WSS、accept、close、圧縮、attachmentを実装します。attachmentのサイズ計算には、対象を明示したエンジン表現上の境界があります。API全体の受け入れ検証は未完了です。 |
| Streams | 独自実装が全ホストでバイトストリームと、テスト済みのWorkersのteeキャンセル・pipeTo中止動作を提供します。モジュール全体の受け入れ検証は未完了です。 |
| async_hooks | ビルド変換されたasync関数はスコープ付きstoreを維持します。未変換のネイティブasyncコールバックは拒否します。任意の動的コードとリクエスト発生元の分離は完全には対応していません。 |
| diagnostics_channel | 同期的なchannel/store契約を実装します。非同期の伝播はasync-hooksの制限に依存します。 |
| worker_threads | WorkersのstubとローカルMessagePortの動作であり、Nodeのthreadではありません。trusted-event branding、host objectのシリアライズ、グローバルの同一性は異なります。 |
| DNS | DNS-over-HTTPS実装です。Service Binding/Hyperdriveの合成アドレスoverrideは未実装です。 |
| events | [WebView events profile](../src/compat/events/README.md): EventEmitter、abort・反復処理のヘルパー、変換済みAsyncResourceの伝播、process warningの配信。ネイティブasyncとV8 inspectionには制限が残ります。 |
| その他のモジュール | 実装と共有契約はありますが、モジュール全体の受け入れ検証は未完了です。namespaceが一致するだけでは不十分です。 |

[WebSocketのattachmentの境界](../src/browser/websocket/README.md)は、エンジン内部の非公開表現に依存するシリアライズ後のサイズにだけ適用されます。対応する値、スナップショットの分離、通常のサイズ制限、TLS認証、ネットワーク動作を免除するものではありません。

不足・余分なexportの正確な基準は、[固定したexport](../demo/tests/experiments/node-compat/exports.json)に対する[surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json)で管理します。これらのファイルが正本であり、このガイドにexport一覧を重複して載せません。確認するには`npm run build`の後、`npm run test:node-inventory --prefix demo`を実行します。動作契約は`src/compat`の各実装の隣にあります。

### 完成度の評価

インポート監査は、export名とそのJavaScriptの型を固定したWorkersプロファイルと比較します。監査の成功は新たな公開APIの退行がないことを意味し、モジュール全体の互換性を証明しません。特に、関数をオブジェクトに置き換えると、export名が変わらなくても退行として検出します。

`npm run build`の後に`npm run test:node-completion --prefix demo`を実行し、`demo/artifacts/node-inventory/completion.json`を再生成します。レポートはChromiumとWebKitの両方で固定対象の全モジュールを扱い、公開APIの不足と、公開APIは一致しているが認定されていないモジュールを区別し、根拠への参照とともに次の調査を記録します。エンジン、モジュール、型監査データが不足している場合やプロファイルが一致しない場合は生成に失敗します。任意のレポートフラグ`--require-complete`は公開APIの表面だけの根拠を拒否します。このフラグによってレポート生成を互換性認定として扱ってはいけません。

残る作業には異なる原因があります。

- **実装の不足:** `crypto`、`zlib`、残る仮想ファイルシステムのセマンティクスには、操作単位の実装と検証が必要です。未実装であることは技術的に不可能である証拠ではありません。
- **動作の不足:** ストリームのライフサイクルや合成DNSの残る動作には、正しい名前をexportするだけでなく、専用のアダプターと契約が必要です。
- **エンジンの境界:** proxy/promiseのintrospection、ネイティブasyncの継続hook、信頼済みMessagePortのbrandingには観測可能な差異があります。ビルド時変換やネイティブブリッジには、明示的な範囲と個別の検証が必要です。
- **Workersのstub:** 固定したランタイムの実際のno-op・拒否動作を維持します。Nodeに存在するという理由だけでデスクトップNodeの機能を実装しないでください。
- **検証の不足:** exportの表面が一致していても、完成と呼ぶにはモジュール全体の操作・prototypeの網羅とネイティブ受け入れ検証が必要です。

codecオプションのgetterは、ネイティブ処理の前に入力や辞書を変更できます。この通常の変更は維持します。サイズ変更可能なArrayBufferと拡張可能なSharedArrayBufferのviewは、Workersと同様に変換時にスナップショットを取得します。オプションgetterから転送される固定長ArrayBufferは、より限定的なエンジン上の境界です。Workersは切り離し後もネイティブのbacking storeを保持できますが、JavaScriptでは転送直前の変更を復元できません。ローカルの高速codecは、空データを黙って圧縮するのではなく、このケースを`TypeError`で拒否します。オプションgetterから入力や辞書のバッファーを転送しないでください。この制限は、他のcodecオプションやライフサイクル動作を免除しません。

反例の確認には`npm run test:node-boundaries --prefix demo`を、Workers eventsの基準と実装の確認には`npm run test:events --prefix demo`を実行します。`node:events`は[WebView events profile](../src/compat/events/README.md)を経由し、process warningの配信とmicrotaskのスケジューリングをそのアダプターと共有します。テストは、ページ内とDedicated Workersで通常のVite/esbuildインポートを比較します。エンジンのinspectionと未変換のnative-asyncの境界は明示したままです。このプロファイルとの一致は、Workers/Nodeの全モジュールを認定するものではありません。

[追加の互換性プロファイル](../src/compat/expansion/README.md)は、consoleのstub、sys/utilのalias、選択されたcrypto操作、リクエスト内だけで有効な`/tmp`、共通鍵型のKeyObject、Brotli/Zstd/CRC32、ファイルシステムのメタデータ、ストリームのキャンセル、モジュールのメタデータ、HTTPヘルパーを扱います。固定したWorkersバージョンとのライブ差分テストには`npm run test:node-expansion --prefix demo`を実行します。CIは既存のeventsスイートと併せてこれらを実行します。ネイティブ検証では、`npm run test:events:native:prepare --prefix demo`でインストール済み利用側を準備し、`npm run test:node-expansion:native --prefix demo -- ios <simulator-uuid>`または`npm run test:node-expansion:native --prefix demo -- android <emulator-serial>`を実行します。ネイティブレポートは、`demo/artifacts/node-inventory/native-expansion/`配下に候補のハッシュとインストールしたtarballの識別情報を含みます。

Workers で機能しないモジュールが端末機能を得るわけではありません。VM isolate、プロセス生成、V8 heap へのアクセス、UDP socket、OS terminal は提供しません。`node:test` が公開するのは Workers の mock API であり、Node の完全なテスト runner ではありません。

## Workers API とバインディング

- `passThroughOnException`、ローカル WorkerEntrypoint / RPC、Cache API、HTMLRewriter は未対応です。scheduled / queue / workflow のライフサイクルはローカルでシミュレートしません。
- `cloudflare:workers` は部分的な実装です。分離 dispatcher は realm 全体の `env` proxy を更新します。direct 実行では値を設定しません。リクエスト単位ではなく、最初の dispatch 前には値がありません。Fetch Handler の引数を優先してください。DurableObject はコンストラクターの外枠であり、ローカルの Durable Objects ランタイムではありません。
- `Request.cf` は渡された値を保持しますが、Cloudflare のメタデータは生成しません。
- [ローカル KV](kv.md) はクラウドレプリケーションや binding RPC なしで端末ストレージを使います。
- D1、Hyperdrive、R2、Service Bindings、Queue producer、[その他のクラウドサービス](cloudflare-bindings.md)は、デプロイ済み Worker の HTTP ハンドラーを通じてリモートで実行します。サービスのローカル実装ではありません。ローカル ASSETS は未対応です。明示的なリモートアセットポリシーを使ってください。

## ネイティブネットワーク

HTTP/1.1 の framing、リダイレクト、レスポンス解析は JavaScript / Wasm で実行します。ネイティブコードは TCP / TLS と WebView のライフサイクル hook を提供します。HTTP リクエストごとに `Connection: close` の接続を使い、送信後の暗黙のリトライはありません。

- HTTPS は Content-Length または chunked framing を必要とします。バイトブリッジは認証済みの接続終了と切断による欠落を区別できないため、EOF 区切りの HTTPS は拒否します。通常の HTTP は EOF framing に対応します。
- trailer は解析しますが、Fetch レスポンスヘッダーとしては公開しません。この HTTP/1.1 トランスポートでは、HTTP/2、protocol upgrade、CONNECT は未対応です。
- socket の読み書きは 64 KiB が上限です。ヘッダーテキストは informational / final header と trailer を合わせて 64 KiB に制限します。読み取りは消費側の需要に従います。
- ブラウザ実行では、ブラウザの CORS / header / cookie 制約を維持します。ネイティブトランスポートはブラウザ相当の SameSite / CSRF 保護を保証しません。
- OS の終了はバックグラウンド処理を停止する可能性があります。一部のシナリオは実機を対象にしていますが、アプリケーションの端末上の動作、WebView のクラッシュ復旧、メモリ圧迫には別の検証が必要です。

## ドキュメントレンダリング

リモート HTML はアプリローカルのオリジン（iOS は `capacitor://localhost`、Android 埋め込みは `https://workers-sdk.local`、Capacitor Android は通常 `https://localhost`）で描画します。リモート実行はサーバーコードとクラウドサービスを Worker に残しますが、WebView をそのサイトのオリジンにしたり、すべてのブラウザー認証機能を提供したりしません。HTML の成功だけでなく、ハイドレーションと操作も確認してください。

### アプリケーション統合の制限

| 機能 | 現在の境界 | 連携ガイド |
| --- | --- | --- |
| クライアント base URL を推論する Better Auth | 固定版 flare-stack-blog は Better Auth が `capacitor://localhost` を拒否するため iOS のクライアント初期化に失敗。Android の HTTP(S) はこの拒否に該当しない。 | HTTPS 認証エンドポイントの明示で初期化するが、ログイン・Cookie 全体は未検証。この設定だけで移行完了とはしない。[再現](../demo/tests/upstream/flare-stack-blog/README.md)。 |
| Passkeys / WebAuthn と PRF | pknotes のネイティブパスキー登録は検証した両環境で失敗。Chromium 仮想認証器の成功はネイティブ対応の根拠にならない。 | ネイティブ認証情報連携、アプリ・ドメイン関連付け、PRF は個別検証が必要。リモート描画で relying-party のオリジン検証は回避できない。対応は保留で、技術的に不可能と証明したものではない。[認証境界](../demo/tests/upstream/pknotes/README.md)。 |
| Void React Pages | Void / @void/react 1.1.12 はリモート D1 と明示許可した公開 GET（SSR・ハイドレーションを含む）を iOS シミュレーターと Android エミュレーターで検証。他の Void フレームワークと Worker 全体ローカル実行は未検証。 | iOS カスタムスキーム遷移には 1.1.12 以降を使用。[連携と検証範囲](void.md)。 |
| 外部ブラウザー OAuth | 実機 iPhone を含め、人工的なローカル・公開 HTTPS 発行元、PKCE、コールバック、セッション交換を検証。実プロバイダー方針、refresh token 保存、コールドスタート再開は対象外。 | 利用可能なら公式ネイティブ SDK を使用。システムブラウザーの Cookie は WebView と自動共有しない。[認証例](../demo/authentication/README.md)。 |
| Analytics Engine などクラウド専用サービス | Analytics Engine は Cloudflare で実行し、ローカルデータセットはない。Counterscale のライブ検証には設定済みアカウント、イベント、読み取りトークンが必要。 | 特権トークンはバックエンドに置き、端末要求を認証する。標準 CI 認証テストはライブ分析を実行しない。[Counterscale 設定](../demo/tests/upstream/counterscale/README.md)。 |
| 画像最適化と端末性能 | OpenNext はローカル workerd とデプロイ済み Cloudflare IMAGES、実機 iPhone 描画を検証。性能は単発 Debug 測定で実機 iOS メモリーは未計測。 | 本番画像設定を検証し、性能を主張する前に実機の Release 起動・メモリーを測定。[OpenNext の未検証範囲](opennext.md#current-gaps)。 |

固定したサードパーティフィクスチャは、アプリケーションのソースを編集せず特定のユーザーフローを検証するもので、すべての機能や将来のバージョンを認定するものではありません。多くはリモート backend として HTTPS 配下のローカル workerd を使います。live Analytics Engine と OpenNext の公開 HTTPS の D1 / Images シナリオは、明示的に設定した例外です。本番統合で結果を根拠にする前に、[シナリオの範囲](../demo/tests/README.md#application-acceptance)を確認してください。

ナビゲーション、フォームアップロード、リダイレクト、信頼、寿命の制限は[ネイティブドキュメント描画](native-rendering-api.md#scope-and-limits)を参照してください。ブラウザー Service Worker 比較では、WebKit の再生 POST 本文の消失と合成リダイレクトの `redirected: false` を明示的に期待します。他のアサーションは必須です。これらはブラウザー制限の記録で、対応動作ではありません。iOS は別のネイティブスキームブリッジを使います。ブラウザー結果は iOS/Android 検証の代わりになりません。
