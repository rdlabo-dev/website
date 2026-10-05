---
title: "Eine Zahlung abwickeln"
code: ["collect-a-payment/collect-payment.ts.md","collect-a-payment/connection-token.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"collect-payment.ts":[1,1]}},{"id":"listener-auf-anwendungsebene-registrieren","activeLine":{"collect-payment.ts":[6,19]}},{"id":"initialisieren","activeLine":{"connection-token.ts":[0,34]}},{"id":"ein-verbindungstoken-sicher-bereitstellen","activeLine":{"connection-token.ts":[0,34]}},{"id":"einen-paymentintent-im-backend-erstellen","activeLine":{"collect-payment.ts":[34,42]}},{"id":"lesegeräte-suchen","activeLine":{"collect-payment.ts":[22,30]}},{"id":"ein-lesegerät-verbinden","activeLine":{"collect-payment.ts":[27,34]}},{"id":"eine-zahlungsmethode-erfassen","activeLine":{"collect-payment.ts":[42,44]}},{"id":"den-paymentintent-bestätigen","activeLine":{"collect-payment.ts":[43,45]}},{"id":"abbruch-und-fehler-behandeln","activeLine":{"collect-payment.ts":[14,19]}},{"id":"das-lesegerät-trennen","activeLine":{"collect-payment.ts":[44,48]}}]
sourceRevision: "36dc5901fcd3e6e542d3400bee7d9dae42b0d865603cba3fa5b2f345acec2377"
---
Wickeln Sie eine Zahlung vor Ort mit Stripe Terminal ab: Registrieren Sie die Listener frühzeitig, initialisieren Sie das Plugin, verbinden Sie ein Lesegerät und bestätigen Sie einen PaymentIntent.

## Listener auf Anwendungsebene registrieren

Registrieren Sie Terminal-Ereignislistener einmal pro Start der JavaScript-Anwendung, möglichst früh beim Bootstrap, etwa in `main.ts`, einem Anwendungsinitialisierer oder einem beim Start initialisierten Singleton-Service, und vor jeder Initialisierung oder Operation. Lassen Sie sie für die gesamte Lebensdauer ihrer zuständigen Instanz auf Anwendungsebene registriert.

!::TerminalEventsEnum::

Die typisierten Überladungen von `addListener` decken die meisten dieser Einträge ab. `DiscoveringReaders` und `CancelDiscoveredReaders` werden beim Start und Abbruch der nativen Suche ausgelöst, haben aber keine eigenen Überladungen; siehe die Seite [API](/docs/api).

## Initialisieren

Bevorzugen Sie eine authentifizierte Anfrage aus der App über `RequestedConnectionToken` und `setConnectionToken`. So kann Ihre App ihre üblichen Autorisierungsdaten mitsenden und Fehler prüfen. Registrieren Sie den Listener vor `initialize`; das Terminal SDK fordert bei Bedarf jeweils ein neues Verbindungstoken zur einmaligen Verwendung an. Setzen Sie während der Entwicklung `isTest`.

!::initialize::

### Kompatibilitätsmodus `tokenProviderEndpoint`

`tokenProviderEndpoint` steht für einfache Bereitstellungen zur Verfügung. Die nativen Clients der Version v8.3.0 senden jedoch einen einfachen HTTP-**POST**: Aufrufer können weder einen Autorisierungsheader noch einen Anfragekörper hinzufügen. Verwenden Sie ihn nur, wenn Ihr Server die Anfrage auf anderem Weg authentifizieren und absichern kann. Stellen Sie niemals einen uneingeschränkt öffentlichen Endpunkt zur Tokenerstellung bereit.

Ist `tokenProviderEndpoint` gesetzt, sendet das Plugin einen HTTP-**POST** mit leerem Anfragekörper. Die Antwort **muss** JSON mit einer Zeichenfolge `secret` sein:

```json
{ "secret": "pst_..." }
```

Dieser Wert ist ein Stripe-Terminal-[Verbindungstoken](https://docs.stripe.com/terminal/fleet/connect-reader?terminal-sdk-platform=js#connection-token). Erstellen Sie es auf dem Server mit Ihrem **geheimen** API-Schlüssel (`stripe.terminal.connectionTokens.create()`). Hinterlegen Sie den geheimen Schlüssel, eingeschränkte Schlüssel mit Berechtigung zur Tokenerstellung oder unverarbeitete Verbindungstoken niemals im App-Binary, in Protokollen oder in einer öffentlichen Clientkonfiguration.

Die offizielle Demo stellt `POST /connection/token` bereit und gibt `{ secret }` zurück; passen Sie deren Authentifizierung und Autorisierung an Ihre Anwendung an.

:::message
In v8.3.0 protokolliert Android das über `tokenProviderEndpoint` zurückgegebene `secret`; im Web werden die an `setConnectionToken` übergebenen Optionen protokolliert. Vermeiden Sie den Endpunktmodus unter Android, bis diese Protokollierung im Ursprungsprojekt entfernt wurde, vermeiden Sie die Speicherung von Web-Konsolenprotokollen in der Produktion und aktualisieren Sie auf eine korrigierte Plugin-Version, sobald sie verfügbar ist.
:::


Im Web erfordert `initialize` eine neue Plugin-Instanz: Ein erneuter Aufruf nach erfolgreicher Initialisierung löst `Stripe Terminal has already been initialized` aus.

## Ein Verbindungstoken sicher bereitstellen

Lassen Sie `tokenProviderEndpoint` weg und registrieren Sie `RequestedConnectionToken` **vor** `initialize`. Benötigt das SDK ein Token, löst das Plugin dieses Ereignis aus und wartet auf `setConnectionToken({ token })`.

Rufen Sie das Token mit Ihrem üblichen Autorisierungsmechanismus ab, verlangen Sie eine erfolgreiche Antwort, prüfen Sie `secret` und übergeben Sie es als `token`. Rufen Sie `setConnectionToken` nur auf, während ein Tokenabruf aussteht; Android und iOS weisen zusätzliche Aufrufe mit `Stripe Terminal do not pending fetchConnectionToken` zurück. Protokollieren Sie niemals die Antwort oder das Token.

!::setConnectionToken::

## Einen PaymentIntent im Backend erstellen

Erstellen Sie den PaymentIntent auf Ihrem Server. Die offizielle Demo verwendet `POST /connection/intent` und gibt `{ paymentIntent }` als **Client-Secret** zurück.

Voraussetzungen passend zum Plugin und zur Demo:

- `payment_method_types` muss `card_present` enthalten
- Bewahren Sie den geheimen Stripe-Schlüssel auf dem Server auf
- Übergeben Sie nur das Client-Secret an `collectPaymentMethod({ paymentIntent })`
- Erstellen oder bestätigen Sie keine PaymentIntents für Zahlungen mit physisch vorliegender Karte mit einem veröffentlichbaren Schlüssel in der App

Serverbeispiel aus der Demo:

```ts
await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card_present'],
  capture_method: 'automatic',
});
```

## Lesegeräte suchen

Suchen Sie nach Lesegeräten in der Nähe oder nach simulierten Lesegeräten. Geben Sie einen Wert aus `TerminalConnectTypes` und eine Stripe-Terminal-`locationId` an, sofern der Verbindungstyp sie benötigt.

`locationId` wird bei der Internetsuche verwendet und ist beim Verbinden von Lesegeräten für Tap to Pay, Bluetooth und Android USB erforderlich. Die Internetsuche kann nach Standort filtern; Tap to Pay und Bluetooth übernehmen den Standort in die Verbindungskonfiguration.

Besonderheiten:

- **Web** unterstützt nur `Internet`. Alle anderen Werte für `type` sind nicht verfügbar.
- **iOS Bluetooth** meldet Lesegeräte **mehrfach** über `DiscoveredReaders`, während sich die Suche aktualisiert. Siehe [Stripe: Ein Bluetooth-Lesegerät verbinden (iOS)](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth). Setzen Sie `bluetoothScanWaitTime` (in Millisekunden), damit `discoverReaders` vor der Auflösung mit der aktuellen Liste wartet. Bei `0` oder ohne Angabe wird das erste Suchergebnis zurückgegeben.
- **iOS** löst beim Suchstart außerdem `DiscoveringReaders` aus. USB, HandOff und `Simulated` als `type` sind nicht implementiert.
- **Android** benötigt `ACCESS_FINE_LOCATION` zur Laufzeit; andernfalls wird `discoverReaders` abgewiesen. `Simulated` wird als Bluetooth-Suche behandelt. `HandOff` entspricht Apps on Devices.
- Rufen Sie `cancelDiscoverReaders` auf, wenn der Nutzer die Suchoberfläche verlässt. Im Web hat der Abbruch keine Wirkung. Geben Sie dem Nutzer immer eine Möglichkeit, eine lange Bluetooth-Suche zu beenden.

Hören Sie zusätzlich zum Warten auf das Promise auf `DiscoveredReaders`. Unter iOS mit Bluetooth liefert der Listener die laufend aktualisierte Liste; das Promise kann bereits vor dem letzten Ereignis aufgelöst werden.

!::discoverReaders::

!::DiscoverReadersOptions::

!::TerminalConnectTypes::

## Ein Lesegerät verbinden

Verbinden Sie eines der gefundenen Lesegeräte, bevor Sie Zahlungsdaten erfassen. Das Objekt `reader` muss aus dem aktuellen Suchergebnis stammen (`serialNumber` ist die primäre Kennung des Plugins).

`autoReconnectOnUnexpectedDisconnect` ist standardmäßig `false` und wird für Tap to Pay und Bluetooth angewendet. Android USB aktiviert derzeit die automatische Wiederverbindung in der nativen Verbindungskonfiguration. Internetverbindungen verwenden dieses Flag nicht.

`merchantDisplayName` und `onBehalfOf` gelten für iOS Tap to Pay (`LocalMobileReader`). Unter Android setzen Sie die Angaben zum verbundenen Konto und zur Anzeige stattdessen am PaymentIntent.

!::connectReader::

## Eine Zahlungsmethode erfassen

Übergeben Sie das **Client-Secret** des PaymentIntent aus Ihrem Backend an `collectPaymentMethod`. Das Plugin ruft diesen PaymentIntent ab und erfasst anschließend die Zahlungsmethode am verbundenen Lesegerät.

!::collectPaymentMethod::

## Den PaymentIntent bestätigen

Verarbeiten und bestätigen Sie den PaymentIntent, dessen Zahlungsmethode erfasst wurde. `confirmPaymentIntent` wird abgewiesen, wenn die Erfassung zuvor nicht erfolgreich war (`PaymentIntent not found for confirmPaymentIntent`).

!::confirmPaymentIntent::

`ConfirmedPaymentIntent` ist ein Signal für die Clientoberfläche und keine Freigabe zur Auftragsabwicklung. Wickeln Sie den Auftrag erst ab, nachdem Ihr Backend einen Stripe-Webhook wie `payment_intent.succeeded` geprüft hat.

## Abbruch und Fehler behandeln

- `cancelCollectPaymentMethod` bricht eine laufende Erfassung ab. Bei Erfolg wird das Promise aufgelöst und `Canceled` ausgelöst.
- `Failed` wird ausgelöst, wenn `collectPaymentMethod` oder `confirmPaymentIntent` fehlschlägt. Das Promise desselben Aufrufs wird ebenfalls abgewiesen. Die Nutzdaten können `message`, `code` und `declineCode` enthalten.
- Verwenden Sie `ConnectionStatusChange` nicht zur Erkennung unerwarteter Verbindungsabbrüche. Nutzen Sie `UnexpectedReaderDisconnect` und bei Bluetooth/USB zusätzlich `DisconnectedReader`. Siehe [Lebenszyklus des Lesegeräts](/docs/reader-lifecycle).

!::cancelCollectPaymentMethod::

## Das Lesegerät trennen

Trennen Sie das Lesegerät, wenn der Zahlungsablauf abgeschlossen ist oder das Lesegerät nicht mehr benötigt wird.

!::disconnectReader::
