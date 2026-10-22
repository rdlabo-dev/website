---
title: "互換性と制限"
---

# 互換性と制限

対象は Cloudflare Workers であり、単独の Node.js プロセスではありません。Node プロファイルは workerd `1.20261012.1`、compatibility date `2026-10-17` を追加フラグなしで使います。他の日付やフラグはこのプロファイルの対象外です。WebView は workerd や V8 を含みません。iOS は独自の JavaScript エンジンを使います。

旧 `workers-capacitor` の 0.1.0 Preview と明示的に承認された 0.1.1 Preview は、[バージョン固有のリリース例外](../CONTRIBUTING.md#010-preview-exception)に基づき、以下の制限を伴う既存の互換実装を含みます。明示的に承認された `cf-workers-native@0.1.2` Preview も[リリース例外](../CONTRIBUTING.md#012-preview-follow-up)に基づき記載の制限を維持します。収録は Workers や Node.js の完全互換を意味しません。

## ネイティブホスト

| ホスト | 範囲 |
| --- | --- |
| iOS 埋め込み | UIKit/SwiftUI 向け 0.1.2 Preview の `WorkersIOS` SwiftPM product。UIKit コントローラーを取り除く前に close が必要。SwiftUI の dismantling は自動で閉じる。 |
| Android 埋め込み | ローカル Maven SDK 配布。公開 Maven リリースはなし。WebView の `MULTI_PROFILE` が必須。SDK 画面は同時に 1 つで、永続 SDK Cookie をホストの Cookie から分離。 |
| Capacitor | 既存の Capacitor 8 連携。8.5.3 で検証。汎用ネイティブプラグインにはこの経路を使用。 |

0.1.2 Preview の npm 名は `cf-workers-native` です。公開後にインストールしてください。埋め込みホストは JS・ネイティブの版の一致が必要で、旧 `workers-capacitor@0.1.1` には含まれません。両方とも 30 秒後に未完了の起動を検出します。同じランタイムとビルドツールを再利用するため、以下の API・フレームワーク制限を維持します。プラットフォームの動作は[埋め込み設定とライフサイクル](native-embedding.md)、ホストごとの根拠は[検証範囲](native-embedding.md#verification)を参照してください。

## Node.js

Node 全体の互換性は未完成です。モジュールのインポートに成功しても、メソッド、検証、状態、スケジューリング、エンジンの動作が同等であるとは確認できません。

| 領域 | 動作と制限 |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | 固定した Workers プロファイルを実装します。Workers の stub は stub のままです。例えば matchesGlob は固定したバージョンの拒否動作を再現します。 |
| HTTP と net | インメモリのサーバーディスパッチです。OS で待ち受けるサーバーはありません。外向き TCP / TLS にはネイティブトランスポートが必要です。 |
| fs / fs/promises | 読み取り専用の埋め込み仮想ファイルです。書き込み、FileHandle、watch、完全なファイルシステムのセマンティクスには対応しません。 |
| module | 限定的な builtin registry です。createRequire は VFS の JSON だけを読み込みます。実行可能モジュールはバンドルする必要があり、任意の動的解決は未対応です。 |
| process, events, console, util / util/types / sys | export や動作に不足があります。エンジンの introspection、call site、host object の検出は Workers と同等ではありません。 |
| crypto と zlib | 依存ライブラリの実装は Workers の全 export、アルゴリズム、鍵、codec を網羅しません。暗号や圧縮の同等性を仮定しないでください。 |
| TLS と HTTP 内部 | node:tls は未完成です。\_http_common、\_http_outgoing、\_http_server、\_tls_wrap、\_stream_wrap は import 監査に失敗します。ネイティブ TLS トランスポートがあることは、Node TLS API 互換性を意味しません。 |
| Streams | host にバイトストリームがない場合、パッケージの fallback が提供します。Workers の tee の cancel reason と pipeTo の abort timing は完全には再現していません。 |
| async_hooks | ビルド変換された async 関数はスコープ付き store を維持します。未変換のネイティブ async コールバックは拒否します。任意の動的コードとリクエストの発生元の分離は完全には対応していません。 |
| diagnostics_channel | 同期的な channel / store 契約を実装します。非同期の伝播は async-hooks の制限に依存します。 |
| worker_threads | Workers の stub とローカル MessagePort の動作であり、Node の thread ではありません。trusted-event branding、host object のシリアライズ、グローバルの同一性は異なります。 |
| DNS | DNS-over-HTTPS 実装です。Service Binding / Hyperdrive の合成アドレス override は未実装です。 |
| その他のモジュール | 実装と共有契約はありますが、モジュール全体の受け入れ検証は未完了です。namespace が一致するだけでは不十分です。 |

不足 / 余分な export の正確な基準は、[固定した export](../demo/tests/experiments/node-compat/exports.json) に対する [surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json) で管理します。これらのファイルが正本であり、このガイドに export 一覧を重複して載せません。確認するには `npm run build` の後、`npm run test:node-inventory --prefix demo` を実行します。動作契約は `src/compat` の各実装の隣にあります。

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
