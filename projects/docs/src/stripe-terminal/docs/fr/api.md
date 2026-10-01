---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "fafce7f4b49acd51ca860d7030347e6d2f84a74204462a46df27e73f2f92457d"
---
Référence de `@capacitor-community/stripe-terminal` v8.2.1. Les plateformes compatibles avec les types de connexion et les API Tap to Pay sont décrites dans [Configuration](/docs/configuration).

## Méthodes

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

Chaque surcharge de `addListener` possède sa propre signature. Le tableau `TerminalEventsEnum` ci-dessous contient uniquement les noms des membres et leurs valeurs textuelles ; il ne reprend pas ces surcharges.

`DiscoveringReaders` et `CancelDiscoveredReaders` figurent dans l’énumération et sont émis par la recherche native, mais ne disposent pas de surcharge typée dans cette liste.

## Interfaces

!::DiscoverReadersOptions::

!::TapToPayUxConfiguration::

!::TapToPayColorScheme::

!::IsTapToPayAccountLinkedOptions::

!::PluginListenerHandle::

## Alias de types

!::ReaderInterface::

!::ReaderSoftwareUpdateInterface::

!::LocationInterface::

!::Cart::

!::CartLineItem::

!::TapToPayColor::

!::TapToPayTapZone::

`TerminalResultInterface` est une union de noms d’événements de résultat du paiement : `TerminalEventsEnum.ConfirmedPaymentIntent`, `CollectedPaymentIntent`, `Canceled` et `Failed`. Cet alias pratique n’est pas le type de retour de `confirmPaymentIntent()`.

## Énumérations

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

`DeviceGroup` associe un `DeviceType` à un groupe d’images de lecteurs (`stripe_m2`, `chipper`, `wisepad`, `wisepose`, `s700`, `apple`, `tapToPayDevice`, `unknown`). Cette énumération sert uniquement de référence pour choisir des images ; elle ne doit pas être transmise à `discoverReaders` ou `connectReader`.
