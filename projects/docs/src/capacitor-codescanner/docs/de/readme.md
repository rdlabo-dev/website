---
title: "Erste Schritte"
sourceRevision: "5a9028935db26cb0542936414eb0826a116eef78a9dea9e3fd92bac0bd99adc9"
---
# @rdlabo/capacitor-codescanner

<!-- rdlabo-docs-omit -->
[![npm-Version](https://badge.fury.io/js/@rdlabo%2Fcapacitor-codescanner.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-codescanner) [![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Scannen Sie QR-Codes und Barcodes mit einem nativen Capacitor-Modal.

Die Kamera läuft innerhalb des Modals. Sie müssen daher keine Kameraansicht in Ihren Web-Assets verwalten. Verwenden Sie einen Einzelscan oder fortlaufende Mehrfachscans; jeder erkannte Code wird über `event.code` übermittelt.

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/capacitor-codescanner](https://docs.rdlabo.dev/projects/capacitor-codescanner)
<!-- /rdlabo-docs-omit -->

**Dokumentation:** [Vollständige Dokumentation lesen](https://docs.rdlabo.dev/projects/capacitor-codescanner)

## Installation

```bash
npm install @rdlabo/capacitor-codescanner
npx cap sync
```

### Kameraberechtigung (vor dem ersten Scan erforderlich)

Das Plugin verwendet die Gerätekamera. Fügen Sie unter iOS eine Nutzungsbeschreibung in die `Info.plist` Ihrer Anwendung ein, beispielsweise in `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes and barcodes.</string>
```

Unter Android deklariert das Plugin-Manifest `android.permission.CAMERA`. Das Betriebssystem kann dennoch zur Laufzeit beim Öffnen des Scanners nach der Berechtigung fragen. Synchronisieren und bauen Sie die native Anwendung nach Änderungen an der nativen Konfiguration neu: mit `npx cap sync` und anschließend über Xcode / Android Studio oder Ihren üblichen nativen Capacitor-Build.

## Verwendung

Lesen Sie [CodeScanner](https://docs.rdlabo.dev/projects/capacitor-codescanner/docs/code-scanner). Starten Sie den Scan nach Installation und Kameraeinrichtung durch eine Benutzeraktion, beispielsweise über eine Schaltfläche.

<!-- rdlabo-docs-omit -->
Registrieren Sie einen Listener, öffnen Sie das Modal aus dem Handler einer Schaltfläche und entfernen Sie den Handle, sobald `present` abgeschlossen ist. Dies gilt auch, wenn der Benutzer das Modal ohne Scan schließt:

```ts
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

<!-- /rdlabo-docs-omit -->

## Einsatzbereiche

Verwenden Sie dieses Plugin, wenn Sie ein sofort einsetzbares Scanner-Modal benötigen und keine eigene Kameraoberfläche erstellen möchten. Es eignet sich für:

- Das Scannen von QR-Codes oder Barcodes auf Belegen, Produkten oder Tickets.
- Das Erfassen mehrerer Codes in einer Sitzung mit `isMulti: true`.

## Funktionen

- **Automatische Beleuchtung**: Schaltet bei Dunkelheit standardmäßig das Kameralicht ein.
- **Vibrationsfeedback**: Vibriert, wenn ein Code erkannt wird.
- **Markierung des Erkennungsbereichs**: Zeigt einen roten Rahmen um den aktiven Scanbereich.
- **Hervorhebung erkannter Codes**: Zeichnet einen roten Rahmen um den erkannten Code.
- **Schließen-Schaltfläche**: Standardmäßig oben rechts vorhanden.
- **Mehrfachscan-Modus**: Scannt bei `isMulti: true` weiter, bis der Benutzer das Modal schließt.

## Plattformhinweise

- **iOS und Android**: Vollständig unterstützt.
- **Web**: Nicht unterstützt, da das Plugin nativen Kamerazugriff benötigt.

## API

<docgen-index>

* [`present(...)`](/docs/readme#present)
* [`addListener('CodeScannerCatchEvent', ...)`](/docs/readme#addlistenercodescannercatchevent-)
* [Schnittstellen](/docs/readme#interfaces)
* [Typaliase](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### present(...)

```typescript
present(scannerOption: ScannerOption) => Promise<void>
```

| Parameter               | Typ                                                    |
| ------------------- | ------------------------------------------------------- |
| **`scannerOption`** | <code><a href="#scanneroption">ScannerOption</a></code> |

--------------------


### addListener('CodeScannerCatchEvent', ...)

```typescript
addListener(eventName: 'CodeScannerCatchEvent', listenerFunc: (event: { code: string; }) => void) => Promise<PluginListenerHandle>
```

| Parameter              | Typ                                               |
| ------------------ | -------------------------------------------------- |
| **`eventName`**    | <code>'CodeScannerCatchEvent'</code>               |
| **`listenerFunc`** | <code>(event: { code: string; }) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Schnittstellen


#### ScannerOption

| Eigenschaft                    | Typ                               | Beschreibung                                                                                                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`detectionWidth`**    | <code>number</code>                | Breite des Erkennungsbereichs im Verhältnis zur verfügbaren Breite (0–1). Der Standardwert ist 0,4.                                              |
| **`detectionHeight`**   | <code>number</code>                | Höhe des Erkennungsbereichs im Verhältnis zur Erkennungsbreite. Der Standardwert unter iOS ist 1; unter Android sind 0,15–0,2 üblich.              |
| **`enableCloseButton`** | <code>boolean</code>               | Schließen-Schaltfläche oben links im Scanbereich aktivieren (Standard: true)                                                        |
| **`sheetScreenRatio`**  | <code>number</code>                | Verhältnis des Scanbereichs (Größe des Sheet-Modals) zur Bildschirmgröße festlegen. Der Standardwert ist 0,9 unter Android und 1 (pageSheet) unter iOS. |
| **`CodeTypes`**         | <code>MetadataObjectTypes[]</code> | Zu erkennende Codetypen festlegen (Standard: ["qr", "code39", "ean13"])                                                    |
| **`isMulti`**           | <code>boolean</code>               | Mehrfachscan-Modus aktivieren (Standard: false)                                                                                         |
| **`enableAutoLight`**   | <code>boolean</code>               | Automatische Beleuchtung bei Dunkelheit aktivieren (Standard: true)                                                                      |


#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Typaliase


#### MetadataObjectTypes

<code>'aztec' | 'code128' | 'code39' | 'code39Mod43' | 'code93' | 'dataMatrix' | 'ean13' | 'ean8' | 'face' | 'interleaved2of5' | 'itf14' | 'pdf417' | 'qr' | 'upce' | 'catBody' | 'dogBody' | 'humanBody' | 'salientObject'</code>

</docgen-api>

<!-- rdlabo-docs-omit -->
## Vorabversionskanäle

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Validation` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Inhaber oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt folgendermaßen lautet:

```text
/beta
```

Die Anfrage autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Unmittelbar vor der Veröffentlichung prüft der Workflow erneut die Berechtigung des Inhabers oder Maintainers und den Head-SHA. Nach jedem neuen Commit muss die CI erneut erfolgreich sein und ein Inhaber oder Maintainer einen neuen `/beta`-Kommentar hinzufügen. Pull Requests aus Forks werden unterstützt. Pull Requests, die einen Workflow für die Freigabe von Releases ändern, können erst als Beta veröffentlicht werden, nachdem diese Workflow-Änderungen in `main` übernommen wurden.

Beta-Versionen verwenden das Format `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem Workflow mit ausschließlich lesenden Berechtigungen ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt und deaktiviert dabei Lifecycle-Skripte. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich abgeschlossen wurden. Direkte Pushes nach `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt einen Release-Tag. Stabile `vX.Y.Z`-Tags werden auf npm unter `latest` veröffentlicht, Revisions- und Vorabversions-Tags unter `next`. Weder Veröffentlichungen unter `beta` noch unter `next` ändern den npm-Dist-Tag `latest`.

## Maintainer

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](./LICENSE).
<!-- /rdlabo-docs-omit -->
