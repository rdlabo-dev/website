---
title: "WebView drucken"
sourceRevision: "145f2af17ecb0168492978f5495d7f1cdfe1647f0a4c589e5180a0730c1813aa"
---
# WebView drucken

Zeigt die Systemdruckoberfläche für den Inhalt der aktuellen WebView an. Nur für Android und iOS. Rufen Sie dies nach der [Installation](/docs/readme#installation) auf. Von einem Button aus ist dies der schnellste Weg, die Systemdruckoberfläche ohne externe Datei zu prüfen. Drucken Sie eine PDF-Datei oder eine andere Datei mit [PDFs und Dateien drucken](/docs/pdf).

```ts
import { Printer } from '@rdlabo/capacitor-printer';

await Printer.printWebView({ name: 'Document' });
```

`name` bezeichnet den Druckauftrag und ist standardmäßig `'Document'`.

<!-- !::printWebView:: -->

<!-- !::PrintWebViewOptions:: -->
