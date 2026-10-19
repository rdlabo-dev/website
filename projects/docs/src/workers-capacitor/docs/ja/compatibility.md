---
title: "互換性と制限"
sourceRevision: "12d713df68d891cc7da6cca41b2c0644441d8017087e7642241f9053124875f6"
headingAliases: {"workers-apis-and-bindings":"workers-api-%E3%81%A8%E3%83%90%E3%82%A4%E3%83%B3%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0","native-networking":"%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF","document-rendering":"%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88%E3%83%AC%E3%83%B3%E3%83%80%E3%83%AA%E3%83%B3%E3%82%B0","application-integration-limits":"%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E7%B5%B1%E5%90%88%E3%81%AE%E5%88%B6%E9%99%90"}
---
対象は Cloudflare Workers であり、単独の Node.js プロセスではありません。Node プロファイルは workerd `1.20261012.1`、compatibility date `2026-10-17` を追加フラグなしで使います。他の日付やフラグはこのプロファイルの対象外です。WebView は workerd や V8 を含みません。iOS は独自の JavaScript エンジンを使います。

0.1.0 Preview は、[バージョン固有のリリース例外](../CONTRIBUTING.md#010-preview-exception)に基づき、下記の制限付きで既存の互換実装を含みます。含まれていることは、Workers や Node.js との完全な互換性を主張するものではありません。

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

リモート HTML はアプリローカルのオリジン（iOS は `capacitor://localhost`、Android は通常 `https://localhost`）で描画します。リモート実行はサーバーコードとクラウドサービスを Worker に残しますが、WebView をそのサイトのオリジンに変えたり、ブラウザのすべての認証機能を提供したりはしません。HTML レスポンスの成功だけでなく、ハイドレーションと対話コントロールを確認してください。

### アプリケーション統合の制限

| 機能 | 現在の境界 | 統合時の注意 |
| --- | --- | --- |
| クライアントの base URL を推測する Better Auth | 固定した flare-stack-blog アプリケーションは、Better Auth が `capacitor://localhost` を拒否するため iOS でクライアント初期化に失敗します。Android の HTTP(S) オリジンはこの拒否に該当しません。 | 明示的な HTTPS 認証エンドポイントならクライアントを初期化できますが、完全な login / cookie フローはここでは未検証です。その設定だけで移行が完了すると考えないでください。[再現例](../demo/tests/upstream/flare-stack-blog/README.md)を参照してください。 |
| Passkeys / WebAuthn と PRF | pknotes のネイティブ passkey 登録は、検証した両プラットフォームで失敗します。Chromium の仮想 authenticator の受け入れ成功はネイティブサポートを示しません。 | ネイティブ認証情報統合、app / domain association、PRF の利用可能性は別途検証が必要です。リモートレンダリングで relying-party のオリジン確認を迂回することはできません。ネイティブ対応は延期しているもので、技術的に不可能と証明したわけではありません。[認証の境界](../demo/tests/upstream/pknotes/README.md)を参照してください。 |
| Void React Pages | React Pages + D1 のリモート実行は、公開済み Void / @void/react 1.1.12 を用いて iOS シミュレーターと Android エミュレーターで検証しています。他の Void フレームワークとローカル実行は未検証です。 | iOS の custom-scheme navigation には 1.1.12 以降を使ってください。[Void 統合と検証範囲](void.md)を参照してください。 |
| 外部ブラウザ OAuth | サンプルは、模擬のローカル / 公開 HTTPS テスト issuer、PKCE、callback 処理、session exchange を、実機の iPhone も含めて検証します。実際の provider policy、refresh token の保存、cold-start resume は対象外です。 | 利用可能なら provider の native SDK を使ってください。system browser の Cookie は WebView と自動共有されません。[認証サンプル](../demo/authentication/README.md)を参照してください。 |
| Analytics Engine とその他のクラウド専用サービス | Analytics Engine は Cloudflare で実行し、ローカル dataset 実装はありません。Counterscale の live scenario には、準備済みのアカウント、イベント、analytics read token が必要です。 | 特権トークンは backend に維持し、端末のリクエストを認証してください。デフォルトの CI 認証シナリオは live analytics を検証しません。[Counterscale 設定](../demo/tests/upstream/counterscale/README.md)を参照してください。 |
| 画像最適化と端末性能 | OpenNext フィクスチャはローカル workerd とデプロイ済み Cloudflare IMAGES を対象とし、実機 iPhone でのレンダリングも含みます。性能サンプルは Debug の単一実行であり、実機 iOS のメモリは未測定です。 | 本番の画像設定を検証し、性能を主張する前に実機の release ビルドで起動とメモリを測定してください。[OpenNext の未対応事項](opennext.md#current-gaps)を参照してください。 |

固定したサードパーティフィクスチャは、アプリケーションのソースを編集せず特定のユーザーフローを検証するもので、すべての機能や将来のバージョンを認定するものではありません。多くはリモート backend として HTTPS 配下のローカル workerd を使います。live Analytics Engine と OpenNext の公開 HTTPS の D1 / Images シナリオは、明示的に設定した例外です。本番統合で結果を根拠にする前に、[シナリオの範囲](../demo/tests/README.md#application-acceptance)を確認してください。

ナビゲーション、フォームアップロード、リダイレクト、信頼、ライフサイクルの制限は[ネイティブドキュメントレンダリング](native-rendering-api.md#scope-and-limits)を参照してください。ブラウザの Service Worker 比較には、POST の再送とリダイレクトメタデータに関する、想定内の WebKit の 6 件の失敗が含まれます。iOS は別のネイティブ scheme bridge を使います。ブラウザの結果は iOS / Android 検証の代わりにはなりません。
