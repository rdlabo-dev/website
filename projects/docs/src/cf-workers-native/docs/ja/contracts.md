---
title: "Feature 契約 API"
---

# Feature 契約 API

互換性の単位は API カテゴリーごとの基底クラスではなく、**名前と型を持つプロファイル**です。一つのプロファイルが、API 型、宣言した動作ケース、実装、テストを結び付けます。契約 runner を変更せずに、ローカル実装、委譲による実装、workerd が提供する実装を使用できます。

基盤は三つの部分で構成されます。

| 部分 | 責務 |
| --- | --- |
| `Feature<ID, API, Case>` | 不変の識別情報とケース名。ネイティブ API の形を維持します |
| `FeatureImplementation<Feature>` | 必須の実装 API と、すべてのケースの明示的なカバレッジ |
| `openFeature` / `runContract` | セットアップのロールバック、スコープ付きクリーンアップ、ケースごとの新規スコープ、構造化した結果 |

`FeatureImplementation` は抽象クラスですが、ライフサイクルの状態はサブクラスではなく host が所有します。実装側は `create(scope)` を実装し、host の初期化やクリーンアップ関数をオーバーライドすることはできません。返す API 内のクラスやメソッドに制限はありません。汎用の `execute(name, args)` プロトコル、グローバルレジストリ、バインディングとエンジン機能で分けた runner はありません。

## feature の追加

```ts
import {
  defineFeature,
  FeatureImplementation,
  openFeature,
  type FeatureScope,
} from "cf-workers-native/shared/contracts";
import {
  runContract,
  assertContract,
  type ContractSuite,
} from "cf-workers-native/shared/contracts/testing";

interface TextAPI {
  read(key: string): Promise<string | null>;
}
const text = defineFeature<TextAPI>()("example.text", ["missing"]);

class MemoryText extends FeatureImplementation<typeof text> {
  constructor() {
    super(text, { missing: { status: "supported" } });
  }
  create(scope: FeatureScope): TextAPI {
    const values = new Map<string, string>();
    scope.defer(() => values.clear());
    return { read: async (key) => values.get(key) ?? null };
  }
}

const contract: ContractSuite<typeof text> = {
  feature: text,
  cases: {
    async missing(api) {
      if ((await api.read("absent")) !== null) throw new Error("Expected null");
    },
  },
};
assertContract(await runContract(new MemoryText(), contract));

// 同じホストをテストとは独立して使用できます。
const session = await openFeature(new MemoryText());
try {
  await session.api.read("key");
} finally {
  await session.dispose();
}
```

API 型は実装によって決まります。呼び出し側は `openFeature` に無関係な結果型を指定できません。スイートは同じ feature 定義を持つ必要があります。`tests/types/features.ts` のコンパイル時の否定テストでは、欠けている操作、不正な引数 / 結果、欠落 / 架空のケース、異なる feature 識別情報を検証します。typecheck コマンドは `@ts-expect-error` を使ってこれらを確認し、必要なエラーがなくなればビルドを失敗させます。実行時にも feature オブジェクトの不一致と不完全なカバレッジを拒否します。他の TypeScript API と同様、`any` や明示的な安全でないキャストで静的な保証を回避することは可能です。

プロファイルごとにエクスポートする定義を一つにし、各所からインポートしてください。ID は安定した範囲を表し、契約を非互換に変更する場合は ID も変更します。プロファイルのケース名は動作保証を表し、必ずしもメソッド名とは一致しません。プロファイルが何を保証**しない**かを文書化してください。小さなサブセットの通過で、Workers サービス全体との互換性が保証されることはありません。

## ライフタイムと要件

`create` は同期でも非同期でも構いません。所有する各リソースは、失敗する可能性のあるセットアップを await する前も含め、直ちに `scope.defer` に登録してください。host は部分的なセットアップをロールバックし、正常なセッションを登録と逆の順序で破棄します。途中で失敗してもすべてのクリーンアップを試み、繰り返しの破棄は同じ Promise を共有します。feature の終了はクリーンアップ前に `scope.signal` を abort します。初期化エラーとクリーンアップエラーが両方発生した場合は、AggregateError に両方を保持します。

feature のスコープはリクエストのスコープやデータのライフタイムではありません。所有権が明示的に移譲されていない限り、外部が所有するデータベース接続をクリーンアップに登録しないでください。永続化を使うテストプロバイダーは独自の隔離した namespace を使用し、そのクリーンアップを登録する必要があります。新しいスコープだけでは外部サービスをリセットできません。実装は `create` の呼び出しごとに独立して準備した API を返す必要があります。

要件は未検証の capability registry に置く文字列ではなく、`create` 内で実行するチェックです。環境に必要な機能がない場合は `FeatureUnavailable` を投げてください。エンジンの例では `WebAssembly.validate` を確認します。これは利用可能性を検出し、限定的な動作プロファイルを検証するもので、V8 を提供またはエミュレートするものではありません。

`openFeature` は初期化の完了を待ってからセッションを公開します。初期化前のキャンセル、期限、任意の操作のキャンセルは追加しません。初期化と操作を完了させる責任は実装にあり、テストフレームワークのタイムアウトも引き続き重要です。feature の dispose は保持済み API オブジェクトを汎用的に無効化しません。リクエストのキャンセルとストリーミングは fetch トランスポートが担当します。

## 結果と CI のルール

`runContract` は対応するケースごとに新しいスコープを準備し、アサーションを実行して、必ずクリーンアップします。結果には feature ID、安定したケース ID、状態、理由、クリーンアップの失敗が含まれます。

- `passed`: 宣言した期待が満たされました。
- `failed`: セットアップまたはアサーションが失敗しました。クリーンアップの失敗もレポートを失敗にします。
- `unsupported`: この実装が宣言したカバレッジの明示的な対象外であり、理由は必須です。ケースは実行されず、成功として数えることもありません。
- `unavailable`: 環境に必要な機能がありませんでした。対応を宣言したケースがこの状態になれば、検証は失敗です。

`assertContract` は failed / unavailable のケース、クリーンアップの失敗、成功ケースが一つもないレポートを拒否します。部分的なプロファイルには明示的な unsupported エントリーを含められます。完全なカバレッジを要求する CI では、デモと同様にすべての状態が `passed` であることも確認してください。カバレッジの変更はレビュー可能な範囲変更であり、失敗したケースを隠す手段ではありません。テスト runner は引き続き Vitest と Playwright を使います。共通レイヤーはテストフレームワークに依存しません。

## FetchRuntime

独自の実行アダプター用に `FetchRuntime` を `cf-workers-native/capacitor` から export します。サブクラスは `dispatch(request, env, ctx)` を実装し、起動や所有リソースの終了処理に `ready` と `close(): void | Promise<void>` を上書きできます。構築だけでは global fetch を差し替えません。バインドされた `fetch` を直接呼びます。URL 境界、中断、レスポンス検証、HEAD 正規化、終了処理を共通化するため `fetch`、`drain`、`dispose` は継承してください。`drain` が追跡するのは背景処理で、レスポンス本文の消費ではありません。直接実行の破棄では任意のハンドラーコードを強制停止できません。

アプリケーションの設定には `workersCapacitor` を使ってください。再利用可能な Fetch と KV の契約は、パッケージ名の下の `cloudflare/workers/testing` と `cloudflare/bindings/kv/testing` からエクスポートされます。KV テストプロバイダーは独自の namespace を隔離してクリーンアップする必要があります。新しいスコープを作っても永続ストレージは消去されません。
