---
title: "Einrichtung"
sourceRevision: "fe423815dc126915a0ef7a7673e4b6997a2926dd0f77704bb29ca5f7e48e1a26"
---
# Einrichtung

Plattformanforderungen und native Projekteinrichtung für iOS und Android. Verwandte Anleitungen: [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

## Plattformanforderungen

| Plattform | Mindestversion des Betriebssystems              | Hinweise                                                                                                                                                                  |
| -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS      | **18.4**                | Bildgenerierung benötigt iOS ab 18.4. Das Text-LLM benötigt iOS ab 26. Bildanalyse verwendet `Attachment` von Foundation Models unter iOS ab 27, wenn mit Xcode 27 / Swift 6.4 kompiliert wird. |
| Android  | **API 29 (Android 10)** | Gemini Nano über ML Kit benötigt ein kompatibles physisches Gerät, beispielsweise Pixel ab 9.                                                                                          |

## iOS-Einrichtung

CocoaPods-Nutzer benötigen keine zusätzliche Konfiguration. Foundation Models und Image Playground sind Systemframeworks, die auf unterstützten Geräten mit aktiviertem Apple Intelligence automatisch verfügbar sind.

Bei Capacitor-Projekten mit Swift Package Manager erzeugt die aktuelle Capacitor CLI `CapApp-SPM/Package.swift` mit einem iOS-18.0-Deployment-Target und erhält die erforderliche Minor-Version nicht. Ändern Sie nach jedem `npx cap sync ios` die Plattformdeklaration in `platforms: [.iOS("18.4")]`. Die enthaltene Beispielanwendung automatisiert dies mit `npm run cap:sync`. Den kleinen Wrapper mit sofortigem Abbruch bei Fehlern finden Sie unter [`example-app/scripts/sync-capacitor.mjs`](https://github.com/rdlabo-dev/capacitor-local-llm/blob/v2.2.0/example-app/scripts/sync-capacitor.mjs).

Rufen Sie zur Laufzeit [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) auf, um vor dem Erstellen von Chats oder der Textgenerierung die Bereitschaft des Textmodells zu prüfen. Prüfen Sie vor der Übergabe von Bildern separat [`getImageAnalysisAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getimageanalysisavailability), da Text- und Bildverfügbarkeit abweichen können. Einzelheiten zur Bildanalyse finden Sie unter [Bilder](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

Unter iOS-Versionen vor 26 meldet nur `getAvailability()` für das Text-LLM `'device-not-eligible'`. Text- und Chat-APIs wie `createChat()`, `deleteChat()`, `generateText()` und `streamText()` weisen mit `LOCAL_LLM_UNSUPPORTED` zurück. Bildgenerierung über `generateImage()` ist unter iOS ab 18.4 verfügbar.

[`downloadModel()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#downloadmodel) ist unter iOS nicht verfügbar; das Betriebssystem verwaltet das Modell. Beobachten Sie die Bereitschaft über `getAvailability()` oder das Ereignis `availabilityChange`.

## Android-Einrichtung

Die minimale Android-SDK-Version des Plugins ist **29** und damit höher als der derzeitige Capacitor-Standard 24. Aktualisieren Sie `android/variables.gradle` Ihrer Anwendung:

```gradle
ext {
    minSdkVersion = 29
}
```

Gemini Nano wird über Google Play Services verteilt und muss vor der Nutzung auf das Gerät heruntergeladen werden. Das Modell wird nicht mit Ihrer Anwendung gebündelt.

Wenn Gemini Nano nicht verfügbar ist, können Anwendungen ausdrücklich einen LiteRT-LM-Fallback konfigurieren. Siehe [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback).

### Verfügbarkeit prüfen und herunterladen

Rufen Sie [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) auf, um den aktuellen Zustand zu prüfen. Starten Sie beim Status `downloadable` den Download mit [`downloadModel()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#downloadmodel) und beobachten Sie `downloadProgress` und/oder `availabilityChange`, bis der Status `available` ist.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const availabilityListener = await LocalLLM.addListener('availabilityChange', ({ status }) => {
  console.log('availability:', status);
});

const progressListener = await LocalLLM.addListener('downloadProgress', (event) => {
  if (event.progress != null) {
    console.log('download progress:', event.progress);
  } else if (event.downloadedBytes != null) {
    console.log('downloaded bytes:', event.downloadedBytes);
  }
});

const { status } = await LocalLLM.getAvailability();

if (status === 'downloadable') {
  await LocalLLM.downloadModel();
}

await availabilityListener.remove();
await progressListener.remove();
```

## Web-Einrichtung

Unterstützte Desktop-Chrome-Browser führen Textgenerierung über die integrierte Prompt API aus. Siehe [Web-Einrichtung und Einschränkungen](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/web). Führen Sie zum Testen auf localhost `npm run dev` in `example-app` aus.
