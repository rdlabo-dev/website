---
title: deny-soft-private-modifier
---

# @rdlabo/rules/deny-soft-private-modifier

> このプラグインはソフトプライベート修飾子の使用を禁止します。
>
> - ⭐️ このルールは Flat Config の [`rdlabo.configs.recommended`](/docs/configuration) に含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

TypeScript の `private` 修飾子がアクセスを制限するのはコンパイル時だけです。実行時には、ブラケット記法や `any` へのキャストを使ってアクセスできます。一方、JavaScript のハードプライベートフィールド（`#`）は実行時にも制限され、クラスの外からアクセスできません。このルールは `private` のプロパティとメソッドを `#` に置き換え、`this.x` の参照を `this.#x` に更新します。

## ルール詳細

次の記述を検出します。

- `private` プロパティの定義（`private field = ...`）
- `private` メソッドの定義（`private method() { ... }`）
- `private` として宣言されたフィールドへの `this.field` 参照

`private constructor()` はクラス外でのインスタンス生成を防ぐための指定なので、検出対象に含めません。`private readonly` プロパティは検出対象です。自動修正では `private` を取り除いて `#` を付け、`readonly` は維持します。

自動修正は次の順で行います。

1. `private` キーワードを取り除きます。
2. プロパティ名またはメソッド名の前に `#` を付けます。
3. クラス内の `this.field` や `this.method()` の参照を、`this.#field` や `this.#method()` に更新します。

## 例

❌ 誤り: クラスフィールドに `private` 修飾子を使う

```ts
class TokenStore {
  private token = '';

  private refresh() {
    this.token = 'new-token';
  }
}
```

✅ 正しい: ハードプライベートフィールド構文（#）を使う

```ts
class TokenStore {
  #token = '';

  #refresh() {
    this.#token = 'new-token';
  }
}
```

## オプション

このルールにオプションはありません。

## 有効化する場面

クラス内部へのアクセスを実行時にも制限したい場合に有効にします。既存コードに `--fix` を適用できますが、クラス外からアクセスできる範囲が変わります。従来の `private` メンバーへ実行時にアクセスしていた外部コードは、修正後に動作しなくなります。

## 関連ルール

- [`@rdlabo/rules/restrict-try-block`](/docs/rules/restrict-try-block)

## 実装

- [ルールの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-soft-private-modifier.ts)
- [テストの実装](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-soft-private-modifier.ts)
