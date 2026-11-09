---
sourceRevision: "0ed08a5bc4e61a961fca993c3e8e50da51b29dcc99005812b1c14e8703c9e6a9"
title: Dynamische Android-Farben
---

# Dynamische Android-Farben

Dynamische Farben sind eine unterstützte, ausdrücklich zu aktivierende API. Lesen Sie die Material You-Palette des Geräts, ohne Native UI-Projektion zu aktivieren, das Activity-Theme zu ändern oder Wallpaper-/Speicherberechtigungen anzufordern. Zum Auslesen der Farben ist Ionic nicht erforderlich. App-lokale SwiftUI-/Compose-Erweiterungen bleiben experimentell; ihr Status ist davon unabhängig.

## Installieren und importieren

Installieren Sie das Plugin als direkte Anwendungsabhängigkeit, synchronisieren Sie und bauen Sie anschließend die Android-App neu. Allein ein JavaScript-Update kann einem installierten APK keine native Methode hinzufügen.

```sh
npm install @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

Verwenden Sie den Pakethaupteinstieg für Funktionen und Typen:

```ts
import {
  getDynamicColorScheme,
  addDynamicColorListener,
  materialColorRoles,
  type DynamicColorScheme,
  type MaterialColorScheme,
  type MaterialColorRole,
} from '@rdlabo/capacitor-native-ui';
```

Der native Getter und die Root-Exports sind in 2.1.3 enthalten. Ältere Installationen wie 2.1.1 benötigen ein Update und einen nativen Neubuild. Diese Anleitung beschreibt die API des aktuellen Quellcodes; die Aufhebung der Einstufung als experimentell gilt ab dem Release, das diese Änderung enthält. Verwenden Sie den früheren Plugin-Unterpfad `/dynamic-colors` nicht.

## Farbschema lesen

```ts
const result = await getDynamicColorScheme();
if (result.available) {
  const colors = result.systemDark ? result.dark : result.light;
  console.log(colors.primary, colors.onPrimary);
}
```

`getDynamicColorScheme(): Promise<DynamicColorScheme>` liest beide Erscheinungsbilder mit einem nativen Aufruf. Die Funktion liefert eine Momentaufnahme, speichert sie nicht zwischen und wendet kein CSS an.

| Plattform | Ergebnis |
| --- | --- |
| Android 12+ (API 31+) | `{ available: true, systemDark, light, dark }` |
| Android 11 und älter | `{ available: false, systemDark }` |
| iOS / Web | `{ available: false, systemDark }`, ohne Lesen über die native Bridge |

`systemDark` ist das Nachtmodus-Flag der Android-Konfiguration. Unter iOS/Web stammt es aus `prefers-color-scheme: dark` oder ist false, wenn `matchMedia` nicht verfügbar ist. Ist `available` false, gibt es keine Eigenschaften `light` oder `dark`. Behalten Sie die bestehende Anwendungspalette bei. Native Lesefehler weisen die Promise zurück; sie werden nicht in `available: false` umgewandelt.

### Farbvertrag

Jedes `MaterialColorScheme` enthält deckende sechsstellige `#RRGGBB`-Zeichenfolgen. Groß-/Kleinschreibung hexadezimaler Buchstaben ist unerheblich. `primary`, `secondary`, `tertiary`, `error`, `surface` und `onSurface` sind erforderlich; weitere Rollen sind im öffentlichen Typ optional, damit Nutzer partielle Farbschemata akzeptieren können. Die aktuelle Android-Implementierung liefert alle 46 Namen aus `materialColorRoles` für jedes Erscheinungsbild:

- Akzent- und Vordergrundrollen, einschließlich primary-/secondary-/tertiary-Container.
- Fehler- und Fehlercontainer-Paare.
- Fläche, Flächencontainerstufen und Flächenvordergründe.
- Kontur, Konturvariante, Abdunklung sowie inverse und feste Rollen.

Verwenden Sie `MaterialColorRole` für Rollennamen und `materialColorRoles` zum Auflisten der unterstützten Namen. Behalten Sie beim Rendern Hintergrund-/Vordergrundpaare wie `primary` und `onPrimary` bei. Die Werte stammen aus den dynamischen hellen/dunklen Farbschemata von AndroidX Material 3; das Plugin erzeugt keine Palette neu aus einer einzelnen Ausgangsfarbe und stellt keine rohen Tonwertpaletten bereit. Die Werte hängen von der Systempalette des Geräts ab.

## Änderungen beobachten und aufräumen

`addDynamicColorListener(listener: () => void)` liefert eine Promise für ein `PluginListenerHandle` mit `remove(): Promise<void>`.

Android benachrichtigt bei Wiederaufnahme der Activity und Konfigurationsänderungen. Eine Benachrichtigung bedeutet **erneut lesen**, nicht zwingend, dass sich die Farben geändert haben. Sie enthält kein Farbschema und ist kein fortlaufendes Abonnement von Wallpaper-Änderungen. Unter iOS/Web liefert die Funktion ein entfernbares Handle ohne Wirkung; beobachten Sie das Browser-Erscheinungsbild separat, wenn Sie einen eigenen Controller implementieren.

Registrieren Sie vor dem ersten Lesen, um keine Änderung während des Starts zu verpassen:

```ts
const refresh = async () => {
  const result = await getDynamicColorScheme();
  // Ergebnis hier anwenden oder speichern; bei Nichtverfügbarkeit den Fallback behalten.
  console.log(result);
};
const handle = await addDynamicColorListener(() => {
  void refresh().catch(console.error);
});
try {
  await refresh();
} catch (error) {
  await handle.remove();
  throw error;
}

// Beim Aufräumen der Anwendung:
await handle.remove();
```

Fassen Sie bei einem eigenen Controller gleichzeitige Lesevorgänge zusammen und behalten Sie bei fehlgeschlagener Aktualisierung die zuletzt funktionierende Palette bei. Der nachstehende Ionic-Controller übernimmt diese Details.

## Auf Ionic anwenden

Das Plugin ermittelt Farben; das Theme verantwortet Konvertierung und CSS-Lebenszyklus. Ein Aufruf von `enableNativeUI()` oder eine andere Projektionseinrichtung ist nicht erforderlich.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// Bei Änderung der Erscheinungsbildpräferenz:
theme.setMode('dark'); // 'light' und 'system' werden ebenfalls unterstützt.

// Beim Aufräumen der Anwendung:
await theme.destroy();
```

Installieren Sie das MD3-Theme und importieren Sie Ionics `dark.class.css` im globalen Stylesheet. Kombinieren Sie es nicht mit `dark.system.css` oder `dark.always.css`. Initialisieren Sie einen Controller pro Browserdokument, sobald das DOM verfügbar ist; führen Sie ihn nicht beim Server-Rendering aus. Die [Theme-Einrichtungs- und Zuordnungsanleitung](/ionic-theme-md3/docs/dynamic-colors) beschreibt die vollständige Stylesheet-Einrichtung, Fallback-Regeln, Fehler und Erscheinungsbildsteuerung.

Ionic-Paletten reichen auch ohne diese Funktion aus. Material-Rollen erweitern optionale Tokens und bewahren dabei ausdrückliche Ionic-Farbwahlen, standardmäßig weiße Flächen und getrennte light-/medium-/dark-Paletten. Success und warning behalten ihre Ionic-Werte.

## Fehlerbehebung

- **Native Methode nicht implementiert:** Aktualisieren Sie die Plugin-Abhängigkeit, führen Sie Capacitor-Sync aus, bauen Sie die Android-App neu und installieren Sie sie erneut. Prüfen Sie das native Binary ebenso wie die JavaScript-Version.
- **Keine Farben unter iOS/Web/älterem Android:** `available: false` ist zu erwarten; behalten Sie die bestehende Palette. Dies ist kein Installationsfehler.
- **Wallpaper-Änderungen erscheinen nicht sofort:** Lesen Sie nach Rückkehr in die App erneut oder fordern Sie ausdrücklich eine Aktualisierung an. Benachrichtigungen sind Lebenszyklus-/Konfigurationsinvalidierungen, keine Garantie für ein sofortiges Wallpaper-Ereignis.
- **Farben werden gelesen, aber die UI bleibt unverändert:** Diese API schreibt kein CSS. Binden Sie einen Theme-Controller an oder wenden Sie die Werte im eigenen Renderer an.
