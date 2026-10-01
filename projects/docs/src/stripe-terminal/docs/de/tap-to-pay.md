---
title: "Tap to Pay"
code: ["tap-to-pay/tap-to-pay.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"tap-to-pay.ts":[1,1]}},{"id":"plattformvoraussetzungen","activeLine":{"tap-to-pay.ts":[1,1]}},{"id":"einrichtungsreihenfolge","activeLine":{"tap-to-pay.ts":[8,11]}},{"id":"die-kontoverknüpfung-prüfen","activeLine":{"tap-to-pay.ts":[11,16]}},{"id":"oberflächenkonfiguration","activeLine":{"tap-to-pay.ts":[16,23]}},{"id":"suchen-und-verbinden","activeLine":{"tap-to-pay.ts":[23,36]}},{"id":"einschränkungen","activeLine":{"tap-to-pay.ts":[1,1]}}]
sourceRevision: "ea74022b5448a326cc27d3b8799c29dd9f05e1309b01515a4a1d26f9af088da9"
---
Tap to Pay erfasst kontaktlose Zahlungen auf einem kompatiblen Telefon oder Tablet ohne separates Kartenlesegerät. Verwenden Sie `TerminalConnectTypes.TapToPay` nach der [Konfiguration](/docs/configuration) und der Einrichtung eines funktionierenden [Verbindungstokens](/docs/collect-a-payment).

Die offizielle Demo zeigt Tap to Pay, Internet und Bluetooth in [demo/angular](https://github.com/capacitor-community/stripe/tree/main/demo/angular).

## Plattformvoraussetzungen

| Plattform | Unterstützt | Hinweise                                                                                                      |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| Android  | Ja       | NFC-fähiges Gerät, Standortberechtigung und Erfüllung der Voraussetzungen für Stripe Tap to Pay auf Android. `minSdkVersion` 26.     |
| iOS      | Ja       | Tap to Pay auf dem iPhone; iOS 16.4+ für die Prüfung der Kontoverknüpfung. `setTapToPayUxConfiguration` ist nicht implementiert. |
| Web      | Nein        | `discoverReaders({ type: TapToPay })` ist nicht verfügbar.                                                      |

Schließen Sie die Terminal-Einrichtung im Stripe-Dashboard ab und erstellen Sie einen [Standort](https://docs.stripe.com/terminal/fleet/locations). Übergeben Sie dessen `locationId` an `discoverReaders`; das Plugin verwendet sie beim Verbinden des Tap-to-Pay-Lesegeräts.

Unter Android fordert `initialize` die unter [Konfiguration](/docs/configuration) angegebene Standortberechtigung an. Bluetooth-Berechtigungen werden nur bei der Suche nach `Bluetooth`- oder `Simulated`-Lesegeräten angefordert; die Tap-to-Pay-Suche selbst fordert sie nicht an.

## Einrichtungsreihenfolge

1. Registrieren Sie Listener auf Anwendungsebene.
2. Registrieren Sie einen authentifizierten Verbindungstoken-Anbieter mit `RequestedConnectionToken` + `setConnectionToken` und rufen Sie anschließend `initialize` auf.
3. Rufen Sie unter iOS `isTapToPayAccountLinked` auf und speichern Sie das Ergebnis nicht zwischen.
4. Rufen Sie unter Android bei Bedarf `setTapToPayUxConfiguration` auf.
5. Rufen Sie `discoverReaders` mit `type: TerminalConnectTypes.TapToPay` und `locationId` auf.
6. Rufen Sie `connectReader` mit dem gefundenen Lesegerät auf.
7. Erfassen Sie die Zahlungsmethode und bestätigen Sie einen `card_present`-PaymentIntent wie unter [Eine Zahlung abwickeln](/docs/collect-a-payment) beschrieben.

!::initialize::

## Die Kontoverknüpfung prüfen

`isTapToPayAccountLinked` ist **nur unter iOS** verfügbar und erfordert iOS 16.4 oder neuer. `initialize()` muss ausgeführt worden sein, damit dem SDK ein Verbindungstoken-Anbieter zur Verfügung steht. Eine Verbindung zu einem Lesegerät ist nicht erforderlich, und der Aufruf aktiviert NFC nicht.

Die Antwort wird bei jedem Aufruf von Apple abgerufen. Speichern Sie `isLinked` nicht zwischen. Übergeben Sie bei Stripe Connect die ID des verbundenen Kontos als `onBehalfOf`; lassen Sie den Wert weg, um das Konto zu prüfen, dem der API-Schlüssel gehört.

Android und Web weisen den Aufruf ab (`unimplemented` / `unavailable`). Sichern Sie ihn durch eine Plattformprüfung oder `.catch()` ab, wie die offizielle Demo es für die Android-spezifische Oberflächenkonfiguration tut.

!::isTapToPayAccountLinked::

!::IsTapToPayAccountLinkedOptions::

## Oberflächenkonfiguration

`setTapToPayUxConfiguration` ist **nur unter Android** verfügbar. Rufen Sie es nach `initialize()` und vor `connectReader()` auf. iOS meldet, dass die Methode nicht implementiert ist; im Web wird der Aufruf protokolliert und beendet.

Die installierte Android-Implementierung wendet `colors` (`primary`, `success`, `error` jeweils als `'default'` oder Hex-Zeichenfolge wie `'#FF5733'`) und `darkMode` (`SYSTEM`, `DARK`, `LIGHT`) an. Das TypeScript-Feld `tapZone` ist deklariert, wird aber im aktuellen Android Terminal SDK von v8.2.1 nicht angewendet.

!::setTapToPayUxConfiguration::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::TapToPayColor::

!::TapToPayTapZone::

!::TapToPayDarkMode::

## Suchen und verbinden

Suchen Sie mit `TerminalConnectTypes.TapToPay` und einer `locationId`. Simuliertes Tap to Pay verwendet `isTest: true` in `initialize`, nicht `TerminalConnectTypes.Simulated`.

Verbinden Sie das Lesegerät aus dem Suchergebnis. `autoReconnectOnUnexpectedDisconnect` ist standardmäßig `false` und wird für Tap to Pay unterstützt. Unter iOS werden `merchantDisplayName` und `onBehalfOf` an die Tap-to-Pay-Verbindungskonfiguration übergeben. Unter Android setzen Sie diese Werte stattdessen am PaymentIntent.

!::discoverReaders::

!::connectReader::

Verwenden Sie nach dem Verbinden `collectPaymentMethod` und `confirmPaymentIntent` mit einem auf dem Server erstellten `card_present`-PaymentIntent.

## Einschränkungen

- Im Web können Tap-to-Pay-Lesegeräte weder gesucht noch verbunden werden.
- Oberflächenfarben und Dunkelmodus sind nur unter Android verfügbar; iOS verwendet die Systemoberfläche für Tap to Pay auf dem iPhone.
- Der Status der Kontoverknüpfung ist nur unter iOS verfügbar und muss jedes Mal erneut von Apple abgerufen werden.
- `tapZone` gehört zur TypeScript-API, ist aber nicht an das installierte Android SDK angebunden.
- Optionale Softwareupdates für Lesegeräte folgen weiterhin den Regeln unter [Lebenszyklus des Lesegeräts](/docs/reader-lifecycle): Installieren Sie sie nicht während des Bezahlvorgangs.
- Belassen Sie geheime Stripe-Schlüssel und die Erstellung von Verbindungstoken im Backend.
