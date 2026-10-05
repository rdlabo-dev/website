---
title: "Démarrage rapide avec Angular"
code: []
scrollActiveLine: []
sourceRevision: "6fe60ce57814cbfc0ba73c86398a43fbd493582369cf58aff1b04aa9fd602080"
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
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
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
