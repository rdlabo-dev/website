---
title: "Konzepte und Grenzen"
sourceRevision: "d9212c9dd7d554bf845bbec3b2217bd32eb6850359e071c8051d35f39f3ef594"
---
# Native UI in Web-gesteuerten Ansichten

Ziel ist es, die Flexibilität von Web-Layouts und Navigation mit nativen Steuerelementen und Funktionen in einer Ansicht zu verbinden. Anwendungen behalten ihre Web-gesteuerte UI; Plugins liefern native Komponenten. Die Engine koordiniert die Darstellung zwischen ihnen, damit jede Komponente bei Layoutänderungen, Interaktionen und Navigation mit der umgebenden Ansicht koexistieren kann.

## Warum ein Bridge-Aufruf nicht genügt

Das Erstellen einer nativen Ansicht gibt ihr noch keinen Platz im DOM. Eine Ansicht über der WebView folgt nicht automatisch einem scrollenden Container und nimmt nicht an dessen Beschneidung oder Stapelreihenfolge teil. Ein höherer Web-`z-index` kann sie nicht überdecken. Einfaches Aus- und Einblenden kann ein anderes Erscheinungsbild sichtbar machen oder die Ansicht an einer veralteten Position wiederherstellen.

Das gemeinsame Integrationsmodell verbindet eine native Ansicht mit einem DOM-Container. Der Container bestimmt, wohin die Komponente in der Web-Ansicht gehört. Das Plugin liefert native Inhalte und meldet Änderungen; die Engine koordiniert Messung, vorbereitetes Erscheinungsbild und Übergabe zwischen Darstellungsebenen.

## Beispiele für das Zusammenspiel

Diese Situationen nutzen dasselbe Darstellungsmodell. Jede Integration verbindet die benötigten Lebenszyklus- und Wertbenachrichtigungen:

| Situation | Gewünschtes Erlebnis | Beitrag des gemeinsamen Modells |
| --- | --- | --- |
| Eine geeignete native Anzeige befindet sich in einem Web-Feed | Sie bleibt beim Scrollen am Inhalt ausgerichtet. | Der DOM-Container liefert die Geometrie; unterstützte native Verfolgung oder vorübergehende Web-Projektion folgt der Bewegung. |
| Ein Web-Alert öffnet sich über nativen Navigationselementen | Der Alert überdeckt ihr Erscheinungsbild; nach dem Schließen kehrt die native Interaktion zurück. | Lebenszyklusbenachrichtigungen oder der Ionic-Adapter fordern Abdeckung an; die Engine koordiniert Bildübergabe und Wiederherstellung. |
| Eine Seite oder ein Modal ändert das Layout | Die nativen Steuerelemente kehren an die aktuelle Position statt in ein altes Rechteck zurück. | Geometrie und Wiederherstellung werden mit der Lebensdauer des zugehörigen Containers abgestimmt. |
| Ein nativer Schalter ändert sich, während sein Web-Fallback ausgeblendet ist | Die Rückkehr zu HTML zeigt nicht den alten Wert. | Optionale Wertbindungen spiegeln Komponentendaten unabhängig von der Darstellung wider. |

Scrollen bedeutet nicht immer, eine aktive native Ansicht zu bewegen. Unterstützte iOS-Overflow-Layouts können native Scroll-Bindungen nutzen; Android verwendet eine vorübergehende Bilddarstellung, und nicht unterstützte Layouts folgen der konfigurierten Fallback-Strategie. Bilder bieten keine aktive SDK-Interaktion. Siehe [Plattformgrenzen](reference/platforms.md) und [Einschränkungen der Scroll-Bindung](advanced/native-handoff.md#native-scroll-tracking).

Die Engine bereitet Bilder vor, während native Inhalte verfügbar sind, und behält sie während der Übergabe bis zur Bestätigung der nativen Wiederherstellung bei. Vorbereitung und Darstellung sind getrennt, damit das Öffnen eines Overlays nicht auf die Aufnahme wartet. Anwendungsspezifische Lebenszyklusentscheidungen benötigen weiterhin Benachrichtigungen; die Registrierung einer Ansicht erkennt nicht automatisch die Overlays jedes Frameworks.

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

Prüfen Sie Ihre tatsächlichen Hintergründe, Overlay-Übergänge und Wiederherstellung auf unterstützten Geräten. Entscheiden Sie vor der Integration, was der Benutzer bei nicht verfügbarer Aufnahme im Web-Fallback sehen soll. Die [Aufnahme- und Plattformreferenz](reference/platforms.md) und der [Projektionsvertrag](reference/projection.md) beschreiben Eignung und Fehlerstrategien.

[Dokumentationsübersicht](README.md)
