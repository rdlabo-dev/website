---
title: "Google Pay"
code: [
  "/docs/stripe/google-pay/strings.xml.md",
  "/docs/stripe/google-pay/android-manifest.xml.md",
  "/docs/stripe/google-pay/google-pay.ts.md"
]
scrollActiveLine: []
---

Google Pay は一度の表示で PaymentIntent を確定します。Android は SetupIntent にも対応しますが、Web は対応していません。

[Stripe: Google Pay](https://stripe.com/docs/google-pay)

Web では Payment Request Button を使用します。開発環境と本番環境の両方を HTTPS で配信してください。

## プラットフォーム対応

| プラットフォーム | Google Pay |
| --- | --- |
| Android | ネイティブ `GooglePayLauncher`（アプリメタデータ必須） |
| iOS | 未実装 |
| Web | Payment Request Button（`stripe-pwa-elements`） |

iOS の各 Google Pay メソッドは拒否されます。Android はプラグイン読み込み時にメタデータから設定を読むため、`initialize` だけでは不十分です。

## 事前設定

### strings.xml

`android/app/src/main/res/values/strings.xml` に公開可能キー、有効フラグ、国コード、加盟店表示名、テストフラグを追加します。

```xml
<string name="publishable_key">Your Publishable Key</string>
<bool name="enable_google_pay">true</bool>
<string name="country_code">US</string>
<string name="merchant_display_name">Widget Store</string>
<bool name="google_pay_is_testing">true</bool>
```

Android Google Pay で Stripe Connect を使う場合は任意で追加します。

```xml
<string name="stripe_account">acct_xxxxxxxxxxxxx</string>
```

### AndroidManifest.xml

`android/app/src/main/AndroidManifest.xml` の `manifest > application` の下へ、以下を追加します。

```xml
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />

<meta-data
  android:name="com.getcapacitor.community.stripe.enable_google_pay"
  android:value="@bool/enable_google_pay"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.publishable_key"
  android:value="@string/publishable_key"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.country_code"
  android:value="@string/country_code"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.merchant_display_name"
  android:value="@string/merchant_display_name"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_is_testing"
  android:value="@bool/google_pay_is_testing"/>
```

連結アカウントには以下を追加します。

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.stripe_account"
  android:value="@string/stripe_account"/>
```

#### 任意1: 利用者情報を取得する場合

```xml
<bool name="email_address_required">true</bool>
<bool name="phone_number_required">true</bool>
<bool name="billing_address_required">true</bool>
<string name="billing_address_format">Full</string>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.email_address_required"
  android:value="@bool/email_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.phone_number_required"
  android:value="@bool/phone_number_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_required"
  android:value="@bool/billing_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_format"
  android:value="@string/billing_address_format"/>
```

#### 任意2: Google Pay に既存の支払い方法を要求しない場合

`false` にすると、利用者の Google Pay ウォレットに既存の支払い方法がなくても利用可能と判定します。既定値は `true` です。

```xml
<bool name="google_pay_existing_payment_method_required">false</bool>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_existing_payment_method_required"
  android:value="@bool/google_pay_existing_payment_method_required"/>
```

## 1. isGooglePayAvailable

Google Pay が利用可能なら Promise が解決し、それ以外は拒否されます。

```ts
import { GooglePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isGooglePayAvailable();
} catch {
  return;
}
```

!::isGooglePayAvailable::

## 2. createGooglePay

バックエンドから PaymentIntent のクライアントシークレットを取得します。Android では SetupIntent も渡せます。例の `/your-intent-endpoint` は [サーバー連携](/docs/server-integration) で用意したバックエンドの URL に置き換えてください。どちらもオプション名は `paymentIntentClientSecret` です。Web では `paymentSummaryItems`、`merchantIdentifier`、`countryCode`、`currency` も必要です。

```ts
// Replace `/your-intent-endpoint` with your backend from Server Integration.
const response = await fetch('/your-intent-endpoint', {
  method: 'POST',
});
if (!response.ok) {
  throw new Error(`Intent request failed: ${response.status}`);
}
const { paymentIntent } = (await response.json()) as {
  paymentIntent: string;
};

await Stripe.createGooglePay({
  paymentIntentClientSecret: paymentIntent,

  // Web only. Google Pay on Android App doesn't need
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

!::createGooglePay::
!::CreateGooglePayOption::

:::message
`paymentSummaryItems`、`merchantIdentifier`、`countryCode`、`currency` は Web で必須です。Android はメタデータの国と加盟店名を使用します。
:::

SetupIntent のクライアントシークレットは `seti_` で始まります。Android は接頭辞を検出し、作成オプションの `currency`（既定値 `USD`）で `presentForSetupIntent` を使用します。Web は `confirmCardPayment` を使うため、SetupIntent を渡さないでください。

## 3. presentGooglePay

```ts
const result = await Stripe.presentGooglePay();
if (result.paymentResult === GooglePayEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

!::presentGooglePay::
!::GooglePayResultInterface::

`Canceled` はキャンセル、`Failed` はエラーです。Android Activity 再生成後は結果リスナーを優先してください。

## 4. addListener

```ts
Stripe.addListener(GooglePayEventsEnum.Completed, () => {
  console.log('GooglePayEventsEnum.Completed');
});
```

!::GooglePayEventsEnum::

## 参考資料

- [Google Pay（Android）](https://stripe.com/docs/google-pay)
- [Google Pay（Web）](https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites)
