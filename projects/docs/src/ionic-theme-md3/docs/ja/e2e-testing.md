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
npm run test:e2e          # Run the suite
npm run test:e2e:ui       # Open Playwright UI mode
npm run test:e2e:debug    # Run with the Playwright debugger
npm run test:e2e:update   # Regenerate intentional baseline changes
```

CIのLinux環境を再現するには、`demo/` でDocker版を実行します。

```bash
npm run test:e2e:docker
npm run test:e2e:docker:update
```

Dockerのコマンドは `demo/package.json` で固定したPlaywrightイメージを使います。

## 失敗をレビューする

スクリーンショットの不一致は、不具合の場合も意図した外観の変更の場合もあります。baselineを更新する前に次を確認します。

1. `demo/test-results/` の実際の画像、期待する画像、差分画像を確認します。
2. 対象routeをライト・ダーク両modeで確認します。
3. コンポーネントの変更が意図したものか確認します。
4. `npm run test:e2e:update` でbaselineを再生成します。CIの描画に合わせる場合はDocker版を使います。

HTMLレポートは `demo/playwright-report/` に出力され、次のコマンドで開けます。

```bash
npx playwright show-report
```

## テスト対象を追加する

デモのrouteやoverlayのバリエーションを追加したら、`demo/e2e/screenshot.spec.ts` を更新し、対応するbaselineを再生成します。画像の差分を確認してからbaseline変更をコミットしてください。

Pull requestは `.github/workflows/e2e-pull_request.yml`、`main` へのpushは `.github/workflows/e2e-main.yml` のE2E workflowを実行します。
