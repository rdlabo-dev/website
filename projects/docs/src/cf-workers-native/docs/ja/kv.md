---
title: "ローカル KV バインディング"
---

# ローカル KV バインディング

`LocalStorageKV` は共通の feature host を通して `kv.local.v1` プロファイルを実装します。API は Workers KV のメソッド名とオーバーロードを使います。WebView の `localStorage` に、各値をメタデータおよび有効期限とともに永続化します。アプリケーションは安定した namespace を選びます。feature を破棄しても、アプリケーションデータは削除されません。

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";
import { openFeature } from "cf-workers-native/shared/contracts";
import { LocalStorageKV } from "cf-workers-native/cloudflare/bindings/kv";
import worker from "./worker";

const kv = await openFeature(new LocalStorageKV("my-app-settings"));
const runtime = workersCapacitor({
  worker,
  baseURL: "https://example.com/api",
  env: { KV: kv.api },
});
// アプリ終了時: runtime.dispose(); await kv.dispose();
```

Worker はこのバインディングの型として、エクスポートされた `KVNamespace` を使用できます。同じ Worker で実際の Workers KV バインディングも使用できます。この構成は direct 実行を使います。メソッドを持つバインディングは、現時点では分離された Worker の structured-clone 境界を越えられません。バインディング RPC は別のトランスポート課題であり、この実装は共通 host や runner を変更しません。

生成ディスパッチの既定 network 実行では KV 操作をデプロイ済み Worker に維持します。ローカル KV には `execution` 配列で対象ルートを明示選択（単独アプリなら Worker 全体の `"local"`）し、全 Wrangler KV 名をプラグインの `kvExecution: { KV: "local" }` または `kvExecution: { KV: "remote" }` に設定します。不足・不正な方針はビルド失敗です。`local` は上記のように `env` から渡し、`remote` は KV のみのルートも Worker へ送ります。R2 などがハンドラーをリモート選択すれば要求全体がデプロイ済み Worker とクラウド KV を使います。ローカルとクラウドのデータは独立です。[ディスパッチガイド](remote-service-bindings.md)を参照してください。

## 対応 API

| 操作 | 動作 |
| --- | --- |
| `get(key, typeOrOptions?)` | デフォルト / 明示指定の text、JSON、ArrayBuffer、バイトストリームの結果。存在しないキーは null を返します |
| `get(keys, typeOrOptions?)` | 最大 100 キー。text または JSON の Map を返し、存在しないキーは null を含みます |
| `getWithMetadata` | 単一 / 一括読み取りは同じモードで、メタデータを含みます。単一読み取りで存在しない場合は `{value: null, metadata: null}`、一括読み取りで存在しないエントリーは null です |
| `put(key, value, options?)` | 文字列、ArrayBuffer、型付きバイトビュー、バイトストリーム。任意の JSON メタデータと絶対 / 相対の有効期限を指定できます |
| `delete(key)` | 値、メタデータ、有効期限をまとめて削除します。キーが存在しなくても問題ありません |
| `list(options?)` | UTF-8 のキー順序、prefix、limit（1～1000）、継続 cursor、メタデータ、有効期限に対応します |

`expirationTtl` と未来の絶対時刻 `expiration` の最小値は 60 秒です。両方を指定した場合は TTL で有効期限を決定します。TTL は入力の収集とエンコードが完了し、保存を確定する直前から開始します。絶対有効期限は呼び出し時に検証し、保存確定前に期限を過ぎた場合は拒否して以前の値を維持します。有効期限は、新しい feature セッションを開始した後も、読み取りと一覧取得時に確認します。期限切れレコードは遅延削除されます。オプションなしで上書きすると、以前のメタデータと有効期限は削除されます。cursor は namespace と prefix に紐づく不透明なローカルトークンで、Cloudflare には移植できません。配列のオフセットではなく最後に返したキーの次から再開するため、以前のエントリーを削除しても次のキーを飛ばしません。同時書き込みがある場合、一覧取得はトランザクショナルなスナップショットではありません。

## 実装上の保護

検証はテストから独立してバインディング実装に含まれます。無効なキー、読み取りモード、オプション、limit、有効期限、メタデータ、一括読み取りモードは拒否します。キーは `.` と `..` を除く UTF-8 の 1～512 バイトで、値は 25 MiB、シリアライズ済みメタデータは 1024 バイトが上限です。ブラウザのストレージ容量制限はこれより大幅に小さい場合があります。有効な `cacheTtl`（30 秒以上）は受け付けますが、ローカルの読み取りキャッシュは導入しません。未知のオプションフィールドは黙って無視せず、拒否します。

バイトストリームは、レコードの保存を確定する前にサイズを逐次確認しながら、段階的に base64 エンコードします。デコード済みチャンクを保持したり、別の完全なバイトバッファーに結合したりしません。入力の失敗やサイズ超過時は古いレコードを維持します。値、有効期限、メタデータは一つのストレージ書き込みにシリアライズされます。容量やセキュリティに関する失敗は、メモリへのフォールバックをせずに伝播します。返すバイト列とメタデータは独立したコピーです。`localStorage` がない場合は `FeatureUnavailable` を投げ、プロパティアクセスのエラーはそのまま伝播します。

任意の第 2 コンストラクター引数で、決定論的なテスト用に既存の `Storage` バックエンドを渡せます。汎用のストレージレジストリや永続化ライフサイクルの抽象化は導入しません。実行時検証とバックエンドの失敗テストは `tests/unit/kv.test.ts` にあります。

## 互換性と永続化の境界

`cf-workers-native/cloudflare/bindings/kv/testing` がエクスポートする `kvContract` は、実際のローカル workerd バインディングとローカルアダプターに対して、18 の共通動作ケースを検証します。小さな `kv.text.v1` プロファイル向けには、引き続き `kvTextContract` を使用できます。契約プロバイダーは空のテスト用 namespace とそのクリーンアップを所有します。アプリケーションデータに対して実行しないでください。有効期限の境界と失敗経路のテストは別にあります。workerd のスイートは、実際の最小 TTL の経過も待ちます。

このプロファイルは、グローバルレプリケーション、結果整合性、リージョンキャッシュの動作、本番のレート制限、クラウド同期をエミュレートしません。エラーメッセージ、分散環境での順序、性能が同一であるとも主張しません。一括レスポンスのサイズ確認はローカルのシリアライズ結果の制限であり、Cloudflare 内部の転送サイズ計算を再現するものではありません。KV API は TypeScript で実装しており、V8 を組み込んではいません。

ストレージは WebView のオリジンに属します。アプリ / ブラウザのデータ削除、アンインストール、eviction、オリジン変更によってデータにアクセスできなくなる可能性があります。シークレットの暗号化や OS レベルの耐久性は保証しません。Web Storage の呼び出しは Promise API の内部では同期的です。バイナリ値は base64 エンコードされるため、大きな値にはメモリと容量のオーバーヘッドがあります。ストリーム読み取りは pull ごとに最大 48 KiB をデコードし、EOF / キャンセル時にエンコード済み文字列を解放しますが、Web Storage 自体はエンコード済みレコード全体を返します。ストリーム書き込みは、アトミックなストレージ書き込みまでエンコード済みの各部分を保持します。レコード形式にはバージョン付きのストレージ prefix を使います。以前の未公開の text 専用プロトタイプからの移行は提供しません。

ネイティブテストは、iOS / Android のシミュレーター / エミュレーターの WebView でバンドル済みアセットを使います。ドキュメントの再読み込み後の永続性は Chromium / WebKit でも検証しています。これらは実機やアプリケーションのアップグレードをまたぐ耐久性を保証するものではありません。

参考資料: Cloudflare の [KV 読み取り](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)、[KV 書き込み](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)、[キー一覧取得](https://developers.cloudflare.com/kv/api/list-keys/)。一括メタデータ読み取りで存在しないエントリーの形式と、キー先頭の U+FEFF の保持は、実際の workerd に対して検証しています。単一キーの text 読み取りは先頭の BOM を保持し、単一キーの JSON 読み取りは BOM 付きの JSON を拒否します。一括読み取りは JSON 解析前を含め BOM を除去します。この単一 / 一括の違いは get と getWithMetadata の両方で再現し、テストしています。
