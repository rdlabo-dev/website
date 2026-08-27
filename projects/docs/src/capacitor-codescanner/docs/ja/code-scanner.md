---
title: CodeScanner
code: []
scrollActiveLine: []
---

`CodeScanner` はネイティブのスキャナーモーダルを開き、スキャン結果を届けます。[インストール](/docs/readme#インストール) のあとで呼び出します。最初の検出を取りこぼさないよう、`present` より前に `addListener` を登録します。

## present

```typescript
import { CodeScanner } from '@rdlabo/capacitor-codescanner';

const scanQRCode = async () => {
  await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
    console.log('Scanned code:', event.code);
  });

  await CodeScanner.present({
    detectionWidth: 0.6,
    detectionHeight: 0.15,
    isMulti: false,
    CodeTypes: ['qr'],
  });
};

const scanMultipleCodes = async () => {
  await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
    console.log('Scanned code:', event.code);
  });

  await CodeScanner.present({
    detectionWidth: 0.8,
    detectionHeight: 0.2,
    isMulti: true,
    CodeTypes: ['qr', 'code39', 'ean13', 'code128'],
  });
};
```

`isMulti: true` だとモーダルを開いたまま複数コードをスキャンできます。

!::present::

!::ScannerOption::

!::MetadataObjectTypes::

## addListener

```typescript
import { CodeScanner } from '@rdlabo/capacitor-codescanner';

const handle = await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
  console.log('Scanned code:', event.code);
});

await handle.remove();
```

!::addListener.CodeScannerCatchEvent::

!::PluginListenerHandle::
