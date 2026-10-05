---
title: "API"
code: []
scrollActiveLine: []
---

`@capacitor-community/stripe` v8.3.0 の公開 API メタデータから生成したリファレンスです。プラットフォームの制限、継承されるオプションフィールド、結果リスナーのライフサイクル、サーバーの責務は各メソッドページで説明しています。

## メソッド

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

## インターフェース

### PaymentSheet と PaymentFlow が継承するオプション

`CreatePaymentSheetOption` と `CreatePaymentFlowOption` は、公開されている `BasePaymentOption` を拡張します。docgen のメタデータは継承フィールドを展開しないため、ここに明示します。

| プロパティ | 型 | プラットフォーム／用途 |
| --- | --- | --- |
| `defaultBillingDetails` | `DefaultBillingDetails` | iOS、Android |
| `shippingDetails` | `AddressDetails` | Android |
| `billingDetailsCollectionConfiguration` | `BillingDetailsCollectionConfiguration` | iOS、Android |
| `customerEphemeralKeySecret` | `string` | `customerId` と併用 |
| `customerId` | `string` | Stripe Customer |
| `enableApplePay` | `boolean` | ネイティブ PaymentSheet |
| `applePayMerchantId` | `string` | Apple Pay 有効時に必須 |
| `enableGooglePay` | `boolean` | ネイティブ PaymentSheet |
| `GooglePayIsTesting` | `boolean` | Android Google Pay テストモード |
| `countryCode` | `string` | ウォレットの国。既定値 `US` |
| `merchantDisplayName` | `string` | PaymentSheet の加盟店名 |
| `returnURL` | `string` | iOS のリダイレクト認証 |
| `allowsDelayedPaymentMethods` | `boolean` | iOS と Android の遅延型の支払い方法。既定値 `false` |
| `paymentMethodLayout` | `'horizontal' \| 'vertical' \| 'automatic'` | Android |
| `style` | `'alwaysLight' \| 'alwaysDark'` | iOS |
| `withZipCode` | `boolean` | Web |
| `currencyCode` | `string` | ネイティブ SetupIntent の Google Pay |

すべて任意フィールドです。組み合わせと Web の制限は [PaymentSheet](/docs/payment-sheet) と [PaymentFlow](/docs/payment-flow)を参照してください。

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

## 型エイリアス

<!-- !::PaymentSheetResultInterface:: -->
<!-- !::PaymentFlowResultInterface:: -->
<!-- !::ApplePayResultInterface:: -->
<!-- !::GooglePayResultInterface:: -->
<!-- !::CollectionMode:: -->
<!-- !::AddressCollectionMode:: -->

## 列挙型

<!-- !::PaymentSheetEventsEnum:: -->
<!-- !::PaymentFlowEventsEnum:: -->
<!-- !::ApplePayEventsEnum:: -->
<!-- !::GooglePayEventsEnum:: -->
