---
title: "Aufnahme- und Plattformgrenzen"
sourceRevision: "51bea8d4a3b4cd13ce718f6c9cb171dee5bfa9af6be8d0c033e488854847b6da"
---
# Aufnahme- und Plattformgrenzen

Wählen Sie Aufnahme- und Fallback-Einstellungen für die tatsächliche native Oberfläche. Beginnen Sie mit dem [Projektionsvertrag](projection.md) und dem [Konfigurationsleitfaden](../configuration/README.md); diese Referenz beschreibt Plattformverhalten und Grenzen, keine zusätzlichen Einrichtungsschritte.

Eine undurchsichtige Karte in einem Feed und ein durchscheinendes Player-Steuerelement benötigen unterschiedliche Aufnahmeentscheidungen. Die alleinige Aufnahme der Karte kann benachbarte Inhalte ausschließen; die alleinige Aufnahme des durchscheinenden Steuerelements verliert hingegen den Hintergrund, mit dem es sich mischt. Wählen Sie anhand der folgenden Fälle das Aufnahmeverhalten und behalten Sie für nicht aufnehmbare Inhalte einen Web-Fallback bei. Diese Entscheidungen bewahren verfügbare Bildpunkte, kein Live-Video und nicht alle Effekte des Plattform-Compositors.

## Android-Aufnahmemodi

Verwenden Sie für undurchsichtige, per Software renderbare Android-SDK-Ansichten `captureMode = NativeUIProjection.CaptureMode.VIEW` zusammen mit einer expliziten `failedFallback`-Richtlinie (`WEB`, sofern der Verbraucher die native Platzierung nicht selbst pflegt). Dies zeichnet nur die Pixel der View ohne umliegenden Abstand, sodass die Aufnahme einer teilweise sichtbaren Anzeige keine Werkzeugleiste oder angrenzenden Inhalte einbrennen kann. Video, SurfaceView, durchscheinende Ansichten und Inhalte, die Window-Komposition benötigen, müssen den Standardmodus `COMPOSITED` behalten. Der Verbraucher muss einen passenden beschnittenen DOM-Host für die gesamte undurchsichtige View bereitstellen; beliebige native Konturmasken, Transformationen und benutzerdefinierte Beschneidungen werden nicht nachgebildet.

VIEW-Pixel werden nach nativer View-Identität, Abmessungen und Inhaltsrevision gecacht. Normales Scrollen behält das dekodierte Web-Bild und aktualisiert die Platzierung ohne Aufnahme, PNG-Encoding oder Bilddekodierung. Das Bild bedeckt die Border-Box des Hosts am lokalen Ursprung (0, 0), unabhängig von der Bestätigungslatenz nativer Platzierung. Undurchsichtige Bilder bleiben zwischen Scrollbewegungen unter der aktiven nativen View gezeichnet. Vor dem Ausblenden dieser View wartet die Engine auf visuelle WebView-Bereitschaft und einen Zeichenvorgang; VIEW erzeugt keine nativen Eintritts- oder Rückkehrbildkopien. Die Rückkehrbestätigung wartet den nativen Zeichenvorgang und den folgenden Animationsframe ab. Eine Generationsprüfung verhindert, dass ein verspäteter Cover-Callback Inhalte nach Wiederherstellung oder Suspendierung ausblendet.

Die native Bitmap wird im VIEW-Modus nach dem PNG-Encoding freigegeben; PNG und dekodiertes Web-Bild bleiben gecacht. Plugin-Aktualisierungsbenachrichtigungen erhöhen die Inhaltsrevision: Melden Sie jede Inhaltsänderung ohne Austausch der View als Aktualisierung. Ersetzen der Registrierung, WebView-Navigation, Reset oder Schließen entfernt den Cache. Encoding bleibt außerhalb des UI-Threads; View-Zeichnung und Cache-Zuständigkeit bleiben darauf, mit der bestehenden Grenze von 8 Millionen Pixeln.

COMPOSITED behält native Übergabekopien für durchscheinende Inhalte. Eintrittskopien warten vor ihrer Entfernung auf visuelle WebView-Bereitschaft und einen Zeichenvorgang. Läuft die Eintrittsfrist von 500 ms ab, wird die native View vor Entfernung der Kopie wiederhergestellt und eine verspätete Zeichenbestätigung abgelehnt.

## Android-Bibliothek

Android verwendet eine Gradle-Android-Bibliothek, die über Maven als AAR statt über Capacitor-Plugin-Registrierung verteilt wird. Die Veröffentlichungskoordinaten sind `io.github.webview-native-ui:engine:<version>`. Erstellen und prüfen Sie die lokale Maven-Veröffentlichung mit:

```sh
android/gradlew -p android testDebugUnitTest assembleRelease connectedDebugAndroidTest publishReleasePublicationToVerificationRepository
```

`NativeUIClippedView` ist ein untergeordneter Helfer, der vom Aufrufer gelieferte Position und Beschneidung anwendet, ohne unveränderte Abmessungen zurückzusetzen. `NativeUIProjection` verwaltet Bildübergabe und Wiederherstellung; es verwendet diesen Helfer nicht für das Renderer-Layout. Das konsumierende Plugin verwaltet normale native Platzierung und Größenaktualisierungen. Android behauptet keine native Overflow-Bindung nach WKWebView-Art. Übergeordnete Registrierungen teilen einen nicht konsumierenden Window-Touch-Beobachter: Down verhindert die Übernahme laufender Aufnahmen, Up/Cancel/Fokusverlust erlaubt wieder Vorbereitung, und Bereinigung entfernt nur diese Registrierung. Vorhandene Callback-Zustellung und Rückgabewerte bleiben erhalten.

`NativeUISnapshots` bereitet zusammengesetzte PixelCopy-Bilder und lokale PNG-Dateien vor und führt Cover/Restore anschließend aus diesem Cache aus. Encoding läuft außerhalb des UI-Threads; pro Besitzer läuft nur eine Vorbereitung. Melden Sie visuelle Änderungen und Interaktion und geben Sie Token bei der Bereinigung frei. Alle View-/Lebenszyklusaufrufe laufen auf dem UI-Thread. Revision, Eignung und Fallback-Richtlinie bleiben beim Plugin.

Nachdem vorbereitete Web-Pixel angezeigt oder entfernt wurden, prüft `NativeUIWebReadiness.prepare` Bereitschaft für einen nachfolgenden WebView-Zeichenvorgang. Das Prädikat `current` muss besitzende Sitzung, Quellgeneration und Bildrevision validieren. Die temporäre native Kopie überdeckt diese asynchrone Übergabe; der Overlay-Start selbst wartet nicht. Weder Bridge-Bestätigung noch dieser Callback beweist die Darstellung auf dem physischen Display.

Ein undurchsichtiges Bild kann zwischen Übergaben unter einer undurchsichtigen nativen Ansicht verbleiben, aber diese Strategie darf nicht auf durchscheinende Steuerelemente angewendet werden: Eine durchscheinende Ansicht über ihrem eigenen aufgenommenen Erscheinungsbild würde den Inhalt doppelt zusammensetzen. Wählen Sie das Aufnahmeverhalten passend zur tatsächlichen Ansicht und zum Hintergrund und prüfen Sie die vollständige Integration. Erzeugen Sie niemals Klicks durch ein projiziertes Bild.

### Durchscheinende Android-Flächen

Erfassen Sie die zusammengesetzten Fensterpixel einschließlich Hintergrund, statt die durchscheinende Ansicht auf eine leere Bitmap zu zeichnen. Behalten Sie das vorbereitete Web-Bild dekodiert, aber ausgeblendet. Bei der Übergabe installiert `cover(token, window, reference, views)` eine temporäre undurchsichtige Bildkopie vor dem Ausblenden dieser nativen Ansichten im selben UI-Durchlauf. Zeigen Sie das Web-Bild, bestätigen Sie Web-Zeichenbereitschaft und entfernen Sie dann die Eintrittskopie. Das Overlay startet sofort; Bild-Encoding liegt niemals auf diesem Pfad.

Installieren Sie bei der Rückkehr mit `restore` die vorbereitete Rückkehrkopie, stellen Sie darunter die nativen Ansichten wieder her, blenden Sie das Web-Bild aus und entfernen Sie die Rückkehrkopie nach Web-Zeichenbereitschaft. So werden aktive durchscheinende native Pixel nicht über ihrem eigenen Snapshot zusammengesetzt. Validieren Sie Token und aktuelle Flächengeneration in jedem asynchronen Callback. Die temporäre Kopie ist nicht interaktiv und begrenzt; Bereinigung gibt beide Kopien und gecachte Ressourcen frei.

Dies erhält den aufgenommenen Hintergrund, keine fortlaufend veränderte Szene hinter dem Bild. Hintergrundänderungen müssen den Cache über dieselben visuellen Änderungsbenachrichtigungen wie Inhaltsaktualisierungen invalidieren. Video und nicht unterstützte Aufnahmeflächen behalten die Fallback-Richtlinie des Verbrauchers.

Verbraucher-Integrationstests gehören in deren jeweilige Repositorys. Engine-CI prüft Browser-, Swift- und Android-Verträge, ohne einen benachbarten Renderer-Checkout vorauszusetzen.

## Farbpräzision von Bildern unter iOS

Vorbereitete Fenstermomentaufnahmen verwenden bei der Aufnahme eine Bitmap im erweiterten Display P3 mit Float16 und werden in einer Hintergrundwarteschlange als 16-Bit-PNGs im Farbraum Display P3 kodiert. Die Web-Projektion zeigt das vorbereitete Bild direkt an, ohne Konvertierung durch Canvas oder WebGPU. Native Kopien für Eintritt und Rückkehr verwenden ebenfalls das dekodierte PNG, sodass beide Seiten nach der Farbkonvertierung dieselben vorbereiteten Pixel nutzen. Kodierung und Dekodierung bleiben außerhalb der Overlay-Übergabe; Verbraucher benötigen weder eine neue Einstellung noch eine neue Abhängigkeit.

Dies reduziert Farbverluste bei Inhalten mit großem Farbumfang, garantiert aber keine identische Liquid Glass-Darstellung: Native Komposition und die Konvertierung in ganzzahlige PNG-Werte können Pixel weiterhin verändern. Höhere Präzision erhöht zudem den Speicherbedarf der Aufnahme und die Bildgröße. Schlägt die Vorbereitung fehl, gilt die bestehende Fallback-Richtlinie. Android behält seinen plattformeigenen Aufnahmepfad.

### Unterschiede bei Liquid Glass-Aufnahmen

Ein aufgenommenes Liquid Glass-Steuerelement kann bei der Projektion in die WebView anders aussehen als das aktive native Steuerelement. Reflektierende Kantenlichter sowie Hintergrundbrechung oder -unschärfe bleiben auf dem Aufnahmeweg nicht vollständig erhalten. Eine höhere Farbpräzision allein beseitigt diesen Unterschied nicht.

![Geräte-Screenshots zum Vergleich aufgenommener und aktiver UIKit-Tab-Leisten auf iPhone und iPad](../assets/ios-native-capture-comparison.png)

Links: **iPhone 15 Pro Max, iOS 27.2**. Rechts: **iPad mini (6. Generation), iPadOS 27.2**. Jeder Geräte-Screenshot zeigt **oben das aufgenommene 16-Bit-Display-P3-PNG in WKWebView** und **unten die aktive UIKit-Tab-Leiste**, jeweils in derselben Größe innerhalb des Geräts. Die Screenshots wurden ohne Skalierung oder Änderung ihres gemeinsamen Farbprofils nebeneinander angeordnet. Dies sind Ergebnisse physischer Geräte, keine Simulator-Aufnahmen.

Der System-Screenshot bewahrt das aktuelle native Erscheinungsbild, die Aufnahme auf Anwendungsebene reproduziert es jedoch nicht vollständig. Auf dem getesteten iPhone bestand der Unterschied auch, wenn das unkodierte aufgenommene Bild vor PNG-Kodierung oder WebView-Darstellung in einer nativen `UIImageView` angezeigt wurde. Das Zeichnen des gesamten `UIWindow` in eine fenstergroße Bitmap mit anschließendem Zuschnitt verbesserte das Ergebnis gegenüber der zugeschnittenen Bitmap der Engine nicht.

System-Screenshots dienen als Beleg für diesen Vergleich, nicht als alternatives Aufnahme-Backend der Engine. Diese Screenshots wurden mit Entwicklerwerkzeugen bei aktiviertem Developer Mode auf den Geräten erstellt. Bildschirmaufnahme-APIs für Anwendungen wie ReplayKit verlangen die Zustimmung des Benutzers; auch ein manueller Screenshot erfordert eine Benutzeraktion. Der Zuschnitt eines System-Screenshots würde dessen aufgenommene Bildpunkte bewahren, beseitigt aber diese Voraussetzungen für die Aufnahme nicht. Die Engine verwendet diesen Weg daher nicht für automatische UI-Übergaben: Gewöhnliche Projektion darf weder Developer Mode noch Screenshot-Aktionen oder einen Berechtigungsablauf zur Bildschirmaufnahme voraussetzen. Siehe [Apples ReplayKit-Sicherheitsdokumentation](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web).

Wir haben diese Einschränkung Apple gemeldet und um einen unterstützten Weg gebeten, das vollständige Erscheinungsbild ohne Bildschirmaufnahmesitzung aufzunehmen. Siehe die [Diskussion in den Apple Developer Forums](https://developer.apple.com/forums/thread/853543). Apple schlug vor, einen Vorfahren aufzunehmen, der den erforderlichen Hintergrund einschließt; der obige Vergleich des gesamten Fensters prüft diesen Ansatz. Dies bleibt eine beobachtete Aufnahmebeschränkung, keine bestätigte Lösung und keine Zusage von Apple. Prüfen Sie durchscheinende Steuerelemente auf physischen Geräten mit den Hintergründen, die Ihr Plugin unterstützt.

## Temporärer Speicher und Anwendungsberechtigungen

Vorbereitete Bilder bleiben im privaten temporären Speicher der App. iOS verwendet `FileManager.default.temporaryDirectory`. Erstellen Sie unter Android `NativeUISnapshots` mit einem Verzeichnis innerhalb von `context.cacheDir`; verwenden Sie keinen gemeinsamen oder externen Speicher. Keine Plattform benötigt für diesen Pfad eine Foto- oder Speicherberechtigungsabfrage. Kein Capacitor-Filesystem-Plugin ist erforderlich. Siehe [Apples Sandbox-Verzeichnisse](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html) und [Androids app-spezifischen Speicher](https://developer.android.com/training/data-storage/app-specific).

`Capacitor.convertFileSrc` ordnet die zurückgegebene Datei-URL dem vorhandenen lokalen WebView-Server zu. Es gewährt keine Dateisystemberechtigung und lädt das Bild nicht hoch. Setzt die Anwendung eine Content Security Policy, muss deren `img-src` den von dieser URL verwendeten lokalen App-Origin erlauben; aktivieren Sie keinen pauschalen `file:`-Zugriff oder sachfremde WebView-Dateizugriffseinstellungen.

`release(token)` und Besitzerbereinigung entfernen eigene Snapshot-Dateien. Abruptes Prozessende kann temporäre Bilder hinterlassen, bis das Betriebssystem den Cache löscht oder die App deinstalliert wird; sofortiges Löschen nach einem Absturz ist nicht garantiert. Halten Sie den Speicher privat und behandeln Sie ihn als entbehrlich, nicht als dauerhafte Anwendungsdaten.
