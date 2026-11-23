---
title: "Plattformkonfiguration"
code: []
scrollActiveLine: []
sourceRevision: "0a886c42b3baeaba6577ffc9f3040c7e9a39f6e91d6b4677730c2f8f780e3d4a"
---
Installieren Sie `@capacitor-community/stripe` und synchronisieren Sie die nativen Projekte. Capacitor 8 registriert das Plugin automatisch. Sie müssen daher weder `MainActivity` bearbeiten noch einen manuellen Aufruf `registerPlugin` hinzufügen.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

Diese Anleitung gilt für Plugin v8 mit Capacitor 8. Im Web benötigen Sie zusätzlich kompatible Versionen der Peer-Abhängigkeiten `@stripe/stripe-js` und `stripe-pwa-elements`. Bewahren Sie den geheimen Stripe-Schlüssel ausschließlich auf dem Server auf. Siehe [Serverintegration](/docs/server-integration).

| Anforderung | Mindestwert |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android-`minSdkVersion` | 24 |

## Android-Konfiguration

Für das Plugin selbst sind keine zusätzlichen Gradle-Einstellungen oder Registrierungen in `MainActivity` erforderlich.

Google Pay unter Android muss vor dem Laden des Plugins über Anwendungsmetadaten konfiguriert werden. Folgen Sie [Google Pay](/docs/google-pay).

Optionales Stripe Connect: Ergänzen Sie die Metadaten `com.getcapacitor.community.stripe.stripe_account`, wenn Android-Google-Pay gegen ein verbundenes Konto arbeiten soll. Native und Web-Versionen von PaymentSheet, PaymentFlow, Apple Pay und Google Pay akzeptieren außerdem `stripeAccount` an `initialize`.

## iOS-Konfiguration

Damit PaymentSheet Karten scannen kann, fügen Sie die folgenden Einträge im obersten `dict` von `Info.plist` ein.

```xml plist:ios/App/App/Info.plist
<key>NSCameraUsageDescription</key>
<string>Camera access lets you scan your payment card.</string>
```

Das Plugin wird unter iOS automatisch geladen. Apple Pay benötigt zusätzlich eine Apple Merchant ID und ein Zertifikat. Folgen Sie [Apple Pay](/docs/apple-pay).

Registrieren Sie für PayPal, 3D Secure und andere weiterleitungsbasierte Zahlungsmethoden ein eigenes URL-Schema, setzen Sie beim Erstellen von PaymentSheet oder PaymentFlow `returnURL` und rufen Sie `handleURLCallback` aus Ihrem App-URL-Handler auf. Ohne Rückkehr-URL bietet Stripe unter iOS ansonsten geeignete weiterleitungsbasierte Zahlungsmethoden nicht an. Siehe [Initialisierung](/docs/initialize#redirect-based-payment-methods-on-ios).

## Web-Konfiguration

Installieren Sie `@stripe/stripe-js@^9.17.0` und `stripe-pwa-elements@^4.1.0`. Rufen Sie beim Start einmal `defineCustomElements()` auf. Stellen Sie die Anwendung in Entwicklung und Produktion über HTTPS bereit.

- [Vanilla-JS-Schnellstart](/docs/vanilla-js)
- [Angular-Schnellstart](/docs/angular)
- [React-Schnellstart](/docs/react)
