---
title: 'API'
code: []
scrollActiveLine: []
---

`@capacitor-community/stripe-terminal` v8.3.0 のリファレンスです。接続方式と Tap to Pay API の対応状況は[設定](/docs/configuration)を参照してください。

## メソッド

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

各 `addListener` オーバーロードは個別のメソッドシグネチャです。下の `TerminalEventsEnum` 表はメンバー名と文字列値だけを示し、オーバーロードは繰り返しません。

`DiscoveringReaders` と `CancelDiscoveredReaders` は列挙型に含まれ、ネイティブの探索処理から送出されますが、この一覧に型付きオーバーロードはありません。

## インターフェース

!::DiscoverReadersOptions::
!::TapToPayUxConfiguration::
!::TapToPayColorScheme::
!::IsTapToPayAccountLinkedOptions::
!::PluginListenerHandle::

## 型エイリアス

!::ReaderInterface::
!::ReaderSoftwareUpdateInterface::
!::LocationInterface::
!::Cart::
!::CartLineItem::
!::TapToPayColor::
!::TapToPayTapZone::

`TerminalResultInterface` は支払い結果イベント `ConfirmedPaymentIntent`、`CollectedPaymentIntent`、`Canceled`、`Failed` の共用体です。`confirmPaymentIntent()` の戻り値ではなく、利便性のための別名です。

## 列挙型

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

`DeviceGroup` は `DeviceType` をリーダー画像グループ（`stripe_m2`、`chipper`、`wisepad`、`wisepose`、`s700`、`apple`、`tapToPayDevice`、`unknown`）へ対応付けます。画像選択用の参照専用列挙型であり、`discoverReaders` や `connectReader` には渡しません。
