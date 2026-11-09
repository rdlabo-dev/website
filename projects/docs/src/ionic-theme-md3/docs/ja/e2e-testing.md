---
title: E2Eスクリーンショットテスト
---

このメンテナー向けガイドでは、Material Design 3デモのPlaywrightによるビジュアルリグレッションテストの実行方法を説明します。`demo/e2e/screenshot.spec.ts` に宣言したすべての項目をライト・ダークの両modeで検証します。overlayのバリエーションは `demo/src/app/overlay-types.ts` の共有配列から生成します。

## テストを実行する

最初にデモの依存関係をインストールします。

```bash
cd demo
npm install
```

作業に合うコマンドを選びます。順に、テスト実行、Playwright UI、debugger、意図した変更のbaseline再生成です。

```bash
npm run test:e2e          # スイートを実行
npm run test:e2e:ui       # Playwright UI モードを開く
npm run test:e2e:debug    # Playwright デバッガーで実行
# 承認済みの PR の基準画像変更は、PR に /update-screenshots とコメントします。
```

CIのLinux環境を再現するには、`demo/` でDocker版を実行します。

```bash
npm run test:e2e:docker
```

Dockerのコマンドは `demo/package.json` で固定したPlaywrightイメージを使います。

## 失敗をレビューする

スクリーンショットの不一致は、不具合の場合も意図した外観の変更の場合もあります。baselineを更新する前に次を確認します。

1. `demo/test-results/` の実際の画像、期待画像、差分画像を確認します。
2. 対象ルートをライト・ダークの両モードで確認します。
3. コンポーネントの変更が意図したものか確認します。
4. PR で `/update-screenshots` を依頼し、CI が生成したコミットをレビューします。
   ローカルの `test:e2e:update` / `test:e2e:docker:update` は使い捨てのチェックアウトで調査用に実行できますが、その画像を PR の基準画像としてコミットしないでください。

HTMLレポートは `demo/playwright-report/` に出力され、次のコマンドで開けます。

```bash
npx playwright show-report
```

## テスト対象を追加する

デモのルートやオーバーレイの種類を追加する場合は、`demo/e2e/screenshot.spec.ts` を更新し、対応する基準画像を再生成します。CI の更新ワークフローを使い、そのコミットの画像差分をレビューしてください。

Pull requestは `.github/workflows/e2e-pull_request.yml`、`main` へのpushは `.github/workflows/e2e-main.yml` のE2E workflowを実行します。

## PR の基準画像を更新する

PR で意図した外観変更を行った場合は、その PR に `/update-screenshots` と投稿します。ワークフローはコラボレーターの権限を確認し、固定された Playwright コンテナで画像を生成して PR ブランチへコミットします。作業を続ける前に、そのコミットを取得してください。ライト・ダークの両モードで変更画像を確認し、意図しない変更を基準画像に含めないでください。ローカルのスクリーンショットは調査用の成果物であり、このワークフローの代替基準画像ではありません。

## ドキュメントのプレビュー

デモの Docs ページは `docs/special-markup.md` から生成されます。編集後は `npm --prefix demo run docs:generate` を実行し、生成した内容をコミットして、起動中のデモの `/main/docs` を確認します。`prestart` と `prebuild` でも再生成されます。セットアップ手順はリンク先のユーザーガイドに、プレビュー用マークアップは原文 Markdown に置きます。`docs-content.generated.ts` を手動で編集しないでください。
