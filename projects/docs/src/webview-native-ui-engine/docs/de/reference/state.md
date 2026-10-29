---
title: "Beobachtbare Darstellungsabsicht"
sourceRevision: "d47c8e0c2eb605531d72341cf829aff9f2b02390a6100655826e23108bb3e001"
---
# Projektionszustand beobachten

Der Projektionszustand beantwortet die Frage, **wo die Komponente dargestellt werden soll**. Er ist unabhängig von ihrem Wert, etwa dem Aktivierungszustand eines Schalters oder einem ausgewählten Tab. Diesen Zusammenhang beschreiben [Wertbindungen](../configuration/values.md).

Beispielsweise bleibt eine Tab-Leiste nach dem Schließen eines Modals unerwartet verborgen. Prüfen Sie dieses Attribut, um eine verbleibende `web`-Anforderung von einer `native`-Anforderung zu unterscheiden, deren Wiederherstellung noch aussteht. Es hilft, die Zuständigkeitsentscheidung zu diagnostizieren; es erlaubt nicht, die Leiste vorzeitig einzublenden oder ihr Bild zu verwerfen.

Eine selektorbasierte `NativeUIProjection`-Registrierung schreibt das schreibgeschützte Attribut `data-native-ui-destination` auf ihren aktuellen DOM-Container:

| Wert | Bedeutung |
| --- | --- |
| `native` | Native Darstellung wird angefordert. |
| `web` | Web-Darstellung wird angefordert, explizit oder weil ein registriertes Overlay den Container überdeckt. |
| `none` | Keine Darstellung wird angefordert. |

Ohne vorherige Zielbenachrichtigung leitet der Start die anfängliche Absicht aus der Sichtbarkeit der nativen Ansicht ab; eine verborgene oder fehlende Ansicht beginnt mit `none`. Anschließend wählen die Projektionsereignisse des Plugins `native`, `web` oder `none`. Overlay-Abdeckung ändert eine sonst native Anforderung in Web; sie überschreibt kein explizites `none`. Die Engine aktualisiert das Attribut beim Abgleich der Darstellung und entfernt es, wenn der Container ersetzt oder die Registrierung zerstört wird. Reservieren Sie dieses Attribut für die Engine, statt es aus Anwendungscode zu setzen.

Dies ist die **Darstellungsabsicht**, keine Bestätigung, dass ein nativer Frame oder ein Bild fertig gezeichnet wurde. Web-Darstellung kann je nach Verfügbarkeit und Integrationsstrategie ein gecachtes natives Bild oder den bestehenden interaktiven Fallback verwenden. Blenden Sie den Fallback nicht allein deshalb aus, weil dieses Attribut `native` angibt: Die Übergabe der Engine behält die vorherige Darstellung bei, bis die nächste bereitsteht.

Verwenden Sie dieses Attribut für Diagnose und Anwendungszustand, der die Sichtbarkeit nicht übernimmt. Fordern Sie Änderungen weiterhin über die dokumentierten Projektionsereignisse an. Der [Projektionsvertrag](projection.md#projection-contract) beschreibt Zuständigkeits-, Fallback- und Interaktionsregeln. Interne Snapshot-Attribute sind keine zusätzlichen öffentlichen Zustands-APIs.
