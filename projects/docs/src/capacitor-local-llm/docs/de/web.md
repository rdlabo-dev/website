---
title: "Web (Chrome)"
sourceRevision: "3b4b847955673ba439a6c4a0b83b02524468e1e6b8136843f085e3418c45eaca"
---
# Web (Chrome)

Das Plugin verwendet die integrierte `LanguageModel`-Prompt-API von Chrome für Textinferenz auf dem Gerät, ohne Server oder API-Schlüssel. Chrome verwaltet Modelldownloads, die zunächst eine Netzwerkverbindung benötigen. Das Plugin ergänzt keine Abhängigkeit zur Modellbereitstellung.

Verwenden Sie Desktop-Chrome mit verfügbarer Prompt API in einem sicheren Kontext, also HTTPS oder localhost. Googles aktuelle Dokumentation nennt Web-Unterstützung ab Chrome 148. API-Bereitstellung und Modellverfügbarkeit hängen weiterhin von Browser-Version, Hardware, Speicher, Richtlinien und Modellbereitschaft ab. Chrome unter Android und iOS wird von diesem Web-Backend nicht unterstützt. Aktuelle Anforderungen finden Sie in der [Chrome-Prompt-API-Dokumentation](https://developer.chrome.com/docs/ai/prompt-api). Frühere experimentelle Builds können Chrome-Flags oder einen Origin Trial benötigen. Das Plugin verändert keine Browsereinstellungen.

Prüfen Sie `getAvailability()` zur Laufzeit. Eine fehlende API liefert `unavailable`; der Versuch, in diesem Browser einen Chat zu erstellen, wird mit `LOCAL_LLM_UNSUPPORTED` zurückgewiesen. Eine vorhandene API mit dem Status `unavailable` weist die Chaterstellung mit `LOCAL_LLM_NOT_AVAILABLE` zurück.

Rufen Sie `downloadModel()` oder das erste `createChat()` aus einer Nutzeraktion wie einem Schaltflächenklick auf, da Chrome beim Modelldownload Nutzeraktivierung verlangt. Beobachten Sie `downloadProgress` zur Fortschrittsanzeige. Bei Cross-Origin-iframes muss die einbettende Seite `allow="language-model"` delegieren. Web Workers werden nicht unterstützt.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

// Diesen Handler an einem Button registrieren, damit Chrome bei Bedarf einen Modelldownload starten kann.
async function onChatClick() {
  const { id } = await LocalLLM.createChat({ instructions: 'Answer briefly.' });
  try {
    const { text } = await LocalLLM.generateText({ chatId: id, prompt: 'What is an LLM?' });
    console.log(text);
  } finally {
    await LocalLLM.deleteChat({ id });
  }
}
```

Unterstützte Methoden umfassen Textverfügbarkeit, Modelldownload, Vorwärmen, Chaterstellung/-löschung, Textgenerierung, Streaming, Abbruch und die veralteten Text-/Sitzungsaliase. `textChunk` enthält inkrementellen Text. Generierungszustandsereignisse liefern eine ID von `started` bis zu einem abschließenden Zustand. Abbruch führt zur Zurückweisung mit `LOCAL_LLM_GENERATION_CANCELLED`, auch beim Löschen eines Chats während der Generierung.

Das Plugin speichert erfolgreiche Textdialogschritte im Arbeitsspeicher und entfernt die ältesten vollständigen Schritte, um `maxMessages` mit Standard 20 und Minimum 2 sowie `maxCharacters` mit Standard 12000 einzuhalten. Anweisungen bleiben separat erhalten. Jede Generierung erstellt eine Browsersitzung aus dem erhaltenen Verlauf und zerstört sie danach, damit abgebrochene oder fehlgeschlagene Schritte nachfolgende Prompts nicht beeinflussen. Chrome erzwingt außerdem sein Kontextfenster. Zu große Eingaben werden mit `LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED` zurückgewiesen. Beim Neuladen der Seite geht der Verlauf verloren. `warmup()` erstellt eine vorübergehende Sitzung und gibt sie wieder frei, optional mit dem Chat-Kontext. Das ausschließlich für iOS vorgesehene `promptPrefix` wird ignoriert.

## Einschränkungen

- Lassen Sie `GenerationOptions` im Web weg. Die normale Web-Prompt-API stellt die numerischen Steuerwerte `temperature`, `topK` oder `maxOutputTokens` des Plugins nicht bereit. Ihre Angabe führt zur Zurückweisung mit `LOCAL_LLM_INVALID_OPTIONS`. Ausschließlich für Chrome-Erweiterungen verfügbare Steuerwerte werden nicht verwendet.
- Dieser Adapter unterstützt derzeit ausschließlich Texteingaben. `getImageAnalysisAvailability()` gibt `unavailable` zurück. Die Angabe von `images` oder `imagePaths` wird mit `LOCAL_LLM_UNSUPPORTED` zurückgewiesen. Chrome besitzt separate multimodale Fähigkeiten, die dieser Adapter noch nicht bereitstellt.
- `generateImage()` und das ausschließlich für Android verfügbare `configureFallbackModel()` weisen mit `LOCAL_LLM_UNSUPPORTED` zurück.
- Verfügbarkeitsereignisse werden erzeugt, wenn Plugin-Aufrufe eine Änderung beobachten, sowie während Modelldownloads. Im Web erfolgt kein Hintergrund-Polling.

## Prüfung

Führen Sie `npm run verify:web` für Paket-Build, Prüfungen öffentlicher Typen und Regressionstests des Browseradapters aus. Diese Tests simulieren die Prompt API. Tatsächliche Modellinferenz muss zusätzlich in einem unterstützten Chrome-Browser mit der Beispielanwendung geprüft werden: `cd example-app` und anschließend `npm run dev`.

### Manuelle Abnahme der Textgenerierung

Verwenden Sie den Tab **Prompt** der Beispielanwendung in unterstütztem Chrome. Die separate Testsuite **Physical-device acceptance** benötigt Bildeingaben und ist für native Geräteprüfungen vorgesehen.

1. Wählen Sie **Check Availability**. Ist das Modell herunterladbar, wählen Sie **Download Model** und warten Sie auf `available`.
2. Geben Sie `Remember the code word ORCHID. Reply briefly.` ein und wählen Sie **Stream Response**. Prüfen Sie, dass der Text schrittweise erscheint und die Bedienelemente anschließend wieder verfügbar sind.
3. Geben Sie `What code word did I ask you to remember?` ein und starten Sie erneut Streaming. Prüfen Sie, dass die Antwort den früheren Dialogschritt berücksichtigt. Eine japanische Folgefrage kann außerdem mehrsprachige Ausgaben prüfen.
4. Fordern Sie eine lange Geschichte an. Wählen Sie **Cancel Generation**, nachdem die Chat-ID erschienen ist und die Generierung begonnen hat. Prüfen Sie den Abbruchfehler und dass danach ein weiterer kurzer Prompt erfolgreich ist.
5. Wählen Sie **Delete Chat** und senden Sie anschließend einen weiteren Prompt. Prüfen Sie, dass eine neue Chat-ID erzeugt und das alte Gespräch nicht erhalten wird.
6. Prüfen Sie in einem Browser ohne Prompt API, dass die Verfügbarkeit `unavailable` ist und die Generierung `LOCAL_LLM_UNSUPPORTED` meldet, ohne die Seite zum Absturz zu bringen.

Die Modellformulierung ist nicht deterministisch. Beurteilen Sie erfolgreiche Inferenz und Lebenszyklusverhalten getrennt vom exakten erzeugten Text.

Streaming und Abbruch werden unter [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat) fortgesetzt. Die Statusverarbeitung beschreibt [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability); stabile Fehlercodes stehen unter [Fehlerbehandlung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/errors).
