---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "ab3be995a23f412d0b6981704309a7f168c6c8338d3909fd3b69579c3ed44a58"
---
Référence générée à partir des métadonnées de l’API publique de `@capacitor-community/stripe` v8.3.0. Les limites des plateformes, les champs d’options hérités, le cycle de vie des écouteurs de résultat et les responsabilités du serveur sont documentés sur les pages des méthodes.

## Méthodes

<!-- !::initialize:: -->

<!-- !::handleURLCallback:: -->

<!-- !::isApplePayAvailable:: -->

<!-- !::createApplePay:: -->

<!-- !::presentApplePay:: -->

<!-- !::updateApplePaySheet:: -->

<!-- !::isGooglePayAvailable:: -->

<!-- !::createGooglePay:: -->

<!-- !::presentGooglePay:: -->

<!-- !::createPaymentFlow:: -->

<!-- !::presentPaymentFlow:: -->

<!-- !::confirmPaymentFlow:: -->

<!-- !::createPaymentSheet:: -->

<!-- !::presentPaymentSheet:: -->

<!-- !::addListener:: -->

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
| `allowsDelayedPaymentMethods` | `boolean` | Moyens de paiement différés sur iOS et Android ; `false` par défaut |
| `paymentMethodLayout` | `'horizontal' \| 'vertical' \| 'automatic'` | Android |
| `style` | `'alwaysLight' \| 'alwaysDark'` | iOS |
| `withZipCode` | `boolean` | Web |
| `currencyCode` | `string` | Google Pay avec un SetupIntent natif |

Ces champs sont facultatifs. Consultez [PaymentSheet](/docs/payment-sheet) et [PaymentFlow](/docs/payment-flow) pour les combinaisons et les limites du Web.

<!-- !::StripeInitializationOptions:: -->

<!-- !::StripeURLHandlingOptions:: -->

<!-- !::CreatePaymentSheetOption:: -->

<!-- !::CreatePaymentFlowOption:: -->

<!-- !::CreateApplePayOption:: -->

<!-- !::CreateGooglePayOption:: -->

<!-- !::PaymentSummaryItem:: -->

<!-- !::DefaultBillingDetails:: -->

<!-- !::Address:: -->

<!-- !::AddressDetails:: -->

<!-- !::BillingDetailsCollectionConfiguration:: -->

<!-- !::DidSelectShippingContact:: -->

<!-- !::DidCreatePaymentMethod:: -->

<!-- !::ShippingContact:: -->

<!-- !::PluginListenerHandle:: -->

## Alias de types

<!-- !::PaymentSheetResultInterface:: -->

<!-- !::PaymentFlowResultInterface:: -->

<!-- !::ApplePayResultInterface:: -->

<!-- !::GooglePayResultInterface:: -->

<!-- !::CollectionMode:: -->

<!-- !::AddressCollectionMode:: -->

## Énumérations

<!-- !::PaymentSheetEventsEnum:: -->

<!-- !::PaymentFlowEventsEnum:: -->

<!-- !::ApplePayEventsEnum:: -->

<!-- !::GooglePayEventsEnum:: -->
