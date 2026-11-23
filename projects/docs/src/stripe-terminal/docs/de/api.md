---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "22bc9f975e3af0fb66880b451030f8ae7a781f2f8c024ba2b0e9d0657dd91115"
---
Referenz für `@capacitor-community/stripe-terminal` v8.4.0. Die Plattformunterstützung für Verbindungstypen und APIs für Tap to Pay wird unter [Konfiguration](/docs/configuration) beschrieben.

## Methoden

!::initialize::

!::discoverReaders::

!::setConnectionToken::

!::setSimulatorConfiguration::

!::connectReader::

!::getConnectedReader::

!::disconnectReader::

!::cancelDiscoverReaders::

!::collectPaymentMethod::

!::cancelCollectPaymentMethod::

!::confirmPaymentIntent::

!::installAvailableUpdate::

!::cancelInstallUpdate::

!::setReaderDisplay::

!::clearReaderDisplay::

!::rebootReader::

!::cancelReaderReconnection::

!::setTapToPayUxConfiguration::

!::isTapToPayAccountLinked::

!::addListener::

Jede Überladung von `addListener` hat eine eigene Methodensignatur. Die Tabelle `TerminalEventsEnum` unten enthält nur die Namen der Einträge und ihre Zeichenfolgenwerte; die Überladungen werden dort nicht wiederholt.

`DiscoveringReaders` und `CancelDiscoveredReaders` sind in der Enumeration enthalten und werden von der nativen Suche ausgelöst. In dieser Liste haben sie jedoch keine typisierte Überladung.

## Interfaces

!::StripeTerminalInitializationOptions::

!::DiscoverReadersOptions::

!::SetConnectionTokenOptions::

!::SimulatorConfigurationOptions::

!::ConnectReaderOptions::

!::CollectPaymentMethodOptions::

!::ReaderInterface::

!::ReaderSoftwareUpdateInterface::

!::LocationInterface::

!::LocationAddress::

!::Cart::

!::CartLineItem::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::IsTapToPayAccountLinkedOptions::

!::PluginListenerHandle::

## Typaliase

!::TapToPayColor::

!::TapToPayTapZone::

`TerminalResultInterface` ist eine Union aus Ereignisnamen für Zahlungsergebnisse: `TerminalEventsEnum.ConfirmedPaymentIntent`, `CollectedPaymentIntent`, `Canceled` und `Failed`. Der Alias dient der Vereinfachung und ist kein Rückgabetyp von `confirmPaymentIntent()`.

## Enumerationen

!::TerminalConnectTypes::

!::TerminalEventsEnum::

!::SimulateReaderUpdate::

!::SimulatedCardType::

!::BatteryStatus::

!::UpdateTimeEstimate::

!::NetworkStatus::

!::LocationStatus::

!::DeviceType::

!::DisconnectReason::

!::ConnectionStatus::

!::ReaderEvent::

!::ReaderDisplayMessage::

!::ReaderInputOption::

!::PaymentStatus::

!::TapToPayDarkMode::

`DeviceGroup` ordnet einem `DeviceType` eine Gruppe von Lesegerätebildern zu (`stripe_m2`, `chipper`, `wisepad`, `wisepose`, `s700`, `apple`, `tapToPayDevice`, `unknown`). Die Enumeration dient nur als Referenz zur Bildauswahl; sie wird nicht an `discoverReaders` oder `connectReader` übergeben.
