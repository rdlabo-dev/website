---
title: "ビルド設定"
sourceRevision: "316c7e29f6060cdd927aa021bad5b1b210ae8525f1c76add44fd7f862758c532"
headingAliases: {"frameworks":"%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%83%AF%E3%83%BC%E3%82%AF","typescript-types":"typescript-%E3%81%AE%E5%9E%8B","angular-on-workers":"workers-%E4%B8%8A%E3%81%AE-angular","tools":"%E3%83%84%E3%83%BC%E3%83%AB","browser-es-modules-(no-bundler)":"browser-es-modules%EF%BC%88%E3%83%90%E3%83%B3%E3%83%89%E3%83%A9%E3%83%BC%E3%81%AA%E3%81%97%EF%BC%89","browser-es-modules-no-bundler":"browser-es-modules%EF%BC%88%E3%83%90%E3%83%B3%E3%83%89%E3%83%A9%E3%83%BC%E3%81%AA%E3%81%97%EF%BC%89"}
---
まずアプリケーションのフレームワークを選び、次に Capacitor 統合に使用するビルドツールを設定します。フレームワークのガイドで Worker エントリーと実行境界を確認し、ツールのプラグインでそのエントリーをモバイルアプリに接続します。既存の Cloudflare ビルドは分離したまま維持してください。

## フレームワーク

次の統合にはサンプルと検証結果があります。サポート対象はここに記載した実行経路に限られます。API とアプリケーションの制約は[互換性の制限](compatibility.md)を参照してください。

| フレームワーク | 実行と検証済みの範囲 | 設定 |
| --- | --- | --- |
| Hono | ローカルの Fetch Handler と HTML ページ。Hono フィクスチャでルーティング、フォーム、リクエスト / レスポンスの動作を検証しています。クラウド依存のリクエストはリモートディスパッチを使います。 | [Hono エントリー](#hono)、[ネイティブレンダリングの例](../demo/rendering) |
| Workers Express | `cloudflare:node` によるローカル実行。API と HTML レンダリングのフィクスチャがあります。クラウド依存のリクエストはリモートディスパッチを使います。 | [Workers Express エントリー](#workers-express)、[ネイティブレンダリングの例](../demo/rendering) |
| Void React Pages | リモート Worker で SSR、loader、action を実行し、WebView でクライアントハイドレーションとフォームを処理します。Void / @void/react 1.1.12 以降を使用してください。公開済みの 1.1.12 パッケージは iOS シミュレーターと Android エミュレーターの受け入れテストを通過しています。 | [Void の設定と検証](void.md) |
| Next.js / OpenNext | D1 を使うサンプルは Worker 全体をリモートで実行します。別のローカルプロファイルで公開 SSR ページ、ハイドレーション、リンク、アセットを検証していますが、ローカル D1 や ASSETS のサポートを示すものではありません。 | [OpenNext の設定と制限](opennext.md) |

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

[Vite](#vite) または [esbuild](#esbuild) プラグインは Capacitor / ブラウザ用のビルドだけに使用し、Cloudflare ビルドには使用しないでください。ブラウザ用ポリフィルとともに、Workers 互換の `node:http` / `node:net` アダプターを提供します。検証済みの基準とモジュールは[互換性一覧](compatibility.md)に記載しています。`listen(3000)` はインメモリのハンドラーを登録するもので、TCP ポートの待ち受けを開始するものではありません。プラグインは Hono と Workers Express の両方に対応しており、フレームワークのコードは変更不要です。

#### TypeScript の型

このパッケージは、対応する `httpServerHandler` アダプターの `cloudflare:node` 型を提供します。既存の Workers 型宣言がないブラウザビルドでは、`tsconfig.json` の `compilerOptions.types` に追加してください。

```json
{ "compilerOptions": { "types": ["workers-capacitor/cloudflare/apis/types"] } }
```

プロジェクトですでに使っている他の型は残してください。これは型のみのエントリーであり、実行時にインポートしてはいけません。Workers の生成済み型を使うプロジェクトでは、その宣言を維持してください。アプリケーション側で `cloudflare.d.ts` や `client.d.ts` を用意する必要はありません。

### Workers 上の Angular

この統合はまだ検証されていません。対象は、**Cloudflare Workers にデプロイ済みの既存の Angular SSR アプリケーション**です。Capacitor に移す際もレンダリング、ルーティング、ハイドレーションを維持することを目指しています。サポート対象に含めるには、専用の Worker エントリー設定と受け入れ検証用サンプルが必要です。

Vite または esbuild に対応しているだけでは、Angular SSR のサポートを意味しません。独立したフロントエンドの Fetch のみの統合は、別のユースケースです。

## ツール

以下のバージョンは、分離した Capacitor ビルドのものです。フレームワークの既存のクラウドビルドは異なるツールやバージョンを使用する場合があります。それらは変更せず、フレームワークのガイドに従って生成済み Worker を接続してください。

| ビルド | 設定 | 入力 |
| --- | --- | --- |
| Vite 7 | `workers-capacitor/tooling/vite` プラグイン | TypeScript / JavaScript の Worker エントリー。上記のフレームワーク出力を含みます |
| esbuild 0.28 | `workers-capacitor/tooling/esbuild` プラグイン | TypeScript / JavaScript の Worker エントリー。上記のフレームワーク出力を含みます |
| Browser ES Modules | 下記の明示的な Worker ソース | ブラウザ互換の JavaScript のみ |

現在、その他のバンドラーには対応していません。これらのプラグインは Capacitor / ブラウザ用ビルドだけに追加し、Cloudflare ビルドには追加しないでください。

### Vite

Capacitor / ブラウザ用の Vite 設定にプラグインを追加します。

```ts
import { defineConfig } from "vite";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/vite";

export default defineConfig({
  plugins: [workersCapacitorPlugin({ worker: "./src/worker.ts" })],
});
```

`src/worker.ts` は Fetch Handler をエクスポートする既存のアプリケーションエントリー（Hono の `export default app` など）であり、ライブラリのトランスポートモジュールではありません。プラグインの `worker` パスは Vite のルートを基準に解決されます（絶対パスも使用できます）。プラグインがそのエントリーを通常のパッケージインポートに接続するため、アプリケーションコードで特殊なインポートや生成ソースファイルを使う必要はありません。

### esbuild

esbuild では、同じアプリケーションコードに次のビルド設定を使用します。

```js
import { build } from "esbuild";
import { workersCapacitorPlugin } from "workers-capacitor/tooling/esbuild";

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

`worker.js` は既存の Fetch Handler をエクスポートします。その依存関係もすべて、URL を解決可能なブラウザ互換の ES Modules でなければなりません。この経路では TypeScript、bare npm import、Node API、`cloudflare:*` インポートは変換されません。`lib/browser/isolated/transport.js` に相当する公開バンドル用エントリーは `workers-capacitor/browser/isolated` です。
