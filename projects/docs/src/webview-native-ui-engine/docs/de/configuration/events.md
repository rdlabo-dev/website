---
title: "Benachrichtigungen"
sourceRevision: "96734d252ef2d23df15b3d25f52bda7afdd9e042842e0b4c4cafc017c530adf0"
---
# Plugin-Benachrichtigungen verbinden

Verwenden Sie `receiveListeners`, wenn sich native Inhalte oder ihre Darstellung nach der Initialisierung ändern. Dies sind Benachrichtigungen über erfolgreiche Änderungen, kein Abfangen von Methoden. Die Leitfäden für [Capacitor](../getting-started/capacitor.md) und [Cordova](../getting-started/cordova.md) zeigen, wo sie weitergeleitet werden; diese Seite definiert den gemeinsamen Ereignisvertrag.

Beispielsweise verändert die Auswahl eines anderen nativen Tabs das hervorgehobene Element, aber nicht die Position der Leiste. Ohne Aktualisierungsbenachrichtigung kann beim Öffnen eines Web-Sheets ein Bild der alten Auswahl erneut verwendet werden. Senden Sie das Ereignis Ihres Plugins für die erfolgreiche Auswahl und nehmen Sie es in `update` auf. Eine Ausblendung ist etwas anderes: Ordnen Sie ihr Ereignis `none` zu, damit eine spätere Aktualisierung des Erscheinungsbilds die verborgene Leiste nicht wieder einblenden kann.

## Start und Zuordnung

Durch die Weiterleitung von Benachrichtigungen aus dem Plugin kann die Engine das neueste passende Projektionsziel behalten, bevor die Web-Laufzeit ihr Abonnement eingerichtet hat. Eine separate Zustandsvariable oder ein Callback für den Anfangszustand ist nicht nötig. Lassen Sie die Auslieferung der Anwendungsereignisse des Plugins unverändert: Die Engine erfasst den Zustand, ohne Benachrichtigungen, Aktualisierungen oder Benutzeraktionen erneut auszuführen. Ohne Zielbenachrichtigung leitet sie das anfängliche Ziel aus der Sichtbarkeit der nativen Ansicht ab. Die Registrierung muss vor den Benachrichtigungen bestehen, die sie beobachten soll.

Wenn Ihr Plugin mehrere Registrierungen besitzt, leiten Sie die Benachrichtigung an jede Registrierung weiter; `receiveListeners.match` wählt die zuständige Oberfläche aus. Aktualisierungen des Erscheinungsbilds ändern das Ziel nicht. Vor der Verbindung bleiben native Positionierung und Sichtbarkeit Aufgabe des Renderers.

Beim standardmäßigen Web-Fallback bleibt während des Scrollens ohne vorbereitetes Bild oder native Scroll-Bindung der Web-Fallback sichtbar, bis der Renderer die aktuelle native Positionierung mit seiner Benachrichtigung für das native Ziel bestätigt. Eine reine Aktualisierung des Erscheinungsbilds ist keine solche Bestätigung. Verbraucher, die bei Fehlern nativ wiederherstellen, müssen ihre native Geometrie selbst aktuell halten.

## Erfolgreiche Aktualisierungs- und Darstellungsereignisse auswählen

Alle eingehenden Ereignisdeklarationen gehören zu `receiveListeners`. Seine Liste `update` aktualisiert das Bild und konfigurierte Wertbindungen, seine Listen `projection` wählen das Ziel, und das optionale `match` filtert Benachrichtigungen für die zuständige Oberfläche.

| Benachrichtigung | Stelle zum Auslösen im bestehenden Plugin |
| --- | --- |
| `appearanceChanged` (ein `update`-Ereignis) | Nach einer erfolgreichen nativen Änderung des Erscheinungsbilds, etwa `setColors` |
| `transitionStarted` (`web`) | Bevor sich das Fallback-DOM bewegt oder eine Web-Ebene die native Ansicht überdeckt |
| `shown` (`native`) | Nach dem bestehenden Einblendungsvorgang des Plugins oder bei der Rückkehr von der Web-Projektion |
| `hidden` (`none`) | Nach dem bestehenden Ausblendungsvorgang des Plugins |

Die Namen in den Beispielen sind frei gewählte Konventionen, keine reservierten Engine-Methoden. Ein `update`-Ereignis aktualisiert das vorbereitete Bild und die konfigurierten Werte, ohne das angeforderte Ziel zu ändern. Es ruft `setColors` nicht erneut auf.

Senden Sie `transitionStarted`, bevor sich das DOM bewegt, `shown`, wenn wieder native Projektion angefordert wird, und `hidden` nach dem eigenen Ausblendungsvorgang des Plugins. Native Aufnahme, URL-Konvertierung, Bildvorbereitung, Zeichenbestätigung, Bildfreigabe und Listener-Bereinigung bleiben innerhalb der Engine. Die Engine ruft niemals die Methoden `show`, `hide`, Auswahl oder Anzeigenladen des Plugins auf. Beenden Sie die Registrierung mit `projection.destroy()` unter iOS oder `projection.close()` unter Android, wenn der Renderer zerstört wird. Behalten Sie die Registrierung während ihrer gesamten Lebensdauer und rufen Sie native APIs im UI-Thread auf.
