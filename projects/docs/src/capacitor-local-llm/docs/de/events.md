---
title: "Ereignisse"
sourceRevision: "67a8c132bc7208d7aaf6fe34239fd3d14fd67bd58f3b9baaaeaed5c0ab71c931"
---
# Ereignisse

Plugin-Ereignisse für Verfügbarkeit, Downloadfortschritt, gestreamte Textabschnitte und den Generierungslebenszyklus. Zugehörige Anleitungen: [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Einrichtung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Fehlerbehandlung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).

| Ereignis                   | Beschreibung                                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availabilityChange`    | Wird ausgelöst, wenn sich die Verfügbarkeit des Textmodells ändert, während Listener registriert sind.                                                                                                                                     |
| `downloadProgress`      | Wird während `downloadModel()` unter Android ausgelöst. Zwischenereignisse können nur `downloadedBytes` enthalten, da ML Kit keine Gesamtbytezahl bereitstellt. `progress` ist zu Beginn `0` und bei Abschluss `1`, sofern bekannt. |
| `textChunk`             | Wird während `streamText()` mit fortlaufenden Textabschnitten für die passende `chatId` / `generationId` ausgelöst.                                                                                                                  |
| `generationStateChange` | Wird für angenommene Textgenerierungen zunächst mit `started` und danach mit `completed`, `cancelled` oder `failed` ausgelöst. Abschließende Fehlerereignisse enthalten einen stabilen `errorCode`.                                                            |

Entfernen Sie Listener über das zurückgegebene `PluginListenerHandle.remove()` oder über `removeAllListeners()`.

Im Web stammt `downloadProgress.progress` aus dem normierten Downloadfortschritt von Chrome (0–1); Bytezahlen werden nicht angegeben. Verfügbarkeitsereignisse geben Änderungen wieder, die während Plugin-Verfügbarkeitsprüfungen sowie beim Erstellen oder Herunterladen von Sitzungen beobachtet werden. Streaming- und Lebenszyklusereignisse der Generierung verwenden denselben Vertrag wie auf nativen Plattformen.
