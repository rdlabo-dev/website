---
title: はじめに
---

TypeScriptの `extends` で継承したmemberを含むCapacitorプラグインドキュメントを生成します。Ionicの [`@capacitor/docgen`](https://github.com/ionic-team/capacitor-docgen) を独立して保守しているforkです。

## 小さなsandboxで試す

```sh
mkdir docgen-demo
cd docgen-demo
npm init -y
npm install --save-dev @rdlabo/capacitor-docgen@0.4.1
```

本家 `@capacitor/docgen` を同じプロジェクトへ同時インストールしないでください。どちらも `docgen` binaryを公開します。

`src/definitions.ts` を作成します。

```ts
export interface SharedOptions {
  requestId?: string;
}

export interface CreateOptions extends SharedOptions {
  value: string;
}

export interface MyPlugin {
  create(options: CreateOptions): Promise<void>;
}
```

`tsconfig.json` を作成します。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  },
  "files": ["src/definitions.ts"]
}
```

docgenが更新するplaceholderを含む `README.md` を作成します。

```md
<docgen-index></docgen-index>

<docgen-api></docgen-api>
```

次を実行します。

```sh
npx docgen --project tsconfig.json --api MyPlugin --output-readme README.md --output-json dist/docs.json
```

生成された `CreateOptions` のドキュメントには `value` と `requestId` の両方が含まれます。生成内容を変えるにはTypeScriptのinterfaceやJSDocを編集してください。marker外の散文はそのまま残ります。編集後は同じコマンドを再実行します。

既存プラグインでは `package.json` に `"docgen": "docgen --api MyPlugin --output-readme README.md"` のようなscriptを追加できます。このsandboxでは必須ではありません。

## ドキュメント

- [本家との差分](./upstream-differences)
