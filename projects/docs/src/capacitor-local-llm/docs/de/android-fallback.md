---
title: "Android-Fallback-Modell"
sourceRevision: "4d49ca639190d946aa4120301eb35e5668bbfb7a857df355f0efc0ca2e597d79"
---
# Android-Fallback-Modell

Wenn ML Kit Gemini Nano als nicht verfügbar meldet, konfigurieren Sie ausdrücklich ein LiteRT-LM-Fallback. Zugehörige Anleitungen: [Einrichtung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

## Gemini Nano nicht verfügbar

Wenn ML Kit Gemini Nano als nicht verfügbar meldet, etwa auf Geräten ohne die erforderliche AICore-Funktion, kann eine App ausdrücklich ein lokales [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)-Modell im Format `.litertlm` konfigurieren. Für gewöhnliche Textgenerierung bleibt Gemini Nano bevorzugt, sofern es verfügbar ist. Das Plugin enthält keine Modellgewichte und lädt sie auch nicht unbemerkt herunter: Die App verantwortet die Modelldatei, die Benutzerführung beim Herunterladen, Speicherung, Aktualisierungen und Einhaltung der Lizenzbedingungen.

Die Fallback-Konfiguration ist auf Bilder ausgerichtet und setzt `supportsImages` standardmäßig auf `true`, da LiteRT-LM 0.16.1 keine stabile Abfrage der unterstützten Modalitäten bereitstellt. Verwenden Sie ein multimodales Modell oder übergeben Sie bei einem reinen Textmodell `supportsImages: false`. Als Ausgangspunkt für bildfähige Apps empfiehlt sich ein Modell aus der offiziellen [LiteRT-Sammlung multimodaler Modelle](https://huggingface.co/collections/litert-community/multi-modality-models), etwa Gemma 4 E2B. Beachten Sie, dass Gemma 4 E2B etwa 2,6 GB groß ist. Modellgröße und Speicherbedarf müssen auf jedem unterstützten Gerät geprüft werden. Es gibt eine kleinere LFM2.5-VL-450M-Konvertierung, deren Modellbeschreibung jedoch einen aktuellen Fehler bei der visuellen Positionsbestimmung dokumentiert. Daher ist sie nicht die Standardempfehlung.

```typescript
// Das heruntergeladene Modell nach Bedarf umbenennen und entweder in android/app/src/main/assets paketieren
// oder einen lesbaren absoluten, von der App verwalteten Dateipfad angeben.
await LocalLLM.configureFallbackModel({
  path: '/android_asset/gemma-4-E2B-it.litertlm',
  maxTokens: 4096,
  maxImages: 1,
  // supportsImages ist standardmäßig true
});

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'Answer questions about the supplied image.',
});

const result = await LocalLLM.generateText({
  chatId,
  prompt: 'Describe this image concisely.',
  images: [{ uri: 'content://com.example.files/photo.jpg' }],
});
```

Jeder Eintrag in `images[]` akzeptiert genau eine der Optionen `uri` oder `base64`. Die Android-URI-Eingabe akzeptiert lesbare absolute Pfade, dekodierte `file://`-URLs ohne Authority und `content://`-URIs. Die Base64-Eingabe akzeptiert rohe kodierte Bytes oder eine URL im Format `data:image/...;base64,...`. Die veraltete Option `imagePaths` bleibt zur Kompatibilität erhalten und behält das Verhalten aus v2.0 bei: Sie leitet ausschließlich an ein konfiguriertes LiteRT-LM-Fallback weiter, auch wenn ML Kit verfügbar ist. Übergeben Sie nicht beide Optionen. Jedes dekodierte Bild ist auf 32 MiB beschränkt. Content-URIs und Base64-Eingaben werden auf einem I/O-Dispatcher in größenbeschränkte temporäre Dateien im App-Cache umgewandelt und nach der Generierung entfernt. Bilder gelten nur für den aktuellen Gesprächsschritt und werden nicht im Chatverlauf gespeichert.

Rufen Sie vor der Bildeingabe `getImageAnalysisAvailability()` auf. Android behandelt den gemeinsamen Status `available` von ML Kit Prompt als Verfügbarkeit der dokumentierten Bildeingabe-API und bevorzugt dieses Backend. Andernfalls verwendet es ein konfiguriertes bildfähiges LiteRT-LM-Fallback. ML Kit dekodiert Bilder über Android-APIs und beschränkt die Vorverarbeitung auf eine längste Kante von 2048 Pixeln und ungefähr 4 Megapixel pro Bild, mit höchstens 4 Bildern und insgesamt ungefähr 8 Megapixeln pro Anfrage. `maxImages: 4` ist daher lediglich eine Begrenzung der Anzahl; vier große Bilder können das Gesamtpixelbudget dennoch überschreiten. LiteRT-LM erhält die aufgelöste Datei direkt. Ein reines Text-Fallback weist Bildeingaben mit `LOCAL_LLM_UNSUPPORTED` zurück, statt sie stillschweigend zu ignorieren.

Der ML-Kit-Pfad für mehrere Bilder bleibt experimentell, bis Abnahmetests auf einem kompatiblen physischen Gemini-Nano-Gerät abgeschlossen sind. Betrachten Sie die ML-Kit-Bildanalyse nicht allein aufgrund von `getImageAnalysisAvailability()` als produktionsreif. Prüfen Sie Generierung und Streaming, Abbruch, mehrere Bilder, die Bereinigung von Content-URIs und Fehler bei übergroßen Bildern auf jeder unterstützten Gerätefamilie.

Bevorzugen Sie für große Modelle einen von der App verwalteten absoluten Modellpfad. `/android_asset/...` wird aus Komfortgründen unterstützt. Das Plugin muss dieses Asset jedoch in private App-Dateien kopieren, da die native Engine einen echten Dateipfad benötigt. Innerhalb derselben App-Version verwendet es die versionierte private Kopie erneut, schließt bei einer Neukonfiguration die alte Engine und entfernt ältere Kopien desselben Assets nach einer erfolgreichen neuen Initialisierung. Während eines App-Upgrades kann der maximale Speicherbedarf vorübergehend das paketierte Asset, die vorherige private Kopie und die neue temporäre Kopie umfassen. Die aktive Engine bleibt während der gesamten Lebensdauer des Plugins geladen. Von der App verwaltete Dateien dürfen erst ersetzt oder gelöscht werden, wenn das Plugin zerstört oder ein anderes Modell erfolgreich konfiguriert wurde.

Das Fallback verwendet die strukturierten Nachrichten, den nativen Streaming-Flow und die Abbruch-API von LiteRT-LM. Für breite Kompatibilität laufen die Text- und Bildverarbeitung derzeit auf der CPU. Generierung, Konfiguration, Warmup, Download und Abbau werden über denselben Plugin-Mutex serialisiert. `downloadModel()` verwaltet weiterhin ausschließlich das ML-Kit-Systemmodell. LiteRT-LM entwickelt sich schnell weiter. Behandeln Sie das Fallback daher als ausdrücklich aktivierbare Option und führen Sie vor der Veröffentlichung Langzeittests auf physischen Geräten durch.

Die Android-Abhängigkeit fixiert `kotlinx-coroutines` auf 1.11.0, da die LiteRT-LM-0.16.1-Binärdatei die neuere Standardmethoden-ABI von `SendChannel` verwendet, während ihre veröffentlichte POM noch 1.9.0 deklariert. Wird diese Versionsfixierung entfernt oder herabgesetzt, tritt beim Abschluss des nativen Streamings ein `NoSuchMethodError` auf. Siehe das vorgelagerte [LiteRT-LM-Issue #2812](https://github.com/google-ai-edge/LiteRT-LM/issues/2812).

Das Modell muss ausdrücklich aktiviert werden, die LiteRT-LM-Laufzeitabhängigkeit ist jedoch bei jedem Android-Verbraucher enthalten. Version 0.16.1 ergänzt ein AAR von ungefähr 20 MB komprimiert und native Bibliotheken von ungefähr 22 MB pro arm64-Build. Universelle Debug-APKs sind größer; Android App Bundles werden normalerweise nach ABI aufgeteilt. Prüfen Sie die endgültige APK-/AAB-Größe und die unterstützten 64-Bit-ABIs. LiteRT-LM steht unter Apache-2.0; für Modellgewichte gelten eigene Lizenzen und Nutzungsbedingungen. Übernehmen Sie `LICENSE` und `THIRD_PARTY_NOTICE.txt` der Laufzeit in die Open-Source-Hinweise Ihrer App und prüfen Sie die Bedingungen des gewählten Modells separat.
