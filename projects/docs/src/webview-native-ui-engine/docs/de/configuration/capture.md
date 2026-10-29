---
title: "Aufnahmezeitpunkt"
sourceRevision: "d96661854c40b245d82c079e1106470993dadb679ce6a90d2a0e9c3f4f056788"
---
# Den Aufnahmezeitpunkt konfigurieren

Verwenden Sie diese Einstellung, wenn eine erfolgreiche Zustandsänderung vor dem Ende ihrer visuellen Animation gemeldet wird. Beispielsweise kann ein Tab-Auswahlereignis eintreffen, während die Hervorhebung noch vergrößert ist; eine sofortige Aufnahme würde diese Zwischenform unter dem nächsten Web-Overlay bewahren. Verzögern Sie die Vorbereitung im Hintergrund, bis das Steuerelement zur Ruhe kommt. Behalten Sie den Standard bei, wenn das gemessene Erscheinungsbild bereits stabil ist; eine längere Verzögerung hält auch das vorherige Bild länger verfügbar.

`captureDelayMs` ist eine optionale Registrierungseinstellung für Capacitor und Cordova. Der Standard beträgt **50 Millisekunden** unter iOS, Android und in den Optionen der tieferen API `createWebProjection`. Werte müssen endlich und nicht negativ sein. Sie verwendet den bestehenden Debounce: Eine neue Aktualisierung oder Interaktion startet die Vorbereitung nach dem Ende der Aktivität neu. Sie fügt keinen zweiten Timer hinzu und verzögert die Darstellung des Overlays nicht.

Bis neue Bildpunkte bereitstehen, bleibt das letzte abgeschlossene Bild verfügbar. Ist noch kein fertiges Bild vorhanden, gilt der normale Web-Fallback. Das Öffnen eines Overlays während des Debounce wartet nicht auf eine neue Aufnahme. Eine längere Verzögerung verlängert daher auch den Zeitraum, in dem nach einer Aktualisierung das vorherige Erscheinungsbild verwendet werden kann.

Eine Empfehlung als Ausgangspunkt für **Liquid Glass-Auswahlanimationen einer UITabBar sind 600 ms**. Bei Simulatorvergleichen mit iOS 27.0 auf dem iPhone und iOS 27.1 auf Duo nahm 50 ms eine vergrößerte Auswahl auf, bei 300 ms blieb noch eine kleine Restveränderung, und 600 ms entsprach dem bei 1000 ms beobachteten abgeschlossenen Erscheinungsbild. Dies ist eine Empfehlung für diese Interaktion, kein Zeitvertrag von Apple und keine allgemeine Liquid Glass-Dauer. Messen Sie Auswahl, erneute Auswahl und aufeinanderfolgende Aktualisierungen Ihres Steuerelements, bevor Sie einen Wert wählen. Für ständig wechselnde Inhalte ist kein stabiler Snapshot garantiert.
