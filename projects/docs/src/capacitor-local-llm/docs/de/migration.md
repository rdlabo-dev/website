---
title: "Migration"
sourceRevision: "797546168d7d52f3c5629004481f1eac86e55be46699566a1bc8b25142dc66dc"
---
# Migration

Veraltete v1-Kompatibilitäts-APIs und Hinweise zur Migration von der Ionic-Upstream-Version. Zugehörige Anleitungen: [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Fehlerbehandlung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors), [Einrichtung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup).

## Veraltete Kompatibilitäts-APIs

Die v1-APIs bleiben verfügbar, sind jedoch zugunsten expliziter Chat- und Verfügbarkeitsmethoden veraltet:

| Veraltet                                   | Ersatz                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `systemAvailability()`                       | `getAvailability()`                                |
| `download()`                                 | `downloadModel()`                                  |
| `prompt()`                                   | `createChat()` + `generateText()` / `streamText()` |
| `endSession()`                               | `deleteChat()`                                     |
| `addListener('systemAvailabilityChange', …)` | `addListener('availabilityChange', …)`             |
| `warmup({ sessionId })`                      | `warmup({ chatId })`                               |

`systemAvailability()` und `systemAvailabilityChange` liefern den bisherigen Vertrag `LLMAvailability` mit vier Werten (`available`, `unavailable`, `notready`, `downloadable`). Dabei werden die unter [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability) beschriebenen detaillierten `Availability`-Zustände zusammengefasst.

`prompt()` ohne `sessionId` führt aus Gründen der Abwärtskompatibilität weiterhin eine einmalige Generierung aus.

## Migration von Ionic Upstream v1

Dieser Fork ist kein vollständig austauschbarer Ersatz. Ändern Sie die Abhängigkeit und die Imports auf `@rdlabo/capacitor-local-llm`, verwenden Sie `getAvailability()` und den expliziten Lebenszyklus mit `createChat()` / `generateText()` / `deleteChat()` und behandeln Sie die detaillierten Zustände und stabilen Fehlercodes. Mindestvoraussetzungen sind iOS 18.4 und Android API 29. Veraltete v1-Einstiegspunkte bleiben als Übergangsschicht erhalten, einschließlich der ursprünglichen vier Verfügbarkeitswerte.
