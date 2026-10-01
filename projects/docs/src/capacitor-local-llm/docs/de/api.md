---
title: "API"
sourceRevision: "66deceaae39427a7fcd43939bf55936aa204fc9db9aa1f442c30f26e5897ce4d"
---
* [`getAvailability()`](#getavailability)
* [`getImageAnalysisAvailability()`](#getimageanalysisavailability)
* [`downloadModel()`](#downloadmodel)
* [`configureFallbackModel(...)`](#configurefallbackmodel)
* [`warmup(...)`](#warmup)
* [`createChat(...)`](#createchat)
* [`deleteChat(...)`](#deletechat)
* [`generateText(...)`](#generatetext)
* [`streamText(...)`](#streamtext)
* [`cancelGeneration(...)`](#cancelgeneration)
* [`addListener('availabilityChange', ...)`](#addlisteneravailabilitychange-)
* [`addListener('systemAvailabilityChange', ...)`](#addlistenersystemavailabilitychange-)
* [`addListener('downloadProgress', ...)`](#addlistenerdownloadprogress-)
* [`addListener('textChunk', ...)`](#addlistenertextchunk-)
* [`addListener('generationStateChange', ...)`](#addlistenergenerationstatechange-)
* [`removeAllListeners()`](#removealllisteners)
* [`generateImage(...)`](#generateimage)
* [`systemAvailability()`](#systemavailability)
* [`download()`](#download)
* [`prompt(...)`](#prompt)
* [`endSession(...)`](#endsession)
* [Interfaces](#interfaces)
* [Typaliase](#type-aliases)

<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

Öffentlicher Vertrag des On-Device-LLM-Plugins.

### getAvailability()

```typescript
getAvailability() => Promise<GetAvailabilityResult>
```

Liefert die detaillierte Verfügbarkeit des Textmodells. Die Web-Implementierung prüft die Unterstützung der Chrome Prompt API; nicht unterstützte Browser geben `unavailable` zurück.

**Rückgabe:** <code>Promise&lt;<a href="#getavailabilityresult">GetAvailabilityResult</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### getImageAnalysisAvailability()

```typescript
getImageAnalysisAvailability() => Promise<GetImageAnalysisAvailabilityResult>
```

Liefert die Verfügbarkeit der Bildanalyse und das native Backend, das Bildeingaben verarbeiten würde.
Mit Xcode 27 / Swift 6.4 kompilierte iOS-27-Builds geben den Textmodell-`status` sowie
`backend: 'foundation-models'` und `maxImages: 4` zurück. Mit älteren Xcode-Versionen erstellte Builds melden
`unavailable` und können keine iOS-27-Bildunterstützung enthalten. Android meldet Gemini-Nano-Prompt-
APIs oder ein konfiguriertes LiteRT-LM-Fallback. Die Web-Implementierung meldet für Bildanalyse derzeit `unavailable`.

**Rückgabe:** <code>Promise&lt;<a href="#getimageanalysisavailabilityresult">GetImageAnalysisAvailabilityResult</a>&gt;</code>

**Seit:** 2.1.0

--------------------

### downloadModel()

```typescript
downloadModel() => Promise<void>
```

Startet einen Modelldownload unter Android oder Chrome im Web. Im Web durch eine Nutzeraktion aufrufen; Chrome verwaltet das Modell.

**Seit:** 2.0.0

--------------------

### configureFallbackModel(...)

```typescript
configureFallbackModel(options: ConfigureFallbackModelOptions) => Promise<void>
```

Initialisiert ein ausdrücklich konfiguriertes Android-LiteRT-LM-Fallback-Modell. Gemini Nano bleibt bevorzugt, sofern verfügbar.
Die Modellkonfiguration führt lokale Dateioperationen aus und kann längere Zeit dauern. iOS und Web lehnen diese API ab.

| Parameter         | Typ                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#configurefallbackmodeloptions">ConfigureFallbackModelOptions</a></code> |

**Seit:** 2.0.0

--------------------

### warmup(...)

```typescript
warmup(options?: WarmupOptions | undefined) => Promise<void>
```

Wärmt Modellressourcen vor. Die Web-Implementierung erstellt und beendet eine temporäre Textsitzung; `promptPrefix` gilt nur für iOS.

| Parameter         | Typ                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#warmupoptions">WarmupOptions</a></code> |

**Seit:** 1.0.0

--------------------

### createChat(...)

```typescript
createChat(options?: CreateChatOptions | undefined) => Promise<CreateChatResult>
```

Erstellt einen Chat, der bis zu seiner Löschung vom Plugin verwaltet wird.

| Parameter         | Typ                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#createchatoptions">CreateChatOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#createchatresult">CreateChatResult</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### deleteChat(...)

```typescript
deleteChat(options: DeleteChatOptions) => Promise<void>
```

Löscht einen Chat und bricht dessen Generierung ab.

| Parameter         | Typ                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#deletechatoptions">DeleteChatOptions</a></code> |

**Seit:** 2.0.0

--------------------

### generateText(...)

```typescript
generateText(options: GenerateTextOptions) => Promise<GenerateTextResult>
```

Generiert den vollständigen Text.

| Parameter         | Typ                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#generatetextoptions">GenerateTextOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#generatetextresult">GenerateTextResult</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### streamText(...)

```typescript
streamText(options: StreamTextOptions) => Promise<StreamTextResult>
```

Streamt native Textstücke und gibt den vollständigen Text zurück.

| Parameter         | Typ                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#generatetextoptions">GenerateTextOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#generatetextresult">GenerateTextResult</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### cancelGeneration(...)

```typescript
cancelGeneration(options: CancelGenerationOptions) => Promise<void>
```

Bricht eine laufende Generierung ab.

| Parameter         | Typ                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#cancelgenerationoptions">CancelGenerationOptions</a></code> |

**Seit:** 2.0.0

--------------------

### addListener('availabilityChange', ...)

```typescript
addListener(eventName: 'availabilityChange', listenerFunc: AvailabilityChangeListener) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Verfügbarkeitsänderungen. Die Web-Implementierung meldet Änderungen, die bei Verfügbarkeitsprüfungen sowie beim Erstellen oder Herunterladen einer Sitzung erkannt werden.

| Parameter              | Typ                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'availabilityChange'</code>                                                 |
| **`listenerFunc`** | <code><a href="#availabilitychangelistener">AvailabilityChangeListener</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### addListener('systemAvailabilityChange', ...)

```typescript
addListener(eventName: 'systemAvailabilityChange', listenerFunc: SystemAvailabilityChangeListener) => Promise<PluginListenerHandle>
```

| Parameter              | Typ                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'systemAvailabilityChange'</code>                                                       |
| **`listenerFunc`** | <code><a href="#systemavailabilitychangelistener">SystemAvailabilityChangeListener</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 1.0.0

--------------------

### addListener('downloadProgress', ...)

```typescript
addListener(eventName: 'downloadProgress', listenerFunc: DownloadProgressListener) => Promise<PluginListenerHandle>
```

Registriert einen Listener für den Downloadfortschritt unter Android oder Chrome im Web.

| Parameter              | Typ                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **`eventName`**    | <code>'downloadProgress'</code>                                               |
| **`listenerFunc`** | <code><a href="#downloadprogresslistener">DownloadProgressListener</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### addListener('textChunk', ...)

```typescript
addListener(eventName: 'textChunk', listenerFunc: TextChunkListener) => Promise<PluginListenerHandle>
```

Registriert einen Listener für native Textstücke.

| Parameter              | Typ                                                            |
| ------------------ | --------------------------------------------------------------- |
| **`eventName`**    | <code>'textChunk'</code>                                        |
| **`listenerFunc`** | <code><a href="#textchunklistener">TextChunkListener</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 2.0.0

--------------------

### addListener('generationStateChange', ...)

```typescript
addListener(eventName: 'generationStateChange', listenerFunc: GenerationStateChangeListener) => Promise<PluginListenerHandle>
```

Registriert einen Listener für Start, Abschluss, Abbruch und Fehlschlag einer Generierung.

| Parameter              | Typ                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'generationStateChange'</code>                                                    |
| **`listenerFunc`** | <code><a href="#generationstatechangelistener">GenerationStateChangeListener</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Seit:** 2.1.0

--------------------

### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

Entfernt alle Plugin-Listener.

**Seit:** 1.0.0

--------------------

### generateImage(...)

```typescript
generateImage(options: GenerateImageOptions) => Promise<GenerateImageResponse>
```

Generiert PNG-Bilder unter iOS.

| Parameter         | Typ                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code><a href="#generateimageoptions">GenerateImageOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#generateimageresponse">GenerateImageResponse</a>&gt;</code>

**Seit:** 1.0.0

--------------------

### systemAvailability()

```typescript
systemAvailability() => Promise<SystemAvailabilityResponse>
```

**Rückgabe:** <code>Promise&lt;<a href="#systemavailabilityresponse">SystemAvailabilityResponse</a>&gt;</code>

**Seit:** 1.0.0

--------------------

### download()

```typescript
download() => Promise<void>
```

**Seit:** 1.0.0

--------------------

### prompt(...)

```typescript
prompt(options: PromptOptions) => Promise<PromptResponse>
```

| Parameter         | Typ                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#promptoptions">PromptOptions</a></code> |

**Rückgabe:** <code>Promise&lt;<a href="#promptresponse">PromptResponse</a>&gt;</code>

**Seit:** 1.0.0

--------------------

### endSession(...)

```typescript
endSession(options: EndSessionOptions) => Promise<void>
```

Beendet eine ältere Sitzung. Bereits beendete oder unbekannte Sitzungskennungen werden erfolgreich und ohne Wirkung verarbeitet.

| Parameter         | Typ                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#endsessionoptions">EndSessionOptions</a></code> |

**Seit:** 1.0.0

--------------------

### Interfaces

#### GetAvailabilityResult

Von Verfügbarkeitsprüfungen zurückgegebenes Ergebnis.

| Eigenschaft         | Typ                                                  | Beschreibung                      | Seit |
| ------------ | ----------------------------------------------------- | -------------------------------- | ----- |
| **`status`** | <code><a href="#availability">Availability</a></code> | Aktuelle Verfügbarkeit des Textmodells. | 2.0.0 |

#### GetImageAnalysisAvailabilityResult

Von Verfügbarkeitsprüfungen für Bildanalyse zurückgegebenes Ergebnis.

| Eigenschaft            | Typ                                                                  | Beschreibung                                                       | Seit |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| **`status`**    | <code><a href="#availability">Availability</a></code>                 | Aktuelle Verfügbarkeit der Bildanalyse.                              | 2.1.0 |
| **`backend`**   | <code><a href="#imageanalysisbackend">ImageAnalysisBackend</a></code> | Natives Backend, das die Bildanalyse bei Verfügbarkeit ausführen würde.   | 2.1.0 |
| **`maxImages`** | <code>number</code>                                                   | Maximale Anzahl Bilder pro Generierung für das aktive Backend. | 2.1.0 |

#### ConfigureFallbackModelOptions

Konfiguriert ein ausdrücklich aktiviertes Android-LiteRT-LM-Fallback, das verwendet wird, wenn Gemini Nano nicht verfügbar ist.
Das Modell muss bereits als App-Asset oder als lesbare, von der App verwaltete Datei vorliegen. iOS und Web lehnen diese API ab.

| Eigenschaft                 | Typ                 | Beschreibung                                                                                               | Seit |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| **`path`**           | <code>string</code>  | Pfad zum `.litertlm`-Modell. Für mitgelieferte Assets `/android_asset/...` verwenden, andernfalls einen absoluten, von der App verwalteten Dateipfad. | 2.0.0 |
| **`maxTokens`**      | <code>number</code>  | An LiteRT-LM übergebene kombinierte Kontextkapazität. Standardwert: 4096.                                          | 2.0.0 |
| **`maxImages`**      | <code>number</code>  | Maximale Anzahl Bilder pro Generierung für ein bildfähiges Modell. Standardwert: 1.                      | 2.0.0 |
| **`supportsImages`** | <code>boolean</code> | Initialisiert die Bildverarbeitungspipeline von LiteRT-LM. Standardwert: `true`; nur für ein reines Textmodell auf `false` setzen.   | 2.0.0 |

#### WarmupOptions

Optionen für das Vorwärmen. Android wärmt das Modell global vor; iOS kann einen Chat vorwärmen.
Die Web-Implementierung erstellt und beendet eine temporäre Sitzung, optional mit dem Kontext eines Chats.

| Eigenschaft               | Typ                | Beschreibung                                                                  | Seit |
| ------------------ | ------------------- | ---------------------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Explizite Chatkennung für das Vorwärmen unter iOS oder als Kontext für das Vorwärmen im Web. | 2.0.0 |
| **`sessionId`**    | <code>string</code> |                                                                              | 1.0.0 |
| **`promptPrefix`** | <code>string</code> | Optionales Prompt-Präfix für Foundation Models.                            | 1.0.0 |

#### CreateChatResult

Ergebnis mit der Kennung des vom Plugin verwalteten Chats.

| Eigenschaft     | Typ                | Beschreibung                                           | Seit |
| -------- | ------------------- | ----------------------------------------------------- | ----- |
| **`id`** | <code>string</code> | Für Generierungs- und Löschaufrufe erforderliche Kennung. | 2.0.0 |

#### CreateChatOptions

Optionen zum Erstellen eines vom Plugin verwalteten Chats.

| Eigenschaft               | Typ                                                              | Beschreibung                                      | Seit |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------ | ----- |
| **`instructions`** | <code>string</code>                                               | Dauerhafte Systemanweisungen für diesen Chat.    | 2.0.0 |
| **`history`**      | <code><a href="#chathistoryoptions">ChatHistoryOptions</a></code> | Grenzen des Chatverlaufs auf iOS, Android und im Web. | 2.0.0 |

#### ChatHistoryOptions

Grenzen des Chatverlaufs. Alle Implementierungen behalten die Anweisungen bei und verwerfen jeweils die ältesten vollständigen Gesprächsrunden.

| Eigenschaft                | Typ                | Beschreibung                                             | Seit |
| ------------------- | ------------------- | ------------------------------------------------------- | ----- |
| **`maxMessages`**   | <code>number</code> | Maximale Anzahl gespeicherter Nachrichten. Standardwert: 20.              | 2.0.0 |
| **`maxCharacters`** | <code>number</code> | Maximale Anzahl gespeicherter Nachrichtenzeichen. Standardwert: 12000. | 2.0.0 |

#### DeleteChatOptions

Optionen zum Löschen eines Chats.

| Eigenschaft     | Typ                | Beschreibung                                 | Seit |
| -------- | ------------------- | ------------------------------------------- | ----- |
| **`id`** | <code>string</code> | Von `createChat()` zurückgegebene Chatkennung. | 2.0.0 |

#### GenerateTextResult

Ergebnis einer Textgenerierung.

| Eigenschaft               | Typ                | Beschreibung                                                  | Seit |
| ------------------ | ------------------- | ------------------------------------------------------------ | ----- |
| **`text`**         | <code>string</code> | Vollständiger generierter Text.                                     | 2.0.0 |
| **`generationId`** | <code>string</code> | Kennung, mit der Diagnosedaten einer Generierung zugeordnet werden können. | 2.0.0 |

#### GenerateTextOptions

Optionen für eine Generierung ohne Streaming.

| Eigenschaft             | Typ                                                            | Beschreibung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Seit |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`chatId`**     | <code>string</code>                                             | Von `createChat()` zurückgegebene Chatkennung.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 2.0.0 |
| **`prompt`**     | <code>string</code>                                             | Nutzerprompt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 2.0.0 |
| **`images`**     | <code>ImageInput[]</code>                                       | Bilder, die einem bildfähigen Backend übergeben werden. Unter iOS 27 oder neuer (mit Xcode 27 / Swift 6.4 kompilierte Builds) akzeptiert Foundation Models `Attachment` bis zu 4 Bilder mit jeweils höchstens 32 MiB über lesbare absolute Pfade, `file://`-URLs, rohes Base64 oder Base64-Daten-URLs. Nach einer erfolgreichen Generierung werden Anhänge aus dem gespeicherten Chatverlauf entfernt, während der Textprompt und die Antwort erhalten bleiben. Android verwendet Gemini-Nano-Prompt-APIs oder ein konfiguriertes LiteRT-LM-Fallback mit absoluten Pfaden, `file://`-, `content://`- oder Base64-Eingaben und den Gesamtpixelgrenzen von ML Kit. Web- und reine Textbackends lehnen Bildeingaben mit `LOCAL_LLM_UNSUPPORTED` ab. | 2.1.0 |
| **`imagePaths`** | <code>string[]</code>                                           | Lokale Bildpfade für ein bildfähiges Android-LiteRT-LM-Fallback-Modell. Absolute Pfade, `file://`-URLs und lesbare `content://`-URIs werden akzeptiert. Dieser Kompatibilitätspfad behält das LiteRT-LM-Routing von v2.0 bei, auch wenn ML Kit verfügbar ist.                                                                                                                                                                                                                                                                                                                                                                               | 2.0.0 |
| **`options`**    | <code><a href="#generationoptions">GenerationOptions</a></code> | Optionale Generierungseinstellungen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 2.0.0 |

#### ImageUriInput

Lokale URI als Bildeingabe.

| Eigenschaft         | Typ                | Beschreibung                                                                                                                                     | Seit |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`uri`**    | <code>string</code> | Bild-URI. iOS akzeptiert lesbare absolute lokale Pfade und `file://`-URLs. Android akzeptiert absolute Pfade, `file://`-URLs und `content://`-URIs. | 2.1.0 |
| **`base64`** |                     | Base64- und URI-Eingaben schließen sich gegenseitig aus.                                                                                                   | 2.1.0 |

#### Base64ImageInput

Base64-kodiertes Bild als Eingabe.

| Eigenschaft         | Typ                | Beschreibung                                                                                            | Seit |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| **`base64`** | <code>string</code> | Rohe Base64-Bildbytes oder eine `data:image/...;base64,...`-URL. Das dekodierte Bild darf 32 MiB nicht überschreiten. | 2.1.0 |
| **`uri`**    |                     | Base64- und URI-Eingaben schließen sich gegenseitig aus.                                                          | 2.1.0 |

#### GenerationOptions

Plattformübergreifende Steuerung der Textgenerierung. Nicht unterstützte Werte werden abgelehnt und nicht auf Grenzwerte begrenzt. In der Chrome-Web-Implementierung müssen diese Einstellungen weggelassen werden.

| Eigenschaft                  | Typ                | Beschreibung                            | Seit |
| --------------------- | ------------------- | -------------------------------------- | ----- |
| **`temperature`**     | <code>number</code> | Sampling-Temperatur.                  | 2.0.0 |
| **`topK`**            | <code>number</code> | Wählt aus den k wahrscheinlichsten Tokens aus. | 2.0.0 |
| **`maxOutputTokens`** | <code>number</code> | Maximale Anzahl generierter Tokens.              | 2.0.0 |

#### CancelGenerationOptions

Optionen zum Abbrechen einer laufenden Generierung.

| Eigenschaft               | Typ                | Beschreibung                                                         | Seit |
| ------------------ | ------------------- | ------------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Chat, dem die Generierung zugeordnet ist.                                      | 2.0.0 |
| **`generationId`** | <code>string</code> | Optionale Generierungskennung; eine Abweichung wird wie ein nicht gefundenes Objekt behandelt. | 2.0.0 |

#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

#### SystemAvailabilityResponse

| Eigenschaft         | Typ                                                        | Beschreibung                                                                                  | Seit |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- |
| **`status`** | <code><a href="#llmavailability">LLMAvailability</a></code> | Älterer Verfügbarkeitswert. Detaillierte Zustände werden auf den ursprünglichen Vertrag mit vier Werten abgebildet. | 1.0.0 |

#### DownloadProgressEvent

Fortschritt des Modelldownloads. Android-Zwischenereignisse enthalten kein `progress`, da ML Kit keine Gesamtzahl der Bytes liefert.

| Eigenschaft                  | Typ                | Beschreibung                                                                 | Seit |
| --------------------- | ------------------- | --------------------------------------------------------------------------- | ----- |
| **`progress`**        | <code>number</code> | Bekannter normierter Fortschritt: 0 zu Beginn und 1 bei Abschluss.                  | 2.0.0 |
| **`downloadedBytes`** | <code>number</code> | Bisher heruntergeladene Bytes, sofern ML Kit diese Angabe bereitstellt.                            | 2.0.0 |
| **`totalBytes`**      | <code>number</code> | Gesamtzahl der Bytes, sofern ein Plattform-SDK sie bereitstellt. Derzeit unter Android nicht enthalten. | 2.0.0 |

#### TextChunkEvent

Von `streamText()` ausgegebene inkrementelle Textstücke.

| Eigenschaft               | Typ                | Beschreibung                                              | Seit |
| ------------------ | ------------------- | -------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code> | Chat, dem die Generierung zugeordnet ist.                           | 2.0.0 |
| **`generationId`** | <code>string</code> | Kennung dieser Generierung.                           | 2.0.0 |
| **`text`**         | <code>string</code> | Nur neu generierter Text, nicht die angesammelte Momentaufnahme. | 2.0.0 |

#### GenerationStateChangeEvent

Lebenszyklusereignis für `generateText()` und `streamText()`.

| Eigenschaft               | Typ                                                            | Beschreibung                                                       | Seit |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| **`chatId`**       | <code>string</code>                                             | Chat, dem die Generierung zugeordnet ist.                                    | 2.1.0 |
| **`generationId`** | <code>string</code>                                             | Native Generierungskennung, verfügbar ab dem Ereignis `started`. | 2.1.0 |
| **`state`**        | <code><a href="#generationstate">GenerationState</a></code>     | Aktueller Lebenszykluszustand.                                          | 2.1.0 |
| **`errorCode`**    | <code><a href="#localllmerrorcode">LocalLLMErrorCode</a></code> | Stabiler Fehlercode für die Zustände `cancelled` und `failed`.            | 2.1.0 |

#### GenerateImageResponse

Ergebnis der Bildgenerierung.

| Eigenschaft                  | Typ                  | Beschreibung                                      | Seit |
| --------------------- | --------------------- | ------------------------------------------------ | ----- |
| **`pngBase64Images`** | <code>string[]</code> | Rohe Base64-kodierte PNG-Bilder ohne Daten-URI-Präfix. | 1.0.0 |

#### GenerateImageOptions

Optionen für die Bildgenerierung. Bildgenerierung ist nur ab iOS 18.4 verfügbar.

| Eigenschaft               | Typ                  | Beschreibung                          | Seit |
| ------------------ | --------------------- | ------------------------------------ | ----- |
| **`prompt`**       | <code>string</code>   | Bildbeschreibung.                   | 1.0.0 |
| **`promptImages`** | <code>string[]</code> | Optionale Base64-Referenzbilder.    | 1.0.0 |
| **`count`**        | <code>number</code>   | Anzahl der Varianten. Standardwert: 1. | 1.0.0 |

#### PromptResponse

Ältere Prompt-Antwort.

| Eigenschaft       | Typ                | Beschreibung              | Seit |
| ---------- | ------------------- | ------------------------ | ----- |
| **`text`** | <code>string</code> | Vollständiger generierter Text. | 1.0.0 |

#### PromptOptions

Ältere Prompt-Optionen.

| Eigenschaft               | Typ                                              | Beschreibung                                                 | Seit |
| ------------------ | ------------------------------------------------- | ----------------------------------------------------------- | ----- |
| **`sessionId`**    | <code>string</code>                               | Optionale Kennung einer älteren Sitzung.                         | 1.0.0 |
| **`instructions`** | <code>string</code>                               | Bei der erstmaligen Erstellung der älteren Sitzung verwendete Anweisungen. | 1.0.0 |
| **`options`**      | <code><a href="#llmoptions">LLMOptions</a></code> | Ältere Einstellungen für die Generierung.                                 | 1.0.0 |
| **`prompt`**       | <code>string</code>                               | Nutzerprompt.                                                | 1.0.0 |

#### LLMOptions

| Eigenschaft                      | Typ                | Beschreibung               | Seit |
| ------------------------- | ------------------- | ------------------------- | ----- |
| **`temperature`**         | <code>number</code> | Sampling-Temperatur.     | 1.0.0 |
| **`maximumOutputTokens`** | <code>number</code> | Maximale Anzahl generierter Tokens. | 1.0.0 |

#### EndSessionOptions

Optionen zum Löschen einer älteren Sitzung.

| Eigenschaft            | Typ                | Beschreibung                | Seit |
| --------------- | ------------------- | -------------------------- | ----- |
| **`sessionId`** | <code>string</code> | Kennung der älteren Sitzung. | 1.0.0 |

### Typaliase

#### Availability

Die semantische Verfügbarkeit des Textmodells auf dem Gerät.

<code>'available' | 'device-not-eligible' | 'not-enabled' | 'downloadable' | 'downloading' | 'not-ready' | 'unavailable'</code>

#### ImageAnalysisBackend

Für die Bildanalyse auf dem Gerät ausgewähltes natives Backend.

<code>'foundation-models' | 'ml-kit-prompt' | 'litert-lm'</code>

#### ImageInput

Bildreferenz für Textgenerierung mit Bildverarbeitung.

<code><a href="#imageuriinput">ImageUriInput</a> | <a href="#base64imageinput">Base64ImageInput</a></code>

#### StreamTextOptions

Optionen für native Streaming-Generierung.

<code><a href="#generatetextoptions">GenerateTextOptions</a></code>

#### StreamTextResult

Abschließendes Ergebnis einer nativen Streaming-Generierung.

<code><a href="#generatetextresult">GenerateTextResult</a></code>

#### AvailabilityChangeListener

Listener für Verfügbarkeitsänderungen.

<code>(event: <a href="#getavailabilityresult">GetAvailabilityResult</a>): void</code>

#### SystemAvailabilityChangeListener

<code>(event: <a href="#systemavailabilityresponse">SystemAvailabilityResponse</a>): void</code>

#### LLMAvailability

<code>'available' | 'unavailable' | 'notready' | 'downloadable'</code>

#### DownloadProgressListener

Listener für den Fortschritt des Modelldownloads.

<code>(event: <a href="#downloadprogressevent">DownloadProgressEvent</a>): void</code>

#### TextChunkListener

Listener für native Generierungsabschnitte.

<code>(event: <a href="#textchunkevent">TextChunkEvent</a>): void</code>

#### GenerationStateChangeListener

Listener für Änderungen des nativen Generierungslebenszyklus.

<code>(event: <a href="#generationstatechangeevent">GenerationStateChangeEvent</a>): void</code>

#### GenerationState

Zustand des nativen Generierungslebenszyklus.

<code>'started' | 'completed' | 'cancelled' | 'failed'</code>

#### LocalLLMErrorCode

Stabile Local-LLM-Fehlercodes.

<code>'LOCAL_LLM_NOT_AVAILABLE' | 'LOCAL_LLM_DEVICE_NOT_ELIGIBLE' | 'LOCAL_LLM_NOT_ENABLED' | 'LOCAL_LLM_MODEL_NOT_READY' | 'LOCAL_LLM_MODEL_DOWNLOAD_REQUIRED' | 'LOCAL_LLM_CONTEXT_WINDOW_EXCEEDED' | 'LOCAL_LLM_CHAT_NOT_FOUND' | 'LOCAL_LLM_CHAT_BUSY' | 'LOCAL_LLM_GENERATION_NOT_FOUND' | 'LOCAL_LLM_GENERATION_CANCELLED' | 'LOCAL_LLM_INVALID_OPTIONS' | 'LOCAL_LLM_UNSUPPORTED' | 'LOCAL_LLM_IMAGE_NOT_READABLE' | 'LOCAL_LLM_IMAGE_TOO_LARGE' | 'LOCAL_LLM_GENERATION_FAILED' | 'LOCAL_LLM_IMAGE_GENERATION_FAILED' | 'LOCAL_LLM_UNKNOWN_ERROR'</code>
