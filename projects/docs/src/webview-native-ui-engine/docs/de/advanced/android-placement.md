---
title: "Aufgeschobene Android-Positionierung"
sourceRevision: "635ca25b59dc6382eaa179e35382f93855d7d3a8f41f46d2f41d7a0a4223f343"
---
# Aufgeschobene Positionierung unter Android

Verwenden Sie dies nur, wenn ein bestehender Renderer native Positionierung aufschiebt, während ein undurchsichtiges Bild die Darstellung übernimmt. Grundlegende Registrierungen benötigen diese Callbacks nicht.

Beispielsweise bewegt sich eine undurchsichtige native Anzeige durch einen scrollenden Feed. Sobald ihr Bild dem DOM folgt, verursacht wiederholtes Layout der verborgenen nativen Ansicht Arbeit, ohne sichtbare Bildpunkte zu verändern. Schieben Sie diese Positionierung auf und wenden Sie vor dem Einblenden nativer Inhalte die neueste Position an, damit sie nicht an den alten Ort zurückspringen. Behalten Sie das gewöhnliche Positionierungstracking bei, wenn die Ansicht kein undurchsichtiges Bild verwenden kann.

Android-VIEW-Verbraucher können nach erfolgreicher Abdeckung im UI-Thread `isProjecting` lesen, um native Positionierungsarbeit bei gleicher Größe aufzuschieben. Behalten Sie nur die zuletzt akzeptierte Positionierung; prüfen Sie Sequenz/Generation weiterhin und verarbeiten Sie Ausblendung, Größenänderung und Abbau sofort. Stellen Sie `beforeNativeReveal` bereit, um diese ausstehende Positionierung synchron anzuwenden, bevor normale Wiederherstellung, Fehlerbehebung oder Freigabe eines aktiven Bildes native Bildpunkte sichtbar macht. Die Engine löscht `isProjecting` vor dem Callback-Aufruf, sodass die Anwendung der Positionierung nicht erneut aufschieben darf. Der Callback kann auch ohne ausstehende Arbeit laufen und muss idempotent sein. Verwerfen Sie ausstehende Verbraucherarbeit bei Ausblendung/Zerstörung und prüfen Sie vor ihrer Anwendung die Identität der geladenen View. Der Callback ersetzt weder Inhalts-/Größeninvalidierung noch JavaScript-Geometrietracking.

### Abschließende Positionierung bei der Rückkehr von einem undurchsichtigen Bild (Android)

Ein Plugin, das normalerweise bei jedem Scrollen native Positionierung misst und sendet, kann eine abschließende Positionierungsübergabe aktivieren. Übergeben Sie `updatePlacement: (JSONObject) -> Unit` an seine Android-`NativeUIProjection`-Registrierung und binden Sie seinen Web-Host mit `bindProjectionPlacement(element, measure, invalidate)`.

- `binding.projected` wird erst true, nachdem Native die Bildübergabe bestätigt. Solange es true ist, kann das Plugin die letzte Positionierung dieses Hosts in vollständigen Positionierungsbatches wiederverwenden und dessen Messung überspringen. Andere Hosts setzen ihre gewöhnlichen Aktualisierungen fort.
- `measure()` liefert synchron ein JSON-Objekt. Die Engine nimmt es in die bestehende Wiederherstellungsanfrage oder eine Wiederherstellungsanfrage für ein aktives Bild auf. Native prüft Token des aktiven Bildes und View-Identität, ruft `updatePlacement` auf und blendet anschließend Native ein und bestätigt das Zeichnen. Es entsteht kein zusätzlicher Bridge-Roundtrip.
- Das Plugin muss in `updatePlacement` seine eigene Identität, Generation und hostbezogene Sequenz prüfen. Lösen Sie einen Fehler aus, um eine veraltete oder ungültige Positionierung abzulehnen. Eine abschließende Aktualisierung eines Hosts darf nicht dazu führen, dass Aktualisierungen eines anderen Hosts verworfen werden.
- `invalidate()` wird nach einer fehlgeschlagenen Übergabeanfrage aufgerufen. Leeren Sie optimistische Positionierungs-/Deduplizierungscaches und planen Sie den gewöhnlichen Positionierungsabgleich.
- Geben Sie die Bindung beim Ablösen eines Hosts frei. Die Sitzungszuständigkeit verhindert, dass eine verspätete Bestätigung einer alten Registrierung den Projektionszustand einer neuen Registrierung löscht. Pause, deklarierte Sichtbarkeit und Layoutänderungen müssen weiterhin die normalen Sichtbarkeits-/Invalidierungswege des Plugins verwenden.

Diese optionale Funktion verändert Registrierungen ohne `updatePlacement` nicht. Android lehnt `updatePlacement` ab, sofern nicht `captureMode = CaptureMode.VIEW` gilt; Live-Video und andere nicht aufnehmbare Inhalte führen unter `failedFallback = NATIVE` das native Positionierungstracking weiter.
