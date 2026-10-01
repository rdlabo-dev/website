---
title: "Verfügbarkeit und Plattformverhalten"
sourceRevision: "3f2099b8e00f4bb36f67c2fd694e6dbaa4eb862d346bd9b8a01a677f1373f54e"
---
# Verfügbarkeit und Plattformverhalten

Die Interpretation der Statuswerte von [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) und das plattformspezifische Laufzeitverhalten. Verwandte Anleitungen: [Einrichtung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat), [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images), [Ereignisse](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/events).

## Verfügbarkeit

[`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) gibt einen semantischen Wert `status` zurück:

| Status                | Bedeutung                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `available`           | Das Textmodell ist zur Generierung bereit.                                                                                                                                                   |
| `device-not-eligible` | Das Gerät oder die Betriebssystemversion unterstützt das Textmodell auf dem Gerät nicht. iOS meldet dies genau. Androids `FeatureStatus.UNAVAILABLE` enthält keinen Grund und wird auf `unavailable` abgebildet. |
| `not-enabled`         | Das Gerät unterstützt On-Device-KI, aber der Nutzer hat sie nicht aktiviert, beispielsweise bei deaktiviertem Apple Intelligence. Wird hauptsächlich unter iOS gemeldet.                                                             |
| `downloadable`        | Das Modell kann heruntergeladen werden (Android).                                                                                                                                                    |
| `downloading`         | Ein Modelldownload läuft (Android).                                                                                                                                                |
| `not-ready`           | Das Modell ist vorhanden, wird aber noch initialisiert.                                                                                                                                               |
| `unavailable`         | Das Modell ist aus einem anderen Grund nicht verfügbar.                                                                                                                                              |

Abonnieren Sie `availabilityChange` oder den veralteten Alias `systemAvailabilityChange`, um bei registrierten Listenern Aktualisierungen zu erhalten. Unter Android fragt das Plugin den Zustand regelmäßig ab, solange Listener aktiv sind.

Das veraltete `systemAvailability()` und `systemAvailabilityChange` fassen detaillierte Zustände im ursprünglichen Vertrag mit vier Werten zusammen: `available`, `unavailable`, `notready` und `downloadable`. `downloading` und `not-ready` werden auf `notready` abgebildet; `device-not-eligible`, `not-enabled` und `unavailable` auf `unavailable`.

## Plattformverhalten

### iOS

- **Das Text-LLM benötigt iOS 26 und Apple Intelligence.** Unterhalb von iOS 26 wird die Verfügbarkeit als `device-not-eligible` gemeldet. Nur bestimmte iPhones ab iPhone 15 Pro und iPads unterstützen Apple Intelligence. [Weitere Informationen](https://www.apple.com/apple-intelligence/).
- **Chats verwenden das native Foundation-Models-Transkript.** Der Gesprächszustand liegt in `LanguageModelSession`. Vor der Generierung wendet das Plugin außerdem ein konservatives Zeichenbudget gegen die native `contextSize` des Modells an, einschließlich Anweisungen, aktuellem Prompt und Ausgabereserve. Wird eine Grenze überschritten, entfernt es die ältesten vollständigen Prompt-/Antwortschritte, erhält die Anweisungen und erstellt die Sitzung neu.
- **`warmup({ chatId, promptPrefix })` wärmt einen bestimmten Chat vor**, der mit `createChat()` erstellt wurde.
- **`cancelGeneration()` bricht den laufenden `Task`** des Chats ab. Das Promise von `streamText()` / `generateText()` wird mit `LOCAL_LLM_GENERATION_CANCELLED` zurückgewiesen. Bereits über `textChunk` gestreamter Text bleibt in Ihrer UI.
- Einzelheiten zu **Bildanalyse und Bildgenerierung** finden Sie unter [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

### Android

- **Der Gesprächsverlauf wird vom Plugin im Arbeitsspeicher strukturiert.** Jeder Chat speichert Nutzer-/Assistentenschritte und kürzt anhand von `history.maxMessages` mit Standard **20** und `history.maxCharacters` mit Standard **12000**. Gemini Nano verwendet anschließend ML Kit `countTokens()`, um in den Kontext zu passen. LiteRT-LM verwendet eine konservative Heuristik von einem Zeichen pro Token sowie Reserven für Prompt und Bilder, da Version 0.16.1 keine stabile Tokenzähl-API besitzt. Beide Wege entfernen die ältesten vollständigen Schritte. Systemanweisungen werden separat gespeichert und niemals gekürzt. Der Verlauf überdauert keinen Neustart der Anwendung.
- **`warmup()` wärmt das Modell global vor** und ignoriert `chatId` / `promptPrefix`.
- **`cancelGeneration()` arbeitet nach bestem Bemühen.** Es bricht die Coroutine des Plugins ab. ML Kit kann bereits Teilausgaben erzeugt haben, bevor der Abbruch abgeschlossen ist. Das Promise wird bei beobachtetem Abbruch mit `LOCAL_LLM_GENERATION_CANCELLED` zurückgewiesen.
- **Nicht unterstützte Werte von `GenerationOptions` werden mit `LOCAL_LLM_INVALID_OPTIONS` zurückgewiesen**, nicht still begrenzt. `maxOutputTokens` muss innerhalb von `1..min(device token limit, 4096)` liegen. Fehlt es, beträgt der Plugin-Standard **256**.
- **Native Modelloperationen laufen seriell.** Der Plugin-Mutex schützt Gemini-Nano- und LiteRT-LM-Generierung, Fallback-Konfiguration, Vorwärmen, Download und Beenden. Gleichzeitige Generierungen in verschiedenen Chats werden daher in eine Warteschlange gestellt.
- **Nicht alle Geräte ab API 29 unterstützen Gemini Nano.** Das Gerät muss einen kompatiblen On-Device-KI-Stack besitzen. [Weitere Informationen](https://developers.google.com/ml-kit/genai#device-support).
- **Anwendungen können ausdrücklich einen LiteRT-LM-Fallback konfigurieren**, wenn Gemini Nano nicht verfügbar ist. Nach Abschluss der Initialisierung meldet `getAvailability()` `available`. Siehe [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback).
- Die Backend-Auswahl für **Bildanalyse** ist unter [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images) dokumentiert.
- **On-Device-Modelle können nicht verwendet werden, während sich die App im Hintergrund befindet.** Inferenzanfragen aus dem Hintergrund schlagen fehl.
- **AICore erzwingt Inferenzkontingente pro App.** Zu viele Anfragen können im zugrunde liegenden SDK zu Auslastungs- oder Kontingentfehlern führen. Ziehen Sie exponentielles Backoff in Betracht.

### Web (Chrome)

Die Textverfügbarkeit bildet die Chrome-Zustände `available`, `downloadable`, `downloading` und `unavailable` direkt ab. Fehlt die API, wird `unavailable` gemeldet. Verfügbarkeitsereignisse geben Änderungen wieder, die bei Plugin-Prüfungen sowie beim Erstellen oder Herunterladen von Sitzungen beobachtet werden; sie beruhen nicht auf regelmäßigen Hintergrundabfragen. Die Bildanalyse meldet derzeit `unavailable`. Informationen zur Einrichtung, zu unterstützten Methoden und zur Steuerung der Generierung finden Sie unter [Web](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web).
