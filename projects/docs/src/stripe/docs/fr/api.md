---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "5a5105140c785b122fc8c24d9b0fa2e7ecf226fea2e8451c28c0d820f330d400"
---
Référence générée à partir des métadonnées de l’API publique de `@capacitor-community/stripe` v8.2.1. Les limites des plateformes, les champs d’options hérités, le cycle de vie des écouteurs de résultat et les responsabilités du serveur sont documentés sur les pages des méthodes.

## Méthodes

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

### Options héritées de PaymentSheet et PaymentFlow

`CreatePaymentSheetOption` et `CreatePaymentFlowOption` étendent le type exporté `BasePaymentOption`. Les métadonnées docgen ne développent pas les champs hérités ; ils sont donc énumérés ici explicitement.

| Propriété | Type | Plateforme / usage |
| --- | --- | --- |
| `defaultBillingDetails` | `DefaultBillingDetails` | iOS et Android |
| `shippingDetails` | `AddressDetails` | Android |
| `billingDetailsCollectionConfiguration` | `BillingDetailsCollectionConfiguration` | iOS et Android |
| `customerEphemeralKeySecret` | `string` | À utiliser avec `customerId` |
| `customerId` | `string` | Customer Stripe |
| `enableApplePay` | `boolean` | PaymentSheet natif |
| `applePayMerchantId` | `string` | Obligatoire lorsque Apple Pay est activé |
| `enableGooglePay` | `boolean` | PaymentSheet natif |
| `GooglePayIsTesting` | `boolean` | Mode test de Google Pay sur Android |
| `countryCode` | `string` | Pays du portefeuille, `US` par défaut |
| `merchantDisplayName` | `string` | Nom du marchand dans PaymentSheet |
| `returnURL` | `string` | Authentification iOS avec redirection |
| `paymentMethodLayout` | `'horizontal' \| 'vertical' \| 'automatic'` | Android |
| `style` | `'alwaysLight' \| 'alwaysDark'` | iOS |
| `withZipCode` | `boolean` | Web |
| `currencyCode` | `string` | Google Pay avec un SetupIntent natif |

Ces champs sont facultatifs. Consultez [PaymentSheet](/docs/payment-sheet) et [PaymentFlow](/docs/payment-flow) pour les combinaisons et les limites du Web.

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

## Alias de types

!::PaymentSheetResultInterface::

!::PaymentFlowResultInterface::

!::ApplePayResultInterface::

!::GooglePayResultInterface::

!::CollectionMode::

!::AddressCollectionMode::

## Énumérations

!::PaymentSheetEventsEnum::

!::PaymentFlowEventsEnum::

!::ApplePayEventsEnum::

!::GooglePayEventsEnum::
