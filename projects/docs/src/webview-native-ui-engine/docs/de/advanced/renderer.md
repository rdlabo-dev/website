---
title: "Seiten- und Modal-Oberflächen"
sourceRevision: "b410017ab9773a01d2552e663b0f20ffb8d0a52667fe1eff2253dc11d2de8b8d"
---
# Erweitert: Seiten und Modals in einem bestehenden Renderer koordinieren

Ein **Renderer** bezeichnet hier den Teil Ihres Plugins, der native Ansichten erstellt und ihr Layout und Erscheinungsbild aktualisiert. Verwenden Sie diesen Leitfaden, wenn er mehrere native Steuerelemente verwaltet, ihre Aktualisierungen bündelt und weiß, welcher Seite oder welchem Modal sie gehören. Die Engine übernimmt Bildvorbereitung, Scope-Wiederverwendung und Übergabebereinigung, sodass diese Aufgaben nicht für jedes Overlay separat implementiert werden müssen.

Beginnen Sie für eine einzelne native Ansicht stattdessen mit einer [Capacitor](../getting-started/capacitor.md)- oder [Cordova](../getting-started/cordova.md)-Registrierung. Das gemeinsame Modell und seine Grenzen beschreibt [Konzepte](../concepts.md). Die folgenden APIs richten sich an einen bestehenden Renderer und sind keine zusätzlichen Pflichtschritte der Plugin-Leitfäden. Lesen Sie vor der Wahl dieses Weges unter [native Initialisierung](../getting-started/initialization.md) die grundlegende API und ihre optionalen Einstellungen.

## Steuerelemente nach ihrem gemeinsamen Lebenszyklus gruppieren

Eine **Oberfläche** gruppiert Steuerelemente, die gemeinsam übergeben werden müssen, etwa die Schaltflächen einer Seite oder eines Modals. Sie entspricht nicht zwangsläufig einer nativen Ansicht oder einem Bild. `createWebProjectionSurface` verwaltet ihre vorbereiteten Bilder und Fallback-Scopes; `createWebProjectionSurfaces` verwaltet die Lebensdauer mehrerer solcher Oberflächen.

Getrennte Gruppen sind wichtig, weil das Überdecken einer Hintergrundseite nicht zwangsläufig die Steuerelemente des Vordergrundmodals überdeckt. Ein gemeinsamer Lebenszyklus würde diese unabhängigen Darstellungsentscheidungen gegenseitig beeinflussen.

Beispielsweise kann ein Plugin, das Toolbar-Schaltflächen und eine Tab-Leiste rendert, separate Oberflächen für eine Hintergrundseite und jedes Modal verwenden:

| Oberfläche | Nativer Inhalt | Wann ein Web-Bild nützlich ist |
| --- | --- | --- |
| Hintergrundseite | Toolbar-Schaltflächen und Tab-Leiste | Ein Web-Modal oder Popover muss die Steuerelemente der Seite überdecken. |
| Modal | Schaltflächen zum Schließen und Bestätigen | Das Modal bewegt sich beim Ziehen oder ein anderes Web-Overlay überdeckt seine Steuerelemente. |

Wenn ein Modal öffnet, kann die Hintergrundoberfläche auf ihre vorbereiteten Bilder wechseln, während die eigenen Steuerelemente des Modals gegebenenfalls nativ bleiben. Das Schließen des Modals fordert die Wiederherstellung der Hintergrundsteuerelemente an ihren aktuellen Positionen an; ihre Bilder werden nach der akzeptierten nativen Aktualisierung entfernt. Separate Oberflächen verhindern, dass Bilder oder späte Antworten eines entfernten Modals die Zuständigkeit für die neu freigelegte Seite übernehmen.

## Den bestehenden Renderer verbinden

Verbinden Sie jede Phase mit dem entsprechenden Ereignis Ihres Renderers. Diese Snippets zeigen getrennte Lebenszykluspunkte, keine gemeinsam während der Initialisierung auszuführenden Aufrufe. Der Renderer liefert `transport`, Quell-IDs und Frames, akzeptierte Revisionen und seinen bestehenden Aktualisierungsscheduler. In diesem Beispiel ist `ownerOf(element)` die bestehende Suche des Renderers nach der Seite oder dem Modal, dem ein Steuerelement gehört.

### Eine Oberfläche erstellen, sobald ihr Besitzer verfügbar wird

Ordnen Sie Quellen nativer Steuerelemente bestehenden Fallback-Containern zu. Die Sammlung verwendet bei wiederholten Aktualisierungen desselben Besitzers dieselbe Oberfläche. Der an `ensure` übergebene Besitzer ist ein Lebenszyklusschlüssel, kein Quellenfilter: `surfaces.consider` verteilt den Batch an jede Oberfläche. Jede Oberfläche wählt mit `eligible` nur ihre eigenen Steuerelemente; zwei Oberflächen dürfen nicht denselben Fallback-Container verwalten:

```ts
import { createWebProjectionSurface, createWebProjectionSurfaces, type WebProjectionSurface } from '@webview-native-ui/engine';

const surfaces = createWebProjectionSurfaces<HTMLElement, WebProjectionSurface>();
const projection = await surfaces.ensure(page, () =>
  createWebProjectionSurface(transport, {
    namespace: 'my-renderer',
    target: (source) => source.element,
    eligible: (source) => ownerOf(source.element) === page,
    wake: scheduleUpdate,
    blocked: () => transitionIsActive,
  }),
);
```

### Bei normalen Aktualisierungen vorbereiten, an Darstellungsgrenzen übergeben

Eine akzeptierte native Aktualisierung liefert das vorzubereitende Erscheinungsbild. Der Beginn einer Übergabe nutzt dieses vorbereitete Bild; das Ende fordert eine Wiederherstellung an, statt das Bild sofort zu entfernen. Solange eine Oberfläche das Bild besitzt, schließen Sie ihre `owners` vom gewöhnlichen nativen Rendering aus, damit aktive Steuerelemente nicht über der überdeckenden Web-Ebene erscheinen. Verwenden Sie `visibleOwners` während der Wiederherstellung für die Zuständigkeit der Rückkehrbilder. Geben Sie das Bild erst nach Bestätigung der normalen nativen Aktualisierung frei.

```ts
// Nach dem Akzeptieren einer gewöhnlichen nativen Aktualisierung:
surfaces.consider(acceptedRevision, sources);

// Wenn das Framework Abdeckung oder Bewegung für diesen Besitzer meldet:
projection?.begin();

// Wenn diese Abdeckung oder Bewegung endet:
projection?.end();
// Normale native Aktualisierung des Renderers senden, dann bei ihrer Bestätigung:
surfaces.updated(token, restoredIDs, acceptedRevision);
```

### Eine Seite oder den Renderer entfernen

Das Löschen eines Besitzers verhindert, dass späte Erstellung oder Wiederherstellung seine Steuerelemente wiederbelebt. Zerstören Sie die Sammlung, wenn der Renderer selbst freigegeben wird.

```ts
await surfaces.delete(page); // Seite entfernen.
// Beim Abbau des Renderers:
await surfaces.destroy();
```

## Positionierung und gemeinsame Beobachtung

Der Renderer liefert native IDs und Frames, Quellzuständigkeit, Positionierungsstrategie und Bestätigungen akzeptierter Aktualisierungen. Framework-Lebenszyklusereignisse bleiben außerhalb der Engine; sie leitet Modal-Semantik nicht aus beliebigen DOM-Mutationen ab.

Für Fallback-Proxys des Renderers erlaubt `canRelocate(target)` explizit, dass `begin(layer)` diese Hosts in eine bereitgestellte Overlay-Ebene verschiebt. Die Engine stellt nach Wiederherstellung, Fehler oder Freigabe ihre Eltern- und Geschwisterreihenfolge wieder her. Anwendungs-DOM wird standardmäßig nicht verschoben, und eine von der Anwendung vorgenommene Umhängung eines Proxys hat Vorrang vor der Wiederherstellung seines alten Orts.

Eine Sammlung teilt Listener für Erscheinungsbild, Größenänderung, Orientierung und Dokumentsichtbarkeit zwischen ihren Oberflächen und ignoriert Engine-eigene Bildereignisse. Renderer können eigene Proxy-Ereignisse mit `ignoreTarget` ausschließen. `followMotion(moving, target)` verwendet die bestehende Zuordnung bewegter Elemente des Renderers, um Bilder nur während der Animation ihrer eigenen Hosts neu auszurichten; Transformationen von Vorfahren bewegen die Bilder bereits ohne Polling. Alle Listener und geplanten Frames werden bei der Freigabe entfernt.

Wiederholte `ensure`-Aufrufe teilen die ausstehende Erstellung oder die bestehende Projektion. Löschung, DOM-Trennung oder Renderer-Freigabe verhindern, dass ein spätes Ergebnis aktiv wird; die Engine zerstört es stattdessen. Eine fehlgeschlagene Erstellung kann erneut versucht werden. Der Renderer signalisiert Seitenentfernung über seinen bestehenden Lebenszyklus und kann während seines normalen Aktualisierungsdurchlaufs `keys()` und `values()` prüfen. Die Sammlung installiert keinen zweiten DOM-Mutationsbeobachter und keine fortlaufende Polling-Schleife.

## Die Übergabe im konsumierenden Renderer prüfen

Testen Sie das Öffnen und Schließen eines Overlays, ein bewegtes Modal und die Entfernung eines Besitzers während der Wiederherstellung. Hintergrund und Vordergrund müssen ihre eigenen Steuerelemente behalten; eine verspätete Bestätigung darf keinen entfernten Besitzer wiederherstellen. Ändern Sie die Position ohne Änderung des Erscheinungsbilds, um Bildwiederverwendung zu prüfen, und ändern Sie anschließend Inhalt oder Abmessungen, um Invalidierung zu prüfen. Testen Sie auch fehlende Bilder: Der gewöhnliche Fallback muss verfügbar bleiben, ohne den Overlay-Start zu verzögern.

Die Engine koordiniert Zuständigkeiten, aber nur die konsumierende Anwendung kann ihre Ebenenwahl und native Positionierung prüfen. Implementieren Sie die native Seite anhand des [nativen Übergabevertrags](native-handoff.md), mit `NativeUICoveredSnapshots.handle` unter iOS und `NativeUISnapshots.handle` unter Android. Stellen Sie geeignete native Grenzen und vollständige Ansichten bereit, die ausgeblendet werden dürfen; die Engine validiert Anfragen und konvertiert Zielkoordinaten. Ihr Renderer wendet weiterhin normales natives Layout an und meldet Bestätigungen akzeptierter Aktualisierungen.

Für andere Zuständigkeitsanforderungen siehe [untergeordnete Web-Projektion](web-projection.md). Die Aktualisierungsplanung ist unabhängig: Verwenden Sie die optionale [Aktualisierungswarteschlange](update-queue.md) nur, wenn sie zur Abgleichstrategie des Renderers passt.
