---
title: "Wertbindungen"
sourceRevision: "42394149a5a0bdbcca6d15e7c39ec5074d71356039852e4e3a0f232c58570df9"
---
# Komponentenwerte ins DOM übertragen

Ein nativer Schalter, eine Tab-Auswahl oder ein Textsteuerelement kann sich ändern, während sein Web-Fallback verborgen ist. Übertragen Sie seine aktuellen Werte, damit Fallback und Anwendung dieselbe Auswahl beobachten können, wenn sie sichtbar werden. Dies ist vom [Projektionszustand](../reference/state.md) getrennt: Ein ausgewählter Tab gehört zu den Komponentendaten und ist keine Anforderung, seine Darstellung zwischen Native und Web zu verschieben.

Beispielsweise schaltet ein Benutzer einen nativen Schalter ein, während dessen Web-Fallback verborgen ist. Ist eine spätere Aufnahme nicht möglich, würde ein unveränderter Fallback ihn ausgeschaltet anzeigen. Geben Sie den aktuellen booleschen Wert über `readValues` zurück und ordnen Sie ihn der Eigenschaft `checked` des unterstützten Hosts zu. Benachrichtigungen an Anwendungsformulare verwenden weiterhin den bestehenden Adapter der Komponente; die Engine gleicht lediglich die dargestellten Daten ab.

Konfigurieren Sie diese Verbindung in der bestehenden `NativeUIProjection`-Initialisierung des Plugins. Ein anwendungsseitiger Wrapper ist nicht erforderlich. Diese Optionen funktionieren mit Capacitor- und Cordova-Registrierungen. Werte werden auf dasselbe von `projectionSelector` gefundene Element angewendet, nicht auf ein untergeordnetes Steuerelement oder ein separates Bindungsziel. Wählen Sie einen [unterstützten Projektionscontainer](../reference/containers.md): etwa ein `ion-toggle` oder ein benutzerdefiniertes Anwendungselement mit `checked` oder `value`. HTML-Elemente `input`, `select` und `textarea` sind keine direkten Projektionscontainer. Wenn Sie eines davon umhüllen, muss der eigene Attributbeobachter oder Eigenschaftssetter des Wrappers den Wert an das innere Steuerelement weiterleiten. Die Engine sucht dieses Steuerelement nicht. Diese Bindungen gehören zu nativen Registrierungen; die tieferen Renderer-APIs behalten die bestehende Wertsynchronisierung des Renderers bei.

## Mit Datenattributen beginnen

Geben Sie `readValues` an, um die Übertragung zu aktivieren. Es liest die **aktuellen** Werte des Plugins einschließlich programmatischer Änderungen; Ereignis-Payloads dienen nicht als Wertespeicher. Jeder zurückgegebene Schlüssel wird standardmäßig zu `data-native-ui-value-<key>`. Lassen Sie `readValues` weg, um das bisherige Verhalten ohne Werteabfragen beizubehalten.

Beispielsweise stellen diese Argumente einer Swift-Registrierung den ausgewählten Tab als `data-native-ui-value-selected` bereit:

```swift
receiveListeners: .init(update: ["updated", "tabSelected"]),
readValues: { [weak self] in
    ["selected": self?.selectedTabID ?? ""]
},
```

Verwenden Sie kleingeschriebene Schlüssel, die mit einem Buchstaben beginnen und danach Buchstaben, Ziffern oder Bindestriche enthalten. Geben Sie JSON-kompatible Werte zurück. Zeichenfolgen werden wörtlich geschrieben; Zahlen, boolesche Werte, Arrays, Objekte und null verwenden JSON-Text. Null wird zum Attributtext `null`; eine leere Zeichenfolge erzeugt ein leeres Attribut. Beides entfernt das Attribut nicht, und ein ausgelassener Schlüssel lässt den vorherigen Wert unverändert. Verwenden Sie in Swift `NSNull()` oder in Kotlin `JSONObject.NULL`, um JSON-null zurückzugeben (`JSONObject.put(key, null)` entfernt stattdessen den Schlüssel).

Die Engine liest Werte, wenn das passende DOM erscheint, nach einer erneuten Seitenverbindung und bei konfigurierten `update`-Ereignissen. Antworten für ein entferntes DOM oder eine überholte Anfrage werden ignoriert. Der Callback läuft im nativen UI-Thread: Lesen Sie gespeicherten Zustand, statt blockierende Arbeit auszuführen.

## Eine DOM-Eigenschaft wählen, wenn die Komponente sie benötigt

Ein unterstützter Web-Component-Host kann `value`, `checked` oder eine andere Dateneigenschaft bereitstellen, statt Attribute zu lesen. Überschreiben Sie nur diese Schlüssel mit `values`:

```swift
receiveListeners: .init(update: ["updated", "selectionChanged"]),
values: ["selected": .init(property: "value")],
readValues: { [weak self] in
    ["selected": self?.selectedTabID ?? ""]
},
```

Die entsprechenden Kotlin-Registrierungsargumente sind:

```kotlin
receiveListeners = NativeUIProjection.ReceiveListeners(
    update = listOf("updated", "selectionChanged")
),
values = mapOf(
    "selected" to NativeUIProjection.ValueBinding(property = "value")
),
readValues = { JSONObject().put("selected", selectedTabID) },
```

Die Eigenschaftszuweisung bewahrt JSON-Typen: Ein boolescher Wert bleibt boolesch, statt zu einer Attributzeichenfolge zu werden. Wählen Sie eine beschreibbare Dateneigenschaft, die die Komponente unterstützt. HTML-, Stil- und Ereignisbehandlungseigenschaften sind keine Bindungsziele. Eine Eigenschaftszuordnung ersetzt für diesen Schlüssel die Attributübertragung. Andere zurückgegebene Schlüssel verwenden weiterhin die standardmäßigen Datenattribute.

Wenn Eigenschaftsbindungen auf ein noch nicht definiertes autonomes benutzerdefiniertes Element (etwa `<my-toggle>`) zielen, wartet die Engine vor dem Lesen und Zuweisen von Werten auf dessen Definition. Dadurch verdeckt eine frühe Zuweisung nicht den späteren Setter der Komponente. Nach dem Warten prüft sie DOM-Zuständigkeit und ausstehende Aktualisierungen erneut. Reine Attributbindungen können Werte bereits vor der Definition des benutzerdefinierten Elements übertragen. Definieren Sie angepasste integrierte Elemente (etwa `<input is="my-input">`) vor dem Aktivieren von Eigenschaftsbindungen; ihr benutzerdefinierter Definitionsname lässt sich nicht zuverlässig aus dem DOM ermitteln.

## Anwendungsereignisse im Komponentenadapter belassen

Die Engine verbindet nativen Zustand mit dem DOM. Sie implementiert keine bidirektionale Framework-Bindung und löst weder `input`, `change`, `ionChange` noch andere Komponentenereignisse aus. Erstmaliges Lesen, Benutzerauswahl und programmatische Aktualisierungen folgen demselben Übertragungsweg. Bei gleichzeitigen Lesevorgängen wird die neueste Antwort verwendet; Antworten für einen entfernten Container werden ignoriert.

Belassen Sie Anwendungsbenachrichtigungen auf der bestehenden Ereignis-API des Plugins. Der Adapter für Formularsteuerelement, benutzerdefiniertes Element oder Framework entscheidet, wie das native Ereignis das Anwendungsmodell aktualisiert. Beispielsweise kann das Ereignis `tabSelected` eines Tab-Plugins den Zustand des ausgewählten Tabs in der Anwendung aktualisieren, während die Engine unabhängig davon die aktuelle Auswahl in die Eigenschaft `value` des Fallbacks überträgt. Lesen Sie in diesem Ereignishandler nicht das DOM in der Erwartung, dass die asynchrone Engine-Aktualisierung bereits abgeschlossen ist; verwenden Sie stattdessen die dokumentierte Payload des Plugin-Ereignisses.

Ein benutzerdefiniertes Element kann über seinen `attributeChangedCallback` auf ein übertragenes Attribut reagieren oder eine Eigenschaft über seinen Setter entgegennehmen. Verwenden Sie diesen Hook, um den aktuellen Wert darzustellen. Setter, die Anwendungsereignisse auslösen, behalten ihr eigenes Verhalten; die Engine unterdrückt diese Ereignisse nicht und erfindet kein universelles Ereignisformat. Die Übertragung einer Eigenschaft verbindet für sich allein kein Framework-Formular.

Die Engine ruft keine nativen Setter auf, beobachtet keine DOM-Eigenschaften zur Rückübertragung nach Native und spielt keine Aktionen erneut ab. Behalten Sie den bestehenden Web-zu-Native-Handler der Komponente bei und vermeiden Sie bedingungslose Setter-/Ereignisschleifen.

Beim Abbau bleiben übertragene Werte für den Web-Fallback verfügbar. Die Engine entfernt ihre Projektionszustandsmarkierung, setzt aber Komponentendaten nicht zurück.
