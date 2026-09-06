---
title: deny-soft-private-modifier
---

# @rdlabo/rules/deny-soft-private-modifier

> このプラグインはソフトプライベート修飾子の使用を禁止します。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。
> - ✒️ [コマンドライン](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems)の `--fix` オプションで、このルールが報告する問題の一部を自動修正できます。

## ルール詳細

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

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/deny-soft-private-modifier.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/deny-soft-private-modifier.ts)
