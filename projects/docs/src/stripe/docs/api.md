---
title: "API"
code: []
scrollActiveLine: []
---

Reference generated from the public API metadata for `@capacitor-community/stripe` v8.3.0. Platform limits, inherited option fields, result listener lifecycle, and server responsibilities are documented on the method pages.

## Methods

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

### Inherited PaymentSheet and PaymentFlow options

`CreatePaymentSheetOption` and `CreatePaymentFlowOption` extend the exported `BasePaymentOption`. The docgen metadata does not expand inherited fields, so they are listed here explicitly.

| Property | Type | Platform / purpose |
| --- | --- | --- |
| `defaultBillingDetails` | `DefaultBillingDetails` | iOS and Android |
| `shippingDetails` | `AddressDetails` | Android |
| `billingDetailsCollectionConfiguration` | `BillingDetailsCollectionConfiguration` | iOS and Android |
| `customerEphemeralKeySecret` | `string` | Use with `customerId` |
| `customerId` | `string` | Stripe Customer |
| `enableApplePay` | `boolean` | Native PaymentSheet |
| `applePayMerchantId` | `string` | Required when Apple Pay is enabled |
| `enableGooglePay` | `boolean` | Native PaymentSheet |
| `GooglePayIsTesting` | `boolean` | Android Google Pay test mode |
| `countryCode` | `string` | Wallet country, default `US` |
| `merchantDisplayName` | `string` | PaymentSheet merchant name |
| `returnURL` | `string` | iOS redirect-based authentication |
| `allowsDelayedPaymentMethods` | `boolean` | iOS and Android delayed payment methods; default `false` |
| `paymentMethodLayout` | `'horizontal' \| 'vertical' \| 'automatic'` | Android |
| `style` | `'alwaysLight' \| 'alwaysDark'` | iOS |
| `withZipCode` | `boolean` | Web |
| `currencyCode` | `string` | Google Pay with native SetupIntent |

These are optional fields. See [PaymentSheet](/docs/payment-sheet) and [PaymentFlow](/docs/payment-flow) for combinations and web limitations.

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

## Type aliases

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
