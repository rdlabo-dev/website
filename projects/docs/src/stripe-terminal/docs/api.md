---
title: 'API'
code: []
scrollActiveLine: []
---

Reference for `@capacitor-community/stripe-terminal` v8.3.0. Platform support for connection types and Tap to Pay APIs is documented in [Configuration](/docs/configuration).

## Methods

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

Each `addListener` overload is a distinct method signature. The `TerminalEventsEnum` table below lists member names and string values only; it does not repeat those overloads.

`DiscoveringReaders` and `CancelDiscoveredReaders` appear on the enum and are emitted by native discovery, but they have no typed overload in this list.

## Interfaces

!::DiscoverReadersOptions::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::IsTapToPayAccountLinkedOptions::

!::PluginListenerHandle::

## Type aliases

!::ReaderInterface::

!::ReaderSoftwareUpdateInterface::

!::LocationInterface::

!::Cart::

!::CartLineItem::

!::TapToPayColor::

!::TapToPayTapZone::

`TerminalResultInterface` is a union of payment-result event names: `TerminalEventsEnum.ConfirmedPaymentIntent`, `CollectedPaymentIntent`, `Canceled`, and `Failed`. It is a convenience alias, not a return type of `confirmPaymentIntent()`.

## Enums

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

`DeviceGroup` maps a `DeviceType` to a reader-image group (`stripe_m2`, `chipper`, `wisepad`, `wisepose`, `s700`, `apple`, `tapToPayDevice`, `unknown`). The enum is documented as reference-only for picking images; you do not pass it to `discoverReaders` or `connectReader`.
