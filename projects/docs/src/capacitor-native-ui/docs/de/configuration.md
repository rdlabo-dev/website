---
title: "Native UI konfigurieren"
sourceRevision: "db88d5020c11e414684703be1833e5c8ecdd0c8c631ffa15263925943070e80f"
---
# Native UI konfigurieren

Dies ist die Einstellungsreferenz. Beginnen Sie mit der [Funktionsweise der Projektion](../README.md#how-projection-works), anschließend mit [Ionic-Einrichtung](setup.md) oder [HTML-Einrichtung](framework-independent.md) für die Installation.

Rufen Sie `enableNativeUI()` einmal auf, nachdem das DOM Ihrer Anwendung eingebunden wurde. Ionic- und ausdrücklich markierte HTML-Bedienelemente verwenden dieselben Standard-Swift-Renderer. Das Theme ist optional; Web-Layout, Safe Areas und Abstände liegen bei Ihrer App oder Ihrem Theme.

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Importieren Sie ohne Ionic dieselbe API aus `@rdlabo/capacitor-native-ui/core`. Dieser Einstiegspunkt lädt Ionics optionale Popover-Integration nicht. Siehe [reines HTML](framework-independent.md).

## Plattformverhalten

| Funktion | Unterstütztes iOS | Android | Browser / älteres iOS |
| --- | --- | --- | --- |
| Automatische Ionic-Bedienelemente (`ionic.auto`) | Nativ | Ursprüngliche Web-Bedienelemente | Ursprüngliche Web-Bedienelemente |
| Explizite Elementschaltflächen | Nativ | Ursprüngliche Web-Bedienelemente | Ursprüngliche Web-Bedienelemente |
| Elementerweiterungen | SwiftUI | Kotlin / Compose | Ursprünglicher Web-Inhalt |
| Vertical Bars | Nativ, sofern verfügbar; andernfalls Web-Seitenleiste | Web-Seitenleiste | Web-Seitenleiste |
| `tab-accessory`-Erweiterungen | Nur unterstützter iOS-Tab-Host | Ursprünglicher Web-Inhalt | Ursprünglicher Web-Inhalt |

Web-Seitenleisten benötigen das Ionic-Seitenleistenlayout oder einen anwendungseigenen HTML-`webHost`. Einstellungen schaffen keine Gerätefähigkeit.

Das aus HTML abgeleitete Hell-/Dunkelverhalten beschreibt [Helle und dunkle Darstellung](appearance.md). Die Darstellung wird im Web-CSS konfiguriert, nicht über eine Startoption.

## Alle Einstellungen

`controls` wählt Standardwerte für Auswahl und Gruppierung. `verticalBars` konfiguriert die Seitenleiste. `ionic` konfiguriert Ionic-Erkennung und Darstellung. Ausgelassene Felder in `controls` sind standardmäßig `true`, auch bei Teilobjekten.

```ts
const shell = await enableNativeUI({
  root: document.body,
  controls: {
    buttonGroup: true,
    button: true,
    backButton: true,
    tabs: true,
    segment: true,
    fab: true,
  },
  verticalBars: {
    enabled: true,
    // Optional: placement: { edge: 'trailing', webHost: appOwnedHost },
  },
  extensions: [],
  ionic: {
    auto: true,
    verticalBars: {
      buttonProjection: 'system',
      buttonDefaultFill: 'glass',
      popover: false,
    },
  },
  debug: false,
});
```

### Standardwerte für die Auswahl

Jedes Bedienelement akzeptiert `ControlProjection`. `controls` selbst akzeptiert dieselben Werte als Kurzform für alle sechs Felder.

| Wert | Gewöhnliche Position | Vertikale Seitenleiste |
| --- | --- | --- |
| `true` (Standard) | Ausgewählt | Ausgewählt |
| `false` | Nicht ausgewählt | Nicht ausgewählt |
| `'horizontalOnly'` | Ausgewählt | Nicht ausgewählt |
| `'verticalOnly'` | Nicht ausgewählt | Ausgewählt |

Horizontal und vertikal beschreiben die **Position des Bedienelements**, nicht Bildschirmausrichtung oder Gerätemodell. Diese Standardwerte verschieben kein Bedienelement, ergänzen keine fehlende Gerätefähigkeit und machen nicht unterstütztes Markup nicht geeignet.

| Bedienelement | Verantwortung |
| --- | --- |
| `buttonGroup` | Bereits ausgewählte Aktionen gruppieren, wenn die Gruppe geeignet ist. Wählt niemals Kindelemente aus. |
| `button` | Gewöhnliche Schaltflächen und Ionic-Menüschaltflächen auswählen. |
| `backButton` | Zurücknavigation unabhängig von der übergeordneten Gruppe auswählen. |
| `tabs` | Tabs und ihre registrierte Suchdarstellung auswählen. |
| `segment` | Unterstützte Segmente auswählen. |
| `fab` | Unterstützte schwebende Aktionsschaltflächen auswählen. |

Lokale Attribute `data-horizontal-bars="true|false"` und `data-vertical-bars="true|false"` überschreiben den jeweiligen Auswahlstandard. Auf `ion-buttons` steuern sie nur die Gruppierung. Explizite `data-native-ui`-Quellen sind von diesen Standardwerten unabhängig. Strukturelle Ausschlüsse und Seitenleistenverfügbarkeit gelten weiterhin. Siehe [Werkzeugleistenauswahl und Gruppierung](native-ui.md#toolbar-selection-and-grouping).

### Weitere Einstellungen

| Einstellung | Standard | Bedeutung |
| --- | --- | --- |
| `root` | `document.body` | Verbundener Quellteilbaum. Bedienelemente außerhalb werden nicht projiziert. |
| `verticalBars.enabled` | `true` | Seitenleistenprojektion zulassen, sofern verfügbar. |
| `verticalBars.placement` | ausgelassen | Optional `{ edge: 'leading' \| 'trailing', webHost?: HTMLElement }`. Die Kante ist eine Präferenz, keine Erklärung einer Gerätefähigkeit. |
| `extensions` | `[]` | **Experimentell.** App-spezifische SwiftUI-/Compose-Erweiterungen. Unabhängig von `controls` und `ionic.auto`; die App bestimmt, wann ihr Reader Inhalte zurückgibt. |
| `ionic.auto` | `true` | Automatische Ionic-Erkennung aktivieren. `false` deaktiviert sie einschließlich lokaler Layoutaktivierungen. Explizite `data-native-ui`-Quellen und Erweiterungen bleiben unabhängig. |
| `ionic.verticalBars.buttonProjection` | `'system'` | `'system'` verwendet native Stile; `'source'` projiziert unterstützte Ionic-Stile. Lokale Darstellungsüberschreibungen haben Vorrang. |
| `ionic.verticalBars.buttonDefaultFill` | `'glass'` | `'glass'` oder `'solid'` für eigenständige Ionic-Schaltflächen im Quellstil ohne explizite Füllung. Explizite Füllungen und der transparente Standard innerhalb von Gruppen haben Vorrang. |
| `ionic.verticalBars.popover` | `false` | Ionic-Popover aktivieren, die an nativen Seitenschaltflächen verankert sind. Erfordert den Ionic-Einstiegspunkt und seine optionalen Peer-Abhängigkeiten. |
| `debug` | `false` | Quellelemente und Fallback-Gründe in der Entwicklerkonsole protokollieren. |

### HTML-Host für die Fallback-Seitenleiste

`webHost` ist eine optionale, von der Anwendung gestaltete HTML-Fallback-Seitenleiste. Es gelten folgende Anforderungen:

- Mit demselben Dokument wie `root` verbunden.
- Außerhalb von `root`; keines der Elemente darf das andere enthalten.
- Von der Anwendung gestaltet und positioniert, einschließlich reservierter Inhaltsabstände.

Verwenden Sie einen begrenzten `root`, etwa Ihr `<main>`, mit einem benachbarten Host; der Standard `document.body` erlaubt keinen solchen Host. Ohne Host bleiben die Originalbedienelemente sichtbar, wenn HTML-Seitenleisten nicht verfügbar sind. Ionics bestehendes Seitenleistenlayout verwendet seinen eigenen Fallback-Adapter.

HTML unterstützt derzeit Schaltflächen und Zurückschaltflächen. Reader für Tabs, Segmente und FABs bleiben Ionic-Adapter; deren Aktivierung leitet keine entsprechenden Strukturen aus beliebigem HTML ab.

## Häufige Konfigurationen

```ts
// Ionic oder HTML: alle unterstützten Bedienelemente, Seitenleistenunterstützung standardmäßig aktiv.
const shell = await enableNativeUI();

// Alternative: automatische Auswahl nur in der Seitenleiste.
const railOnly = await enableNativeUI({ controls: 'verticalOnly' });

// Alternative: automatisch nur Tabs auswählen.
const tabsOnly = await enableNativeUI({
  controls: { buttonGroup: false, button: false, backButton: false, tabs: true, segment: false, fab: false },
});
```

Dies sind Alternativen: Starten Sie nur eine Shell. Wiederholte gleichwertige Starteinstellungen liefern deren Handle zurück; andere Einstellungen erfordern zunächst das Zerstören der vorherigen Shell.

`controls: false` deaktiviert jede standardmäßige Auswahl und Gruppierung, während lokale Attribute weiterhin aktivieren können. `ionic: { auto: false }` deaktiviert dagegen die automatische Ionic-Erkennung vollständig. Keine der beiden Optionen deaktiviert explizite HTML-Quellen oder Erweiterungen.

`verticalBars.enabled: false` belässt Seitenleisten-Bedienelemente unabhängig von der Auswahl im Web. Gewöhnliche Bedienelemente bleiben unbeeinflusst. `data-native-ui-placement="element"` erhält die ursprüngliche Position eines expliziten Bedienelements, auch mit `controls: 'verticalOnly'`. Setzen Sie die Position bei Ionic-Gruppen auf die gesamte `ion-buttons`-Gruppe, damit ihre gemeinsame native Fläche genau eine Position hat.

## Bedienelemente in einer angepassten Ionic-App explizit auswählen

Deaktivieren Sie automatische Ionic-Projektion und behalten Sie die native Seitenleiste sowie Ihre eigenen Erweiterungen:

```ts
const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#content')!,
  ionic: { auto: false },
  verticalBars: {
    enabled: true,
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
  extensions: [myExtension],
});
```

```html
<main id="content">
  <ion-button>Keep this on the Web</ion-button>
  <ion-button data-native-ui="button" data-native-ui-placement="rail">Project this action</ion-button>
  <button data-native-ui="button">Project at its original position</button>
</main>
<aside id="rail" aria-label="Actions"></aside>
```

Behalten Sie die ursprünglichen Handler an jeder Quelle. Explizites `ion-button` verwendet den Standard-Schaltflächenreader; unterstützte Inhalte und Stilregeln gelten daher weiterhin. Das Attribut macht beliebiges eigenes Markup nicht unterstützt. `data-native-ui-placement="rail"` fordert die Systemleiste an, sofern verfügbar. Gestalten Sie den optionalen `webHost` und reservieren Sie Platz in Ihrer App; ohne ihn bleiben die Quellelemente nicht verfügbarer expliziter Seitenleisten sichtbar. Unmarkierte Ionic-Bedienelemente werden weiterhin im Web dargestellt. Eine automatisch projizierte Gruppe mit einer explizit markierten Quelle bleibt im Web, um diese Quelle nicht doppelt zu überdecken.

Explizite integrierte Quellen unterstützen einzelne `button`-, `ion-button`- und `[role="button"]`-Elemente mit `data-native-ui="button"` oder `"back-button"`. Dies aktiviert nicht die Ionic-spezifischen Reader für bestehende `ion-back-button`, `ion-menu-button`, Schaltflächengruppen, Tabs, Segmente oder FABs. Lassen Sie automatische Projektion für den jeweiligen Typ aktiviert, verwenden Sie eine explizite Standardschaltfläche mit eigenem Klickhandler oder registrieren Sie eine Erweiterung für eigene Oberflächen.

`verticalBars.enabled` steuert weiterhin die Seitenleistenverfügbarkeit. Entfernen Sie die explizite Markierung einer Quelle oder verwenden Sie `data-native-ui="disabled"`, um sie im Web zu belassen.

## Seitenleistennutzung nach dem Start ändern

```ts
await shell.disableVerticalControlArea();
await shell.enableVerticalControlArea();
```

Diese Methoden ändern `verticalBars.enabled` dieser Shell und erhalten Darstellung, Bedienelemente und Position. Vor dem Zuständigkeitswechsel lösen sie bestehende Projektionen auf, ohne eine weitere Shell zu erzeugen. Aufrufe werden serialisiert. Nach `destroy()` werden beide Methoden abgewiesen.

```ts
const lease = await shell.suspend(); // vorübergehend alle Web-Bedienelemente wiederherstellen
await lease.resume();
await shell.destroy(); // Shell stoppen und Quellen wiederherstellen
```

Das Deaktivieren der Seitenleistenprojektion entfernt kein Anwendungs-CSS und ändert keine anwendungseigenen Abstände. Aktualisieren Sie bei Bedarf zugleich Ihr eigenes Layout.

## Nach einer unbeobachteten Änderung eine Prüfung anfordern

```ts
shell.markForCheck();
```

Verwenden Sie dies nach der Änderung einer Eigenschaft oder eines Reader-Zustands ohne DOM-Mutation. Es plant eine Prüfung, bündelt wiederholte Anforderungen und sendet nur geänderte native Snapshots. Der Rückgabewert ist `void`; es wartet weder auf nativen Abschluss noch rendert es das Framework-DOM. Aufrufe nach der Zerstörung werden ignoriert. Siehe [Quellprüfungen und Beobachtung](native-ui-extensions.md#schedule-a-source-check).

## Verstehen, warum eine Quelle im Web bleibt

Ergänzen Sie Ihre bestehenden Startoptionen vorübergehend um `debug: true` und erstellen Sie die Web-App erneut. Starten Sie für Diagnosen keine zweite Shell:

```ts
const shell = await enableNativeUI({ debug: true, extensions: [myExtension] });
console.info(shell.getStatus());
```

Öffnen Sie die WebView-Entwicklerkonsole und filtern Sie nach `[Native UI]`. Diagnosen enthalten nach Möglichkeit die DOM-Quelle. Jeder Grund wird während dieser Aktivierung einmal je Quelle protokolliert, damit Scrollen oder wiederholtes `markForCheck()` die Konsole nicht überfüllen. Props, Aktions-Payloads und Ausnahmemeldungen der Anwendung werden nicht protokolliert.

| Diagnose | Prüfen Sie Folgendes |
| --- | --- |
| `web-fallback` | Plattformunterstützung, native Plugin-Registrierung, Synchronisierung und erneuten nativen Build. |
| `unregistered-extension` | Der native Registrierungsname muss zur DOM-Definition passen und vor dem Start registriert werden. Auch neu eingefügte Quellen werden geprüft. |
| `reader-error` / `invalid-props` | Reader-Implementierung, ausschließlich JSON-Werte und die 64K-Größenbegrenzung. |
| `unsupported-placement` / `missing-tab-owner` | Plattform und zuständigen nativen Tab-Host für ein Tab-Zubehör. |
| `source-hidden` / `source-clipped` / `source-focused` | Sichtbarkeit, abschneidende/transformierte Vorfahren oder fokussierten Web-Nachfahren. |
| `reader-opt-out` | Ihr Reader hat null zurückgegeben. |
| `unsupported-control` | Unterstütztes Markup, zugänglichen Namen, feste Position und Stile. |
| `native-rejected` | Native Props-Dekodierung, Position oder Geräteunterstützung. Die Bridge meldet die Ablehnung, nicht die native Ausnahme. |

`getStatus()` fasst die Shell zusammen; es ist kein Diagnosebericht pro Element. Normale Navigation, Aussetzung und nicht unterstützte Inhalte können bewusst die Web-Darstellung beibehalten. Deaktivieren Sie Debug nach der Untersuchung; es ändert die Projektionseignung nicht.

## Bestehende Anwendungen

Das eigenständige `enableVerticalControlArea()` wählt standardmäßig `'verticalOnly'`. Sein Helfer `setPlacement()` ist ein veralteter Web-CSS-Adapter; verwenden Sie für das Web-Layout `setVerticalBarsLayout({ edge, inset })` aus dem Theme. Native Verfügbarkeit stammt aus den Gerätemetriken des Plugins.

Die [Migration von 1.2.1](migration.md) beschreibt Paketaufteilung, entfernte Optionen und geänderte Standardwerte bei partieller Bedienelementkonfiguration.