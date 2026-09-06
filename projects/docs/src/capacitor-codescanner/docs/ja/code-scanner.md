---
title: CodeScanner
code: []
scrollActiveLine: []
---

`CodeScanner` はネイティブのスキャナーモーダルを開き、スキャン結果を届けます。[インストール](/docs/readme#インストール) とカメラ権限の設定のあとで呼び出します。ボタンなどユーザー操作から開始します。最初の検出を取りこぼさないよう、`present` より前に `addListener` を登録します。`present` はモーダルが閉じたとき（スキャン後またはユーザーがキャンセルしたとき）に解決します。再スキャンでリスナーが積み上がらないよう、その後ハンドルを `remove` します。

## present

既知の QR を 1 件読み、リスナーで `event.code` を確認してからモーダルを閉じます（単発スキャンでは検出後に閉じる場合もあります）。

```typescript
import { CodeScanner } from '@rdlabo/capacitor-codescanner';
import type { PluginListenerHandle } from '@capacitor/core';

const scanQRCode = async () => {
  let handle: PluginListenerHandle | undefined;
  try {
    handle = await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
      console.log('Scanned code:', event.code);
    });

    await CodeScanner.present({
      detectionWidth: 0.6,
      detectionHeight: 0.15,
      isMulti: false,
    });
  } finally {
    await handle?.remove();
  }
};
```

連続マルチスキャンでは、listen → present → remove の流れはそのまま、`isMulti: true` を設定します。前のハンドルを `remove` せずに `addListener` を重ねないでください。

```typescript
await CodeScanner.present({
  detectionWidth: 0.8,
  detectionHeight: 0.2,
  isMulti: true,
});
```

`isMulti: true` だとユーザーが閉じるまでモーダルを開いたまま複数コードをスキャンできます。

## コード種別のフィルタ

バージョン 8.0.3 では、公開 TypeScript 型は `metadataObjectTypes` を、ネイティブ実装は `CodeTypes` を想定しており不一致があります。このバージョンでは既定値（`qr`、`code39`、`ean13`）を使ってください。

!::present::

!::ScannerOption::

!::MetadataObjectTypes::

イベントの値は `{ code: string }` です。型は[API](/docs/api)を参照してください。
