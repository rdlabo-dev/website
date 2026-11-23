---
title: "Configuration platform"
code: []
scrollActiveLine: []
---

Install `@capacitor-community/stripe` and synchronize the native projects. Capacitor 8 registers the plugin automatically, so you do not edit `MainActivity` or add a manual `registerPlugin` call.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

This guide targets plugin v8 with Capacitor 8. Web also needs the compatible `@stripe/stripe-js` and `stripe-pwa-elements` peer dependencies. Keep the Stripe secret key on your server only. See [Server Integration](/docs/server-integration).

| Requirement | Minimum |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android `minSdkVersion` | 24 |

## First payment path

Use this order for the first successful PaymentSheet run:

1. Finish the platform steps on this page.
2. Pick **one** framework guide and initialize Stripe there ([Vanilla JS](/docs/vanilla-js), [Angular](/docs/angular), or [React](/docs/react)).
3. Create a test PaymentIntent on your server and return the client secret. See [Server Integration](/docs/server-integration).
4. Present [PaymentSheet](/docs/payment-sheet), then confirm the listener result (`Completed`, `Canceled`, or `Failed`). Final payment state still comes from your Stripe webhooks.

PaymentFlow, Apple Pay, and Google Pay are later options after PaymentSheet works.

## Android configuration

No extra Gradle or `MainActivity` registration is required for the plugin itself.

Google Pay on Android must be configured with application metadata before the plugin loads. Follow [Google Pay](/docs/google-pay).

Optional Stripe Connect: if Android Google Pay should run against a connected account, add `com.getcapacitor.community.stripe.stripe_account` metadata. Native and web PaymentSheet, PaymentFlow, Apple Pay, and Google Pay also accept `stripeAccount` on `initialize`.

## iOS configuration

Add these entries inside the root `dict` in `Info.plist` so PaymentSheet can scan cards:

```xml plist:ios/App/App/Info.plist
<key>NSCameraUsageDescription</key>
<string>Camera access lets you scan your payment card.</string>
```

The plugin loads automatically on iOS. Apple Pay also needs an Apple Merchant ID and certificate. Follow [Apple Pay](/docs/apple-pay).

For 3D Secure redirects, set `returnURL` when you create PaymentSheet or PaymentFlow, then call `handleURLCallback` from your app URL handler. See [Initialize](/docs/initialize).

## Web configuration

Install `@stripe/stripe-js@^9.17.0` and `stripe-pwa-elements@^4.1.0`, then call `defineCustomElements()` once during bootstrap. Serve the app over HTTPS in development and production.

Choose **one** framework quick start (they are alternatives, not a sequence):

- [Vanilla JS Quick start](/docs/vanilla-js)
- [Angular Quick start](/docs/angular)
- [React Quick start](/docs/react)

After initialization, continue with [Server Integration](/docs/server-integration), then [PaymentSheet](/docs/payment-sheet).
