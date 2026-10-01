---
title: "Erste Schritte"
sourceRevision: "c98c9fd401157a5fa13c40f78a7ebaf6ab2fa6e014a977d824cf9403154e4b38"
---
# @rdlabo/capacitor-screenshot-event

<!-- rdlabo-docs-omit -->
[![npm-Version](https://badge.fury.io/js/@rdlabo%2Fcapacitor-screenshot-event.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-screenshot-event) [![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Benachrichtigen Sie Ihre Capacitor-Anwendung, nachdem der Benutzer einen Screenshot aufgenommen hat.

Verwenden Sie das Event für Hinweise nach der Aufnahme oder für Aktualisierungen der App-Oberfläche, beispielsweise eine Toast-Meldung oder einen Analytics-Protokolleintrag. Die Benachrichtigung erfolgt nach der Screenshot-Aufnahme. Sie schützt oder verwischt Inhalte vor der Aufnahme nicht.

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/capacitor-screenshot-event](https://docs.rdlabo.dev/projects/capacitor-screenshot-event)
<!-- /rdlabo-docs-omit -->

## Installation

```bash
npm install @rdlabo/capacitor-screenshot-event
npx cap sync
```

## Verwendung

Unter [ScreenshotEvent](https://docs.rdlabo.dev/projects/capacitor-screenshot-event/docs/screenshot-event) erfahren Sie, wie Sie einen Listener registrieren, die Überwachung starten, einen tatsächlichen Screenshot auf einem Gerät prüfen und anschließend die Überwachung beenden und den Handle entfernen.

<!-- rdlabo-docs-omit -->
Registrieren Sie einen Listener, starten Sie die Überwachung und nehmen Sie einen Screenshot auf einem physischen Gerät auf. Beenden Sie beim Verlassen oder Zerstören der Ansicht die Überwachung und entfernen Sie den Handle:

```ts
import { ScreenshotEvent } from '@rdlabo/capacitor-screenshot-event';
import type { PluginListenerHandle } from '@capacitor/core';

let handle: PluginListenerHandle | undefined;

const start = async () => {
  if (handle) return;
  handle = await ScreenshotEvent.addListener('userDidTakeScreenshot', () => {
    console.log('Screenshot was taken');
  });

  await ScreenshotEvent.startWatchEvent();
};

const stop = async () => {
  await ScreenshotEvent.removeWatchEvent();
  await handle?.remove();
  handle = undefined;
};
```

<!-- /rdlabo-docs-omit -->

## Plattformhinweise

- **iOS**: Verwendet die Benachrichtigung `UIApplication.userDidTakeScreenshotNotification`.
- **Android** (8.0.0): Überwacht `FileObserver.CREATE` im festen Pfad `Pictures/Screenshots/` im externen Speicher. Die Erkennung setzt voraus, dass Screenshots in diesem Verzeichnis gespeichert werden. Sie ist kein MediaStore-Änderungsbeobachter und funktioniert nicht garantiert auf jedem Android-Gerät oder mit jedem Galeriepfad eines Geräteherstellers.
- **Web**: Nicht unterstützt, da Browser keine Screenshot-Events bereitstellen.

## API

<docgen-index>

* [`startWatchEvent()`](/docs/readme#startwatchevent)
* [`removeWatchEvent()`](/docs/readme#removewatchevent)
* [`addListener('userDidTakeScreenshot', ...)`](/docs/readme#addlisteneruserdidtakescreenshot-)
* [Schnittstellen](/docs/readme#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### startWatchEvent()

```typescript
startWatchEvent() => Promise<void>
```

--------------------


### removeWatchEvent()

```typescript
removeWatchEvent() => Promise<void>
```

--------------------


### addListener('userDidTakeScreenshot', ...)

```typescript
addListener(eventName: 'userDidTakeScreenshot', listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Parameter              | Typ                                 |
| ------------------ | ------------------------------------ |
| **`eventName`**    | <code>'userDidTakeScreenshot'</code> |
| **`listenerFunc`** | <code>() =&gt; void</code>           |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Schnittstellen


#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

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
