---
title: "Démarrage rapide avec Angular"
code: []
scrollActiveLine: []
sourceRevision: "b10514b51676c15d9f75d0e77b4c219af1e11103ff6d8eb8e82808687e57ba33"
---
Initialisez le plugin une seule fois au démarrage de l’application. Les applications Angular 22 doivent utiliser `provideAppInitializer` pour exécuter l’initialisation avant de présenter l’interface Stripe.

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

Enregistrez les écouteurs de résultat dans ce même parcours de démarrage. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

## Web

Installez `stripe-pwa-elements` et appelez `defineCustomElements()` une seule fois après le démarrage d’Angular.

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

Lorsque vous récupérez les secrets de PaymentIntent ou SetupIntent avec `HttpClient` d’Angular, utilisez `firstValueFrom`. N’utilisez pas l’ancien utilitaire `toPromise()`, qui a été supprimé.

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

Ensuite : créez ces secrets sur votre serveur ([Intégration serveur](/docs/server-integration)), puis présentez [PaymentSheet](/docs/payment-sheet).
