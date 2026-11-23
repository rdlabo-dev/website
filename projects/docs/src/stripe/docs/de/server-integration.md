---
title: "Serverintegration"
code: []
scrollActiveLine: []
sourceRevision: "50400ae0ad477d20468b9736bdbb1e770ca166c808888eae6526010133441402"
---
`@capacitor-community/stripe` akzeptiert ausschließlich für den Client sichere Werte. Ihr Backend erstellt PaymentIntents, SetupIntents, Customers und temporäre Schlüssel mit dem geheimen Stripe-Schlüssel. Das Plugin ruft die geheime API niemals auf.

## Den geheimen Schlüssel auf den Server beschränken

Belassen Sie `sk_live_...` und `sk_test_...` auf dem Server. Liefern Sie ausschließlich den veröffentlichbaren Schlüssel an die Anwendung aus, über `Stripe.initialize` oder Android-Google-Pay-Metadaten. Betten Sie den geheimen Schlüssel nicht in Capacitor-Konfiguration, Versionsverwaltung oder Client-Protokolle ein.

## Anfragen authentifizieren und Bestellungen prüfen

Authentifizieren Sie den App-Nutzer und wählen Sie den zugehörigen Customer auf dem Server aus. Bestimmen Sie Betrag und Währung anhand der serverseitigen Produkt- oder Bestelldaten. Vertrauen Sie weder den Beträgen noch den Customer-IDs, die der Client übermittelt. Gestalten Sie wiederholte Anfragen zur Zahlungserstellung idempotent und prüfen Sie die Webhook-Signatur, bevor Sie den Bestellstatus ändern.

Die Demo-Endpunkte liefern die unten gezeigten Antwortformate. Ihre öffentlichen Testrouten prüfen weder die Identität des Nutzers noch seine Berechtigung für die Bestellung. Übernehmen Sie das Antwortformat und ergänzen Sie diese Prüfungen in Ihrem Produktions-Backend.

## Client Secrets

Erstellen Sie einen [PaymentIntent](https://stripe.com/docs/payments/payment-intents) für eine sofortige Zahlung oder einen [SetupIntent](https://stripe.com/docs/payments/save-and-reuse), um eine Zahlungsmethode für später zu speichern. Geben Sie das **Client Secret** des Intents an die Anwendung zurück, nicht den geheimen Schlüssel und nicht eine direkte Charge.

Temporäre Customer-Schlüssel sind optional. Verwenden Sie sie mit einer Customer-ID, wenn PaymentSheet oder PaymentFlow gespeicherte Zahlungsmethoden anzeigen soll. Wenn Sie `customerId` an das Plugin übergeben, müssen Sie auch `customerEphemeralKeySecret` übergeben. Ein PaymentIntent ohne Customer ist gültig.

Ordnen Sie Serverfelder den Plugin-Optionen zu:

| Serverfeld | Plugin-Option |
| --- | --- |
| `paymentIntent` | `paymentIntentClientSecret` |
| `setupIntent` | `setupIntentClientSecret` |
| `ephemeralKey` | `customerEphemeralKeySecret` |
| `customer` | `customerId` |

## Antwortstrukturen

PaymentIntent mit Customer:

```json
{
  "paymentIntent": "pi_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

SetupIntent mit Customer:

```json
{
  "setupIntent": "seti_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

PaymentIntent ohne Customer:

```json
{
  "paymentIntent": "pi_..._secret_..."
}
```

Apple Pay verwendet ein PaymentIntent-Client-Secret. Google Pay verwendet im Web ein PaymentIntent-Client-Secret. Android akzeptiert über die historisch benannte Option `paymentIntentClientSecret` auch ein SetupIntent-Client-Secret. Native PaymentSheet- und PaymentFlow-Versionen akzeptieren beide Intent-Secrets, mit oder ohne Customer-Felder. Die aktuelle Web-PaymentSheet-Version akzeptiert nur PaymentIntents; Web-PaymentFlow akzeptiert beide Intent-Typen.

## Webhooks als maßgebliche Quelle

`Completed` auf dem Gerät ist ein UI-Signal. Es beweist nicht, dass Stripe Geld eingezogen hat. Erfüllen Sie Bestellungen erst, nachdem Sie den Zahlungserfolg auf Ihrem Server überprüft haben, beispielsweise über einen verifizierten [Stripe-Webhook](https://docs.stripe.com/webhooks) `payment_intent.succeeded`. `setup_intent.succeeded` bedeutet, dass eine Zahlungsmethode für die spätere Verwendung gespeichert wurde; es bedeutet nicht, dass eine Zahlung erfolgt ist.

Behandeln Sie `Canceled` als Schließen des Sheets durch den Kunden. Behandeln Sie `Failed` und `FailedToLoad` als Fehler. Erstellen Sie vor einem erneuten Versuch einen neuen Intent, wenn der vorherige nicht mehr bestätigt werden kann.

Der offizielle Demo-Server, der die obigen Strukturen zurückgibt, befindet sich unter [capacitor-community/stripe/demo/server](https://github.com/capacitor-community/stripe/tree/v8.4.0/demo/server).
