---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "fafce7f4b49acd51ca860d7030347e6d2f84a74204462a46df27e73f2f92457d"
---
Referenz für `@capacitor-community/stripe-terminal` v8.2.1. Die Plattformunterstützung für Verbindungstypen und Tap-to-Pay-APIs wird unter [Konfiguration](/docs/configuration) beschrieben.

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

!::DiscoverReadersOptions::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::IsTapToPayAccountLinkedOptions::

!::PluginListenerHandle::

## Typaliase

!::ReaderInterface::

!::ReaderSoftwareUpdateInterface::

!::LocationInterface::

!::Cart::

!::CartLineItem::

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
