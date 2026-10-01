---
title: "Angular-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "b10514b51676c15d9f75d0e77b4c219af1e11103ff6d8eb8e82808687e57ba33"
---
Initialisieren Sie das Plugin beim Anwendungsstart einmal. Angular-22-Anwendungen sollten `provideAppInitializer` verwenden, damit die Initialisierung vor dem Anzeigen der Stripe-UI ausgeführt wird.

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() =>
      Stripe.initialize({
        publishableKey: 'Your Publishable Key',
      }),
    ),
  ],
};
```

Registrieren Sie Ergebnis-Listener im selben Startablauf. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

## Web

Installieren Sie `stripe-pwa-elements` und rufen Sie nach dem Angular-Bootstrap einmal `defineCustomElements()` auf.

```bash
npm install stripe-pwa-elements
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

Verwenden Sie beim Abrufen von PaymentIntent- oder SetupIntent-Secrets über Angular-`HttpClient` `firstValueFrom`. Verwenden Sie nicht die entfernte Hilfsfunktion `toPromise()`.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);
```

Als Nächstes erstellen Sie diese Secrets auf Ihrem Server ([Serverintegration](/docs/server-integration)) und zeigen anschließend [PaymentSheet](/docs/payment-sheet) an.
