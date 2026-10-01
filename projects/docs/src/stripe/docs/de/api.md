---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "5a5105140c785b122fc8c24d9b0fa2e7ecf226fea2e8451c28c0d820f330d400"
---
Aus den öffentlichen API-Metadaten von `@capacitor-community/stripe` v8.2.1 erzeugte Referenz. Plattformgrenzen, geerbte Optionsfelder, Lebenszyklus der Ergebnis-Listener und Serverzuständigkeiten sind auf den Methodenseiten dokumentiert.

## Methoden

!::initialize::

!::handleURLCallback::

!::isApplePayAvailable::

!::createApplePay::

!::presentApplePay::

!::updateApplePaySheet::

!::isGooglePayAvailable::

!::createGooglePay::

!::presentGooglePay::

!::createPaymentFlow::

!::presentPaymentFlow::

!::confirmPaymentFlow::

!::createPaymentSheet::

!::presentPaymentSheet::

!::addListener::

## Interfaces

### Geerbte PaymentSheet- und PaymentFlow-Optionen

`CreatePaymentSheetOption` und `CreatePaymentFlowOption` erweitern das exportierte `BasePaymentOption`. Die docgen-Metadaten expandieren geerbte Felder nicht, daher werden sie hier ausdrücklich aufgeführt.

| Eigenschaft | Typ | Plattform / Zweck |
| --- | --- | --- |
| `defaultBillingDetails` | `DefaultBillingDetails` | iOS und Android |
| `shippingDetails` | `AddressDetails` | Android |
| `billingDetailsCollectionConfiguration` | `BillingDetailsCollectionConfiguration` | iOS und Android |
| `customerEphemeralKeySecret` | `string` | Mit `customerId` verwenden |
| `customerId` | `string` | Stripe-Customer |
| `enableApplePay` | `boolean` | Natives PaymentSheet |
| `applePayMerchantId` | `string` | Erforderlich bei aktiviertem Apple Pay |
| `enableGooglePay` | `boolean` | Natives PaymentSheet |
| `GooglePayIsTesting` | `boolean` | Android-Google-Pay-Testmodus |
| `countryCode` | `string` | Wallet-Land, Standard `US` |
| `merchantDisplayName` | `string` | PaymentSheet-Händlername |
| `returnURL` | `string` | Weiterleitungsbasierte iOS-Authentifizierung |
| `paymentMethodLayout` | `'horizontal' \| 'vertical' \| 'automatic'` | Android |
| `style` | `'alwaysLight' \| 'alwaysDark'` | iOS |
| `withZipCode` | `boolean` | Web |
| `currencyCode` | `string` | Google Pay mit nativem SetupIntent |

Dies sind optionale Felder. Kombinationen und Web-Einschränkungen beschreiben [PaymentSheet](/docs/payment-sheet) und [PaymentFlow](/docs/payment-flow).

!::StripeInitializationOptions::

!::StripeURLHandlingOptions::

!::CreatePaymentSheetOption::

!::CreatePaymentFlowOption::

!::CreateApplePayOption::

!::CreateGooglePayOption::

!::PaymentSummaryItem::

!::DefaultBillingDetails::

!::Address::

!::AddressDetails::

!::BillingDetailsCollectionConfiguration::

!::DidSelectShippingContact::

!::DidCreatePaymentMethod::

!::ShippingContact::

!::PluginListenerHandle::

## Typaliase

!::PaymentSheetResultInterface::

!::PaymentFlowResultInterface::

!::ApplePayResultInterface::

!::GooglePayResultInterface::

!::CollectionMode::

!::AddressCollectionMode::

## Enums

!::PaymentSheetEventsEnum::

!::PaymentFlowEventsEnum::

!::ApplePayEventsEnum::

!::GooglePayEventsEnum::
