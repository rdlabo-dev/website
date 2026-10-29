---
title: "Projektionsvertrag und Lebensdauer"
sourceRevision: "815c5dbcef229aa13eaf2e47d8bd643ca955bf96eddd26cf9dcbff7d1d8776be"
---
# Projektionsreferenz

Verwenden Sie diese Referenz, um Integrationsverträge und Plattformgrenzen zu prüfen. Beginnen Sie mit [Konzepten und Integrationswegen](../concepts.md), um zu entscheiden, ob die Engine zu Ihrer UI passt. Unter [native Initialisierung](../getting-started/initialization.md) werden erforderliche Eingaben, optionale Einstellungen und erweiterte APIs unterschieden. Folgen Sie anschließend dem [Capacitor](../getting-started/capacitor.md)-, [Cordova](../getting-started/cordova.md)- oder [Renderer](../advanced/renderer.md)-Leitfaden.

Diese Seite behandelt DOM-Lebensdauer, Zielprioritäten, Host-Anforderungen und native Eignung. Siehe [Plattformgrenzen](platforms.md) für Aufnahmedetails, [Projektionszustand](state.md) für das Attribut der Darstellungsabsicht und [Containerunterstützung](containers.md) für HTML-/Ionic-Hosts.

Verwenden Sie diesen Vertrag, wenn Sie festlegen, was einen Übergang überleben muss. Beispielsweise schließt ein Modal, während eine native Wiederherstellungsantwort noch unterwegs ist, und das Framework ersetzt das Seiten-DOM. Die alte Antwort darf die Steuerelemente der verlassenen Seite nicht einblenden; die folgenden Lebensdauer- und Zielregeln definieren diese Grenze.

## Lebensdauer von DOM und Seite

Die native Registrierung ist unabhängig vom JavaScript-Framework. Ihr Selektor identifiziert einen Fallback-Container im aktuellen Dokument; dieser darf nach der Registrierung erscheinen. Entfernt oder ersetzt ein Framework diesen Container, gibt die Engine die alte Projektion frei und bindet das aktuell passende Element. Eine ausstehende Ziehbewegung oder native Zeichenbestätigung des entfernten Containers darf seinen Ersatz nicht aufhalten. Wird dasselbe Element zwischen Eltern verschoben, werden seine Scroll-Bindungen aktualisiert, ohne dass das Plugin es erneut registrieren muss.

Eine vollständige HTML-Navigation erzeugt ein neues Dokument und eine neue Laufzeitsitzung. Die native Registrierung installiert die Laufzeit im neuen Dokument und behält das explizite Projektionsziel des Plugins; Bilder und Antworten gehören zu ihrem ursprünglichen Dokument. Behalten Sie Registrierungen während der Lebensdauer des nativen Renderers bei, statt sie bei jedem Seitenereignis des Frameworks neu zu erstellen.

Diese Regeln gelten für die selektorbasierte native Registrierung. Ein untergeordnetes `createWebProjectionScope(element)` bindet bewusst dieses konkrete Element; dessen Renderer bleibt dafür zuständig, den Scope beim Wechsel des Elements zu ersetzen.

Die Engine kann nicht die Übergangs- oder Modal-Semantik jedes Frameworks aus DOM-Mutationen ableiten. Verwenden Sie für diese Übergänge die bestehenden Projektionsbenachrichtigungen und bei Bedarf eine explizite Overlay-Integration. Ionic-Unterstützung ist optional und für die gewöhnliche DOM-Lebensdauerverwaltung nicht erforderlich. Framework-spezifische Ereignisse werden nicht automatisch installiert. Erstellung nativer Ansichten, Layoutbedingungen und SDK-Lebenszyklus bleiben beim Plugin.

## Projektionsvertrag

Eine Benachrichtigung bestimmt, **wohin die Fläche gehört**, nicht wie sie aufgenommen wird. Die Engine wählt die plattformspezifische Übergabe, ohne vom Plugin eine weitere Kopie des Projektionszustands zu verlangen.

| Gewünschtes Ziel | Erforderliches Verhalten |
| --- | --- |
| `native` | Interaktive native Ansicht mit bestätigter Geometrie anzeigen. Bei Bewegung unterstütztes natives Tracking oder ein vorbereitetes Bild verwenden. |
| `web` | Nativen Inhalt unter der überdeckenden Web-Ebene halten, indem seine native Projektion entfernt wird; ein vorbereitetes Bild oder den Web-Fallback des Plugins verwenden. |
| `none` | Nativen Inhalt, projizierte Bilder und Fallback-Inhalt entfernen. Spätere Aktualisierungs-/Aufnahmecallbacks dürfen sie nicht wieder anzeigen. |

Overlay-Abdeckung kann `native` vorübergehend in `web` ändern; sie überschreibt niemals `none`. Ein Aufnahmefehler ändert das gewünschte Ziel nicht. `failedFallback: native` ist nur für Verbraucher gültig, die ihre native Platzierung selbst pflegen, und überschreibt niemals explizites `web`, `none` oder Overlay-Abdeckung.

Die Engine verwaltet Bildbereitschaft und Wiederherstellungsbestätigung. Sie darf native Pixel nicht ausblenden, bevor Ersatzpixel bereit sind, und Ersatzpixel nicht entfernen, bevor die native Wiederherstellung erfolgreich ist. Reine Positionsbewegungen verwenden vorbereitete Inhalte erneut; Änderungen an Erscheinungsbild, Größe und Renderer-Identität invalidieren sie. Bei fehlendem Bild greift sofort der deklarierte Fallback, statt während eines Übergangs auf eine Aufnahme zu warten.

Registrierung und Benachrichtigungsweiterleitung behalten die letzte Absicht über Start und Wiederverbindung hinweg; sie führen Geschäftsereignisse nicht erneut aus. Die Zerstörung entfernt Registrierung und Bildcache. Benachrichtigungen sind Absichtserklärungen, keine Abschlussversprechen: Eine API, die abgeschlossenes Ausblenden verspricht, muss die unter DOM- und nativen Flächenanforderungen beschriebene explizite Entfernungsbestätigung abwarten.

Ein bestehender Renderer, der CSS-Sichtbarkeit prüft, kann `getUnprojectedVisibility(element)` aus dem npm-Paket aufrufen. Es liest die aktuell deklarierte/geerbte Sichtbarkeit ohne die Ausblendungsregeln der Engine und stellt vor der Rückgabe die Projektionszuständigkeit wieder her. Verwenden oder verändern Sie Engine-Markierungsattribute nicht, um in einem konsumierenden Plugin die Projektionszuständigkeit abzuleiten. Unter [DOM-Integration des Renderers](../advanced/web-projection.md) wird beschrieben, wie Engine-eigene Mutationen von der Renderer-Invalidierung ausgeschlossen werden. Dieser Helfer liest Stile und kann Attributbeobachter auslösen; er beseitigt keine Mess- oder Transportkosten.

## DOM- und native Flächenanforderungen

`projectionSelector` ist erforderlich und muss mit einem gültigen CSS-Selektor **beim Projektionsbeginn genau einen vorhandenen Container auflösen**. ID-, Klassen-, Attribut- und Nachfahrenselektoren werden unterstützt; bei keinem oder mehreren Treffern bleibt Native ausgeblendet. Die Engine erstellt den Fallback-Container nicht und bestimmt weder Größe, Platzierung, Ebene noch z-index. Behalten Sie das normale Containerlayout und interaktive Web-Bedienelemente; ein leerer Platzhalter ohne Größe ist kein nutzbarer Fallback. Dies ist ein fester Gültigkeitsbereich, kein Suchstamm.

Der Container muss bei der Registrierung noch nicht existieren. Bei fehlendem DOM wird gewartet, ohne nativen Inhalt anzuzeigen; sein Ersetzen erzeugt eine neue Bindung und entfernt alte Bilder. Die Engine erhält Kinder, Listener und Werte des Containers. Übergeben Sie die native Ansicht selbst über `view`; eine Gruppe von Bedienelementen kann ihren gemeinsamen nativen Container verwenden. Die Engine verwaltet die interne Kennung, daher sind weder ID-Liste noch View-Dictionary nötig. Unabhängige Flächen verwenden separate Registrierungen.

Ein Web-Component-Host kann das Ziel sein, etwa `projectionSelector: 'native-ad[placement="home"]'`. Geben Sie dem Host eine Layoutbox (`display: block` mit den gewünschten Abmessungen); die Engine beobachtet Einfügen, Entfernen und Änderungen an Selektorattributen. Der Selektor läuft im Dokument und durchsucht keine Shadow Roots. Die Engine blendet während der Projektion Fallback-Inhalte und Pseudoelemente im Light DOM und in offenen Shadow Roots aus. Inhalte geschlossener Shadow Roots können nicht untersucht werden und müssen die `visibility` des Hosts erben; stellen Sie einen Container bereit, dessen Shadow-/Slot-Struktur das eingefügte Bild anzeigen kann.

Siehe [Unterstützung von Projektionscontainern](containers.md) für die HTML- und vollständigen Ionic-Elementtabellen, Größenbedingungen und ein Wrapper-Beispiel.

### Anforderungen an native Flächen

Wenn ein Plugin mehrere unabhängig bewegte native Ansichten darstellt, beispielsweise mehrere Anzeigen in einem scrollenden Feed, erstellen Sie für jede Ansicht eine separate Registrierung mit einem Selektor für ihren eigenen DOM-Container. So kann sich eine Ansicht bewegen, ausblenden oder ersetzt werden, ohne die Projektion einer anderen Ansicht zu verändern.

Wenn diese Registrierungen Plugin-Benachrichtigungen teilen, ordnen Sie mit `receiveListeners.match` jede Benachrichtigung der vorgesehenen Registrierung zu. Die Abgleichfelder werden von Ihrem Plugin gewählt und sind keine reservierten Engine-Bezeichner. Nehmen Sie beispielsweise `viewKey` zur Identifikation des dargestellten Elements und `instanceId` zur Unterscheidung aufeinanderfolgender geladener Instanzen dieses Elements auf:

```swift
match: ["viewKey": viewKey, "instanceId": instanceId]
```

```kotlin
match = mapOf("viewKey" to viewKey, "instanceId" to instanceId)
```

Fügen Sie dieselben Felder in die Benachrichtigungs-Payload ein. Geben Sie die alte Registrierung beim Ersetzen ihres geladenen Inhalts frei, auch wenn der native Container wiederverwendet wird, damit Benachrichtigungen der vorherigen Instanz den Ersatz nicht beeinflussen können.

Bei Ansichten von Drittanbieter-SDKs belassen Sie Laden und Interaktionsbehandlung im Plugin. Melden Sie mit `canCapture`, ob der aktuelle Inhalt gemäß den SDK-Regeln und den unterstützten Aufnahmebedingungen Ihrer Integration aufgenommen werden darf. Beispielsweise kann ein Werbe-SDK unterschiedliche Behandlung für Video und statische Inhalte verlangen. Die Engine erteilt keine Erlaubnis zur Aufnahme von SDK-Inhalten und ersetzt nicht deren Klick- und Impressionsbehandlung.

Setzen Sie für SDK-Verbraucher ohne gleichwertigen Web-Fallback unter iOS `failedFallback: .native` beziehungsweise unter Android `failedFallback = NativeUIProjection.FailedFallback.NATIVE`. Der Standard `.web` / `WEB` erhält bestehende Verbraucher. Kann automatische Bewegung kein vorbereitetes Bild nutzen (nicht bereit, nicht unterstützte Aufnahme oder abgelehnte Übergabe), erhält `native` die aktive native Ansicht und hält das Fallback-DOM ausgeblendet. Der Verbraucher muss diese Ansicht weiterhin positionieren; diese Option erzeugt kein natives Scrolltracking auf Android. Explizites `web`, `none` und Overlay-Abdeckung haben Vorrang: Die Option hebt niemals eine native Ansicht über eine absichtlich überdeckende Web-Ebene.

Unter Android müssen Verbraucher, deren asynchrone Ausblendemethode das Verschwinden aller Pixel verspricht, `projection.hide { completed -> ... }` aufrufen und erst bei `completed` gleich true auflösen. Native Übergabekopien verschwinden sofort; der Abschluss wartet auf die synchrone Entfernung des Web-Proxys. Ein Timeout meldet Fehler, keinen Erfolg. Rufen Sie beim erneuten Anzeigen zusätzlich zu normalen Plugin-Ereignissen `projection.show()` auf; dies erhält auch die Darstellungsabsicht, falls das Ereignisabonnement noch startet.

Scrollbeobachtung folgt den Vorfahren im zusammengesetzten Baum einschließlich zugewiesener Slots. Nicht zusammengesetzte Scrollereignisse innerhalb eines Ionic-Shadow-Baums werden an ihrer Quelle beobachtet; Anwendungen ergänzen keinen zusätzlichen Listener und senden keine synthetischen Dokumentereignisse. Listener folgen Host-Umhängungen und Slot-Neuzuweisungen und werden bei der Bereinigung entfernt.

Scrollen wird intern behandelt: iOS verwendet eine eindeutig zugeordnete native Scrollbindung, wenn verfügbar; andernfalls, auch unter Android, nutzt Scrollen vorübergehend das vorbereitete Bild und stellt nativen Inhalt nach Ende der Bewegung wieder her. Automatische Scrollbehandlung überschreibt niemals explizites `web` oder `none`. Nicht unterstützte Aufnahme oder Geometrie erhält den normalen DOM-Fallback; auf dem Übergangspfad wird nicht auf eine neue Aufnahme gewartet. Das letzte explizite Ziel übersteht WebView-Neuladen, und Antworten alter Dokumente können keine Anfragen eines neuen Dokuments abschließen.

Standardmäßig ist der interne Kanal auf den Hauptframe der localhost-Origins von Capacitor begrenzt. Übergeben Sie bei einem anderen konfigurierten Origin die exakten `allowedOrigins` der Anwendung. Android benötigt die WebView-Funktionen `WEB_MESSAGE_LISTENER` und `DOCUMENT_START_SCRIPT`; auf nicht unterstützten WebViews scheitert die Registrierung explizit. Verwenden Sie keine Wildcard-Origins für WebViews, die zu entfernten Seiten navigieren können.

Informationen zu Aufnahmemodi, durchscheinenden Oberflächen, Bildfarben und privatem Speicher finden Sie unter [Aufnahme- und Plattformgrenzen](platforms.md). Bridge- und Scroll-Bindungen für eigene Renderer sind unter [native Übergabe](../advanced/native-handoff.md) dokumentiert.

[Dokumentationsübersicht](../README.md)
