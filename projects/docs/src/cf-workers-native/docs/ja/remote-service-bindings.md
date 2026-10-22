---
title: "リモートサービスバインディングのディスパッチ"
---

# リモートサービスバインディングのディスパッチ

## 検証単位と状態

単位は、R2、リモート KV、Service Bindings、Queue producer を使う既存 Worker の fetch ハンドラーへの、ビルドで生成する HTTP ディスパッチです。KV のみの要求がローカルストレージを使うのは、そのルートがローカル選択され、バインディング方針もローカルの場合だけです。リモートメソッドは既存 Worker 内で変更なく実行します。Capacitor にローカル R2、KV 同期、クライアント RPC プロキシ、queue consumer を導入するものではありません。

workerd 統合の基準は Miniflare `5.20261012.0-beta`、compatibility date `2026-10-01` です。ブラウザ統合は補足的な証拠であり、ネイティブトランスポートの認定ではありません。

Durable Objects、AI、Workflows、汎用リモート名、アセット実行ポリシーについては[追加の Cloudflare バインディングとリモート ASSETS](cloudflare-bindings.md)を参照してください。

## 設定

Vite または esbuild プラグインで、既存の Worker エントリーと Wrangler 設定を使います。

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [{ method: "*", path: "/settings/*" }],
  kvExecution: { SETTINGS: "local", SHARED: "remote" },
});
```

例は実装と保持依存を端末へ配布できる既存の `/settings/` 登録を想定します。アプリに合わせて選択してください。[実行設定](cloudflare-bindings.md#choosing-execution)を参照します。

コンパイラーは名前付き Wrangler 環境も含め、`r2_buckets[].binding`、`kv_namespaces[].binding`、`services[].binding`、`queues.producers[].binding` を検出します。JSON、JSONC、TOML に対応しています。既存の D1 と Hyperdrive のバインディングも引き続きサポートします。ビルド解析に入るのは名前だけであり、リソース ID、認証情報、接続文字列は実行時のクライアント設定になりません。

標準外の設定位置には `workerConfig` を指定します。明示的な `r2Bindings`、`kvBindings`、`serviceBindings`、`queueBindings` はそれぞれの種類だけ検出を上書きします。ルート配列・Worker 全体ローカルでは、検出・明示した全 KV 名の `kvExecution` を `local`・`remote` に設定します。不足・未知名・不正値はビルド失敗です。既定 network は全要求をリモートに維持し、KV 方針もリモートが既定です。`kvBindings` は名前、`kvExecution` は実行場所を指定します。R2、Service Bindings、Queue producer、D1、Hyperdrive はサーバー必須です。KV とサーバーバインディングが同じ名前ならサーバー専用のままです。

実行場所が使うバインディングのインスタンスを決めます。

- 明示選択されローカル実行可能で、バインディングが `local` の KV 専用ルートはランタイムの `env` を使います。未選択はリモートです。
- `remote` KV を 1 つでも使う KV 専用ルートは既存 Worker へ送り、要求内の全操作をリモート環境で行います。
- R2 と KV を使うルートは要求単位で送り、両方を元の Worker とクラウド KV で実行します。一部だけローカルでは実行しません。
- 保守的な Worker 全体のフォールバックは KV 専用も含め全ルートをリモートにします。判断はレポートで確認します。

ローカル KV は既存の feature API で提供し、Wrangler と同じバインディング名を使います。ビルドが検出するのは名前であり、端末のストレージインスタンスではありません。`env` の設定がなくても、黙ってクラウド KV に切り替わることはありません。クラウド / 端末の同期もありません。明示的に渡すその他のローカルバインディングには引き続き `localBindings` を使えます。KV は代わりに `kvExecution` を使います。remote KV の名前を `localBindings` に宣言するとビルドエラーになります。`local` ポリシーはローカル実行を許可しますが、他のサーバー依存や Worker 全体のフォールバックを上書きしません。

```ts
import { openFeature } from "cf-workers-native/shared/contracts";
import { LocalStorageKV } from "cf-workers-native/cloudflare/bindings/kv";
const kv = await openFeature(new LocalStorageKV("my-app-settings"));
// workersCapacitor に env: { SETTINGS: kv.api } を渡します。SETTINGS は Wrangler の名前に合わせます。
// 終了時: await runtime.dispose(); await kv.dispose();
```

メソッドを持つバインディングは `prefer: "worker"` でも direct 実行を使います。これは既存の[ローカル KV 実行契約](kv.md)であり、Dedicated Worker への binding RPC ではありません。リモートリクエストは引き続きローカル実行の前に選ばれ、デプロイ済み Worker 自身のバインディングを使います。ローカルの `env` インスタンスは使いません。

```ts
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  prefer: "worker", // 関数を含むローカル env は direct 実行を選択します
  env: { SETTINGS: kv.api }, // Wrangler で宣言したバインディング名を使います
  remote: {
    origin: "https://your-existing-worker.example",
    getToken: () => existingSession.accessToken,
    maxBufferedBodyBytes: 8 * 1024 * 1024,
  },
});
```

選択した要求はローカル実行前に、元のパス、クエリー、メソッド、本文でこのオリジンへ送ります。明示許可した独立ルートはローカルに残る場合があります。安全な分割を証明できなければ全体をリモートにします。`workers-capacitor-server.json` を確認してください。Wrangler の Queue consumer 設定は consumer 専用を含め全体ディスパッチを強制します。queue ハンドラーはサーバーに残り、アプリ内で配信を開始しません。

## アップロードとメモリ

ブラウザのアップロードとネイティブの redirect-follow リクエストは、デフォルトで最大 8 MiB をバッファリングします。`maxBufferedBodyBytes` はバイト単位の非負の安全な整数を受け付け、ゼロは空の本文だけを許可します。上限を超えるストリームはキャンセルし、トランスポートのディスパッチ前に拒否します。バッファリングするバイトは、上限付きで拡張するストレージにコピーし、入力チャンクの、より大きい可能性がある backing buffer を保持しません。ネイティブの manual / error リダイレクトモードは再送用のバッファリングではなくストリーミングを使います。

この上限は、このトランスポートのバッファーを制限するもので、アプリ全体のメモリ、同時リクエスト、呼び出し側が確保した blob、Dedicated Worker ブリッジを制限するものではありません。本文を確保する前にアプリケーションでサイズと並行数を制限してください。大きな R2 オブジェクトには既存の Worker に multipart エンドポイントを実装し、個々のリクエストを上限内に収めます。アダプターはアップロードの自動分割、失敗した書き込みの再試行、放棄した multipart セッションの abort、abort したリクエストの効果の取り消しを行いません。

## セキュリティと動作の意味

認証、tenant / object の所有権、検証、レート制限、許可する操作はデプロイ済み Worker に維持してください。クライアントの selector は最適化とコード分離の仕組みであり、認可境界ではありません。バインディングアクセスと RPC はその Worker 内に残ります。この機能は汎用の公開 binding / RPC エンドポイントを作りません。Service RPC は既存の HTTP ハンドラーが既存の権限で呼び出します。

ネイティブ Cookie とリダイレクトは共通トランスポートを使います。CSRF チェックを維持してください。マッピングした Origin / Referer の値だけでは信頼できる意図を確認できず、HttpOnly も侵害されたアプリのスクリプトが認証済みリクエストを送ることを防ぎません。[D1 のセキュリティ契約](d1-transparent-migration.md#shared-transport-security-and-upload-limits)を参照してください。

クラウド KV はクラウドの整合性モデルを維持します。Queues は at-least-once 配信を維持するため、consumer は重複メッセージを冪等に処理する必要があります。enqueue の HTTP レスポンスが成功しても、後続の処理が完了したことを意味しません。ネットワーク障害やキャンセルは、書き込み / enqueue が起こらなかった証明にはなりません。クライアントは自動リトライやオフラインの書き込みキューを追加しません。

## 検証

`npm run build`、`npm test` の後、`demo` で `npm run test:service-bindings` を実行します。最後のコマンドは、実際の workerd R2 bucket、KV namespace、HTTP / RPC サービス、Queue consumer を、Chromium / WebKit、Vite / esbuild、direct / Dedicated Worker 実行で、選択的ビルドと Worker 全体のビルドの両方（16 通り）で検証します。サーバーの状態、R2 の range / condition / HEAD / multipart / delete、KV メタデータ、Service HTTP / RPC、Queue send / batch delivery、認可拒否、送信前のアップロード制限、オフラインのローカルルート、クライアント成果物からの除外を確認します。結果は `demo/artifacts/service-bindings/report.json` に出力します。

これらのブラウザ実行は HTTPS リクエストをローカル workerd へインターセプトします。Vite の開発時起動では、direct / Worker モードのローカルおよび HTTP / RPC ルートも検証します。

既存のネイティブ harness で再現します。

```sh
node demo/tests/experiments/d1/native-server.mjs --services
# サーバー実行中に別のターミナルで実行:
node demo/tests/experiments/d1/native-prepare.mjs --services
node demo/tests/experiments/d1/native-run.mjs ios <simulator-id> --services
node demo/tests/experiments/d1/native-run.mjs android <emulator-id> --services
```

既存の services-native 利用側では `--refresh` を使うと、新しい tarball をインストールしながらネイティブビルドディレクトリを再利用できます。harness は D1 テストの app ID を再利用するため、同じ端末で D1 とサービスのネイティブテストを同時実行しないでください。

## プラットフォームの参考資料

- [Wrangler 設定](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [クラウド KV の動作](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Service HTTP](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/)
- [Service RPC](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- [Queue の配信保証](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
