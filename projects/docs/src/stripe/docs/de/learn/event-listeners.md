---
title: "Ereignis-Listener"
code: []
scrollActiveLine: []
sourceRevision: "0654fb38a5aa55cb46f4574a2420fdad5a451ddd4a7fa1e7b6cc3cd7e5b337a3"
---
Verwenden Sie Ergebnisereignisse als standardmäßigen Ergebnisweg. Registrieren Sie Ergebnis-Listener auf Anwendungsebene einmal pro Start der JavaScript-Anwendung, so früh wie möglich beim Bootstrap, beispielsweise aus `main.ts`, einem Anwendungsinitialisierer oder einem beim Start initialisierten Singleton-Dienst, und vor dem Anzeigen der Stripe-UI.

```ts
import {
  ApplePayEventsEnum,
  GooglePayEventsEnum,
  PaymentFlowEventsEnum,
  PaymentSheetEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';

await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => handleCompleted()),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => handleCanceled()),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => handleFailed(error)),
]);
```

<!-- !::PluginListenerHandle:: -->

## Neuerstellung der Android-Activity

Dies ist unter Android besonders wichtig, da die Activity und die JavaScript-Laufzeit neu erstellt werden können, während die Stripe-UI geöffnet ist. Die neue JavaScript-Laufzeit muss ihre Listener beim Bootstrap registrieren.

Das ursprüngliche JavaScript-Promise und der Capacitor-`PluginCall` lassen sich nicht wiederherstellen. Liefert Stripe das native Ergebnis nach der Neuerstellung, hält das Plugin das zugehörige Ergebnisereignis zurück, bis ein Listener verfügbar ist. Dies gilt für die Ereignisse `Completed`, `Canceled` und `Failed` von PaymentSheet, PaymentFlow und Google Pay sowie für das Ereignis `Created` von PaymentFlow.

Besteht der ursprüngliche Aufruf weiterhin, bleibt das Verhalten unverändert: Das Promise wird normal abgeschlossen und das Ereignis ohne Zurückhalten ausgeliefert. Diese Rückfalloption ist eine speicherinterne Übergabe eines nativen Ergebnisses. Sie ist keine dauerhafte Speicherung und garantiert keine Wiederherstellung nach dem Beenden des Prozesses durch das Betriebssystem.

Belassen Sie Ergebnis-Listener auf Anwendungsebene während der gesamten Lebensdauer der JavaScript-Laufzeit registriert. Fügen Sie sie nicht in einem Schaltflächenhandler hinzu und entfernen Sie sie nicht beim Unmounten einer Seite, wenn Sie das Zahlungsergebnis nach einer Android-Neuerstellung weiterhin benötigen.

## PaymentSheet-Ereignisse

<!-- !::addListener.PaymentSheetEventsEnum:: -->

<!-- !::PaymentSheetEventsEnum:: -->

Typischer PaymentSheet-Ablauf:

1. Registrieren Sie Ergebnis-Listener beim Start.
2. Rufen Sie `createPaymentSheet()` auf.
3. Warten Sie auf `Loaded` oder verarbeiten Sie `FailedToLoad`.
4. Rufen Sie `presentPaymentSheet()` auf.
5. Empfangen Sie eines der Ereignisse `Completed`, `Canceled` oder `Failed`.

`Canceled` bedeutet, dass der Kunde das Sheet geschlossen hat. Behandeln Sie dies als Abbruch, nicht als ausgelösten Fehler. `Failed` und `FailedToLoad` enthalten eine Fehlerzeichenfolge. Erfüllen Sie eine Bestellung nicht allein auf Grundlage des Client-Ereignisses; überprüfen Sie den Intent-Status auf Ihrem Server mithilfe eines [Webhooks](/docs/server-integration).

## PaymentFlow-Ereignisse

<!-- !::addListener.PaymentFlowEventsEnum:: -->

<!-- !::PaymentFlowEventsEnum:: -->

Typischer PaymentFlow-Ablauf:

1. Registrieren Sie Ergebnis-Listener beim Start.
2. Rufen Sie `createPaymentFlow()` auf.
3. Warten Sie auf `Loaded` oder verarbeiten Sie `FailedToLoad`.
4. Rufen Sie `presentPaymentFlow()` auf.
5. Empfangen Sie `Opened` und anschließend `Created` mit `{ cardNumber }` oder `Canceled`.
6. Rufen Sie `confirmPaymentFlow()` auf.
7. Empfangen Sie eines der Ereignisse `Completed`, `Canceled` oder `Failed`.

## Apple-Pay-Ereignisse

<!-- !::addListener.ApplePayEventsEnum:: -->

<!-- !::ApplePayEventsEnum:: -->

`DidSelectShippingContact` enthält `contact` und `updateId`. Rufen Sie unter iOS `updateApplePaySheet` mit dieser `updateId` und aktualisierten `paymentSummaryItems` auf. Antwortet JavaScript nicht, greift das native Sheet nach 25 Sekunden auf die zuletzt akzeptierten Positionen zurück und behält die aktuellen Versandmethoden bei. `updateApplePaySheet` ist unter Android und im Web nicht implementiert.

`DidCreatePaymentMethod` enthält den Versand-`contact`. Apple gibt die vollständige Adresse erst nach einer erfolgreichen Zahlung zurück.

## Google-Pay-Ereignisse

<!-- !::addListener.GooglePayEventsEnum:: -->

<!-- !::GooglePayEventsEnum:: -->

Google Pay ist unter Android und im Web verfügbar. Unter iOS ist es nicht implementiert.
