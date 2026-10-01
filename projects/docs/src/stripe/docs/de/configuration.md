---
title: "Plattformkonfiguration"
code: []
scrollActiveLine: []
sourceRevision: "9893f84807239965b9f91cfc3d886f62574663d7eb3611721ddf9187edbcfa0a"
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

## Der Weg zur ersten Zahlung

Gehen Sie für den ersten erfolgreichen PaymentSheet-Durchlauf in dieser Reihenfolge vor:

1. Schließen Sie die Plattformschritte auf dieser Seite ab.
2. Wählen Sie **eine** Framework-Anleitung und initialisieren Sie Stripe dort: [Vanilla JS](/docs/vanilla-js), [Angular](/docs/angular) oder [React](/docs/react).
3. Erstellen Sie auf Ihrem Server einen Test-PaymentIntent und geben Sie dessen Client Secret zurück. Siehe [Serverintegration](/docs/server-integration).
4. Zeigen Sie [PaymentSheet](/docs/payment-sheet) an und prüfen Sie anschließend das Listener-Ergebnis (`Completed`, `Canceled` oder `Failed`). Der endgültige Zahlungszustand stammt weiterhin aus Ihren Stripe-Webhooks.

PaymentFlow, Apple Pay und Google Pay sind weitere Optionen, nachdem PaymentSheet funktioniert.

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

Setzen Sie für 3D-Secure-Weiterleitungen beim Erstellen von PaymentSheet oder PaymentFlow `returnURL` und rufen Sie anschließend `handleURLCallback` aus Ihrem App-URL-Handler auf. Siehe [Initialisierung](/docs/initialize).

## Web-Konfiguration

Installieren Sie `stripe-pwa-elements` und rufen Sie beim Bootstrap einmal `defineCustomElements()` auf. Stellen Sie die Anwendung in Entwicklung und Produktion über HTTPS bereit.

Wählen Sie **einen** Framework-Schnellstart. Es sind Alternativen, keine aufeinanderfolgenden Schritte:

- [Vanilla-JS-Schnellstart](/docs/vanilla-js)
- [Angular-Schnellstart](/docs/angular)
- [React-Schnellstart](/docs/react)

Fahren Sie nach der Initialisierung mit [Serverintegration](/docs/server-integration) und anschließend [PaymentSheet](/docs/payment-sheet) fort.
