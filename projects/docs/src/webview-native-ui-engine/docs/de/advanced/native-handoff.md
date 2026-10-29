---
title: "Native Übergabe"
sourceRevision: "b775b82f00f554e349da3ad288738a3342139d5db18a22ee0677ebd193fbb2e3"
---
# Native Übergabe für benutzerdefinierte Renderer

Ein bestehender Renderer sollte seine geordneten `WebProjectionRequest`-Nachrichten an die Methode `handle` des nativen Snapshot-Managers weiterleiten. Damit bleiben Anfragevalidierung, Koordinatenkonvertierung von CSS nach Native, Übergabe gecachter Bilder und Freigabe von Kopien in der Engine. Die Bridge bleibt die eigene Capacitor- oder Cordova-Methode des Plugins; die Engine hängt nicht vom Aufrufobjekt eines dieser Frameworks ab.

Beispielsweise sendet ein Renderer Toolbar-Schaltflächen bereits als eine native Aktualisierung und weiß, welche Ansichten zu jeder Schaltflächengruppe gehören. Leiten Sie Bildübergabenachrichten an `handle` weiter, statt Koordinatenkonvertierung und Kopienfreigabe für jede Gruppe neu zu implementieren. Belassen Sie die Aufnahmefähigkeit und das gewöhnliche Layout der Gruppe in diesem Renderer: Die Engine kann nicht ableiten, welche Geschwisteransichten gefahrlos gemeinsam ausgeblendet werden dürfen.

Rufen Sie Ansichts- und Snapshot-Lebenszyklus-APIs im Haupt-/UI-Thread auf. Stellen Sie zwei Renderer-Callbacks bereit: `frames(ids, revision)` liefert aktuelle geeignete Grenzen, und `views(ids)` liefert die vollständigen nativen Ansichten, die gefahrlos zusammen ausgeblendet werden können. Geben Sie leere Grenzen oder `nil` / `null` zurück, wenn dieser Vorgang nicht verfügbar ist. Grenzen verwenden **Punkte relativ zur WebView unter iOS** und **physische Pixel relativ zur WebView unter Android**. Die Engine prüft, dass die gemessenen IDs exakt der Anfrage entsprechen.

```swift
snapshots.handle(request, in: webView,
    frames: { ids, revision in renderer.measure(ids, at: revision) },
    views: { ids in renderer.viewsAllowedToHide(ids) },
    complete: reply)
```

```kotlin
snapshots.handle(request, activity.window, webView,
    frames = { ids, revision -> renderer.measure(ids, revision) },
    views = { ids -> renderer.viewsAllowedToHide(ids) },
    complete = { result ->
        result.fold(onSuccess = reply, onFailure = reject)
    })
```

`renderer` und `reply` stehen oben für den bestehenden Layoutcode und den Bridge-Abschlusscallback des Plugins. Leiten Sie unter Android ein fehlgeschlagenes `Result` an den Ablehnungscallback der Bridge weiter (oben `reject`); Web verwendet diesen Fehler, um das Bild aufzugeben und die Darstellung abzugleichen. Bestätigen Sie eine fehlgeschlagene Zeichengrenze nicht als Erfolg. `frames` kann wiederholt laufen, während sich die Geometrie stabilisiert; es muss angeforderte Revision und Aufnahmefähigkeit erneut prüfen. Es darf das Layout nicht verändern. Wenn mehrere Steuerelemente einen nativen Container teilen, muss `views` eine Teilmenge ablehnen, die nicht aufgenommene Steuerelemente ausblenden würde. Die Engine kann diese Beziehung nicht ableiten. Der Renderer behält außerdem seine bestehenden nativen Interaktionsbenachrichtigungen.

`cover` installiert vorbereitete Bildpunkte, bevor es diese Ansichten ausblendet. Zielteile werden gegen das gecachte Token validiert und sowohl für Abdeckung als auch Wiederherstellung verwendet, sodass eine verschobene vorbereitete Oberfläche keine alte Position wiederverwendet. Ungültige oder nicht verfügbare Übergaben liefern `shown: false`. `painted` und `restored` geben nur die jeweilige Kopie frei; Android wartet auf die Web-Zeichenbereitschaft. `release` und `reset` geben eigene Ressourcen frei. Im Abdeckungs- oder Wiederherstellungsweg beginnt keine Aufnahme.

Der Renderer führt seine gewöhnliche native Aktualisierung weiterhin zwischen `restore` und der akzeptierten Aktualisierungsbestätigung aus. Rufen Sie vor dieser Aktualisierung unter iOS `restoreControls()` oder unter Android `restoreViews()` auf, um nur die Ausblendungsänderungen der Engine rückgängig zu machen. Dies ist kein Befehl, beliebige Plugin-Inhalte anzuordnen oder einzublenden. Belassen Sie die normale Sichtbarkeits- und Positionierungsstrategie im Renderer.

### Direkte Snapshot-Grundbausteine

Verwenden Sie diese nur, wenn Ihre Integration die native Positionierung während der Übergabe selbst verwaltet. `NativeUIProjection` verwendet dieselben Operationen mit registrierungsspezifischen Strategien für die Positionierung und für undurchsichtige Ansichten. Duplizieren Sie bei der Weiterleitung an `handle` weder Konvertierung noch Kopienfreigabe.

- Konvertieren Sie Ziel-`parts` aus CSS-Pixeln unter iOS mit `webView.bounds.width / viewportWidth` oder unter Android mit `webView.width / viewportWidth`. Übergeben Sie Frames an `cover` und `restore`; fehlende Abdeckungsteile behalten die aufgenommene Positionierung bei. Keine der beiden Operationen nimmt neue Bildpunkte auf.
- `transient: true` trennt eine bewegte Vordergrundoberfläche vom `coveringToken` des Hintergrunds. Verwenden Sie Bildpunkte wieder, solange Quellgrößen und Positionen relativ zu ihrem Scope unverändert bleiben; Bewegung innerhalb eines festen Scopes invalidiert das Layout.
- Geben Sie die Eintrittskopie nach Web-Zeichenbereitschaft frei: `retireCopy(token)` unter iOS, `retireCopyAfterWebDraw` unter Android.
- Rufen Sie für die Rückkehr `restore` auf, machen Sie die Engine-Ausblendung mit `restoreControls()` / `restoreViews()` rückgängig und wenden Sie das normale native Layout an. Geben Sie die Rückkehrkopie nach akzeptierter nativer Aktualisierung und Web-Zeichenbereitschaft mit `retireCopy` und `entry: false` / `entry = false` frei. Android kann `painted` und `restored` an `handle` weiterleiten, um Bereitschafts- und Ablehnungsbehandlung wiederzuverwenden.
- Geben Sie Tokens mit `release(token)` frei. Verwenden Sie `reset()` nur beim Abbau des Besitzers und unter Android `close()` zum Freigeben des Encoders. Setzen Sie niemals Aufnahmen einer anderen Oberfläche zurück.

Bei fehlender Aufnahme oder Positionierung gilt der gewöhnliche Fallback des Renderers. Payloads beschreibt der [Web-Anfragevertrag](web-projection.md#multiple-fallbacks-in-one-native-transaction).

Verwenden Sie `NativeUICoveredSnapshots.observe`, um den JS-Listener bei Beginn und Ende von Interaktionen zu benachrichtigen. Unter iOS rasterisieren Aufnahmen das sichtbare Fenster mit `drawHierarchy(in:afterScreenUpdates:)`, einschließlich des Hintergrunds unter der beschnittenen nativen Komponente. Bildschirm-Snapshot-Views sind Kopien für die Anzeige und werden nicht als Bitmap-Quellen verwendet. Bei Materialien wie Liquid Glass kann die UIKit-Rasterisierung vom Live-Compositor abweichen; prüfen Sie das Erscheinungsbild auf physischen Geräten mit den von Ihrem Plugin unterstützten Hintergründen. Cache-Gültigkeit umfasst deshalb Layout und visuelle Änderungsbenachrichtigungen des Plugins. Die Engine nimmt nicht fortlaufend auf und garantiert nicht die Aufnehmbarkeit jedes denkbaren Renderers.

## Natives Scrolltracking

Ein natives Steuerelement in einer scrollenden Web-Liste würde sonst neue Positionierungsnachrichten benötigen, während sich die Liste bewegt. Verwenden Sie diese Bindungen nur, wenn der Renderer den Scroll-Abgleich bereits übernimmt: Eine eindeutig zugeordnete iOS-Overflow-Scrollansicht kann native Inhalte mitführen. Verschachteltes oder mehrdeutiges Scrollen muss den gewöhnlichen Fallback verwenden, statt Inhalte an den falschen Scroll-Besitzer anzuhängen.

`readScrollPlacement(element, owner, identify)` misst einen nicht transformierten Overflow-Besitzer. `createScrollBindings()` validiert Wiederverwendung und erkennt Bewegung, während die Übernahme auf ein ACK wartet. Nehmen Sie `reuse` nicht in Layout-Deduplizierungssignaturen auf; es beschreibt den Bestätigungszustand, nicht das Layout.

Unter iOS gruppiert `NativeUIScrollBindings.replace` Quellen nach Besitzer und bindet nur eine eindeutig passende `UIScrollView`. `update()` wendet Positionen und Beschneidung an, ohne Inhalte neu aufzubauen. `NativeUIClippedView` erhält die vollständigen Inhaltsabmessungen und beschränkt zugleich sichtbare Pixel und Treffertests.

Eine bestehende, nativ abgelehnte Bindung verliert ihre Zuständigkeit und kann über **denselben** Update-/ACK-Pfad neu übernommen werden. Eine fehlgeschlagene Neuübernahme bleibt bis zu einem relevanten Layout-/Scrollende-Ereignis beim Fallback. Ergänzen Sie niemals eine sofortige Wiederholungsschleife und führen Sie keine Benutzeraktionen erneut aus. Eine Frame-/Props-Änderung kalibriert einen bestehenden Koordinatenursprung nicht neu.

Dies verwendet WKWebViews interne Overflow-Hierarchie ohne private Klassennamen. Fehlende/mehrdeutige Ansichten, verschachteltes Scrollen, Dokumentscrollen, nicht unterstützte Transformationen, geformte Beschneidung oder ein bewegter unbestätigter Besitzer können nicht gebunden werden. Behaupten Sie keine Unterstützung allein aufgrund einer vorhandenen `UIScrollView`. Eine native Ansicht kann Gesten abfangen, die in ihr beginnen; deren Weiterleitung und SDK-Barrierefreiheit bleiben rendererspezifisch.
