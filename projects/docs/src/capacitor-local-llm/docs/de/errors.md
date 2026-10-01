---
title: "Fehlerbehandlung"
sourceRevision: "f88f0419566e96e348f93a41532a340386b5b62514ed02796fa19e074ed8d51b"
---
# Fehlerbehandlung

Stabile Fehlercodes der nativen Capacitor-Fehler und der Web-Implementierung. Zugehörige Anleitungen: [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Migration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/migration).

Native Capacitor-Fehler und die Web-Implementierung stellen einen stabilen String `code` bereit, der `LocalLLMErrorCode` entspricht. Im Web wird bei Fehlern eine `LocalLLMException` ausgelöst, die `Error` erweitert und `code` setzt.

```typescript
import { LocalLLM, LocalLLMException } from '@rdlabo/capacitor-local-llm';

try {
  await LocalLLM.generateText({ chatId: 'missing', prompt: 'Hello' });
} catch (err) {
  const code = err instanceof LocalLLMException ? err.code : (err as { code?: string }).code;
  console.log(code, (err as Error).message);
}
```

## `LocalLLMErrorCode`

| Code                                | Beschreibung                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `LOCAL_LLM_NOT_AVAILABLE`           | Das On-Device-Textmodell ist nicht verfügbar.                                            |
| `LOCAL_LLM_DEVICE_NOT_ELIGIBLE`     | Das Gerät oder Betriebssystem unterstützt keine On-Device-Textgenerierung.                        |
| `LOCAL_LLM_NOT_ENABLED`             | On-Device-KI wird unterstützt, wurde vom Benutzer jedoch nicht aktiviert.                              |
| `LOCAL_LLM_MODEL_NOT_READY`         | Das Modell wird heruntergeladen oder initialisiert (`downloading` / `not-ready`).             |
| `LOCAL_LLM_MODEL_DOWNLOAD_REQUIRED` | Das Modell muss zunächst heruntergeladen werden (`downloadable`).                                |
| `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED` | Die Eingabe und die angeforderte Ausgabe passen auch nach dem Kürzen entfernbarer Verlaufseinträge nicht in den verfügbaren Kontext. |
| `LOCAL_LLM_CHAT_NOT_FOUND`          | Die `chatId` existiert nicht.                                                        |
| `LOCAL_LLM_CHAT_BUSY`               | Für diesen Chat läuft bereits eine Generierung.                                  |
| `LOCAL_LLM_GENERATION_NOT_FOUND`    | Es gibt keine passende laufende Generierung, oder die `generationId` stimmt nicht überein.                      |
| `LOCAL_LLM_GENERATION_CANCELLED`    | Die Generierung wurde über `cancelGeneration()` oder `deleteChat()` abgebrochen.            |
| `LOCAL_LLM_INVALID_OPTIONS`         | Ein Optionswert fehlt oder liegt außerhalb des zulässigen Bereichs.                                         |
| `LOCAL_LLM_UNSUPPORTED`             | Die Methode oder Funktion wird auf dieser Plattform oder Betriebssystemversion nicht unterstützt.              |
| `LOCAL_LLM_IMAGE_NOT_READABLE`      | Ein Bild-URI kann nicht aufgelöst, geöffnet oder dekodiert werden.                                |
| `LOCAL_LLM_IMAGE_TOO_LARGE`         | Ein Bild überschreitet die Eingabegrößenbeschränkung der Plattform.                                    |
| `LOCAL_LLM_GENERATION_FAILED`       | Die Generierung ist aus einem stabilen, plattformspezifisch zugeordneten Grund fehlgeschlagen.                             |
| `LOCAL_LLM_IMAGE_GENERATION_FAILED` | Die Bildgenerierung ist fehlgeschlagen, etwa weil kein Stil verfügbar ist.                                  |
| `LOCAL_LLM_UNKNOWN_ERROR`           | Ein unerwarteter Fehler des zugrunde liegenden SDK ist aufgetreten. Einzelheiten finden Sie in `message`.                    |
