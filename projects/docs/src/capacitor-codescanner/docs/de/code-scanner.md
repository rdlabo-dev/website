---
title: "CodeScanner"
sourceRevision: "2a1e905065af178899cfb25f371b7fb81b9ea8cdf8d41794cfdad2839da37c87"
---
# CodeScanner

`CodeScanner` öffnet ein natives Scanner-Modal und liefert die gescannten Werte. Rufen Sie die Funktion nach der [Installation](/docs/readme#installation) und der Einrichtung der Kameraberechtigung auf. Beginnen Sie mit einer Benutzeraktion, beispielsweise über eine Schaltfläche. Registrieren Sie `addListener` vor `present`, damit der erste erkannte Code nicht verloren geht. `present` wird aufgelöst, wenn sich das Modal schließt, sei es nach einem Scan oder nach einem Abbruch durch den Benutzer. Entfernen Sie anschließend den Listener-Handle, damit sich bei erneuten Scans keine Listener ansammeln.

## present

Scannen Sie einen bekannten QR-Code, prüfen Sie `event.code` im Listener und schließen Sie anschließend das Modal, oder lassen Sie es im Einzelscan-Modus automatisch schließen:

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

Behalten Sie für fortlaufende Mehrfachscans denselben Ablauf listen → present → remove bei und setzen Sie `isMulti: true`. Rufen Sie `addListener` nicht erneut auf, ohne den vorherigen Handle zu entfernen:

```typescript
await CodeScanner.present({
  detectionWidth: 0.8,
  detectionHeight: 0.2,
  isMulti: true,
});
```

Mit `isMulti: true` bleibt das Modal offen, sodass mehrere Codes gescannt werden können, bis der Benutzer es schließt. Die Optionsfelder finden Sie auf der [API-Seite](/docs/api#scanneroption).

## Codetypen filtern

In Version 8.0.3 stellen die veröffentlichten TypeScript-Typen `metadataObjectTypes` bereit, während die native Implementierung `CodeTypes` erwartet. Verwenden Sie für diese Version die Standardwerte (`qr`, `code39`, `ean13`).

Die Event-Payload ist `{ code: string }`. Die Signaturen finden Sie unter [API](/docs/api).
