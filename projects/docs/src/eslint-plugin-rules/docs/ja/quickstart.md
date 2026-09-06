---
title: lintの検出と修正を試す
---

コード規約を実行できる検査にします。TypeScriptのprivateメンバーを検査し、診断を確認して、JavaScriptのprivate fieldへ自動修正する流れを試します。汎用TypeScriptの1ルールを使うため、Angular・Ionicアプリを作る必要はありません。

## 適用したいポリシーを選ぶ

| プロジェクトで必要なもの | エントリポイントとpreset |
| --- | --- |
| Angular・IonicのComponentとtemplate規約 | パッケージルートの `recommended` |
| Workersのエラー境界 | `/typescript` の `workers/recommended` |
| タイムゾーン不具合の再導入チェック | `/typescript` の `workers-timezone/recommended` |

Workersの2つのpresetは独立したopt-inです。日時処理なら[ライブラリとlintのセット演習](/workers-timezone/docs/quickstart)から始めてください。pluginはコードパターンを検査し、実行時の日時変換やアプリのテストを置き換えるものではありません。

## 1. 小さなlint用プロジェクトを作る

Node.js 24とnpmを使います。この独立した演習ではESLint 10を使います。既存アプリを変更する前に[要件](/docs/getting-started)を確認してください。

```sh
mkdir eslint-rules-demo
cd eslint-rules-demo
npm init -y
npm pkg set type=module
npm install --save-dev @rdlabo/eslint-plugin-rules@22.1.0 eslint@10 typescript@6 typescript-eslint@8
```

`eslint.config.mjs` として保存します。この構文ルールにはTypeScriptプロジェクトやtyped lintingは不要です。

```js
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  languageOptions: { parser: tseslint.parser },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: { '@rdlabo/rules/deny-soft-private-modifier': 'error' },
});
```

## 2. ルールの検出を確認する

`demo.ts` として保存します。

```ts
class Counter {
  private value = 0;

  increment() {
    return ++this.value;
  }
}

console.log(new Counter().increment());
```

```sh
npx eslint demo.ts
```

終了ステータスが0以外になり、宣言とメンバー参照の2箇所に `@rdlabo/rules/deny-soft-private-modifier` が表示されます。

## 3. 修正結果を確認する

```sh
npx eslint demo.ts --fix
npx eslint demo.ts
```

2つ目のコマンドは正常終了します。`demo.ts` を開くと、宣言と参照がJavaScriptのprivate fieldへ変わっています。

```ts
class Counter {
  #value = 0;

  increment() {
    return ++this.#value;
  }
}

console.log(new Counter().increment());
```

これは1ルールを体験する例で、プロジェクト全体のpresetではありません。すべてのルールにautofixがあるわけではなく、自動修正はコミット前に確認してください。

## 4. 必要なpresetを導入する

[設定ガイド](/docs/configuration)からAngular・IonicまたはWorkers向けの構成へ進みます。Angular presetを展開するときはTypeScript・HTMLの対象指定を維持し、型を調べるルールではtyped lintingを有効にします。CIでプロジェクトのlintコマンドを実行し、コントリビューターやAIへの実装指示にも含めてください。

[ルール一覧](/docs/rules)で確認しながら、必要なポリシーを段階的に追加できます。既存アプリで新しい推奨presetを有効にする前に[移行ガイド](/docs/migration)を確認してください。
