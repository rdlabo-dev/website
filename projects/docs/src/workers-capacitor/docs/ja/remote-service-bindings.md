---
title: "リモートサービスバインディングのディスパッチ"
sourceRevision: "101b624d8788fd720d0346e4dc7acf162de1d7c9c250488a5b5b0fd405d69baa"
headingAliases: {"unit-and-status":"%E6%A4%9C%E8%A8%BC%E5%8D%98%E4%BD%8D%E3%81%A8%E7%8A%B6%E6%85%8B","configuration":"%E8%A8%AD%E5%AE%9A","uploads-and-memory":"%E3%82%A2%E3%83%83%E3%83%97%E3%83%AD%E3%83%BC%E3%83%89%E3%81%A8%E3%83%A1%E3%83%A2%E3%83%AA","security-and-semantics":"%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E3%81%A8%E5%8B%95%E4%BD%9C%E3%81%AE%E6%84%8F%E5%91%B3","verification":"%E6%A4%9C%E8%A8%BC","platform-references":"%E3%83%97%E3%83%A9%E3%83%83%E3%83%88%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%81%AE%E5%8F%82%E8%80%83%E8%B3%87%E6%96%99"}
---
## 検証単位と状態

検証単位は、既存の Worker の fetch ハンドラーが R2、remote 設定の KV、Service Bindings、Queue producer を使う場合に、ビルドが生成する HTTP ディスパッチです。KV のみのリクエストはバインディングの実行ポリシーに従います。リモートバインディングのメソッドは、デプロイ済み Worker 内で変更せずに実行します。Capacitor にローカル R2、KV 同期、クライアントの RPC proxy、Queue consumer をインストールするものではありません。

workerd 統合の基準は Miniflare `5.20261012.0-beta`、compatibility date `2026-10-01` です。ブラウザ統合は補足的な証拠であり、ネイティブトランスポートの認定ではありません。

Durable Objects、AI、Workflows、汎用リモート名、アセット実行ポリシーについては[追加の Cloudflare バインディングとリモート ASSETS](cloudflare-bindings.md)を参照してください。

## 設定

Vite または esbuild プラグインで、既存の Worker エントリーと Wrangler 設定を使います。

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  kvExecution: { SETTINGS: "local", SHARED: "remote" },
});
```

コンパイラーは名前付き Wrangler 環境も含め、`r2_buckets[].binding`、`kv_namespaces[].binding`、`services[].binding`、`queues.producers[].binding` を検出します。JSON、JSONC、TOML に対応しています。既存の D1 と Hyperdrive のバインディングも引き続きサポートします。ビルド解析に入るのは名前だけであり、リソース ID、認証情報、接続文字列は実行時のクライアント設定になりません。

標準と異なる場所の設定には `workerConfig` を指定します。明示的な `r2Bindings`、`kvBindings`、`serviceBindings`、`queueBindings` の配列は、それぞれ該当する種類の検出だけを上書きします。検出した（または明示的に列挙した）すべての KV 名に対して `kvExecution` を `local` または `remote` に設定してください。ポリシーの欠落、不明な名前、無効な値はビルドを失敗させます。KV 実行に暗黙のデフォルトはありません。`kvBindings` が名前を列挙し、`kvExecution` が実行場所を選びます。R2、Service Bindings、Queue producer、D1、Hyperdrive はサーバーが必要です。KV とサーバーバインディングで同じ名前を共有する場合、その名前はサーバー専用のままです。

実行場所が使うバインディングのインスタンスを決めます。

- バインディングを `local` に設定した KV のみのルートは、ランタイムの `env` を使います。
- `remote` の KV バインディングを一つでも使う KV のみのルートは、既存の Worker にディスパッチします。そのリクエストのすべての操作はリモート環境を使います。
- R2 と KV を使うルートは一つのリクエストとしてディスパッチします。両バインディングは元の Worker で実行し、クラウド KV を使います。ハンドラーの一部をローカルで実行することはありません。
- 保守的に Worker 全体へフォールバックした場合、KV のみのルートも含めすべてリモートで実行します。その判断をビルドレポートで確認してください。

ローカル KV は既存の feature API で提供し、Wrangler と同じバインディング名を使います。ビルドが検出するのは名前であり、端末のストレージインスタンスではありません。`env` の設定がなくても、黙ってクラウド KV に切り替わることはありません。クラウド / 端末の同期もありません。明示的に渡すその他のローカルバインディングには引き続き `localBindings` を使えます。KV は代わりに `kvExecution` を使います。remote KV の名前を `localBindings` に宣言するとビルドエラーになります。`local` ポリシーはローカル実行を許可しますが、他のサーバー依存や Worker 全体のフォールバックを上書きしません。

```ts
import { openFeature } from "workers-capacitor/shared/contracts";
import { LocalStorageKV } from "workers-capacitor/cloudflare/bindings/kv";
const kv = await openFeature(new LocalStorageKV("my-app-settings"));
// workersCapacitor に env: { SETTINGS: kv.api } を渡します。SETTINGS は Wrangler の名前と一致させてください。
// 終了時: await runtime.dispose(); await kv.dispose();
```

メソッドを持つバインディングは `prefer: "worker"` でも direct 実行を使います。これは既存の[ローカル KV 実行契約](kv.md)であり、Dedicated Worker への binding RPC ではありません。リモートリクエストは引き続きローカル実行の前に選ばれ、デプロイ済み Worker 自身のバインディングを使います。ローカルの `env` インスタンスは使いません。

```ts
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  prefer: "worker", // メソッドを持つローカル env は direct 実行を選びます
  env: { SETTINGS: kv.api }, // Wrangler で宣言したバインディング名を使用します
  remote: {
    origin: "https://your-existing-worker.example",
    getToken: () => existingSession.accessToken,
    maxBufferedBodyBytes: 8 * 1024 * 1024,
  },
});
```

選ばれたリクエストは、ローカル実行前に元のパス、クエリ、メソッド、本文を保持してこのオリジンへ送られます。安全で無関係なルートはローカルに残ります。安全に分割できると確認できなければ、Worker 全体をリモートにディスパッチします。その判断は `workers-capacitor-server.json` で確認してください。Wrangler の Queue consumer 設定がある場合は、consumer 専用プロジェクトも含め、Worker 全体のディスパッチを強制します。queue handler はサーバーに残す必要があります。アプリ内で Queue 配信を開始することはありません。

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
