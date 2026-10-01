---
title: "Bilder"
sourceRevision: "5d7d548716c09c9a6cae9e5346d3f8c29762b522303fd28486d50bf1e0d7babb"
---
# Bilder

Bildanalyse (Bildeingabe) und Bildgenerierung. Zugehörige Anleitungen: [Einrichtung](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback), [Verfügbarkeit](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Chat](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/chat).

Prüfen Sie [`getImageAnalysisAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getimageanalysisavailability) unabhängig von [`getAvailability()`](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api#getavailability) für das Textmodell, bevor Sie Bilder übergeben: Die Verfügbarkeit für Text und Bilder kann unterschiedlich sein.

## Bildanalyse

Die Eingabe `images` und `getImageAnalysisAvailability()` gehören zur API-Version `2.1.0`. Gleichen Sie die installierte Paketversion mit der [API-Referenz](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/api) ab. Die Anleitung im Quellcode garantiert nicht, dass diese Methoden in einer älteren npm-Version verfügbar sind.

### iOS

Die Bildanalyse verwendet unter iOS 27+ das native Foundation-Models-`Attachment`, wenn das Plugin mit Xcode 27 / Swift 6.4 kompiliert wurde. Jeder Eintrag in `images[]` akzeptiert entweder einen lesbaren lokalen `uri` (`content://` ist nur unter Android verfügbar) oder rohe Base64-Daten beziehungsweise eine Base64-Daten-URL. Es werden bis zu 4 Bilder akzeptiert, jeweils mit höchstens 32 MiB nach dem Dekodieren. Base64-Eingaben werden in größenbeschränkte temporäre native Dateien umgewandelt und nach der Generierung entfernt. Bei iOS-27-Builds liefert `getImageAnalysisAvailability()` den `status` des Textmodells sowie `backend: 'foundation-models'` und `maxImages: 4`. Mit älteren Xcode-Versionen erstellte Builds melden `unavailable` und können keine iOS-27-Bildunterstützung enthalten. Prüfen Sie dies unabhängig, bevor Sie Bilder anhängen. Nach einer erfolgreichen Generierung werden Bildanhänge aus dem gespeicherten Chatverlauf entfernt; die Texteingabe und die Antwort bleiben erhalten.

### Android

Die Bildanalyse wählt ausdrücklich ein natives Backend aus. `getImageAnalysisAvailability()` meldet `ml-kit-prompt`, wenn der gemeinsame Funktionsstatus von ML Kit Prompt `available` ist, da dieser SDK-Status kein separates Merkmal für die Bildverarbeitung ausweist. Ist ein konfiguriertes bildfähiges Fallback bereit, wird `litert-lm` gemeldet.

Android-Bildeingabeformate, Pixelgrenzen von ML Kit, der experimentelle Pfad für mehrere Bilder, die Kompatibilität von `imagePaths` und die Konfiguration eines bildfähigen LiteRT-LM-Fallbacks sind unter [Android-Fallback-Modell](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/android-fallback) dokumentiert.

## Bildgenerierung (nur iOS)

Die Bildgenerierung ist unter iOS 18.4+ über `generateImage()` verfügbar.

```typescript
import { LocalLLM } from '@rdlabo/capacitor-local-llm';

const { pngBase64Images } = await LocalLLM.generateImage({
  prompt: 'A serene mountain lake at sunrise, photorealistic',
  count: 2,
});

const src = `data:image/png;base64,${pngBase64Images[0]}`;
```
