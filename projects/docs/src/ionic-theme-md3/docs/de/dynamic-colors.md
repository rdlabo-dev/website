---
title: "Dynamische Android-Farben"
sourceRevision: "6ebe7b39be22337397e0e7b7a3e8058b446e8d1258bdbf1a1ee7fed47327ab34"
---
# Dynamische Android-Farben

Dynamische Farben werden unterstützt und optional aktiviert. Android 12 und neuer liefern helle und dunkle Material-Farbschemata; dieses Paket konvertiert deren Rollen mit den Algorithmen des Ionic-Docs-Farbgenerators. Ältere Android-Versionen, iOS und Web verwenden die vorhandene Ionic-Palette und die Standardfarben der Komponenten. Siehe [Farbsystem](color-system.md): Ionic-Paletten allein reichen aus; native Material-Rollen verfeinern lediglich optionale CSS-Tokens.

Importieren Sie die APIs `getDynamicColorScheme` und `addDynamicColorListener` aus dem Root-Einstiegspunkt von `@rdlabo/capacitor-native-ui`. Die Native UI-Projektion muss nicht aktiviert werden. Der Konvertierungshelfer des Themes bleibt unter `@rdlabo/ionic-theme-md3/dynamic-colors` verfügbar.

## Beispiel für Gerätefarben

Pixel 8a mit Android 17 und aktivierten optionalen Material You-Farben. Das Standardtheme funktioniert mit der eigenen Ionic-Palette; diese Screenshots zeigen die zusätzliche native Farbintegration im hellen und dunklen Erscheinungsbild.

<img src="../screenshots/android17-light.png" alt="Optionale Material You-Farben im hellen Erscheinungsbild" width="270"> <img src="../screenshots/android17-dark.png" alt="Optionale Material You-Farben im dunklen Erscheinungsbild" width="270">

## Einrichtung

Installieren Sie das Theme und den nativen Anbieter in Ihrer Capacitor-Anwendung:

```sh
npm install @rdlabo/ionic-theme-md3 @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

Die Root-Exporte des Plugins und der native Getter sind in 2.1.3 enthalten; eine ältere native Binärdatei (etwa 2.1.1) muss neu gebaut werden, statt lediglich neues JavaScript zu erhalten. Verwenden Sie für die nachfolgend beschriebene Zuordnung Theme 9.2.0 oder neuer. Der [Plugin-Leitfaden](/capacitor-native-ui/docs/dynamic-colors) dokumentiert Verfügbarkeit, Rollentypen und native Benachrichtigungen.

Befolgen Sie die [Theme-Installation](../README.md) für die Reihenfolge der Ionic- und Theme-Stylesheets. Binden Sie die klassenbasierte dunkle Palette in Ihr globales Stylesheet ein:

```scss
@import '@ionic/core/css/palettes/dark.class.css';
```

Für Ionic Angular ist `@ionic/angular/css/palettes/dark.class.css` gleichwertig. Initialisieren Sie einmal beim Anwendungsstart im Browser, nachdem das DOM existiert. Dieser Helfer schreibt in ein Dokument und darf nicht während des Server-Renderings ausgeführt werden.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// Diese Wechsel verwenden die zwischengespeicherten Paletten ohne nativen Aufruf.
theme.setMode('dark');
theme.setMode('light');
theme.setMode('system');

await theme.refresh(); // Optionale explizite Aktualisierung von Hintergrundbild/Palette.

// Beim Abbau der Anwendung, nicht unmittelbar nach der Initialisierung:
await theme.destroy(); // Abmelden und ursprüngliche Root-Eigenschaften/-Klasse wiederherstellen.
```

## Erscheinungsbild und Lebenszyklus

Importieren Sie nicht zusätzlich `dark.system.css` oder `dark.always.css`: Dieser Controller verwaltet die Klasse `ion-palette-dark` auf `document.documentElement` und die Root-Eigenschaft `color-scheme`. Belassen Sie globale Palettenüberschreibungen an diesem Root-Element; Variablen auf body oder einzelnen Komponenten können geerbte Root-Werte verdecken.

- `system` (Standard): folgt dem Erscheinungsbild des Geräts.
- `light`: bleibt hell, auch wenn das Gerät zu dunkel wechselt.
- `dark`: bleibt dunkel, auch wenn das Gerät zu hell wechselt.

Native Wiederaufnahme-/Konfigurationsereignisse, Wiederaufnahme/Sichtbarkeit des Dokuments und Änderungen des Browser-Erscheinungsbilds lösen eine Aktualisierung aus. Gleichzeitige Anfragen teilen einen Bridge-Lesevorgang. Beide Schemata werden zusammen abgerufen; unveränderte Paletten überspringen die Konvertierung und unveränderte Eigenschaften CSS-Schreibvorgänge. Aktualisierungsfehler erhalten die letzte funktionierende Palette. Automatische Aktualisierungsfehler erreichen `onError`; ein explizites `theme.refresh()` wird abgelehnt, damit der Aufrufer den Fehler behandeln kann. Initialisierungsfehler führen zur Ablehnung und Bereinigung. Pro Dokument darf es einen Controller geben. Rufen Sie beim Abbau der Anwendung `destroy()` auf.

| Controller-Methode | Verhalten |
| --- | --- |
| `setMode(mode)` | Wählt `system`, `light` oder `dark` synchron mit zwischengespeicherten Schemata; kein nativer Lesezugriff. |
| `refresh()` | Liest erneut und wendet das gewählte Erscheinungsbild an; wird bei einem Fehler abgelehnt. |
| `destroy()` | Entfernt Listener und stellt ursprüngliche Inline-Eigenschaften und die dunkle Klasse wieder her; kann gefahrlos erneut aufgerufen werden. |

Wenn `available` false ist, erhält der Controller die Anwendungspalette bzw. stellt sie wieder her und verwaltet weiterhin das gewählte Erscheinungsbild. Ein Initialisierungsfehler lehnt das Promise von `enableDynamicColors()` ab und bereinigt Listener; `onError` behandelt automatische Aktualisierungsfehler, nicht die Initialisierung oder explizite `refresh()`-Aufrufe. Lassen Sie keinen zweiten Erscheinungsbild-Controller dieselben Root-Klassen/-Eigenschaften schreiben. Die Option `document` richtet sich an ein bestimmtes Browserdokument.

## Zuordnung

| Material-Rolle | Ionic-Token |
| --- | --- |
| primary / secondary / tertiary | entsprechende benannte Farbe |
| error | danger |
| surfaceContainerLowest bei hell / surfaceContainerLow bei dunkel (Fallback auf surface) | Hintergrundfarbe |
| surfaceContainerLow bei hell / surfaceContainerHighest bei dunkel (Fallback auf surface) | light |
| outline (Fallback auf den Mittelwert von surface/onSurface) | medium |
| onSurface | dark |
| onSurface | Textfarbe |

Die native Bridge liefert die unterstützten Material-Farbrollen für beide Modi; die ursprünglichen sechs Felder bleiben die Kompatibilitätseingaben, zusätzliche Rollen sind im TypeScript-Vertrag optional. Benannte Farben erzeugen Basis, RGB, Kontrast, Kontrast-RGB, shade und tint. Primary, secondary, tertiary und danger verwenden die gelieferten Rollen `onPrimary`, `onSecondary`, `onTertiary` und `onError` für Kontrast und Kontrast-RGB. Fehlende Rollen fallen einzeln auf Ionics Vergleich des Schwarz-Weiß-Kontrastverhältnisses zurück. Die shade/tint-Erzeugung und die light/medium/dark-Paletten behalten die Ionic-Berechnung bei. MD3-Komponenten verwenden ebenfalls die gelieferte `on*`-Rolle, sofern vorhanden. Hintergrund und Text erzeugen separate Tokens von step-50 bis step-950; die bisherigen Aliasse `--ion-color-step-*` werden ebenfalls bereitgestellt. Success und warning behalten ihre vorhandenen Ionic-Werte. Light, medium und dark folgen der neutralen Gerätepalette; ihre RGB-, Kontrast-, shade- und tint-Werte werden gemeinsam erzeugt. Die helle Basis verwendet surfaceContainerLowest (weiß), die dunkle Basis surfaceContainerLow. Ältere Schemata mit sechs Rollen fallen für background/light auf surface und für medium auf den Mittelwert von surface/onSurface zurück.

Standardmäßige helle Oberflächen bleiben weiß: Content, Menu, Toolbar, TabBar, Card, Listen/Einträge und Modal/Popover/Alert/ActionSheet. Im dunklen Modus verwenden Seiten und Overlay-Hüllen surfaceContainerLow, während Toolbar, TabBar, Card und Listen/Einträge surfaceContainerHigh verwenden. Die benannte light-Palette verwendet im dunklen Modus surfaceContainerHighest und erhält so die Reihenfolge von Seiten-, Panel- und light-farbigen Oberflächen, statt sie alle einheitlich schwarz zu machen. Diese Rollen werden je Komponente aufgelöst, damit lokale Überschreibungen weiterhin funktionieren. Ohne optionale Rollen bleiben vorhandene Ionic-Hintergrundvariablen der Fallback.

Explizite Material-Varianten (filled/outlined-Karten und tonal/elevated-Schaltflächen), Suchfelder, Ladeanzeigen und inverse Toast-Oberflächen behalten ihre eigenen Rollen. Explizite color-Attribute und md3-disabled haben weiterhin Vorrang vor der standardmäßigen Komponentendarstellung.

Die gelieferten nativen Rollen werden außerdem zu optionalen `--md-sys-color-*`-Tokens für MD3-Komponenten. Fehlende optionale Rollen fallen auf lokale/benutzerdefinierte Überschreibungen oder den aus Ionic abgeleiteten CSS-Fallback zurück, auch beim Moduswechsel oder Aktualisieren. Ein explizites `color="light"` behält beispielsweise die Ionic-Rolle light bei und folgt zugleich deren erzeugter neutraler Gerätepalette.

Verwenden Sie für eine Konvertierung ohne DOM-Änderungen `materialToIonicColors(scheme)` für Ionic-Variablen und `materialToMd3Colors(partialRoles)` für optionale MD3-Tokens. Beide Konvertierungsfunktionen liefern CSS-Variablen-Maps vom Typ `Record<string, string>`. `materialToIonicColors` benötigt die sechs erforderlichen Rollen von `MaterialColorScheme`; `materialToMd3Colors` akzeptiert jede Teilmenge von `MaterialColorRole`-Namen und gibt nur die gelieferten Rollen aus. Eingaben sind opake `#RRGGBB`-Strings; ungültige übergebene Farben lösen `TypeError` aus. Keine Funktion schreibt ins DOM oder ruft die Bridge auf. Es wird keine Farbbibliothek als Laufzeitabhängigkeit verwendet. Die Quellenangaben zu den Algorithmen und die Upstream-Lizenz stehen in `THIRD_PARTY_NOTICES.md`.

## Fehlerbehebung und Prüfung

- **Keine dynamischen Farben:** Android 12 oder neuer ist erforderlich. Auf anderen Plattformen bleibt die Ionic-Palette aktiv; dies ist das erwartete Fallback-Verhalten.
- **Nativer Getter nicht implementiert:** Aktualisieren Sie das Plugin, synchronisieren Sie, bauen Sie die native App neu und installieren Sie sie erneut. Nur Web-Assets zu aktualisieren reicht nicht aus.
- **Konflikte im dunklen Modus:** Verwenden Sie ausschließlich die klassenbasierte dunkle Palette und lassen Sie einen einzigen Controller die Root-Klasse verwalten. Prüfen Sie body-/Komponentenüberschreibungen, die Root-Variablen verdecken.
- **Eine Aktualisierung schlägt fehl:** Automatische Fehler erreichen `onError` und erhalten die letzte funktionierende Palette. Fangen Sie Fehler expliziter `refresh()`-Aufrufe beim Aufrufer ab.
- **Eine Komponente ignoriert eine Rolle:** Prüfen Sie ihr explizites `color`, `md3-disabled`, die Komponenten-CSS-Variablen und die [Verbrauchertabelle](color-system.md#component-assignments).

Die Demo enthält System / Light / Dark-Steuerelemente. Ihr typisierter Bridge-Adapter unterstützt auch reine Browser-Builds; Android benötigt weiterhin ein natives Plugin mit `getDynamicColorScheme`. Der Adapter ist Demo-Infrastruktur und nicht das öffentliche Importmuster für Anwendungen.

Führen Sie nach der Installation der Root- und Demo-Abhängigkeiten `npm run test:dynamic-colors` aus. Browser-Bildtests verwenden aufgezeichnete Android-Farben und benötigen daher kein angeschlossenes Gerät. Aktualisierungen der Screenshot-Referenzen laufen über die `/update-screenshots`-CI der PR.

Die [Änderung der Vordergrundpaare](https://github.com/webview-native-ui/ionic-theme-md3/pull/67) wurde auf einem Pixel 8a mit Android 17 geprüft: Vier explizit eingefärbte Ionic-Schaltflächen stimmten in beiden Modi mit den nativen Hintergrund-/Vordergrundwerten überein. Die abschließenden CI-Läufe für Ionic 8 und 9 bestanden jeweils 34 Unit- und 265 E2E-Tests ohne instabile Ergebnisse. Dies ist eine Prüfung der Farbpaare, keine vollständige Geräte-UI-Abnahme oder Abnahme von Hintergrundbildänderungen.

## Hinweise zur Validierung

Historische Integrationsmessung (keine vollständige Theme-Abnahme; siehe [Android-16-Review-Nachweise](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android16-2026-11-07.md)). Auf einem Android-15-Emulator (API 35) geprüft: Beide nativen Schemata entsprechen den angewendeten Ionic-Tokens; das system-Erscheinungsbild folgt Android; explizite light/dark-Modi bleiben bei Betriebssystemänderungen fest. Browser-E2E deckt dieselbe Erscheinungsbildrichtlinie ab. Unit-Tests prüfen geänderte Paletten, Wiederaufnahme-/Konfigurationsbenachrichtigungen, Invalidierung während laufender Vorgänge, Unterdrückung unveränderter Updates, Fehler und Abbau.

Bei dieser historischen Integrationsmessung wurde die erweiterte API mit 46 Rollen auf dem Android-Emulator geprüft: Jede native Rolle entsprach ihrem `--md-sys-color-*`-Wert. Browser-Tests für Ionic 8 und 9 decken reine Ionic-Fallbacks, optionale Überschreibungen, explizite Farbpaletten und komponentenweise Deaktivierung ab; ein separater Test deaktiviert das Anwendungs-JavaScript. Die [Screenshot-Update-CI vom 2026-11-07](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42332891975) prüfte jeweils 141 Tests für Ionic 8 und 9, einschließlich 84 heller/dunkler Screenshots. Siehe [Review der Ionic-Farbvererbung](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md) für diese historische Farbregelkorrektur und ihren auf Browser begrenzten Prüfumfang.

Eine lokale WebView-Messung der erweiterten API (30 aufeinanderfolgende native Lesevorgänge, 1.000 aufgewärmte Konvertierungsdurchläufe) ergab für den Abruf etwa 9 ms Median / 21 ms p90 und für die Konvertierung beider Schemata in Ionic- und MD3-Variablen etwa 0,6 ms. Dies sind Beobachtungen auf einem Debug-Emulator, keine geräteübergreifenden Leistungsgarantien; die Konvertierung schließt CSS-Rendering aus. Gewöhnliches reines Ionic-Theming verwendet direkt CSS und führt weder die Konvertierung aus noch ruft es die Bridge auf.

Der Austausch des Hintergrundbilds auf einem physischen Gerät bleibt ungeprüft. Eine per Shell ausgelöste Änderung einer Voreinstellung auf diesem Emulator startete die WebView neu, ohne die nativen Farbwerte zu ändern, und konnte daher das durchgängige Verhalten bei Hintergrundbildänderungen nicht nachweisen. Die Testeinstellungen wurden entfernt und die Wiederherstellung der ursprünglichen Palette bestätigt.
