---
title: "ビルド設定"
sourceRevision: "08294f510fa4d9d608db9bc8a9964cb5c51842fed830c5fe8cca31ff55592e0f"
---

# ビルド設定

まずアプリのフレームワークを選び、iOS、Android、Capacitor の連携に使うビルドツールを設定します。フレームワークのガイドで Worker エントリーと実行境界を確認し、ツールのプラグインでそのエントリーをモバイルアプリへ接続します。既存の Cloudflare ビルドは分離して維持してください。

モバイルビルドには独立した設定と出力ディレクトリーを使います。プラグインはサーバーエントリーとデプロイ設定を読み、入力を変更せずモバイル用のコピーを生成します。Vite は SSR・サーバー環境と Cloudflare Vite プラグインを含む設定を拒否します。両ビルダーは既知のサーバー入力を含む出力先を拒否し、出力内の既存リンクも経由した書き込みを防ぐため拒否します。任意の Cloudflare デプロイディレクトリーを出力先に再利用しないでください。独自のビルドディレクトリーすべてを識別することはできません。OpenNext のルートコンパイルは `.next` と `.open-next` の外にある `node_modules/.cache/workers-capacitor/opennext` の一時ディレクトリーを使います。

このビルド境界により既存の Cloudflare デプロイを維持します。ローカル実行、リモートオリジン、`getToken` などの明示的なクライアント設定は、送信するリクエストと認証方法を制御しますが、サーバーのルート、認可処理、バインディングは変更しません。

## ランタイムエントリーを選ぶ

バンドラープラグインはどのホストでも `workersCapacitorPlugin` です。変わるのはアプリのランタイムインポートだけで、Worker ソースと実行オプションは共通です。

| ホスト | ランタイムのインポート | ネイティブ設定 |
| --- | --- | --- |
| iOS | `cf-workers-native/ios` の `workersIOS` | [UIKit / SwiftUI](native-embedding.md#ios) |
| Android | `cf-workers-native/android` の `workersAndroid` | [既存の Android アプリ](native-embedding.md#android) |
| Capacitor | `cf-workers-native/capacitor` の `workersCapacitor` | [Capacitor アプリ](integration.md) |

`cf-workers-native@0.1.7` と対応するネイティブ依存関係を使います。[依存関係の設定](native-embedding.md#dependency-setup)を参照してください。各ターゲット用のエントリーをビルドし、出力ディレクトリー全体をパッケージに含めます。以下の既存の Capacitor 例は `workersCapacitor` を使いますが、SDK ホストの `workersIOS` と `workersAndroid` にも同じオプションが適用されます。

## フレームワーク

最初のモバイルビルドでは、既定のネットワーク実行を維持し、デプロイ済みWorkerのHTTPS URLを設定してください。未対応のサーバーAPIはWorker側に残せるため、ローカルのpolyfillは不要です。リクエスト送信前にWebViewのオリジンを拒否するクライアントライブラリには、連携方法の変更が必要です。リモートへのディスパッチは、そのクライアント初期化の失敗を修復しません。

ネットワーク実行には接続が必要です。失敗したmutationは自動再実行せず呼び出し側へ通知します。ルート選択はローカルハンドラーの実行前に行い、ローカルでの例外を理由にリモートでリクエストを再試行することはありません。任意のローカルルートを安全に分離できない場合はWorker全体をリモートに保ち、生成されたバインディングレポートを確認します。明示的な`execution: "local"`には専用の対応APIプロファイルが必要であり、このフォールバックは有効になりません。

次の統合にはサンプルと検証結果があります。サポート対象はここに記載した実行経路に限られます。API とアプリケーションの制約は[互換性の制限](compatibility.md)を参照してください。

| フレームワーク | 実行と検証済みの範囲 | 設定 |
| --- | --- | --- |
| Hono | ローカルの Fetch ハンドラーと HTML ページ。ルーティング、フォーム、リクエスト・レスポンスを Hono フィクスチャで検証。クラウド依存の要求はリモートディスパッチ。 | [Hono エントリー](#hono)、[ネイティブ描画の例](../demo/rendering) |
| Workers Express | `cloudflare:node` によるローカル実行。API・HTML 描画フィクスチャ。クラウド依存の要求はリモートディスパッチ。 | [Workers Express エントリー](#workers-express)、[ネイティブ描画の例](../demo/rendering) |
| Void React Pages | リモート Worker で SSR、loader、action、WebView でハイドレーションとフォーム。Void / @void/react 1.1.12 以降を使用。公開済み 1.1.12 は iOS シミュレーターと Android エミュレーターの受け入れテストを通過。 | [Void の設定と検証](void.md) |
| Next.js / OpenNext | 既定は network 実行。対応する生成ビルドでは静的 GET をローカルに選択し、D1、ミドルウェア、Next プロトコルの要求はリモートに維持。バージョンと設定の制限を参照。 | [OpenNext の設定と制限](opennext.md) |

### Hono

アプリケーションの既存の Fetch Handler を接続します。例:

```ts
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.html("<h1>Hello from Hono</h1>"));
app.get("/api/hello", (c) => c.json({ hello: "world" }));
export default app;
```

[Vite](#vite) または [esbuild](#esbuild) プラグインの `worker` オプションにこのエントリーを指定します。Worker がページを所有する場合は `render: "/"` を使い、既存のフロントエンドを API と統合する場合は `render` を省略します。Capacitor の設定、クラウドバインディング、認証については[アプリケーション統合ガイド](integration.md)に従ってください。

既定の `execution: "network"` から始め、`baseURL` にデプロイ済み Worker の HTTPS URL を設定します。`remote.origin` で別のデプロイ先を指定しなければ、そのオリジンを使います。選択した実装の端末への配布を許可するには `execution` にルート配列を指定します。Hono の `/app/*` などに対応します。許可は保持される依存データも含み、検出したサーバー境界は上書きしません。[ローカルルートの選択](cloudflare-bindings.md#selecting-local-routes)を参照してください。

### Workers Express

サンプルでは実際の `express` パッケージと Workers 形式のエントリーを使います。

```ts
import express from "express";
import { httpServerHandler } from "cloudflare:node";

const app = express();
app.use(express.json());
app.get("/api/hello", (_req, res) => res.json({ hello: "world" }));
app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

[Vite](#vite) または [esbuild](#esbuild) プラグインはモバイル・ブラウザービルドだけに追加し、Cloudflare ビルドには使わないでください。ブラウザーポリフィルと Workers 互換の `node:http`・`node:net` アダプターを提供します。検証した基準とモジュールは[互換性一覧](compatibility.md)を参照してください。`listen(3000)` はメモリー内ハンドラーを登録し、TCP ポートを開きません。Hono と Workers Express に対応し、フレームワークのコードは変更しません。

既定の `execution: "network"` は Worker 全体をリモートに維持します。`workersCapacitor()` の `baseURL` にデプロイ済み Worker の HTTPS URL を設定し、`baseURL` と異なるオリジンが必要な場合のみ `remote.origin` を指定します。意図的な単独動作の Express アプリでは、以下の Vite・esbuild オプションに `execution: "local"` を追加できます。これは Worker 実装全体と保持する固定データの配布を許可するため、サーバーの秘密情報を含めないでください。サーバーバインディングが設定されていれば `local` はビルドを失敗させます。[実行方針](cloudflare-bindings.md#choosing-execution)を参照してください。

#### TypeScript の型

このパッケージは、対応する `httpServerHandler` アダプターの `cloudflare:node` 型を提供します。既存の Workers 型宣言がないブラウザビルドでは、`tsconfig.json` の `compilerOptions.types` に追加してください。

```json
{ "compilerOptions": { "types": ["cf-workers-native/cloudflare/apis/types"] } }
```

プロジェクトですでに使っている他の型は残してください。これは型のみのエントリーであり、実行時にインポートしてはいけません。Workers の生成済み型を使うプロジェクトでは、その宣言を維持してください。アプリケーション側で `cloudflare.d.ts` や `client.d.ts` を用意する必要はありません。

### Workers 上の Angular

この統合はまだ検証されていません。対象は、**Cloudflare Workers にデプロイ済みの既存の Angular SSR アプリケーション**です。Capacitor に移す際もレンダリング、ルーティング、ハイドレーションを維持することを目指しています。サポート対象に含めるには、専用の Worker エントリー設定と受け入れ検証用サンプルが必要です。

Vite または esbuild に対応しているだけでは、Angular SSR のサポートを意味しません。独立したフロントエンドの Fetch のみの統合は、別のユースケースです。

## ツール

これらのバージョンは独立したモバイルビルドのものです。既存のクラウドビルドは別のツールやバージョンでも構いません。維持したまま、フレームワークのガイドに従って生成 Worker を接続してください。

| ビルド | 設定 | 入力 |
| --- | --- | --- |
| Vite 7 | `cf-workers-native/tooling/vite` プラグイン | TypeScript / JavaScript の Worker エントリー。上記のフレームワーク出力を含みます |
| esbuild 0.28 | `cf-workers-native/tooling/esbuild` プラグイン | TypeScript / JavaScript の Worker エントリー。上記のフレームワーク出力を含みます |
| Browser ES Modules | 下記の明示的な Worker ソース | ブラウザ互換の JavaScript のみ |

他のバンドラーは現在非対応です。プラグインはモバイル・ブラウザービルドだけに追加し、Cloudflare ビルドには使わないでください。

### Vite

モバイル・ブラウザー用の Vite 設定にプラグインを追加します。

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` は Fetch Handler をエクスポートする既存のアプリケーションエントリー（Hono の `export default app` など）であり、ライブラリのトランスポートモジュールではありません。プラグインの `worker` パスは Vite のルートを基準に解決されます（絶対パスも使用できます）。プラグインがそのエントリーを通常のパッケージインポートに接続するため、アプリケーションコードで特殊なインポートや生成ソースファイルを使う必要はありません。

### esbuild

esbuild では、同じアプリケーションコードに次のビルド設定を使用します。

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "cf-workers-native/tooling/esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outdir: "www",
  bundle: true,
  format: "esm",
  platform: "browser",
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

エントリーパスは `absWorkingDir`（またはカレントディレクトリ）を基準に解決されます。出力された Worker アセットや遅延読み込みされる direct モジュールを含む、出力ディレクトリ全体を配信してください。Worker のコンパイルにはプラグインの互換性変換を使用し、アプリケーションの追加プラグインは Worker バンドルには適用されません。`outdir` または `outfile` を指定したブラウザ ESM 出力が必要です。Worker エントリーは単一の JavaScript ファイルにバンドルする必要があり、個別の CSS / ファイルアセットには対応していません。

### Browser ES Modules（バンドラーなし）

この経路は Fetch のみの統合向けであり、ネイティブドキュメント用アセットは自動で準備されません。バンドラーを使わない場合は、パッケージの `dist` ディレクトリを公開用の `lib` ディレクトリにコピーし、通常の相対 ES Module インポートを使用します。

```js
// main.js（<script type="module"> で読み込み）
import { workersCapacitor } from "./lib/index.js";

const runtime = workersCapacitor({
  baseURL: "https://api.example.com/api/",
  worker: {
    createWorker: () =>
      new Worker(new URL("./worker-entry.js", import.meta.url), {
        type: "module",
      }),
    loadDirect: async () => (await import("./worker.js")).default,
  },
});
await runtime.ready;
```

```js
// worker-entry.js
import { serve } from "./lib/browser/isolated/transport.js";
import worker from "./worker.js";
serve(worker);
```

`worker.js` は既存の Fetch Handler をエクスポートします。その依存関係もすべて、URL を解決可能なブラウザ互換の ES Modules でなければなりません。この経路では TypeScript、bare npm import、Node API、`cloudflare:*` インポートは変換されません。`lib/browser/isolated/transport.js` に相当する公開バンドル用エントリーは `cf-workers-native/browser/isolated` です。
