---
title: "PDFs und Dateien drucken"
sourceRevision: "ed04f0427cf8701ea5a516aabbed9028a0e53f44648eec7996e39a89d336e7c3"
---
# PDFs und Dateien drucken

Zeigt die Systemdruckoberfläche für eine PDF-Datei oder andere Datei an. Nur für Android und iOS. Rufen Sie dies nach der [Installation](/docs/readme#installation) auf. Die aktuelle WebView drucken Sie mit [WebView drucken](/docs/web).

Übergeben Sie den Pfad zu einer tatsächlich vorhandenen lokalen Datei, die Ihre App bereits geschrieben hat, keinen Platzhalter-String. Android unterstützt Dateipfade, `file://`-URLs und `content://`-URLs. iOS unterstützt Dateipfade und lokale `file://`-URLs. `mimeType` ist nur für Android verfügbar.

```ts
import { Printer } from '@rdlabo/capacitor-printer';

// filePath muss auf eine auf dem Gerät vorhandene Datei zeigen.
await Printer.printFile({ path: filePath });
// Nach Abschluss von await benötigt das Betriebssystem die Quelldatei nicht mehr; löschen Sie sie dann, falls sie nicht mehr gebraucht wird.
```

Die Signaturen finden Sie auf der [API](/docs/api#printfile)-Seite.
