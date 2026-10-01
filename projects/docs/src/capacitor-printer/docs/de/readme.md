---
title: "Erste Schritte"
sourceRevision: "5b094362b76208e3af7800b47ade8e90409ba70ca0b3e772bb3e320689482d57"
---
# @rdlabo/capacitor-printer

<!-- rdlabo-docs-omit -->
[![npm-Version](https://badge.fury.io/js/@rdlabo%2Fcapacitor-printer.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-printer)
[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Drucken Sie Dateien oder die aktuelle Webansicht aus einer Capacitor-App.

Dieses Plugin kapselt die native Druckoberfläche von iOS und Android. Beginnen Sie mit der aktuellen WebView, für die keine externe Datei benötigt wird, oder drucken Sie eine lokale Datei, etwa eine in Ihrer App erzeugte PDF-Datei.

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/capacitor-printer](https://docs.rdlabo.dev/projects/capacitor-printer)
<!-- /rdlabo-docs-omit -->

**Dokumentation:** [Vollständige Dokumentation lesen](https://docs.rdlabo.dev/projects/capacitor-printer)

## Installation

```bash
npm install @rdlabo/capacitor-printer
npx cap sync
```

## Verwendung

Drucken Sie in einem Button-Handler die aktuelle WebView, um die Systemdruckoberfläche zu öffnen: [WebView drucken](https://docs.rdlabo.dev/projects/capacitor-printer/docs/web). Eine tatsächlich vorhandene lokale PDF-Datei oder andere Datei drucken Sie mit [PDFs und Dateien drucken](https://docs.rdlabo.dev/projects/capacitor-printer/docs/pdf).

<!-- rdlabo-docs-omit -->
### Die aktuelle Webansicht drucken

```ts
import { Printer } from '@rdlabo/capacitor-printer';

const printPage = async () => {
  await Printer.printWebView({ name: 'Document' });
};
```

### Eine Datei drucken

```ts
import { Printer } from '@rdlabo/capacitor-printer';

const printPdf = async (filePath: string) => {
  await Printer.printFile({
    path: filePath,
    mimeType: 'application/pdf',
  });
  // Nach await benötigt das Betriebssystem die Quelldatei nicht mehr; Sie können sie dann löschen.
};
```

<!-- /rdlabo-docs-omit -->

## Anwendungsfälle

Verwenden Sie dieses Plugin, wenn Ihre App den Systemdruckdialog anzeigen soll, beispielsweise für:

- Das Drucken eines Belegs oder einer Rechnung als PDF.
- Das Drucken eines in der App erzeugten Berichts.
- Das Drucken des Inhalts der aktuellen Seite.

## Plattformhinweise

- **iOS und Android**: Sowohl `printFile` als auch `printWebView` werden unterstützt.
- **Web**: Nicht unterstützt, da Browser bereits `window.print()` bereitstellen.

## API

<docgen-index>

* [`printFile(...)`](/docs/readme#printfile)
* [`printWebView(...)`](/docs/readme#printwebview)
* [Interfaces](/docs/readme#interfaces)
* [Typaliase](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### printFile(...)

```typescript
printFile(options: PrintFileOptions) => Promise<void>
```

Zeigt die Druckoberfläche zum Drucken einer Datei an.

Das Promise wird abgeschlossen, sobald das Betriebssystem die Quelldatei
nicht mehr benötigt. Die Datei kann dann sicher in einem `finally`-Block gelöscht werden.

Nur unter Android und iOS verfügbar.

| Parameter         | Typ                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#printfileoptions">PrintFileOptions</a></code> |

--------------------


### printWebView(...)

```typescript
printWebView(options?: PrintOptions | undefined) => Promise<void>
```

Zeigt die Druckoberfläche zum Drucken des WebView-Inhalts an.

| Parameter         | Typ                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#printoptions">PrintOptions</a></code> |

--------------------


### Interfaces


#### PrintFileOptions

| Eigenschaft           | Typ                | Beschreibung                                                                                                                                 |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`path`**     | <code>string</code> | Pfad zur Datei. Android unterstützt Dateipfade, `file://`-URLs und `content://`-URLs. iOS unterstützt Dateipfade und lokale `file://`-URLs. |
| **`mimeType`** | <code>string</code> | MIME-Typ der Datei. Wird nur unter Android verwendet.                                                                                            |


#### PrintOptions

| Eigenschaft       | Typ                | Beschreibung                | Standard                 |
| ---------- | ------------------- | -------------------------- | ----------------------- |
| **`name`** | <code>string</code> | Name des Druckauftrags. | <code>'Document'</code> |


### Typaliase


#### PrintWebViewOptions

<code><a href="#printoptions">PrintOptions</a></code>

</docgen-api>

<!-- rdlabo-docs-omit -->
## Kanäle für Vorabversionen

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Validation` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt lautet:

```text
/beta
```

Die Anforderung autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung und Head-SHA unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit benötigt erneut erfolgreiche CI und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Änderungen in `main` angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt mit deaktivierten Lebenszyklusskripten. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt ein Release-Tag. Stabile Tags `vX.Y.Z` werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](./LICENSE).
<!-- /rdlabo-docs-omit -->
