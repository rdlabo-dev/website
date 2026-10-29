---
title: "Konzepte und Grenzen"
sourceRevision: "9e76202b8e917a9bb839d02de72b3d4c9c9a0d4a742e2ee11139930e52da18df"
---
# Native UI in Web-gesteuerten Ansichten

Verwenden Sie die Engine, wenn eine native Ansicht mit Web-Scrollen, Übergängen oder Overlays koexistieren muss. Beispielsweise kann eine native Tab-Leiste im normalen Gebrauch interaktiv bleiben und beim Öffnen eines Web-Modals dennoch visuell darunter liegen. Die Anwendung behält ihre Web-Navigation und ihr Layout bei, statt den gesamten Bildschirm nativ nachzubauen.

## Warum ein Bridge-Aufruf nicht genügt

Eine native Ansicht über einer WebView liegt außerhalb des DOM-Stapelbaums. Ein höherer `z-index` eines Web-Modals kann sie nicht überdecken. Das Ausblenden der nativen Ansicht legt frei, was die Webseite darunter zeichnet; dies kann anders aussehen. Ein erneutes Einblenden vor der Stabilisierung des Layouts kann die falsche Position sichtbar machen.

Die Engine übernimmt die visuelle Übergabe zwischen diesen Ebenen. Sie bereitet ein Bild vor, während native Inhalte verfügbar sind, stellt dieses Bild bei Bedarf im DOM der Anwendung dar und behält es bis zur Bestätigung der nativen Wiederherstellung bei. Vorbereitung und Darstellung sind getrennt, damit das Öffnen eines Overlays nicht auf die Aufnahme wartet.

## Drei Darstellungen mit unterschiedlichen Aufgaben

| Darstellung | Was der Benutzer sieht | Warum sie verwendet wird |
| --- | --- | --- |
| Aktive native Ansicht | Das tatsächliche interaktive Steuerelement oder eine geeignete SDK-Ansicht | Normale native Interaktion und Darstellung. |
| Web-Projektion | Ein vorbereitetes, nicht interaktives Bild in einem DOM-Container | Das native Erscheinungsbild kann sich mit Web-Inhalten bewegen oder unter einem Web-Overlay liegen. |
| Web-Fallback | Das eigene HTML der Anwendung oder ihr gewählter Leerzustand | Die Integration bleibt nutzbar, wenn kein geeignetes Bild vorbereitet werden kann. |

Eine Projektion ist kein zweites aktives Steuerelement. Sie leitet keine Klicks weiter, animiert kein Video und ordnet die tatsächliche native Ansicht nicht unter einzelnen DOM-Elementen neu an. Die konfigurierten Ziele `native`, `web` und `none` drücken aus, wohin der Inhalt gehört; die Engine wählt den Übergabemechanismus. Genaue Vorrang- und Wiederherstellungsregeln stehen im [Projektionsvertrag](reference/projection.md#projection-contract).

## Warum die Integration einen DOM-Container bereitstellt

Der Container gibt dem Bild seinen Platz im Layout und in der Ebenenstruktur der Anwendung. Ein natives Rechteck allein kann der Engine nicht sagen, welches Modal, welcher beschneidende Vorfahr oder welcher Scrollbereich das Bild enthalten soll. Der Container kann bereits einen Web-Fallback enthalten; sein Inhalt und seine Listener überleben die Projektion.

Für eine Anzeige könnte dies ein `native-ad`-Element in einem scrollenden Feed sein. Für eine Tab-Leiste könnte es ein Fallback-Navigationscontainer unter der Overlay-Ebene der Seite sein. Wählen Sie einen [unterstützten Container](reference/containers.md) mit der vorgesehenen Layoutbox. Die Engine erstellt weder das Anwendungslayout noch liefert sie eine Implementierung für Anzeigen oder Tab-Leisten.

## Die kleinste passende Integration wählen

| Was Sie entwickeln | Einstieg | Warum dieser Weg |
| --- | --- | --- |
| Ein Capacitor-Plugin mit einer nativen Ansicht, etwa einer Tab-Leiste oder einer aufnehmbaren Werbeansicht | [Capacitor-Plugin-Leitfaden](getting-started/capacitor.md) | Die native Registrierung übernimmt Laufzeitstart, Messungen und Übergabebestätigungen; behalten Sie die bestehende Plugin-API bei. |
| Ein Cordova-Plugin mit demselben Bedarf | [Cordova-Plugin-Leitfaden](getting-started/cordova.md) | Derselbe Lebenszyklus nutzt die nativen Hooks und den Ressourcenhandler von Cordova. |
| Ein Renderer, der bereits viele Steuerelemente über Seiten und Modals hinweg bündelt | [Renderer-Leitfaden](advanced/renderer.md) | Gruppieren Sie Steuerelemente nach Lebenszyklus und behalten Sie das bestehende Positionierungs- und Aktualisierungsprotokoll des Renderers bei. |
| Eine Ionic-Anwendung mit einem Engine-fähigen Plugin | [Ionic-Overlay-Leitfaden](configuration/ionic-overlays.md) | Ein gemeinsamer Monitor verbindet den Ionic-Overlay-Lebenszyklus mit der Projektionsabdeckung. |

Unter [native Initialisierung](getting-started/initialization.md) finden Sie die minimale Registrierung sowie eine Abgrenzung optionaler Einstellungen von erweiterten APIs.

Ein Web-Modal allein erfordert keine Renderer-APIs. Beginnen Sie mit nativer `NativeUIProjection`-Registrierung, sofern Sie nicht bereits den Abgleich mehrerer Steuerelemente übernehmen. Anwendungen erhalten Engine-Unterstützung normalerweise durch ein integrierendes Plugin, statt selbst Registrierungen anzulegen. Andere Web-Frameworks können eigene Übergangsbenachrichtigungen verwenden; Ionic ist optional.

## Wo die Zuständigkeiten zusammenkommen

| Engine | Konsumierendes Plugin |
| --- | --- |
| DOM-Messung, Bildgeometrie und unterstützte native Scroll-Bindung | Native Ansichten erstellen, anhängen, positionieren und dimensionieren |
| Start, Ereignisabonnements und native Zeichenbestätigungen | Fallback-DOM in der richtigen Ebene bereitstellen |
| Cache vorbereiteter Bilder, Dekodierung, Anzeige und Freigabe | Änderungen des Erscheinungsbilds und das beabsichtigte Projektionsziel melden |
| Native Aufnahme und temporäre Rückkehrbilder | Native Ansichten und SDK-Aufnahmefähigkeit bereitstellen |
| Bildinvalidierung, Tokenbereinigung und Beobachterabbau | Geschäftsaktionen und interaktiven Web-Fallback verwalten |

Ein DOM-Container enthält nicht zwangsläufig einen interaktiven Web-Ersatz: Ein Schaltflächen-Plugin kann eine HTML-Schaltfläche als Fallback bereitstellen, während ein Werbe-Plugin den Container bei nicht verfügbaren nativen Inhalten leer lassen kann. Die Bildübergabe ist explizit und nicht interaktiv. Die Engine leitet niemals Klicks durch ein Bild weiter und ersetzt nicht die Klick-/Impressionsbehandlung von SDKs.

Native Registrierungen können auch [aktuelle Komponentenwerte](configuration/values.md) in ihren Fallback-Host übertragen. Dies ist unabhängig von der [Darstellungsabsicht](reference/state.md): Ein ausgewählter Tab gehört zu den Komponentendaten, während `native`, `web` und `none` beschreiben, wohin er gehört. Anwendungsereignisse und die Formularintegration des Frameworks bleiben beim Komponentenadapter.

## Prüfen, ob die Grenzen zu Ihrer UI passen

Bilder frieren sowohl das Steuerelement als auch den aufgenommenen Hintergrund ein. Inhalte, die während einer Abdeckung weiter aktualisiert oder interaktiv bleiben müssen, benötigen eine andere Darstellungsstrategie. SDK-Aufnahmebeschränkungen gelten weiterhin, und manche Plattform-Compositor-Effekte, einschließlich Liquid Glass-Glanzlichtern, können von ihrem aufgenommenen Erscheinungsbild abweichen. Die Engine verspricht keine pixelidentische Aufnahme jeder nativen Ansicht.

Prüfen Sie Ihre tatsächlichen Hintergründe, Overlay-Übergänge und Wiederherstellung auf unterstützten Geräten. Entscheiden Sie vor der Integration, was der Benutzer bei nicht verfügbarer Aufnahme im Web-Fallback sehen soll. Die [Aufnahme- und Plattformreferenz](reference/projection.md) beschreibt Eignung, Zeitpunkt, Speicherung und Fehlerstrategien.

[Dokumentationsübersicht](README.md)
