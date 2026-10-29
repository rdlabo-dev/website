---
title: "Registrierungseinstellungen"
sourceRevision: "306aef1f74b9dd314d2883b647c9e28e4cd936a2c7290d9183eb97d8d1dcab21"
---
# Eine native Registrierung konfigurieren

Beginnen Sie mit der [grundlegenden Initialisierung](../getting-started/initialization.md). Die folgenden Einstellungen gehören zu derselben Registrierung; ergänzen Sie nur, was Ihre Komponente benötigt.

## Optionales Verhalten

Optional bedeutet, dass ein Standardwert vorhanden ist, nicht dass eine veränderliche Oberfläche auf Benachrichtigungen verzichten kann. Beispielsweise verändert eine Tab-Auswahl das Erscheinungsbild, auch wenn die Tab-Leiste an derselben Position bleibt: Nehmen Sie die Benachrichtigung über die erfolgreiche Auswahl in `receiveListeners.update` auf.

| Eingabe | Verhalten ohne Angabe | Anwendungsfall und Grund für die Konfiguration |
| --- | --- | --- |
| `receiveListeners` | Keine Plugin-Ereignisse werden abonniert. Die anfängliche Darstellungsabsicht ergibt sich aus der Sichtbarkeit der nativen Ansicht; die interne DOM- und Scroll-Verarbeitung läuft weiterhin. | Eine Tab-Auswahl verändert das hervorgehobene Element: Verbinden Sie `update`, um Bildpunkte und gebundene Werte zu aktualisieren, `projection` für Darstellungswechsel und `match` für die Zuordnung zu einzelnen Oberflächen. Siehe [Ereignisverknüpfung](events.md#choose-successful-update-and-presentation-events) und die `receive`-Weiterleitung im Cordova-Leitfaden. |
| `readValues` | Keine Werte werden von Native ins DOM gelesen. | Ein nativer Schalter verändert sich, während sein Fallback verborgen ist: Lesen Sie seinen aktuellen Zustand, damit der Fallback nicht mit dem alten Wert zurückkehrt. Siehe [Wertbindungen](values.md). |
| `values` | Mit `readValues` werden alle zurückgegebenen Schlüssel zu `data-native-ui-value-*`-Attributen. Ohne `readValues` erfolgt keine Übertragung. | Ein benutzerdefiniertes Element rendert anhand von `checked` statt anhand von Attributen: Ordnen Sie diesen Schlüssel seiner Host-Eigenschaft zu. Dadurch werden keine Anwendungsereignisse erzeugt. |
| `captureDelayMs` | Bilder werden nach einem Debounce von 50 ms vorbereitet. | Eine Tab-Hervorhebung wird beim Eintreffen des Auswahlereignisses noch animiert: Warten Sie auf das abgeschlossene Erscheinungsbild. Siehe [Aufnahmezeitpunkt](capture.md); dies verzögert nicht das Öffnen des Overlays. |
| `canCapture` | Gibt true zurück; Geometrie- und Plattformprüfungen der Engine gelten weiterhin. | Ein SDK wechselt von aufnehmbaren statischen Inhalten zu eingeschränktem Video: Verhindern Sie eine unzulässige Aufnahme. Geben Sie die Aufnahmefähigkeit des aktuellen Inhalts zurück. |
| `failedFallback` | Der gewöhnliche Web-Fallback wird verwendet, wenn kein geeignetes Bild verfügbar ist. | Eine SDK-Ansicht hat keinen brauchbaren Web-Ersatz: Belassen Sie sie während automatischer Bewegung nur dann nativ, wenn der Renderer ihre Positionierung weiterführt. Explizite Web-Abdeckung und `none` haben weiterhin Vorrang. Siehe [Fehlerstrategie](../reference/projection.md#native-surface-requirements). |
| `allowedOrigins` | iOS: `capacitor://localhost`, `app://localhost`, `https://localhost`, `http://localhost`. Android: `https://localhost`, `http://localhost`. | Eine App verändert ihren lokalen Hostnamen: Geben Sie genau diesen vertrauenswürdigen Origin an, damit sich der Kanal verbinden kann. Verwenden Sie unter Android dieselben Origins für `install` und jede Registrierung. |
| `runtime` | Capacitor. | **Für Cordova-Integrationen erforderlich**: Wählen Sie Cordova, damit Benachrichtigungen und Ressourcen-URLs dessen Transport verwenden. |
| `captureMode` (Android) | `COMPOSITED`, einschließlich des sichtbaren Hintergrunds. | Eine undurchsichtige Karte scrollt an benachbarten Inhalten vorbei: `VIEW` nimmt nur die Karte statt der umgebenden Fensterpixel auf. Verwenden Sie es nicht für durchscheinende Inhalte, Video oder SurfaceView. Siehe [Aufnahmefähigkeit](../reference/platforms.md#android-capture-modes). |

Die Engine stellt die [Darstellungsabsicht](../reference/state.md) getrennt von Komponentenwerten bereit. Für beides ist kein anwendungsseitiger Engine-Wrapper erforderlich. Die Erkennung von Ionic-Overlays ist ein separater, optionaler [gemeinsamer Initialisierer](ionic-overlays.md), kein Registrierungsargument; andere Frameworks melden ihren Lebenszyklus explizit.

[Dokumentationsübersicht](../README.md)
