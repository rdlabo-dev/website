---
title: "Void React Pages"
sourceRevision: 974c3f831f1e1a7f302fed9a277d899aeae20f7069e4fe5875bcf63bb5b7fd61
---

# Void React Pages

[Void](https://void.cloud/) erstellt aus Full-Stack-Anwendungen einen Cloudflare Worker und Client-Assets. Die folgende Integration richtet sich an **Void / @void/react 1.1.12, React Pages und D1** und verwendet den vorhandenen entfernten Worker. Diese Konfiguration unterstützt iOS und Android durch die Ausführung auf dem entfernten Worker. Die Kompatibilität einer lokalen Void-Laufzeit ist nicht nachgewiesen.

## Erstellen und verbinden

Erstellen Sie zunächst die vorhandene Void-Anwendung wie gewohnt mit Node **24.21.0 oder neuer**. Lassen Sie deren Konfiguration für `voidPlugin()` und `voidReact()` unverändert. Void erzeugt `dist/ssr/index.js`, `dist/ssr/wrangler.json` und `dist/client/`.

Verwenden Sie diese erzeugten Dateien in der separaten Capacitor-Konfiguration für Vite 7. Lassen Sie Voids eigene Vite-Konfiguration und -Version unverändert:

```ts
workersCapacitorPlugin({
  worker: "../dist/ssr/index.js",
  workerConfig: "../dist/ssr/wrangler.json",
  assetsExecution: "remote",
});
```

Diese Pfade setzen voraus, dass das Build-Stammverzeichnis von Capacitor ein Unterverzeichnis der Anwendung wie `capacitor/` ist. Halten Sie dessen Ausgabe von Voids `dist/` getrennt. Die erzeugte Konfiguration stellt D1- und ASSETS-Bindings bereit; weder das Parsen von `void.config.ts` noch das manuelle Duplizieren von Binding-Namen ist erforderlich. Prüfen Sie im Bericht `workers-capacitor-server.json` des Capacitor-Builds, dass der Ausführungsmodus `worker` ist.

Der Capacitor-Einstiegspunkt verwendet die gewöhnliche öffentliche API:

```ts
import { workersCapacitor } from "workers-capacitor";

const runtime = workersCapacitor({
  baseURL: "https://worker.invalid/",
  remote: { origin: "https://your-deployed-worker.example" },
  render: "/",
});
await runtime.ready;
```

Der vorhandene Worker verarbeitet Seitenanfragen, Loader, Actions und Assets aus der Ferne. Der Zugriff auf D1 bleibt dort. Der Dokumenthost der Bibliothek zeigt die Antwort als Dokument an. Informationen zu Capacitor-Installation, Authentifizierung und Dokumentrendering finden Sie in der [Integrationsanleitung](integration.md). Der native Test verwendet dieselbe Konfiguration.

## SSR und rein clientseitige Seiten

`export const ssr = false` unterdrückt das serverseitig gerenderte HTML der Seitenkomponente. Dadurch wird die Ausführung eines D1-gestützten Loaders auf dem Gerät **nicht** sicher. Lassen Sie diese Anfrage auf dem entfernten Worker ausführen: Void ermittelt dort die Loader-Daten, und der Browser rendert die Komponente. Gewöhnliche SSR-Seiten erhalten initiales HTML und werden mit Voids Client-Assets hydriert. In keinem der beiden Fälle müssen Sie die vorhandene Anwendung in eine SPA umwandeln oder ihre Formulare durch eigene API-Aufrufe ersetzen.

## Grenzen der Verifizierung

Das [eigenständige Beispiel](../demo/void/README.md) und seine Tests decken den erzeugten Worker in lokalem workerd mit D1, den Capacitor-Remote-Build und Fetch-Transport, initiales SSR-HTML, React-Hydration sowie eine Formularaktion mit Datenbankprüfung in Chromium und WebKit ab. Eine rein clientseitige Seite verwendet denselben D1-Loader; sie fehlt im initialen HTML, erscheint aber nach dem clientseitigen Rendering. Die Tests prüfen auch, dass Serverschema und Anwendungscode nicht im Geräte-Build enthalten sind.

Der Browsertest ersetzt die Netzwerkzustellung durch lokales workerd. Der native Test (`demo/tests/void/native.test.mjs`) verwendet HTTPS und die öffentliche Dokument-API, um D1-gestütztes SSR, Hydration, Formulareinfügungen mit Datenbankprüfung und rein clientseitiges Rendering in einem iOS-26.1-Simulator und Android-API-36-Emulator zu testen.

Verwenden Sie für die Navigation mit Capacitor unter iOS **1.1.12 oder neuer**. [Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) enthält unsere [Upstream-Korrektur für die Capacitor-Navigation](https://github.com/voidzero-dev/void/pull/485). Die Tests verwenden die veröffentlichten 1.1.12-Pakete, ohne den Router zu patchen oder den standardmäßigen Capacitor-Origin `capacitor://localhost` zu ändern. Versionen vor 1.1.12 lehnen dieses Schema ab; eine initiale HTML-Antwort allein weist keine funktionierende Navigation nach.

Void-spezifische Abnahme auf physischen Geräten, Integration mit bereitgestelltem Cloudflare, Produktionsauthentifizierung, native Plugin-Ereignisse, Vue, Svelte, Solid, andere Void-Bindings und lokale Ausführung sind nicht verifiziert.

Authentifizierung und Autorisierung bleiben Aufgabe der Anwendung. Das Beispiel verfügt über keine Authentifizierung und darf nicht als produktiver Datenendpunkt bereitgestellt werden. Das Entfernen von Servercode ist kein allgemeiner Geheimnisdetektor; betten Sie niemals Zugangsdaten in Client-Seiten, öffentliche Variablen oder die Capacitor-Konfiguration ein.
