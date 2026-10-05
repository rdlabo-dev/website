---
title: "Plattformkonfiguration"
code: []
scrollActiveLine: []
sourceRevision: "16c407461762d3f385d87599d7fc4f12baa27b55ff5da98922b14095635ac9fe"
---
Installieren Sie `@capacitor-community/stripe` und synchronisieren Sie die nativen Projekte. Capacitor 8 registriert das Plugin automatisch. Sie müssen daher weder `MainActivity` bearbeiten noch einen manuellen Aufruf `registerPlugin` hinzufügen.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

Das Plugin benötigt Capacitor ab 8. Für das Web ist zusätzlich die Peer-Abhängigkeit `stripe-pwa-elements` erforderlich. Bewahren Sie den geheimen Stripe-Schlüssel ausschließlich auf Ihrem Server auf. Siehe [Serverintegration](/docs/server-integration).

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

Ergänzen Sie `NSCameraUsageDescription`, damit PaymentSheet Karten scannen kann:

```diff plist:ios/App/App/Info.plist
  	<key>UIViewControllerBasedStatusBarAppearance</key>
	  <true/>

+   <key>NSCameraUsageDescription</key>
+   <string>Need camera access for read credit card.</string>
  </dict>
```

Das Plugin wird unter iOS automatisch geladen. Apple Pay benötigt zusätzlich eine Apple Merchant ID und ein Zertifikat. Folgen Sie [Apple Pay](/docs/apple-pay).

Registrieren Sie für PayPal, 3D Secure und andere weiterleitungsbasierte Zahlungsmethoden ein eigenes URL-Schema, setzen Sie beim Erstellen von PaymentSheet oder PaymentFlow `returnURL` und rufen Sie `handleURLCallback` aus Ihrem App-URL-Handler auf. Ohne Rückkehr-URL bietet Stripe unter iOS ansonsten geeignete weiterleitungsbasierte Zahlungsmethoden nicht an. Siehe [Initialisierung](/docs/initialize#redirect-based-payment-methods-on-ios).

## Web-Konfiguration

Installieren Sie `stripe-pwa-elements` und rufen Sie beim Bootstrap einmal `defineCustomElements()` auf. Stellen Sie die Anwendung in Entwicklung und Produktion über HTTPS bereit.

- [Vanilla-JS-Schnellstart](/docs/vanilla-js)
- [Angular-Schnellstart](/docs/angular)
- [React-Schnellstart](/docs/react)
